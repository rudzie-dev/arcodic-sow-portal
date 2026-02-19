import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react';

const FONTS = [
  { name: 'Pinyon Script',   style: "'Pinyon Script', cursive"   },
  { name: 'Great Vibes',     style: "'Great Vibes', cursive"     },
  { name: 'Dancing Script',  style: "'Dancing Script', cursive"  },
  { name: 'Pacifico',        style: "'Pacifico', cursive"        },
];

const getCurrency = (code) => {
  const map = {
    USD:'$', EUR:'€', GBP:'£', ZAR:'R', AED:'د.إ', SAR:'﷼',
    CAD:'C$', AUD:'A$', CHF:'Fr', JPY:'¥', CNY:'¥', INR:'₹',
    NGN:'₦', EGP:'E£', TRY:'₺', BRL:'R$', MXN:'MX$', SGD:'S$',
    QAR:'ر.ق', KWD:'د.ك',
  };
  return map[code] || code;
};

export default function SignPage() {
  const { token } = useParams();
  const [state, setState] = useState('loading'); // loading | ready | signed | error | expired
  const [sow, setSow] = useState(null);
  const [arcSig, setArcSig] = useState('');
  const [typedSig, setTypedSig] = useState('');
  const [selectedFont, setSelectedFont] = useState(0);
  const [signing, setSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: tokenRow, error } = await supabase
          .from('sow_tokens')
          .select('*, sows(*)')
          .eq('token', token)
          .single();

        if (error || !tokenRow) return setState('error');
        if (tokenRow.used) return setState('expired');
        if (new Date(tokenRow.expires_at) < new Date()) return setState('expired');

        setSow(tokenRow.sows);
        setArcSig(tokenRow.sows.arcodic_signature || '');
        setState('ready');
      } catch {
        setState('error');
      }
    };
    load();
  }, [token]);

  const handleSign = async () => {
    if (!typedSig.trim()) return;
    setSigning(true);
    try {
      const res = await fetch('/api/complete-sow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, client_signature: typedSig }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setState('signed');
    } catch (err) {
      setErrorMsg(err.message);
      setSigning(false);
    }
  };

  // ── STATES ──
  if (state === 'loading') return (
    <div style={styles.center}>
      <Loader size={24} style={{ color: '#c9a96e', animation: 'spin 1s linear infinite' }} />
      <p style={styles.sub}>Loading document…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (state === 'error') return (
    <div style={styles.center}>
      <AlertCircle size={32} style={{ color: '#c0614a', marginBottom: 16 }} />
      <h2 style={styles.heading}>Invalid Link</h2>
      <p style={styles.sub}>This signing link is invalid or does not exist.</p>
    </div>
  );

  if (state === 'expired') return (
    <div style={styles.center}>
      <AlertCircle size={32} style={{ color: '#c09050', marginBottom: 16 }} />
      <h2 style={styles.heading}>Link Unavailable</h2>
      <p style={styles.sub}>This link has already been used or has expired.<br />Please contact ARCODIC for a new link.</p>
    </div>
  );

  if (state === 'signed') return (
    <div style={styles.center}>
      <CheckCircle2 size={40} style={{ color: '#4a9b6f', marginBottom: 16 }} />
      <h2 style={{ ...styles.heading, color: '#4a9b6f' }}>Document Signed</h2>
      <p style={styles.sub}>Thank you. Both parties have signed the agreement.<br />A confirmation has been sent to your email.</p>
    </div>
  );

  const d = sow?.data || {};
  const currency = getCurrency(d.pricing?.currency || 'ZAR');
  const today = new Date(sow?.arcodic_signed_at || Date.now()).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=Pinyon+Script&family=Great+Vibes&family=Dancing+Script:wght@700&family=Pacifico&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0906; color: #d4c5a8; font-family: 'DM Mono', monospace; font-size: 13px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* NAV */}
      <nav style={navStyle}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={logoStyle}>A</div>
          <span style={brandStyle}>ARCODIC <span style={{ color:'#6b6050', fontWeight:400 }}>SOW Review</span></span>
        </div>
        <div style={{ fontSize:10, color:'#6b6050', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          Read-only · Signing required
        </div>
      </nav>

      <div style={pageStyle}>
        {/* Banner */}
        <div style={bannerStyle}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#c9a96e', boxShadow:'0 0 8px #c9a96e', flexShrink:0 }} />
          <span>This document has been prepared and signed by ARCODIC. Please review and add your signature below.</span>
        </div>

        <div style={docStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:48 }}>
              <div>
                <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:48, fontWeight:600, color:'#f0e8d8', lineHeight:1.05 }}>
                  Statement<br />of Work
                </h1>
                <p style={{ fontSize:11, color:'#8a7250', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:10 }}>
                  Agreement № ARC-{new Date().getFullYear()}-001 · {today}
                </p>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:700, color:'#c9a96e', letterSpacing:'0.15em', textTransform:'uppercase' }}>Arcodic</div>
                <div style={{ fontSize:10, color:'#6b6050', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4 }}>Digital Service Provider</div>
              </div>
            </div>

            {/* Parties */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div style={cardStyle}>
                <div style={labelStyle}>Client</div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:'#f0e8d8', marginBottom:8 }}>{d.client?.name}</div>
                <div style={{ fontSize:12, color:'#8a7d6b' }}>{d.client?.address}</div>
              </div>
              <div style={cardStyle}>
                <div style={labelStyle}>Contact Details</div>
                {[['Primary Contact', d.client?.contact], ['Email', d.client?.email], ['Phone', d.client?.phone]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e1a15', fontSize:12 }}>
                    <span style={{ color:'#6b6050' }}>{k}</span>
                    <span style={{ color:'#d4c5a8' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={bodyStyle}>

            {/* Overview */}
            <Section num="01" title="Project Overview">
              <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:26, fontWeight:600, color:'#f0e8d8', marginBottom:8 }}>{d.project?.title}</div>
              <div style={{ color:'#8a7d6b', lineHeight:1.8 }}>{d.project?.description}</div>
            </Section>

            {/* Scope */}
            <Section num="02" title="Scope of Work">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'#1e1a15', border:'1px solid #1e1a15' }}>
                {[
                  { label:'Pages & Screens', items: d.scope?.pages, color:'#4a8a7a' },
                  { label:'Functionality',   items: d.scope?.features, color:'#c9a96e' },
                  { label:'Integrations',    items: d.scope?.integrations, color:'#c09050' },
                ].map(col => (
                  <div key={col.label} style={{ background:'#16130e', padding:24 }}>
                    <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:col.color, marginBottom:16 }}>{col.label}</div>
                    <ul style={{ listStyle:'none' }}>
                      {(col.items||[]).map((item,i) => (
                        <li key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8, fontSize:12, color:'#d4c5a8' }}>
                          <span style={{ color:'#8a7250', marginTop:2 }}>›</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            {/* Timeline + Finance */}
            <Section num="03–04" title="Milestones & Financial Terms">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }}>
                <div>
                  {(d.timeline||[]).map((m,i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'8px 1fr auto', gap:16, alignItems:'center', padding:'12px 0', borderBottom:'1px solid #1e1a15' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'#c9a96e', boxShadow:'0 0 0 3px rgba(201,169,110,0.15)' }} />
                      <span style={{ fontSize:12 }}>{m.desc}</span>
                      <span style={{ fontSize:11, color:'#6b6050' }}>{new Date(m.date).toLocaleDateString('en-ZA')}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#16130e', border:'1px solid #2a2520', padding:32 }}>
                  <div style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8a7250', marginBottom:8 }}>Total Project Fee</div>
                  <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:48, fontWeight:700, color:'#f0e8d8', lineHeight:1, marginBottom:24 }}>
                    {currency}{d.pricing?.total}
                  </div>
                  <div style={{ height:1, background:'#1e1a15', marginBottom:24 }} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {[['Deposit', d.pricing?.deposit], ['Revisions', d.pricing?.revisions]].map(([k,v]) => (
                      <div key={k}>
                        <div style={{ fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6b6050', marginBottom:4 }}>{k}</div>
                        <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, color:'#e8d5b0' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Signatures */}
            <Section num="05" title="Acceptance & Signing">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>

                {/* ARCODIC — locked */}
                <div style={sigBoxStyle}>
                  <div style={labelStyle}>ARCODIC</div>
                  <div style={sigDisplayStyle}>
                    <span style={{ fontFamily:"'Great Vibes', cursive", fontSize:36, color:'#e8d5b0' }}>{arcSig || 'A. Arcodic Representative'}</span>
                  </div>
                  <div style={sigMetaStyle}>
                    <div><div style={metaKeyStyle}>Signatory</div><div style={{ fontSize:12 }}>A. Arcodic Representative</div></div>
                    <div><div style={metaKeyStyle}>Date</div><div style={{ fontSize:12 }}>{today}</div></div>
                  </div>
                  <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:6, fontSize:10, color:'#4a9b6f' }}>
                    <CheckCircle2 size={12} /> Signed & locked
                  </div>
                </div>

                {/* Client — interactive */}
                <div style={sigBoxStyle}>
                  <div style={labelStyle}>CLIENT</div>

                  {/* Font picker */}
                  <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                    {FONTS.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedFont(i)}
                        style={{
                          background: selectedFont === i ? 'rgba(201,169,110,0.15)' : 'transparent',
                          border: `1px solid ${selectedFont === i ? '#c9a96e' : '#2a2520'}`,
                          color: selectedFont === i ? '#c9a96e' : '#6b6050',
                          padding:'4px 10px', cursor:'pointer', fontSize:10,
                          letterSpacing:'0.05em', transition:'all 0.15s',
                        }}
                      >
                        {f.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Type input */}
                  <input
                    type="text"
                    placeholder="Type your full name to sign"
                    value={typedSig}
                    onChange={e => setTypedSig(e.target.value)}
                    style={{
                      width:'100%', background:'rgba(0,0,0,0.2)',
                      border:'none', borderBottom:'1px solid #2a2520',
                      color:'#e8d5b0', fontFamily: FONTS[selectedFont].style,
                      fontSize:32, padding:'8px 4px', outline:'none',
                      marginBottom:16, transition:'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderBottomColor = '#c9a96e'}
                    onBlur={e => e.target.style.borderBottomColor = '#2a2520'}
                  />

                  <div style={sigMetaStyle}>
                    <div><div style={metaKeyStyle}>Signatory</div><div style={{ fontSize:12 }}>{d.client?.name}</div></div>
                    <div><div style={metaKeyStyle}>Date</div><div style={{ fontSize:12 }}>{new Date().toLocaleDateString('en-ZA', { year:'numeric', month:'long', day:'numeric' })}</div></div>
                  </div>

                  {errorMsg && (
                    <p style={{ color:'#c0614a', fontSize:11, marginTop:12 }}>{errorMsg}</p>
                  )}

                  <button
                    onClick={handleSign}
                    disabled={!typedSig.trim() || signing}
                    style={{
                      marginTop:20, width:'100%',
                      background: typedSig.trim() ? '#c9a96e' : '#2a2520',
                      color: typedSig.trim() ? '#0a0906' : '#6b6050',
                      border:'none', padding:'14px 0',
                      fontFamily:"'DM Mono', monospace",
                      fontSize:11, fontWeight:500,
                      letterSpacing:'0.12em', textTransform:'uppercase',
                      cursor: typedSig.trim() ? 'pointer' : 'not-allowed',
                      transition:'all 0.2s',
                    }}
                  >
                    {signing ? 'Submitting…' : 'Sign & Complete Agreement'}
                  </button>
                </div>
              </div>
            </Section>
          </div>

          {/* Legal */}
          <div style={{ padding:'24px 64px 48px', borderTop:'1px solid #1e1a15', fontSize:10, color:'#6b6050', lineHeight:1.8, letterSpacing:'0.03em' }}>
            This Statement of Work is governed by and incorporated into the Master Service Agreement between ARCODIC and the Client.
            Any functionality, screen, feature, or integration not expressly listed above is excluded from this engagement.
            ARCODIC reserves the right to adjust implementation tools or libraries where technically necessary without material impact to deliverables.
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ── */
const Section = ({ num, title, children }) => (
  <div style={{ marginBottom:56 }}>
    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:16, borderBottom:'1px solid #1e1a15' }}>
      <span style={{ fontSize:10, color:'#c9a96e', letterSpacing:'0.1em', fontWeight:500, minWidth:24 }}>{num}</span>
      <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, color:'#f0e8d8', letterSpacing:'0.02em' }}>{title}</h2>
    </div>
    {children}
  </div>
);

