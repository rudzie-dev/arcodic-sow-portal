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

    const completionHtml = (recipientName) => `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0906; color: #d4c5a8;">
        <h1 style="font-size: 28px; color: #c9a96e; margin-bottom: 8px;">ARCODIC</h1>
        <p style="color: #6b6050; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 40px;">Statement of Work — Fully Executed</p>
        <p style="margin-bottom: 16px;">Hi ${recipientName},</p>
        <p style="margin-bottom: 8px; color: #8a7d6b;">
          Great news — the Statement of Work for <strong style="color: #d4c5a8;">${sow.data?.project?.title || 'your project'}</strong> 
          has been signed by both parties.
        </p>
        <p style="margin-bottom: 32px; color: #6b6050; font-size: 11px;">Completed on ${signedAt}</p>
        <div style="background: #16130e; border: 1px solid #2a2520; padding: 24px; margin-bottom: 32px;">
          <p style="font-size: 10px; color: #6b6050; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px;">Agreement Summary</p>
          <p style="margin-bottom: 4px;">Client: <span style="color: #c9a96e;">${sow.client_name}</span></p>
          <p style="margin-bottom: 4px;">Project: <span style="color: #c9a96e;">${sow.data?.project?.title}</span></p>
          <p>Total Value: <span style="color: #c9a96e;">${sow.data?.pricing?.currency} ${sow.data?.pricing?.total}</span></p>
        </div>
        <p style="font-size: 11px; color: #6b6050;">Please retain this email as your record of execution.</p>
        <hr style="border-color: #2a2520; margin: 32px 0;" />
        <p style="font-size: 10px; color: #4a4035;">ARCODIC Digital Service Provider</p>
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
