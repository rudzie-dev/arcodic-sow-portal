import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { data, arcod_signature, client_email, client_name } = req.body;

  try {
    // 1. Save SOW to Supabase
    const { data: sow, error: sowError } = await supabase
      .from('sows')
      .insert({
        data,
        status: 'sent',
        arcodic_signature,
        arcodic_signed_at: new Date().toISOString(),
        client_email,
        client_name,
      })
      .select()
      .single();

    if (sowError) throw sowError;

    // 2. Generate unique token for client link
    const { data: tokenRow, error: tokenError } = await supabase
      .from('sow_tokens')
      .insert({ sow_id: sow.id })
      .select()
      .single();

    if (tokenError) throw tokenError;

    const signingLink = `${process.env.VITE_APP_URL}/sign/${tokenRow.token}`;

    // 3. Email the client
    await resend.emails.send({
      from: 'ARCODIC <sow@yourdomain.com>',
      to: client_email,
      subject: `Action Required: Please sign your Statement of Work`,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0906; color: #d4c5a8;">
          <h1 style="font-size: 28px; color: #c9a96e; margin-bottom: 8px;">ARCODIC</h1>
          <p style="color: #6b6050; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 40px;">Statement of Work</p>
          
          <p style="margin-bottom: 16px;">Hi ${client_name},</p>
          <p style="margin-bottom: 24px; color: #8a7d6b;">
            Your Statement of Work is ready for review and signature. 
            Please click the button below to view the document and sign.
          </p>
          
          <a href="${signingLink}" style="
            display: inline-block;
            background: #c9a96e;
            color: #0a0906;
            padding: 14px 32px;
            text-decoration: none;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-size: 12px;
            margin-bottom: 32px;
          ">Review & Sign Document</a>
          
          <p style="font-size: 11px; color: #6b6050;">
            This link expires in 7 days. If you have any questions, 
            reply to this email or contact us directly.
          </p>
          
          <hr style="border-color: #2a2520; margin: 32px 0;" />
          <p style="font-size: 10px; color: #4a4035;">ARCODIC Digital Service Provider</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, sow_id: sow.id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}