/* ── Styles ── */
const styles = {
  center: { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:40 },
  heading: { fontFamily:"'Cormorant Garamond', serif", fontSize:28, fontWeight:600, color:'#f0e8d8' },
  sub: { fontSize:13, color:'#6b6050', textAlign:'center', lineHeight:1.8 },
};

const navStyle = {
  position:'sticky', top:0, zIndex:100,
  height:60, display:'flex', alignItems:'center', justifyContent:'space-between',
  padding:'0 40px', background:'rgba(10,9,6,0.95)', borderBottom:'1px solid #2a2520',
  backdropFilter:'blur(20px)',
};
const logoStyle = {
  width:32, height:32, background:'#c9a96e',
  display:'flex', alignItems:'center', justifyContent:'center',
  fontFamily:"'Cormorant Garamond', serif", fontWeight:700, fontSize:16, color:'#0a0906',
};
const brandStyle = { fontFamily:"'Cormorant Garamond', serif", fontSize:18, fontWeight:600, color:'#f0e8d8', letterSpacing:'0.05em' };
const pageStyle = { maxWidth:900, margin:'0 auto', padding:'48px 40px 120px' };
const bannerStyle = {
  display:'flex', alignItems:'center', gap:12,
  padding:'14px 20px', marginBottom:32,
  background:'rgba(201,169,110,0.06)', border:'1px solid rgba(201,169,110,0.2)',
  fontSize:12, color:'#8a7d6b',
};
const docStyle = { background:'#111008', border:'1px solid #2a2520', overflow:'hidden' };
const headerStyle = { padding:'64px 64px 48px', borderBottom:'1px solid #2a2520' };
const bodyStyle = { padding:64 };
const cardStyle = { padding:24, border:'1px solid #1e1a15', background:'#16130e' };
const labelStyle = { fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8a7250', marginBottom:14 };
const sigBoxStyle = { border:'1px solid #1e1a15', padding:24, background:'#16130e' };
const sigDisplayStyle = { minHeight:80, display:'flex', alignItems:'center', borderBottom:'1px solid #2a2520', marginBottom:16, paddingBottom:8 };
const sigMetaStyle = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 };
const metaKeyStyle = { fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6b6050', marginBottom:3 };
