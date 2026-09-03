import { createClient } from '@supabase/supabase-js';
import { textToPdf } from './_lib/textToPdf.js';

// Admin's "Send for signature" action:
//  1. loads the draft sow_document + project + client
//  2. renders the contract text to a PDF and uploads it to SignWell,
//     asking for a hosted (not embedded) signing page
//  3. stores the resulting envelope id + signing link, flips
//     sow_documents.status to 'sent'
//
// NOTE ON THE SIGNWELL CALL: this targets SignWell's documented v1
// `POST /v1/documents` shape (X-Api-Key header, `files[].file_base64`,
// `recipients[]`, in-document `[sig|req|signer1]` / `[date|req|signer1]`
// text tags for field placement). Verify field names against SignWell's
// current API reference (developers.signwell.com) before relying on this
// in production — this endpoint could not be reached to double-check
// while writing this.
//
// The SignWell → Supabase webhook that flips status to 'signed' on
// completion is a separate piece: supabase/functions/signwell-webhook.
// Register its URL in the SignWell dashboard (Settings → API → Webhooks).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sow_document_id } = req.body || {};
  if (!sow_document_id) return res.status(400).json({ error: 'sow_document_id is required' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: sow, error: sowErr } = await supabase
      .from('sow_documents')
      .select('*, projects(*, clients(*))')
      .eq('id', sow_document_id)
      .single();
    if (sowErr || !sow) throw new Error('Contract not found');
    if (sow.status !== 'draft') throw new Error('Only a draft contract can be sent');

    const project = sow.projects;
    const client = project?.clients;
    if (!client?.email) throw new Error('Client has no email on file');

    const { data: settings } = await supabase.from('settings').select('signwell_api_key').eq('id', 1).single();
    const apiKey = settings?.signwell_api_key || process.env.SIGNWELL_API_KEY;
    if (!apiKey) throw new Error('SignWell API key not configured — set it in Admin → Settings');

    // Text tags SignWell scans for to place the signature/date fields.
    const taggedContent = `${sow.content}\n\nClient Signature: [sig|req|signer1]   Date: [date|req|signer1]\n`;
    const pdfBytes = await textToPdf(taggedContent);
    const fileBase64 = Buffer.from(pdfBytes).toString('base64');

    const swRes = await fetch('https://api.signwell.com/v1/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify({
        test_mode: process.env.SIGNWELL_TEST_MODE === 'true',
        draft: false,
        name: `SOW — ${project.name}`,
        subject: `Please sign your Statement of Work — ${project.name}`,
        message: `Hi ${client.name}, your Statement of Work is ready for review and signature.`,
        files: [{ name: 'statement-of-work.pdf', file_base64: fileBase64 }],
        text_tags: true,
        recipients: [{ id: 'signer1', name: client.name, email: client.email, order: 1 }],
      }),
    });

    const swJson = await swRes.json();
    if (!swRes.ok) throw new Error(swJson?.message || swJson?.error || 'SignWell request failed');

    const signingUrl =
      swJson?.recipients?.find((r) => r.id === 'signer1')?.signing_url ||
      swJson?.signing_url ||
      null;

    const now = new Date().toISOString();
    await supabase
      .from('sow_documents')
      .update({
        status: 'sent',
        signwell_envelope_id: swJson?.id || null,
        signing_url: signingUrl,
        sent_at: now,
      })
      .eq('id', sow_document_id);

    await supabase.from('projects').update({ stage: 'contract_sent' }).eq('id', project.id);

    return res.status(200).json({ success: true, signwell_envelope_id: swJson?.id, signing_url: signingUrl });
  } catch (err) {
    console.error('send-contract error:', err);
    return res.status(500).json({ error: err.message });
  }
}
