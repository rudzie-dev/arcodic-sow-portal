// SignWell → Supabase webhook.
//
// Register this function's URL in the SignWell dashboard
// (Settings → API → Webhooks) once deployed:
//   supabase functions deploy signwell-webhook --no-verify-jwt
//
// On a completed/signed event this:
//   1. flips the matching sow_documents row to status='signed'
//   2. advances the project to stage='deposit_due'
//   3. sends the client their portal login link via Resend — this is the
//      trigger point for auto-sending the client's portal invite, per the
//      build brief (no separate invite step; they just sign in with the
//      email already on file for their `clients` row).
//
// NOTE: SignWell's exact webhook payload shape (event name, where the
// document id lives) and signature-verification header could not be
// confirmed against live docs while writing this (network access to
// developers.signwell.com was unavailable in that environment) — the
// parsing below covers the commonly-documented shape
// (`event.type` / `event.related_data.document.id`) with fallbacts to a
// flatter `document.id` shape. Confirm against a real payload from
// SignWell's dashboard test webhook before relying on this in production,
// and adjust `extractDocumentId`/`isSignedEvent` if needed.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const PORTAL_URL = Deno.env.get('PORTAL_URL') || 'https://arcodic-sow-portal.vercel.app';
// Optional: if set, requests must include this as `?secret=` — SignWell
// doesn't have a first-class shared-secret field for webhooks, so this is
// enforced via a custom query param appended to the URL you register.
const WEBHOOK_SECRET = Deno.env.get('SIGNWELL_WEBHOOK_SECRET');

function extractDocumentId(payload: any): string | null {
  return (
    payload?.data?.object?.id ||
    payload?.related_data?.document?.id ||
    payload?.data?.related_data?.document?.id ||
    payload?.document?.id ||
    payload?.document_id ||
    null
  );
}

function isSignedEvent(payload: any): boolean {
  const type = (payload?.event?.type || payload?.event_type || payload?.type || '').toLowerCase();
  return type.includes('completed') || type.includes('signed');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  if (WEBHOOK_SECRET) {
    const url = new URL(req.url);
    if (url.searchParams.get('secret') !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!isSignedEvent(payload)) {
    // Ack anything we don't act on (viewed/opened/declined events, etc.)
    // so SignWell doesn't retry it as a failure.
    return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200 });
  }

  const documentId = extractDocumentId(payload);
  if (!documentId) return new Response('No document id in payload', { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: sow, error: sowErr } = await supabase
    .from('sow_documents')
    .select('*, projects(*, clients(*))')
    .eq('signwell_envelope_id', documentId)
    .single();

  if (sowErr || !sow) {
    console.error('No sow_documents row for SignWell document', documentId, sowErr);
    return new Response(JSON.stringify({ ok: false, reason: 'not_found' }), { status: 200 });
  }

  const now = new Date().toISOString();

  await supabase.from('sow_documents').update({ status: 'signed', signed_at: now }).eq('id', sow.id);
  await supabase.from('projects').update({ stage: 'deposit_due' }).eq('id', sow.project_id);

  const client = sow.projects?.clients;
  if (client?.email && RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Arcodic <hello@arcodic.com>',
          to: client.email,
          subject: 'Your contract is signed — here is your project portal',
          html: `
            <div style="font-family: monospace; max-width: 560px; margin: 0 auto; padding: 40px; background: #0a0906; color: #d4c5a8;">
              <h1 style="font-size: 24px; color: #c9a96e; margin-bottom: 8px;">Arcodic</h1>
              <p style="margin-bottom: 20px;">Hi ${client.name},</p>
              <p style="margin-bottom: 24px; color: #8a7d6b; line-height: 1.7;">
                Your Statement of Work has been signed by both parties. You can now track your project's
                progress, payments, and files in the Arcodic client portal.
              </p>
              <a href="${PORTAL_URL}/login" style="display:inline-block;background:#c9a96e;color:#0a0906;padding:14px 28px;text-decoration:none;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;font-size:12px;">
                Open Client Portal
              </a>
              <p style="font-size: 11px; color: #6b6050; margin-top: 24px;">
                Sign in with this email address — we'll send you a one-time code, no password needed.
              </p>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error('Failed to send portal invite email:', err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
