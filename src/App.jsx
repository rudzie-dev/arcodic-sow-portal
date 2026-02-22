import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Download, Briefcase, User, Layers,
  Calendar, CreditCard, PenTool, CheckCircle2,
  ChevronRight, Zap, Globe, Code2
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CURRENCIES
───────────────────────────────────────────── */
const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'US Dollar'          },
  { code: 'EUR', symbol: '€',   name: 'Euro'               },
  { code: 'GBP', symbol: '£',   name: 'British Pound'      },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham'         },
  { code: 'SAR', symbol: '﷼',   name: 'Saudi Riyal'        },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal'       },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar'    },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar'  },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc'        },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen'       },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan'       },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee'       },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira'     },
  { code: 'EGP', symbol: 'E£',  name: 'Egyptian Pound'     },
  { code: 'TRY', symbol: '₺',   name: 'Turkish Lira'       },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real'     },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso'       },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar'   },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar'      },
];

const getCurrency = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[12];

/* ─────────────────────────────────────────────
   CURRENCY SELECT
───────────────────────────────────────────── */
const CurrencySelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = getCurrency(value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="currency-select" ref={ref}>
      <button className="currency-trigger print-hide" onClick={() => setOpen(o => !o)}>
        <span className="currency-symbol-preview">{selected.symbol}</span>
        <span className="currency-code-preview">{selected.code}</span>
        <span className="currency-chevron">{open ? '▲' : '▼'}</span>
      </button>
      <span className="currency-symbol-print">{selected.symbol}</span>
      {open && (
        <div className="currency-dropdown">
          <div className="currency-dropdown-inner">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                className={`currency-option ${c.code === value ? 'active' : ''}`}
                onClick={() => { onChange(c.code); setOpen(false); }}
              >
                <span className="co-symbol">{c.symbol}</span>
                <span className="co-code">{c.code}</span>
                <span className="co-name">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   TYPE SIGN PAD
───────────────────────────────────────────── */
const SIG_FONTS = [
  { name: 'Cormorant', style: "'Cormorant Garamond', serif" },
  { name: 'Pinyon',    style: "'Pinyon Script', cursive"    },
  { name: 'Vibes',     style: "'Great Vibes', cursive"      },
  { name: 'Dancing',   style: "'Dancing Script', cursive"   },
  { name: 'Pacifico',  style: "'Pacifico', cursive"         },
];

const TypeSignPad = ({ label, signatory, date, value, onChange, locked = false }) => {
  const [fontIdx, setFontIdx] = useState(0);
  return (
    <div className="sig-pad">
      <span className="sig-label">{label}</span>
      {!locked && (
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {SIG_FONTS.map((f, i) => (
            <button key={i} onClick={() => setFontIdx(i)} className="print-hide" style={{
              background: fontIdx === i ? 'rgba(201,169,110,0.15)' : 'transparent',
              border: `1px solid ${fontIdx === i ? 'var(--gold)' : 'var(--border)'}`,
              color: fontIdx === i ? 'var(--gold)' : 'var(--muted)',
              padding:'4px 10px', cursor:'pointer', fontSize:10,
              letterSpacing:'0.05em', transition:'all 0.15s', fontFamily:'inherit',
            }}>{f.name}</button>
          ))}
        </div>
      )}
      <div style={{ position:'relative', marginBottom:16 }}>
        {locked ? (
          <div style={{
            minHeight:72, display:'flex', alignItems:'center',
            borderBottom:'1px solid var(--border)',
            fontFamily: SIG_FONTS[fontIdx].style,
            fontSize:40, color:'var(--cream)', paddingBottom:8,
          }}>{value || <span style={{ color:'var(--muted)', fontSize:14, fontFamily:'inherit' }}>Not yet signed</span>}</div>
        ) : (
          <input
            type="text"
            placeholder="Type your full name to sign…"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="sig-type-input"
            style={{ fontFamily: SIG_FONTS[fontIdx].style }}
          />
        )}
      </div>
      <div className="sig-meta">
        <div><div className="meta-key">Signatory</div><div className="meta-val">{signatory}</div></div>
        <div><div className="meta-key">Date</div><div className="meta-val">{date}</div></div>
      </div>
      {locked && (
        <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, fontSize:10, color:'#4a9b6f' }}>
          <CheckCircle2 size={12} /> Signed & locked
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   EDITABLE FIELD
───────────────────────────────────────────── */
const Field = ({ value, onChange, className='', multiline=false, rows=2, placeholder='' }) => {
  const props = { className:`editable ${className}`, value, onChange:(e)=>onChange(e.target.value), placeholder };
  return multiline ? <textarea {...props} rows={rows} /> : <input {...props} />;
};

/* ─────────────────────────────────────────────
   SCOPE COLUMN
───────────────────────────────────────────── */
const ScopeColumn = ({ icon: Icon, label, accent, items, onAdd, onRemove, onEdit }) => (
  <div className="scope-col">
    <div className="scope-col-header" style={{ '--accent': accent }}>
      <Icon size={14} /><span>{label}</span>
      <button className="scope-add print-hide" onClick={onAdd}><Plus size={12} /></button>
    </div>
    <ul className="scope-list">
      {items.map((item, i) => (
        <li key={i} className="scope-item group-item">
          <ChevronRight size={10} className="scope-bullet" />
          <input className="scope-input" value={item} onChange={(e) => onEdit(i, e.target.value)} />
          <button className="scope-remove print-hide" onClick={() => onRemove(i)}><Trash2 size={10} /></button>
        </li>
      ))}
    </ul>
  </div>
);

/* ─────────────────────────────────────────────
   SUPABASE (anon, read-only polling)
───────────────────────────────────────────── */
const SUPABASE_URL  = 'https://ctjwqktzdvbfijoqnxvo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0andxa3R6ZHZiZmlqb3FueHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODY3MDksImV4cCI6MjA4NzA2MjcwOX0.ng2Ek0nFDteMqsQM-Or-TCBkp424uyCKbWjNbJ7MpUo';

/* ─────────────────────────────────────────────
   BLANK FORM
───────────────────────────────────────────── */
const BLANK_FORM = {
  client:  { name:'', address:'', contact:'', email:'', phone:'' },
  project: { title:'', description:'' },
  scope:   { pages:['Home Page'], features:['Feature 1'], integrations:['Integration 1'] },
  timeline:[ { desc:'Project Kickoff', date: new Date().toISOString().split('T')[0] } ],
  pricing: { total:'', currency:'ZAR', deposit:'50%', revisions:'3' },
};

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const navigate = useNavigate();

  // ── Auth ──
  const [welcomed,     setWelcomed]     = useState(false);
  const [activeProfile,setActiveProfile]= useState(0);
  const [password,     setPassword]     = useState('');
  const [pwError,      setPwError]      = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [pwFocused,    setPwFocused]    = useState(false);
  const [exiting,      setExiting]      = useState(false);

  // ── Form ──
  const [data,         setData]         = useState(BLANK_FORM);
  const [scrolled,     setScrolled]     = useState(false);
  const [arcSig,       setArcSig]       = useState('');
  const [clientSig,    setClientSig]    = useState(null);
  const [clientSignedAt,setClientSignedAt]= useState(null);

  // ── Send ──
  const [showSendModal,setShowSendModal]= useState(false);
  const [clientEmailInput,setClientEmailInput]= useState('');
  const [sending,      setSending]      = useState(false);
  const [sendError,    setSendError]    = useState('');
  const [sent,         setSent]         = useState(false);

  // ── Polling ──
  const [sowId,        setSowId]        = useState(() => localStorage.getItem('arcodic_sow_id'));
  const pollTimerRef = useRef(null);

  // ── Profiles ──
  const PROFILES = [
    { id:'rudz',  name:'Rudz',  image:'/rudz.webp',  password:'URfavraut156', title:'Founder & CEO', greeting:'Welcome back.', sub:"The portal's ready. Let's close something.", joke:null, btnText:'Enter Portal', color:'#c9a96e' },
    { id:'kaleb', name:'Kaleb', image:'/kaleb.webp', password:'12345',        title:'Co-Founder',    greeting:'Oh. Kaleb.',    sub:"Rudz already handled it. You're welcome.", joke:"Password hasn't changed. We've had this talk. 💀", btnText:'Fine, let him in', color:'#4a8a7a' },
  ];
  const TOTAL = PROFILES.length;

  const handleGoTo = (dir) => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      setActiveProfile(prev => (prev + (dir === 'left' ? -1 : 1) + TOTAL) % TOTAL);
      setPassword(''); setPwError(''); setExiting(false);
    }, 320);
  };

  const handleLogin = () => {
    if (password === PROFILES[activeProfile].password) {
      setWelcomed(true);
    } else {
      setPwError('Incorrect password.');
      setTimeout(() => setPwError(''), 2500);
    }
  };

  // Auto-rotate
  useEffect(() => {
    if (welcomed || pwFocused) return;
    const t = setInterval(() => handleGoTo('right'), 6000);
    return () => clearInterval(t);
  }, [welcomed, pwFocused, activeProfile, exiting]);

  // Scroll listener
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Read ?sow= URL param (from dashboard View & Print)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('sow');
    if (p && p !== sowId) {
      setSowId(p);
      localStorage.setItem('arcodic_sow_id', p);
      setClientSig(null); setClientSignedAt(null); setSent(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Re-sync when window refocuses (returning from dashboard tab)
  useEffect(() => {
    const onFocus = () => {
      const s = localStorage.getItem('arcodic_sow_id');
      if (s && s !== sowId) {
        setSowId(s); setClientSig(null); setClientSignedAt(null); setSent(false);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [sowId]);

  // Poll Supabase for client signature
  useEffect(() => {
    if (!sowId) return;
    const poll = async () => {
      try {
        const res  = await fetch(`${SUPABASE_URL}/rest/v1/sows?id=eq.${sowId}&select=status,client_signature,client_signed_at`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
        });
        const rows = await res.json();
        if (rows?.[0]?.status === 'completed') {
          setClientSig(rows[0].client_signature);
          setClientSignedAt(rows[0].client_signed_at);
          setSent(true);
          if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
        }
      } catch (e) {}
    };
    poll();
    pollTimerRef.current = setInterval(poll, 8000);
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [sowId]);

  // Send via API route (triggers Resend email)
  const sendSOW = async () => {
    if (!data.client.name.trim())  { setSendError('Client name is required.');    return; }
    if (!clientEmailInput.trim())  { setSendError('Client email is required.');   return; }
    if (!arcSig.trim())            { setSendError('Please sign as ARCODIC first.'); return; }
    setSending(true); setSendError('');
    try {
      const res  = await fetch('/api/send-sow', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ data, arcodic_signature:arcSig, client_email:clientEmailInput, client_name:data.client.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Send failed');
      setSowId(json.sow_id);
      localStorage.setItem('arcodic_sow_id', json.sow_id);
      setSent(true); setShowSendModal(false);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  // New SOW — full reset
  const handleNewSOW = () => {
    setData(BLANK_FORM); setArcSig(''); setClientSig(null); setClientSignedAt(null);
    setClientEmailInput(''); setSent(false); setSendError('');
    setSowId(null); localStorage.removeItem('arcodic_sow_id');
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
  };

  // Form helpers
  const set = (path, value) => {
    const keys = path.split('.');
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      keys.reduce((obj,k,i) => i===keys.length-1 ? (obj[k]=value) : obj[k], next);
      return next;
    });
  };
  const scopeAdd     = (cat)       => setData(p => { const n=JSON.parse(JSON.stringify(p)); n.scope[cat].push('New item'); return n; });
  const scopeRemove  = (cat,i)     => setData(p => { const n=JSON.parse(JSON.stringify(p)); n.scope[cat].splice(i,1); return n; });
  const scopeEdit    = (cat,i,v)   => setData(p => { const n=JSON.parse(JSON.stringify(p)); n.scope[cat][i]=v; return n; });
  const timelineEdit = (i,key,val) => setData(p => { const n=JSON.parse(JSON.stringify(p)); n.timeline[i][key]=val; return n; });
  const addMilestone    = ()  => setData(p => { const n=JSON.parse(JSON.stringify(p)); n.timeline.push({desc:'New Milestone',date:new Date().toISOString().split('T')[0]}); return n; });
  const removeMilestone = (i) => setData(p => { const n=JSON.parse(JSON.stringify(p)); n.timeline.splice(i,1); return n; });

  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  // ════════════════════════════════════════════
  // WELCOME SCREEN
  // ════════════════════════════════════════════
  if (!welcomed) {
    const active = PROFILES[activeProfile];
    const prev   = PROFILES[(activeProfile - 1 + TOTAL) % TOTAL];
    const next   = PROFILES[(activeProfile + 1) % TOTAL];

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300&family=DM+Mono:wght@300;400;500&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          html,body,#root{width:100%;height:100%;}
          body{background:#080705;font-family:'DM Mono',monospace;-webkit-font-smoothing:antialiased;overflow:hidden;}
          @keyframes wFadeIn  {from{opacity:0}to{opacity:1}}
          @keyframes wSlideUp {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes wPulse   {0%,100%{opacity:1}50%{opacity:0.3}}
          @keyframes wShake   {0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
          .w-root{width:100vw;height:100vh;display:grid;grid-template-columns:52% 48%;background:#080705;}
          .w-left{position:relative;background:linear-gradient(135deg,#080705 0%,#0e0c09 50%,#080705 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;}
          .w-left-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(201,169,110,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,0.025) 1px,transparent 1px);background-size:60px 60px;}
          .w-left-glow{position:absolute;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(201,169,110,0.06) 0%,transparent 70%);pointer-events:none;}
          .w-left::before{content:'';position:absolute;top:32px;left:32px;width:48px;height:48px;border-top:1px solid #1a1610;border-left:1px solid #1a1610;}
          .w-left::after{content:'';position:absolute;bottom:32px;right:32px;width:48px;height:48px;border-bottom:1px solid #1a1610;border-right:1px solid #1a1610;}
          .w-brand{position:absolute;top:36px;left:48px;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#3a3028;animation:wFadeIn 0.6s ease both;}
          .w-carousel{position:relative;width:320px;height:320px;display:flex;align-items:center;justify-content:center;animation:wFadeIn 0.6s 0.1s ease both;}
          .w-avatar{position:absolute;border-radius:50%;overflow:hidden;cursor:pointer;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);user-select:none;}
          .w-avatar img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block;}
          .w-avatar-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:600;color:rgba(255,255,255,0.4);}
          .w-avatar-active{width:168px;height:168px;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;box-shadow:0 0 0 3px rgba(201,169,110,0.2),0 0 0 6px rgba(201,169,110,0.05),0 24px 64px rgba(0,0,0,0.6);}
          .w-avatar-left{width:110px;height:110px;left:10px;top:50%;transform:translateY(-50%) perspective(600px) rotateY(18deg);z-index:2;box-shadow:0 12px 32px rgba(0,0,0,0.5);filter:brightness(0.55) saturate(0.6);}
          .w-avatar-left:hover{filter:brightness(0.75) saturate(0.8);}
          .w-avatar-right{width:110px;height:110px;right:10px;top:50%;transform:translateY(-50%) perspective(600px) rotateY(-18deg);z-index:2;box-shadow:0 12px 32px rgba(0,0,0,0.5);filter:brightness(0.55) saturate(0.6);}
          .w-avatar-right:hover{filter:brightness(0.75) saturate(0.8);}
          .w-profile-info{margin-top:32px;text-align:center;animation:wSlideUp 0.35s ease both;position:relative;z-index:4;}
          .w-profile-name{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:#f0e8d8;letter-spacing:0.02em;margin-bottom:4px;}
          .w-profile-title{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#4a4035;}
          .w-arrows{display:flex;align-items:center;gap:12px;margin-top:32px;position:relative;z-index:4;animation:wSlideUp 0.4s 0.15s ease both;}
          .w-arrow{width:36px;height:36px;background:rgba(201,169,110,0.04);border:1px solid #2a2520;color:#4a3a28;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:50%;font-size:14px;transition:all 0.2s;user-select:none;}
          .w-arrow:hover{background:rgba(201,169,110,0.08);border-color:#c9a96e;color:#c9a96e;transform:scale(1.08);}
          .w-arrow:active{transform:scale(0.95);}
          .w-dots{display:flex;gap:6px;align-items:center;margin:0 8px;}
          .w-dot{width:4px;height:4px;border-radius:50%;background:#2a2520;transition:all 0.3s;cursor:pointer;}
          .w-dot.active{background:#c9a96e;transform:scale(1.3);}
          .w-left-badge{position:absolute;bottom:36px;left:0;right:0;text-align:center;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#2a2218;animation:wFadeIn 0.6s 0.3s ease both;}
          .w-right{position:relative;background:#0e0c09;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 72px;}
          .w-right::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 20% 20%,rgba(201,169,110,0.03) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(74,138,122,0.02) 0%,transparent 50%);}
          .w-divider{position:absolute;left:0;top:10%;bottom:10%;width:1px;background:linear-gradient(to bottom,transparent,rgba(201,169,110,0.08) 30%,rgba(201,169,110,0.08) 70%,transparent);}
          .w-right-inner{position:relative;z-index:1;width:100%;max-width:340px;}
          .w-right-label{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#4a4035;margin-bottom:40px;display:flex;align-items:center;gap:8px;animation:wSlideUp 0.4s ease both;}
          .w-right-label::before{content:'';width:20px;height:1px;background:#2a2520;}
          .w-right-greeting{font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:300;line-height:1.1;color:#f0e8d8;margin-bottom:8px;animation:wSlideUp 0.4s 0.05s ease both;}
          .w-right-greeting strong{font-weight:600;display:block;}
          .w-right-sub{font-size:11px;color:#5a5040;line-height:1.8;margin-bottom:6px;animation:wSlideUp 0.4s 0.08s ease both;}
          .w-right-joke{font-size:10px;color:#3a2e20;font-style:italic;animation:wSlideUp 0.4s 0.1s ease both;}
          .w-right-divider{width:32px;height:1px;background:#252018;margin:28px 0;animation:wFadeIn 0.4s 0.12s ease both;}
          .w-pw-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#4a4035;margin-bottom:10px;animation:wSlideUp 0.4s 0.14s ease both;}
          .w-pw-field{display:flex;align-items:center;border-bottom:1.5px solid #2a2520;margin-bottom:6px;transition:border-color 0.2s;animation:wSlideUp 0.4s 0.16s ease both;}
          .w-pw-field.focused{border-color:#c9a96e;}
          .w-pw-field.error{border-color:#c0614a;}
          .w-pw-input{flex:1;background:transparent;border:none;outline:none;font-family:'DM Mono',monospace;font-size:18px;color:#d4c5a8;padding:10px 0;letter-spacing:0.1em;}
          .w-pw-input::placeholder{color:#2a2520;font-size:22px;letter-spacing:0.15em;}
          .w-pw-toggle{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#3a3028;padding:10px 0 10px 12px;transition:color 0.2s;}
          .w-pw-toggle:hover{color:#8a7250;}
          .w-pw-error{font-size:10px;color:#c0614a;min-height:18px;margin-bottom:24px;letter-spacing:0.04em;}
          .w-pw-error.shake{animation:wShake 0.4s ease;}
          .w-pw-spacer{height:42px;}
          .w-btn{width:100%;padding:16px;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:10px;animation:wSlideUp 0.4s 0.2s ease both;}
          .w-btn-gold{background:#c9a96e;color:#080705;}
          .w-btn-gold:hover{background:#ddb97e;}
          .w-btn-teal{background:#4a8a7a;color:#080705;}
          .w-btn-teal:hover{background:#5aaa9a;}
          .w-btn:disabled{opacity:0.3;cursor:not-allowed;}
          .w-btn:not(:disabled):active{transform:scale(0.99);}
          .w-btn-bar{height:2px;margin-top:12px;background:#1a1610;overflow:hidden;animation:wFadeIn 0.4s 0.22s ease both;}
          .w-btn-bar-fill{height:100%;width:0%;transition:width 0.3s ease,background 0.3s ease;}
          .w-btn-bar-fill.has-value{width:100%;background:#c9a96e;}
          .w-btn-bar-fill.teal.has-value{background:#4a8a7a;}
          .w-right-footer{position:absolute;bottom:32px;left:72px;right:72px;display:flex;justify-content:space-between;align-items:center;}
          .w-right-footer-brand{font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#2a2218;}
          .w-right-footer-live{display:flex;align-items:center;gap:6px;font-size:9px;letter-spacing:0.12em;color:#2a2218;}
          .w-live-dot{width:5px;height:5px;border-radius:50%;background:#10b981;animation:wPulse 2s infinite;}
        `}</style>

        <div className="w-root">
          {/* LEFT */}
          <div className="w-left">
            <div className="w-left-grid" />
            <div className="w-left-glow" />
            <div className="w-brand">Arcodic</div>
            <div className="w-carousel">
              <div className="w-avatar w-avatar-left" onClick={() => handleGoTo('left')}>
                {prev.image ? <img src={prev.image} alt={prev.name} /> : <div className="w-avatar-placeholder">{prev.name[0]}</div>}
              </div>
              <div className="w-avatar w-avatar-active">
                {active.image ? <img src={active.image} alt={active.name} key={active.id} /> : <div className="w-avatar-placeholder">{active.name[0]}</div>}
              </div>
              <div className="w-avatar w-avatar-right" onClick={() => handleGoTo('right')}>
                {next.image ? <img src={next.image} alt={next.name} /> : <div className="w-avatar-placeholder">{next.name[0]}</div>}
              </div>
            </div>
            <div className="w-profile-info" key={active.id + '-info'}>
              <div className="w-profile-name">{active.name}</div>
              <div className="w-profile-title">{active.title}</div>
            </div>
            <div className="w-arrows">
              <button className="w-arrow" onClick={() => handleGoTo('left')}>←</button>
              <div className="w-dots">
                {PROFILES.map((_,i) => (
                  <div key={i} className={`w-dot ${i===activeProfile?'active':''}`}
                    onClick={() => !exiting && i!==activeProfile && handleGoTo(i>activeProfile?'right':'left')} />
                ))}
              </div>
              <button className="w-arrow" onClick={() => handleGoTo('right')}>→</button>
            </div>
            <div className="w-left-badge">SOW Portal · Internal Access Only</div>
          </div>

          {/* RIGHT */}
          <div className="w-right">
            <div className="w-divider" />
            <div className="w-right-inner" key={active.id + '-right'}>
              <div className="w-right-label">Secure Access</div>
              <div className="w-right-greeting">
                {active.greeting}
                <strong style={{ color: active.color }}>{active.name}.</strong>
              </div>
              <p className="w-right-sub">{active.sub}</p>
              {active.joke && <p className="w-right-joke">{active.joke}</p>}
              <div className="w-right-divider" />
              <div className="w-pw-label">Password</div>
              <div className={`w-pw-field ${pwFocused?'focused':''} ${pwError?'error':''}`}>
                <input
                  className="w-pw-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="• • • • • • • •"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwError(''); }}
                  onKeyDown={e => e.key==='Enter' && password.trim() && handleLogin()}
                  onFocus={() => setPwFocused(true)}
                  onBlur={()  => setPwFocused(false)}
                  autoFocus
                />
                <button className="w-pw-toggle" onMouseDown={e=>e.preventDefault()} onClick={()=>setShowPw(s=>!s)}>
                  {showPw ? 'hide' : 'show'}
                </button>
              </div>
              {pwError ? <div className="w-pw-error shake">{pwError}</div> : <div className="w-pw-spacer" />}
              <button className={`w-btn ${active.id==='rudz'?'w-btn-gold':'w-btn-teal'}`} onClick={handleLogin} disabled={!password.trim()}>
                {active.btnText} →
              </button>
              <div className="w-btn-bar">
                <div className={`w-btn-bar-fill ${active.id==='kaleb'?'teal':''} ${password.trim()?'has-value':''}`} />
              </div>
            </div>
            <div className="w-right-footer">
              <div className="w-right-footer-brand">Arcodic · Digital</div>
              <div className="w-right-footer-live"><div className="w-live-dot" />Live</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════
  // MAIN PORTAL
  // ════════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&family=Pinyon+Script&family=Great+Vibes&family=Dancing+Script:wght@700&family=Pacifico&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#0a0906;--surface:#111008;--card:#16130e;--border:#2a2520;--border2:#1e1a15;
          --gold:#c9a96e;--gold-dim:#8a7250;--gold-faint:#2a2218;--cream:#e8d5b0;
          --muted:#6b6050;--text:#d4c5a8;--text-dim:#8a7d6b;--white:#f0e8d8;
          --red:#c0614a;--teal:#4a8a7a;--amber:#c09050;
        }
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;font-size:13px;line-height:1.6;-webkit-font-smoothing:antialiased;}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;transition:background 0.4s,border-color 0.4s;border-bottom:1px solid transparent;}
        .nav.scrolled{background:rgba(10,9,6,0.92);backdrop-filter:blur(20px);border-color:var(--border);}
        .nav-brand{display:flex;align-items:center;gap:12px;}
        .nav-logo{width:32px;height:32px;background:var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-weight:700;font-size:16px;color:var(--bg);}
        .nav-name{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:var(--white);letter-spacing:0.05em;}
        .nav-name span{color:var(--gold-dim);font-weight:400;}
        .nav-btn{display:flex;align-items:center;gap:8px;background:var(--gold);color:var(--bg);border:none;cursor:pointer;padding:9px 22px;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;transition:background 0.2s,transform 0.1s;}
        .nav-btn:hover{background:var(--cream);}
        .nav-btn:active{transform:scale(0.97);}
        .page{max-width:900px;margin:0 auto;padding:100px 40px 120px;}
        .doc{background:var(--surface);border:1px solid var(--border);overflow:hidden;}
        .doc-header{padding:64px 64px 48px;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
        .doc-header::before{content:'';position:absolute;top:0;right:0;width:300px;height:300px;background:radial-gradient(circle at 100% 0%,rgba(201,169,110,0.06) 0%,transparent 70%);pointer-events:none;}
        .doc-header-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:52px;}
        .doc-title{font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:600;color:var(--white);line-height:1.05;letter-spacing:-0.01em;}
        .doc-id{font-size:11px;color:var(--gold-dim);letter-spacing:0.12em;text-transform:uppercase;margin-top:10px;}
        .doc-agency{text-align:right;}
        .doc-agency-name{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--gold);letter-spacing:0.15em;text-transform:uppercase;}
        .doc-agency-sub{font-size:10px;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;margin-top:4px;}
        .doc-parties{display:grid;grid-template-columns:1fr 1fr;gap:32px;}
        .party-box{padding:24px;border:1px solid var(--border2);background:var(--card);}
        .party-label{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:16px;display:flex;align-items:center;gap:8px;}
        .party-label::after{content:'';flex:1;height:1px;background:var(--border2);}
        .doc-body{padding:64px;}
        .section{margin-bottom:56px;}
        .section-header{display:flex;align-items:center;gap:14px;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid var(--border2);}
        .section-num{font-size:10px;color:var(--gold);letter-spacing:0.1em;font-weight:500;min-width:24px;}
        .section-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:var(--white);letter-spacing:0.02em;}
        .section-icon{margin-left:auto;color:var(--gold-dim);opacity:0.6;}
        input.editable,textarea.editable{background:transparent;border:none;outline:none;color:var(--text);font-family:'DM Mono',monospace;font-size:inherit;line-height:inherit;width:100%;resize:none;padding:2px 4px;border-bottom:1px solid transparent;transition:border-color 0.2s,background 0.2s;border-radius:0;}
        input.editable:hover,textarea.editable:hover{border-color:var(--border);background:rgba(201,169,110,0.03);}
        input.editable:focus,textarea.editable:focus{border-color:var(--gold-dim);background:rgba(201,169,110,0.05);}
        input.editable::placeholder,textarea.editable::placeholder{color:var(--muted);opacity:0.5;}
        .field-large{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:var(--white);}
        .field-name{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:var(--white);}
        .field-muted{color:var(--text-dim);font-size:12px;}
        .client-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border2);font-size:12px;}
        .client-row:last-child{border-bottom:none;}
        .client-key{color:var(--muted);min-width:130px;letter-spacing:0.05em;}
        .client-val input.editable{text-align:right;color:var(--text);}
        .overview-grid{display:grid;gap:4px;}
        .scope-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border2);border:1px solid var(--border2);}
        .scope-col{background:var(--card);padding:24px;}
        .scope-col-header{display:flex;align-items:center;gap:8px;color:var(--accent,var(--gold));font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;margin-bottom:20px;}
        .scope-add{margin-left:auto;background:transparent;border:1px solid var(--border);color:var(--muted);cursor:pointer;width:20px;height:20px;display:flex;align-items:center;justify-content:center;transition:border-color 0.2s,color 0.2s;}
        .scope-add:hover{border-color:var(--gold-dim);color:var(--gold);}
        .scope-list{list-style:none;display:flex;flex-direction:column;gap:8px;}
        .scope-item{display:flex;align-items:center;gap:6px;}
        .scope-bullet{color:var(--gold-dim);flex-shrink:0;}
        .scope-input{background:transparent;border:none;outline:none;color:var(--text);font-family:'DM Mono',monospace;font-size:12px;flex:1;min-width:0;border-bottom:1px solid transparent;transition:border-color 0.15s;padding:1px 0;}
        .scope-input:hover{border-color:var(--border);}
        .scope-input:focus{border-color:var(--gold-dim);}
        .scope-remove{background:none;border:none;cursor:pointer;color:var(--muted);opacity:0;transition:opacity 0.15s,color 0.15s;padding:2px;flex-shrink:0;}
        .group-item:hover .scope-remove{opacity:1;}
        .scope-remove:hover{color:var(--red);}
        .timeline{display:flex;flex-direction:column;gap:0;}
        .timeline-item{display:grid;grid-template-columns:32px 1fr 1fr auto;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--border2);}
        .timeline-item:last-child{border-bottom:none;}
        .timeline-dot{width:8px;height:8px;background:var(--gold);border-radius:50%;justify-self:center;box-shadow:0 0 0 3px rgba(201,169,110,0.15);}
        .timeline-date input.editable{text-align:right;color:var(--muted);font-size:11px;}
        .tl-remove{background:none;border:none;cursor:pointer;color:var(--muted);opacity:0;transition:opacity 0.15s,color 0.15s;padding:4px;}
        .timeline-item:hover .tl-remove{opacity:1;}
        .tl-remove:hover{color:var(--red);}
        .timeline-add{margin-top:16px;display:flex;align-items:center;gap:8px;background:none;border:1px dashed var(--border);color:var(--muted);cursor:pointer;padding:10px 16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.08em;width:100%;transition:border-color 0.2s,color 0.2s;}
        .timeline-add:hover{border-color:var(--gold-dim);color:var(--gold);}
        .finance-card{background:var(--card);border:1px solid var(--border);padding:40px;position:relative;overflow:hidden;}
        .finance-card::before{content:'';position:absolute;bottom:0;right:0;width:200px;height:200px;background:radial-gradient(circle at 100% 100%,rgba(201,169,110,0.08) 0%,transparent 60%);pointer-events:none;}
        .finance-total-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:8px;}
        .finance-total{display:flex;align-items:flex-end;gap:6px;margin-bottom:32px;}
        .currency-select{position:relative;display:flex;align-items:baseline;flex-shrink:0;}
        .currency-trigger{display:flex;align-items:baseline;gap:4px;background:transparent;border:none;cursor:pointer;padding:0 6px 0 0;transition:opacity 0.2s;}
        .currency-trigger:hover{opacity:0.7;}
        .currency-symbol-preview{font-family:'Cormorant Garamond',serif;font-size:28px;color:var(--gold-dim);line-height:1;}
        .currency-code-preview{font-size:10px;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;align-self:flex-end;margin-bottom:4px;}
        .currency-chevron{font-size:7px;color:var(--muted);align-self:flex-end;margin-bottom:5px;margin-left:2px;}
        .currency-symbol-print{display:none;font-family:'Cormorant Garamond',serif;font-size:28px;color:var(--gold-dim);}
        .currency-dropdown{position:absolute;top:calc(100% + 8px);left:0;z-index:200;background:var(--card);border:1px solid var(--border);box-shadow:0 24px 48px rgba(0,0,0,0.6);min-width:220px;}
        .currency-dropdown-inner{max-height:280px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--border) transparent;}
        .currency-option{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;background:none;border:none;cursor:pointer;text-align:left;transition:background 0.15s;border-bottom:1px solid var(--border2);}
        .currency-option:last-child{border-bottom:none;}
        .currency-option:hover{background:var(--gold-faint);}
        .currency-option.active{background:rgba(201,169,110,0.1);}
        .co-symbol{font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--gold);min-width:24px;text-align:center;}
        .co-code{font-size:11px;color:var(--white);letter-spacing:0.08em;font-weight:500;min-width:36px;}
        .co-name{font-size:11px;color:var(--muted);}
        .finance-amount input.editable{font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:700;color:var(--white);line-height:1;width:260px;}
        .finance-divider{height:1px;background:var(--border2);margin-bottom:28px;}
        .finance-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
        .finance-item-label{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
        .finance-item input.editable{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:var(--cream);}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:40px;}
        .sig-pad{border:1px solid var(--border2);padding:24px;background:var(--card);}
        .sig-label{display:block;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:16px;}
        .sig-type-input{width:100%;background:rgba(0,0,0,0.2);border:none;border-bottom:1px solid var(--border);color:var(--cream);font-size:36px;padding:8px 4px;outline:none;transition:border-color 0.2s;min-height:72px;}
        .sig-type-input:focus{border-bottom-color:var(--gold-dim);}
        .sig-type-input::placeholder{color:var(--muted);font-size:14px;font-family:'DM Mono',monospace;}
        .sig-meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .meta-key{font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;}
        .meta-val{font-size:12px;color:var(--text);}
        .legal{padding:24px 64px 48px;border-top:1px solid var(--border2);font-size:10px;color:var(--muted);line-height:1.8;letter-spacing:0.03em;}
        .status-bar{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:24px;background:rgba(22,19,14,0.95);border:1px solid var(--border);padding:12px 28px;backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(0,0,0,0.5);white-space:nowrap;}
        .status-dot{width:6px;height:6px;border-radius:50%;background:#4a9b6f;box-shadow:0 0 8px #4a9b6f;animation:sdpulse 2s infinite;}
        .status-dot.awaiting{background:#c9a96e;box-shadow:0 0 8px #c9a96e;}
        @keyframes sdpulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .status-text{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);}
        .status-sep{width:1px;height:16px;background:var(--border);}
        .status-link{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold-dim);transition:color 0.2s;}
        .status-link:hover{color:var(--gold);}
        .mt-4{margin-top:16px;}.mb-2{margin-bottom:8px;}
        @media print{
          :root{--bg:#fff;--surface:#fff;--card:#f9f9f7;--border:#e0dcd5;--border2:#ece8e0;--gold:#8a6a30;--gold-dim:#a07840;--gold-faint:#f5f0e8;--cream:#5a4520;--muted:#888070;--text:#1a1510;--text-dim:#6b6050;--white:#0a0806;}
          @page{margin:18mm;size:A4;}
          body{background:#fff;}
          .nav,.status-bar,.print-hide{display:none!important;}
          .page{padding:0;max-width:100%;}
          .doc{border:none;}
          .doc-header,.doc-body{padding:40px;}
          input.editable,textarea.editable{border-bottom-color:transparent!important;background:transparent!important;}
          .currency-trigger{display:none!important;}
          .currency-symbol-print{display:inline!important;}
          .scope-grid{background:#ece8e0;}
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''} print-hide`}>
        <div className="nav-brand">
          <div className="nav-logo">A</div>
          <span className="nav-name">ARCODIC <span>SOW Portal</span></span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button className="nav-btn print-hide" onClick={() => navigate('/dashboard')} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--gold-dim)' }}>Dashboard</button>
          <button className="nav-btn print-hide" onClick={handleNewSOW} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--gold-dim)' }}>+ New SOW</button>
          <button className="nav-btn" onClick={() => window.print()}><Download size={13} /> Generate PDF</button>
        </div>
      </nav>

      <div className="page">
        <div className="doc">

          {/* HEADER */}
          <div className="doc-header">
            <div className="doc-header-top">
              <div>
                <h1 className="doc-title">Statement<br />of Work</h1>
                <p className="doc-id">Agreement № ARC-{new Date().getFullYear()}-001 · {today}</p>
              </div>
              <div className="doc-agency">
                <div className="doc-agency-name">Arcodic</div>
                <div className="doc-agency-sub">Digital Service Provider</div>
              </div>
            </div>
            <div className="doc-parties">
              <div className="party-box">
                <div className="party-label"><User size={10} />Client</div>
                <Field className="field-name mb-2" value={data.client.name} onChange={v => set('client.name', v)} placeholder="Client name" />
                <Field className="field-muted" value={data.client.address} onChange={v => set('client.address', v)} multiline rows={2} placeholder="Address" />
              </div>
              <div className="party-box">
                <div className="party-label"><Briefcase size={10} />Contact Details</div>
                {[{key:'contact',label:'Primary Contact'},{key:'email',label:'Email'},{key:'phone',label:'Phone'}].map(({key,label}) => (
                  <div className="client-row" key={key}>
                    <span className="client-key">{label}</span>
                    <div className="client-val" style={{flex:1}}><Field value={data.client[key]} onChange={v => set(`client.${key}`,v)} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="doc-body">

            {/* 01 */}
            <div className="section">
              <div className="section-header"><span className="section-num">01</span><h2 className="section-title">Project Overview</h2><Briefcase size={14} className="section-icon" /></div>
              <div className="overview-grid">
                <Field className="field-large mb-2" value={data.project.title} onChange={v => set('project.title',v)} placeholder="Project title" />
                <Field className="field-muted" value={data.project.description} onChange={v => set('project.description',v)} multiline rows={3} placeholder="Project description" />
              </div>
            </div>

            {/* 02 */}
            <div className="section">
              <div className="section-header"><span className="section-num">02</span><h2 className="section-title">Scope of Work</h2><Layers size={14} className="section-icon" /></div>
              <div className="scope-grid">
                <ScopeColumn icon={Globe}  label="Pages & Screens" accent="var(--teal)"  items={data.scope.pages}        onAdd={()=>scopeAdd('pages')}        onRemove={i=>scopeRemove('pages',i)}        onEdit={(i,v)=>scopeEdit('pages',i,v)} />
                <ScopeColumn icon={Zap}    label="Functionality"   accent="var(--gold)"  items={data.scope.features}     onAdd={()=>scopeAdd('features')}     onRemove={i=>scopeRemove('features',i)}     onEdit={(i,v)=>scopeEdit('features',i,v)} />
                <ScopeColumn icon={Code2}  label="Integrations"    accent="var(--amber)" items={data.scope.integrations} onAdd={()=>scopeAdd('integrations')} onRemove={i=>scopeRemove('integrations',i)} onEdit={(i,v)=>scopeEdit('integrations',i,v)} />
              </div>
            </div>

            {/* 03 + 04 */}
            <div className="section two-col">
              <div>
                <div className="section-header"><span className="section-num">03</span><h2 className="section-title">Milestones</h2><Calendar size={14} className="section-icon" /></div>
                <div className="timeline">
                  {data.timeline.map((m,i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-dot" />
                      <Field value={m.desc} onChange={v=>timelineEdit(i,'desc',v)} placeholder="Milestone" />
                      <div className="timeline-date">
                        <input type="date" className="editable" value={m.date} onChange={e=>timelineEdit(i,'date',e.target.value)} style={{textAlign:'right',color:'var(--muted)',fontSize:'11px'}} />
                      </div>
                      <button className="tl-remove print-hide" onClick={()=>removeMilestone(i)}><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
                <button className="timeline-add print-hide" onClick={addMilestone}><Plus size={12} /> Add Milestone</button>
              </div>
              <div>
                <div className="section-header"><span className="section-num">04</span><h2 className="section-title">Financial Terms</h2><CreditCard size={14} className="section-icon" /></div>
                <div className="finance-card">
                  <div className="finance-total-label">Total Project Fee</div>
                  <div className="finance-total">
                    <CurrencySelect value={data.pricing.currency} onChange={v=>set('pricing.currency',v)} />
                    <div className="finance-amount"><Field value={data.pricing.total} onChange={v=>set('pricing.total',v)} placeholder="0" /></div>
                  </div>
                  <div className="finance-divider" />
                  <div className="finance-grid">
                    <div className="finance-item"><div className="finance-item-label">Deposit Required</div><Field value={data.pricing.deposit} onChange={v=>set('pricing.deposit',v)} placeholder="50%" /></div>
                    <div className="finance-item"><div className="finance-item-label">Included Revisions</div><Field value={data.pricing.revisions} onChange={v=>set('pricing.revisions',v)} placeholder="3" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 05 Signatures */}
            <div className="section">
              <div className="section-header"><span className="section-num">05</span><h2 className="section-title">Acceptance & Signing</h2><PenTool size={14} className="section-icon" /></div>
              <div className="two-col">
                <TypeSignPad label="ARCODIC" signatory="A. Arcodic Representative" date={today} value={arcSig} onChange={setArcSig} locked={sent} />
                {clientSig ? (
                  <TypeSignPad
                    label="CLIENT"
                    signatory={data.client.name}
                    date={clientSignedAt ? new Date(clientSignedAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : today}
                    value={clientSig}
                    onChange={() => {}}
                    locked={true}
                  />
                ) : (
                  <div className="sig-pad print-hide" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,background:'rgba(201,169,110,0.03)',border:'1px dashed var(--border)'}}>
                    <div style={{fontSize:11,color:'var(--muted)',textAlign:'center',letterSpacing:'0.05em'}}>
                      {sent ? '◎ Awaiting client signature…' : 'Client will sign via their unique link'}
                    </div>
                    {!sent && (
                      <button
                        onClick={()=>{setSendError('');setClientEmailInput(data.client.email||'');setShowSendModal(true);}}
                        style={{background:arcSig.trim()?'var(--gold)':'var(--border)',color:arcSig.trim()?'var(--bg)':'var(--muted)',border:'none',padding:'12px 28px',cursor:arcSig.trim()?'pointer':'not-allowed',fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',transition:'all 0.2s'}}
                      >Send to Client →</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="legal">
            This Statement of Work is governed by and incorporated into the Master Service Agreement between ARCODIC and the Client.
            Any functionality, screen, feature, or integration not expressly listed above is excluded from this engagement.
            ARCODIC reserves the right to adjust implementation tools or libraries where technically necessary without material impact to deliverables.
          </div>
        </div>
      </div>

      {/* SEND MODAL */}
      {showSendModal && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',padding:40,maxWidth:440,width:'100%'}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:600,color:'var(--white)',marginBottom:8}}>Send to Client</h3>
            <p style={{fontSize:11,color:'var(--muted)',marginBottom:28,lineHeight:1.7}}>The client receives a unique link to review and sign. Your signature locks once sent.</p>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--gold-dim)',marginBottom:8}}>Client Email</div>
              <input
                type="email" placeholder="client@company.com" value={clientEmailInput}
                onChange={e=>setClientEmailInput(e.target.value)}
                style={{width:'100%',background:'var(--surface)',border:'1px solid var(--border)',color:'var(--text)',fontFamily:"'DM Mono',monospace",fontSize:13,padding:'12px 14px',outline:'none',transition:'border-color 0.2s',borderRadius:0}}
                onFocus={e=>e.target.style.borderColor='var(--gold-dim)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}
                onKeyDown={e=>e.key==='Enter'&&sendSOW()}
              />
            </div>
            {sendError && <p style={{color:'var(--red)',fontSize:11,marginBottom:16}}>{sendError}</p>}
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setShowSendModal(false)} style={{flex:1,background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',padding:'12px 0',cursor:'pointer',fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',transition:'all 0.2s'}}>Cancel</button>
              <button onClick={sendSOW} disabled={sending} style={{flex:2,background:'var(--gold)',border:'none',color:'var(--bg)',padding:'12px 0',cursor:sending?'not-allowed':'pointer',fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',opacity:sending?0.7:1,transition:'all 0.2s'}}>{sending?'Sending…':'Send Signing Link'}</button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS BAR */}
      <div className="status-bar print-hide">
        <div className={`status-dot ${sent && !clientSig ? 'awaiting' : ''}`} />
        <span className="status-text">{clientSig ? 'Fully signed' : sent ? 'Awaiting client signature' : 'Ready'}</span>
        <div className="status-sep" />
        <button className="status-link" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>↑ Top</button>
        <div className="status-sep" />
        <button className="status-link" onClick={()=>window.print()}>Print / PDF</button>
      </div>
    </>
  );
}
