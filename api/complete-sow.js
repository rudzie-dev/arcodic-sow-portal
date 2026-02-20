import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  'https://ctjwqktzdvbfijoqnxvo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0andxa3R6ZHZiZmlqb3FueHZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ4NjcwOSwiZXhwIjoyMDg3MDYyNzA5fQ.qcMPWEAKABq2D-jYXliLveX4wH3K_Uz8y2OQW1j_pVs'
);

const resend = new Resend('re_c83UwjdW_GoxhXKvYpehePiEeTFAoiTt7');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, client_signature } = req.body;

  try {
    const { data: tokenRow, error: tokenError } = await supabase
      .from('sow_tokens')
      .select('*, sows(*)')
      .eq('token', token)
      .single();

    if (tokenError || !tokenRow) return res.status(404).json({ error: 'Invalid link' });
    if (tokenRow.used) return res.status(410).json({ error: 'This link has already been used' });
    if (new Date(tokenRow.expires_at) < new Date()) return res.status(410).json({ error: 'This link has expired' });

    const sow = tokenRow.sows;

    await supabase.from('sow_tokens').update({ used: true }).eq('id', tokenRow.id);

    await supabase.from('sows').update({
      client_signature,
      client_signed_at: new Date().toISOString(),
      status: 'completed',
    }).eq('id', sow.id);

    const signedAt = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const arcSignedAt = sow.arcodic_signed_at
      ? new Date(sow.arcodic_signed_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
      : signedAt;

    const completionHtml = (recipientName) => `
      <div style="font-family: monospace; max-width: 620px; margin: 0 auto; padding: 48px 40px; background: #0a0906; color: #d4c5a8;">

        <!-- Header -->
        <div style="margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid #1e1a14;">
          <p style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #4a4035; margin-bottom: 6px;">ARCODIC · Digital Service Provider</p>
          <h1 style="font-size: 32px; color: #c9a96e; font-weight: 700; margin: 0; letter-spacing: -0.01em;">Statement of Work</h1>
          <p style="font-size: 11px; color: #4a9b6f; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 6px;">✓ Fully Executed</p>
        </div>

        <!-- Greeting -->
        <p style="margin-bottom: 8px; font-size: 13px;">Hi ${recipientName},</p>
        <p style="margin-bottom: 32px; color: #8a7d6b; font-size: 12px; line-height: 1.8;">
          The Statement of Work for <strong style="color: #d4c5a8;">${sow.data?.project?.title || 'your project'}</strong>
          has been signed by both parties and is now fully executed.
        </p>

        <!-- Agreement Summary -->
        <div style="background: #111008; border: 1px solid #2a2520; padding: 24px; margin-bottom: 32px;">
          <p style="font-size: 9px; color: #4a4035; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px;">Agreement Summary</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 10px; color: #6b6050; padding: 6px 0; width: 40%;">Client</td>
              <td style="font-size: 11px; color: #d4c5a8; padding: 6px 0;">${sow.client_name}</td>
            </tr>
            <tr>
              <td style="font-size: 10px; color: #6b6050; padding: 6px 0;">Project</td>
              <td style="font-size: 11px; color: #d4c5a8; padding: 6px 0;">${sow.data?.project?.title || '—'}</td>
            </tr>
            <tr>
              <td style="font-size: 10px; color: #6b6050; padding: 6px 0;">Total Value</td>
              <td style="font-size: 11px; color: #c9a96e; padding: 6px 0;">${sow.data?.pricing?.currency || ''} ${sow.data?.pricing?.total || '—'}</td>
            </tr>
            <tr>
              <td style="font-size: 10px; color: #6b6050; padding: 6px 0;">Completed</td>
              <td style="font-size: 11px; color: #d4c5a8; padding: 6px 0;">${signedAt}</td>
            </tr>
          </table>
        </div>

        <!-- Signatures -->
        <div style="margin-bottom: 32px;">
          <p style="font-size: 9px; color: #4a4035; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px;">Signatures</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">

            <!-- ARCODIC sig -->
            <div style="background: #111008; border: 1px solid #2a2520; padding: 20px;">
              <p style="font-size: 9px; color: #4a4035; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">ARCODIC</p>
              <p style="font-size: 22px; font-family: Georgia, serif; font-style: italic; color: #c9a96e; margin-bottom: 8px; letter-spacing: -0.02em;">${sow.arcodic_signature || 'A. Arcodic'}</p>
              <p style="font-size: 9px; color: #6b6050;">Signed ${arcSignedAt}</p>
            </div>

            <!-- Client sig -->
            <div style="background: #111008; border: 1px solid #2a2520; padding: 20px;">
              <p style="font-size: 9px; color: #4a4035; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">CLIENT</p>
              <p style="font-size: 22px; font-family: Georgia, serif; font-style: italic; color: #d4c5a8; margin-bottom: 8px; letter-spacing: -0.02em;">${client_signature}</p>
              <p style="font-size: 9px; color: #6b6050;">Signed ${signedAt}</p>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div style="padding-top: 24px; border-top: 1px solid #1e1a14;">
          <p style="font-size: 10px; color: #4a4035; line-height: 1.8;">
            Please retain this email as your legally binding record of execution.<br/>
            Both parties have agreed to the terms outlined in the Statement of Work.
          </p>
        </div>

      </div>
    `;

    await Promise.all([
      resend.emails.send({
        from: 'ARCODIC <hello@arcodic.com>',
        to: sow.client_email,
        subject: `Signed — Statement of Work: ${sow.data?.project?.title}`,
        html: completionHtml(sow.client_name),
      }),
      resend.emails.send({
        from: 'ARCODIC <hello@arcodic.com>',
        to: 'rudz.dev@gmail.com',
        subject: `Client Signed — ${sow.client_name}: ${sow.data?.project?.title}`,
        html: completionHtml('ARCODIC Team'),
      }),
    ]);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
