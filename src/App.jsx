import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Download, Briefcase, User, Layers,
  Calendar, CreditCard, PenTool, CheckCircle2, RefreshCcw,
  ChevronRight, Zap, Globe, Code2
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CURRENCIES
───────────────────────────────────────────── */
const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar'        },
  { code: 'EUR', symbol: '€',  name: 'Euro'             },
  { code: 'GBP', symbol: '£',  name: 'British Pound'    },
  { code: 'AED', symbol: 'د.إ',name: 'UAE Dirham'       },
  { code: 'SAR', symbol: '﷼',  name: 'Saudi Riyal'      },
  { code: 'QAR', symbol: 'ر.ق',name: 'Qatari Riyal'     },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar'  },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar'},
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc'      },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen'     },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan'     },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee'     },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand'},
  { code: 'NGN', symbol: '₦',  name: 'Nigerian Naira'   },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound'   },
  { code: 'TRY', symbol: '₺',  name: 'Turkish Lira'     },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real'   },
  { code: 'MXN', symbol: 'MX$',name: 'Mexican Peso'     },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'KWD', symbol: 'د.ك',name: 'Kuwaiti Dinar'    },
];

const getCurrency = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[0];

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
   TYPE-TO-SIGN PAD
───────────────────────────────────────────── */
const SIG_FONTS = [
  { name: 'Pinyon',   style: "'Pinyon Script', cursive"  },
  { name: 'Vibes',    style: "'Great Vibes', cursive"    },
  { name: 'Dancing',  style: "'Dancing Script', cursive" },
  { name: 'Pacifico', style: "'Pacifico', cursive"       },
];

const TypeSignPad = ({ label, signatory, date, value, onChange, locked = false }) => {
  const [fontIdx, setFontIdx] = useState(0);

  return (
    <div className="sig-pad">
      <span className="sig-label">{label}</span>

      {!locked && (
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {SIG_FONTS.map((f, i) => (
            <button
              key={i}
              onClick={() => setFontIdx(i)}
              className="print-hide"
              style={{
                background: fontIdx === i ? 'rgba(201,169,110,0.15)' : 'transparent',
                border: `1px solid ${fontIdx === i ? 'var(--gold)' : 'var(--border)'}`,
                color: fontIdx === i ? 'var(--gold)' : 'var(--muted)',
                padding:'4px 10px', cursor:'pointer', fontSize:10,
                letterSpacing:'0.05em', transition:'all 0.15s', fontFamily:'inherit',
              }}
            >{f.name}</button>
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
const Field = ({ value, onChange, className = '', multiline = false, rows = 2, placeholder = '' }) => {
  const props = {
    className: `editable ${className}`,
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
  };
  return multiline
    ? <textarea {...props} rows={rows} />
    : <input {...props} />;
};

/* ─────────────────────────────────────────────
   SCOPE COLUMN
───────────────────────────────────────────── */
const ScopeColumn = ({ icon: Icon, label, accent, items, onAdd, onRemove, onEdit }) => (
  <div className="scope-col">
    <div className="scope-col-header" style={{ '--accent': accent }}>
      <Icon size={14} />
      <span>{label}</span>
      <button className="scope-add print-hide" onClick={onAdd}><Plus size={12} /></button>
    </div>
    <ul className="scope-list">
      {items.map((item, i) => (
        <li key={i} className="scope-item group-item">
          <ChevronRight size={10} className="scope-bullet" />
          <input
            className="scope-input"
            value={item}
            onChange={(e) => onEdit(i, e.target.value)}
          />
          <button className="scope-remove print-hide" onClick={() => onRemove(i)}>
            <Trash2 size={10} />
          </button>
        </li>
      ))}
    </ul>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const [data, setData] = useState({
    client: {
      name: "Acme Corp",
      address: "123 Innovation Drive, Tech City, TC 90210",
      contact: "Jane Doe",
      email: "jane@acme.com",
      phone: "+1 (555) 000-0000"
    },
    project: {
      title: "NexGen E-Commerce Platform",
      description: "A premium, headless commerce solution designed to scale ARCODIC's digital presence through a mobile-first architectural approach, built for performance at every touchpoint."
    },
    scope: {
      pages: ["Home Page", "Product Gallery", "Checkout Flow", "User Dashboard"],
      features: ["Biometric Authentication", "Real-time Inventory Sync", "AI-driven Recommendations"],
      integrations: ["Stripe Connect", "AWS S3 Storage", "SendGrid API"]
    },
    timeline: [
      { desc: "Project Kickoff", date: "2024-06-01" },
      { desc: "UI/UX High Fidelity Design", date: "2024-06-15" },
      { desc: "Development Sprint 1", date: "2024-07-20" },
      { desc: "QA & Launch", date: "2024-08-10" }
    ],
    pricing: {
      total: "25,000",
      currency: "ZAR",
      deposit: "50%",
      revisions: "3"
    }
  });

  const [welcomed, setWelcomed] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [arcSig, setArcSig] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [clientEmailInput, setClientEmailInput] = useState('');

  const sendToClient = async () => {
    if (!arcSig.trim()) { setSendError('Please sign as ARCODIC first.'); return; }
    if (!clientEmailInput.trim()) { setSendError('Please enter the client email.'); return; }
    setSending(true); setSendError('');
    try {
      const res = await fetch('/api/send-sow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          arcodic_signature: arcSig,
          client_email: clientEmailInput,
          client_name: data.client.name,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSent(true); setShowSendModal(false);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const set = (path, value) => {
    const keys = path.split('.');
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      keys.reduce((obj, k, i) => i === keys.length - 1 ? (obj[k] = value) : obj[k], next);
      return next;
    });
  };

  const scopeAdd = (cat) => setData(p => {
    const n = JSON.parse(JSON.stringify(p));
    n.scope[cat].push('New item');
    return n;
  });

  const scopeRemove = (cat, i) => setData(p => {
    const n = JSON.parse(JSON.stringify(p));
    n.scope[cat].splice(i, 1);
    return n;
  });

  const scopeEdit = (cat, i, val) => setData(p => {
    const n = JSON.parse(JSON.stringify(p));
    n.scope[cat][i] = val;
    return n;
  });

  const timelineEdit = (i, key, val) => setData(p => {
    const n = JSON.parse(JSON.stringify(p));
    n.timeline[i][key] = val;
    return n;
  });

  const addMilestone = () => setData(p => {
    const n = JSON.parse(JSON.stringify(p));
    n.timeline.push({ desc: 'New Milestone', date: new Date().toISOString().split('T')[0] });
    return n;
  });

  const removeMilestone = (i) => setData(p => {
    const n = JSON.parse(JSON.stringify(p));
    n.timeline.splice(i, 1);
    return n;
  });

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── WELCOME SCREEN ──
  const USERS = {
    rudz: {
      name: 'Rudz',
      img: '/rudz.webp',
      greeting: 'Welcome back, Rudz.',
      sub: 'Ready to close another one?',
      joke: "The portal's yours. Kaleb has read-only energy anyway.",
      accent: '#c9a96e',
      btnText: 'Enter Portal →',
      nameColor: 'gold',
    },
    kaleb: {
      name: 'Kaleb',
      img: '/kaleb.webp',
      greeting: 'Oh. Kaleb. Hi.',
      sub: "Rudz said you'd show up eventually.",
      joke: "The brief won't review itself. (It did. Rudz handled it.) 📋",
      accent: '#4a8a7a',
      btnText: 'Fine, let him in →',
      nameColor: 'teal',
    },
  };

  if (!welcomed) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; margin: 0; padding: 0; }
        body { background: #0a0906; font-family: 'DM Mono', monospace; -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes tiltL    { from{transform:rotate(0deg) scale(1)} to{transform:rotate(-3deg) scale(1.04)} }
        @keyframes tiltR    { from{transform:rotate(0deg) scale(1)} to{transform:rotate(3deg) scale(1.04)} }
        @keyframes selectPop { 0%{transform:scale(1)} 50%{transform:scale(1.06)} 100%{transform:scale(1)} }

        .w-root {
          width: 100vw; height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #0a0906; position: relative; overflow: hidden;
        }
        .w-bg-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(201,169,110,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,169,110,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .w-bg-glow {
          position: absolute; width: 800px; height: 800px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 65%);
          pointer-events: none; top: 50%; left: 50%; transform: translate(-50%,-50%);
        }

        /* ── TOP ── */
        .w-top {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 56px;
          animation: fadeUp 0.5s ease both;
        }
        .w-badge {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(201,169,110,0.18); padding: 5px 16px;
          margin-bottom: 20px; font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: #6b5a40;
        }
        .w-dot { width:5px; height:5px; border-radius:50%; background:#c9a96e; animation:pulse 2s infinite; flex-shrink:0; }
        .w-logo {
          font-family: 'Cormorant Garamond', serif; font-size: 72px; font-weight: 700;
          color: #f0e8d8; line-height: 1; letter-spacing: -0.02em;
        }
        .w-logo span { color: #c9a96e; }
        .w-tagline {
          font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase;
          color: #3a3028; margin-top: 4px;
        }

        /* ── PROFILE GRID ── */
        .w-profiles {
          position: relative; z-index: 1;
          display: flex; align-items: flex-end; gap: 32px;
          margin-bottom: 48px;
          animation: fadeUp 0.5s 0.12s ease both;
        }
        .w-profile {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          cursor: pointer; background: none; border: none; padding: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        /* alternating tilt on hover */
        .w-profile.left:hover  { transform: rotate(-4deg) scale(1.05) translateY(-8px); }
        .w-profile.right:hover { transform: rotate(4deg)  scale(1.05) translateY(-8px); }
        .w-profile.selected    { animation: selectPop 0.35s ease both; }
        .w-profile.left.selected  { transform: rotate(-2deg) scale(1.08) translateY(-12px); }
        .w-profile.right.selected { transform: rotate(2deg)  scale(1.08) translateY(-12px); }
        .w-profile.dimmed { opacity: 0.35; filter: grayscale(60%); transform: scale(0.92); }

        .w-avatar-wrap {
          position: relative;
          width: 160px; height: 160px;
        }
        .w-avatar-img {
          width: 160px; height: 160px;
          object-fit: cover; display: block;
          clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%);
          filter: grayscale(30%) brightness(0.85);
          transition: filter 0.3s;
        }
        .w-profile:hover .w-avatar-img,
        .w-profile.selected .w-avatar-img { filter: grayscale(0%) brightness(1); }

        .w-avatar-border {
          position: absolute; inset: -3px;
          clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%);
          background: transparent;
          transition: background 0.3s;
          pointer-events: none;
        }
        .w-profile.rudz-sel .w-avatar-border {
          background: linear-gradient(135deg, #c9a96e, transparent 60%);
          inset: -3px;
        }
        .w-profile.kaleb-sel .w-avatar-border {
          background: linear-gradient(135deg, #4a8a7a, transparent 60%);
          inset: -3px;
        }

        .w-profile-label {
          font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
          color: #4a4035; transition: color 0.2s;
        }
        .w-profile:hover .w-profile-label { color: #8a7250; }
        .w-profile.rudz-sel .w-profile-label  { color: #c9a96e; }
        .w-profile.kaleb-sel .w-profile-label { color: #4a8a7a; }

        /* ── GREETING ── */
        .w-greeting-wrap {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 480px;
          animation: fadeIn 0.3s ease both;
        }
        .w-greeting {
          font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 600;
          color: #f0e8d8; margin-bottom: 10px; line-height: 1.1;
        }
        .w-greeting .gold { color: #c9a96e; }
        .w-greeting .teal { color: #4a8a7a; }
        .w-sub  { font-size: 12px; color: #5a5040; line-height: 1.8; margin-bottom: 6px; }
        .w-joke { font-size: 11px; color: #3a3028; font-style: italic; margin-bottom: 40px; }
        .w-vdivider {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, transparent, #2a2520, transparent);
          margin-bottom: 32px;
        }
        .w-btn {
          border: none; padding: 16px 56px; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase; transition: all 0.2s;
        }
        .w-btn.rudz  { background: #c9a96e; color: #0a0906; }
        .w-btn.rudz:hover  { background: #e0c080; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,169,110,0.25); }
        .w-btn.kaleb { background: #4a8a7a; color: #0a0906; }
        .w-btn.kaleb:hover { background: #5aaa9a; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(74,138,122,0.2); }

        .w-hint {
          position: relative; z-index: 1;
          font-size: 10px; color: #2e2618; letter-spacing: 0.1em;
          margin-top: 32px;
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .w-footer {
          position: absolute; bottom: 14px; left: 0; right: 0; text-align: center;
          font-size: 9px; color: #1e1a14; letter-spacing: 0.14em; text-transform: uppercase;
        }
      `}</style>

      <div className="w-root">
        <div className="w-bg-grid" />
        <div className="w-bg-glow" />

        {/* Logo */}
        <div className="w-top">
          <div className="w-badge"><div className="w-dot" />SOW Portal · Internal Access</div>
          <div className="w-logo">ARC<span>.</span></div>
          <div className="w-tagline">Statement of Work System</div>
        </div>

        {/* Profile Selectors */}
        <div className="w-profiles">
          {['rudz', 'kaleb'].map((id, idx) => {
            const u = USERS[id];
            const isSelected = selectedUser === id;
            const isDimmed = selectedUser && selectedUser !== id;
            const side = idx === 0 ? 'left' : 'right';
            const selClass = isSelected ? (id === 'rudz' ? 'rudz-sel' : 'kaleb-sel') : '';
            return (
              <button
                key={id}
                className={`w-profile ${side} ${selClass} ${isDimmed ? 'dimmed' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedUser(isSelected ? null : id)}
              >
                <div className="w-avatar-wrap">
                  <img className="w-avatar-img" src={u.img} alt={u.name} />
                  <div className="w-avatar-border" />
                </div>
                <span className="w-profile-label">{u.name}</span>
              </button>
            );
          })}
        </div>

        {/* Greeting */}
        {selectedUser && (
          <div className="w-greeting-wrap" key={selectedUser}>
            <div className="w-greeting">
              {selectedUser === 'rudz'
                ? <>Welcome back, <span className="gold">Rudz</span>.</>
                : <>Oh. <span className="teal">Kaleb</span>. Hi.</>
              }
            </div>
            <p className="w-sub">{USERS[selectedUser].sub}</p>
            <p className="w-joke">{USERS[selectedUser].joke}</p>
            <div className="w-vdivider" />
            <button
              className={`w-btn ${selectedUser}`}
              onClick={() => setWelcomed(true)}
            >{USERS[selectedUser].btnText}</button>
          </div>
        )}

        {!selectedUser && (
          <p className="w-hint">Select a profile to continue</p>
        )}

        <div className="w-footer">ARCODIC · Digital Service Provider</div>
      </div>
    </>
  );

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { width: 100%; height: 100%; margin: 0; padding: 0; }
          body { font-family: 'DM Mono', monospace; -webkit-font-smoothing: antialiased; background: #0a0906; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @keyframes slideInRight { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
          @keyframes slideInLeft  { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
          @keyframes slideOutLeft { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-60px)} }
          @keyframes slideOutRight{ from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(60px)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

          .wp-root {
            width: 100vw; height: 100vh;
            display: grid; grid-template-columns: 1fr 1fr;
            background: #0a0906; overflow: hidden; position: relative;
          }

          /* LEFT — image side */
          .wp-image-side {
            position: relative; overflow: hidden;
            display: flex; align-items: flex-end;
          }
          .wp-image {
            position: absolute; inset: 0;
            background-size: cover; background-position: center top;
            transition: all 0.5s ease;
          }
          .wp-image-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to right, rgba(10,9,6,0) 60%, #0a0906 100%),
                        linear-gradient(to top, rgba(10,9,6,0.7) 0%, transparent 50%);
          }
          .wp-image-name {
            position: absolute; bottom: 40px; left: 40px;
            font-family: 'Cormorant Garamond', serif;
            font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase;
            color: rgba(212,197,168,0.5);
          }

          /* RIGHT — content side */
          .wp-content-side {
            display: flex; flex-direction: column;
            justify-content: center; padding: 80px 72px 80px 56px;
            position: relative;
          }
          .wp-grid {
            position: absolute; inset: 0; pointer-events: none;
            background-image:
              linear-gradient(rgba(201,169,110,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,169,110,0.02) 1px, transparent 1px);
            background-size: 48px 48px;
          }
          .wp-badge {
            display: inline-flex; align-items: center; gap: 8px;
            border: 1px solid rgba(201,169,110,0.15); padding: 5px 14px;
            margin-bottom: 56px; font-size: 9px; letter-spacing: 0.2em;
            text-transform: uppercase; color: #6b5a40; width: fit-content;
            animation: fadeUp 0.4s ease both;
          }
          .wp-dot { width:5px; height:5px; border-radius:50%; background:#c9a96e; animation:pulse 2s infinite; }
          .wp-logo {
            font-family: 'Cormorant Garamond', serif; font-size: 13px; font-weight: 700;
            letter-spacing: 0.3em; text-transform: uppercase; color: #3a3028;
            margin-bottom: 64px; animation: fadeUp 0.4s 0.05s ease both;
          }

          .wp-card {
            position: relative;
          }
          .wp-card.exit-left  { animation: slideOutLeft  0.3s ease forwards; }
          .wp-card.exit-right { animation: slideOutRight 0.3s ease forwards; }
          .wp-card.enter-right{ animation: slideInRight  0.3s ease both; }
          .wp-card.enter-left { animation: slideInLeft   0.3s ease both; }

          .wp-greeting {
            font-family: 'Cormorant Garamond', serif;
            font-size: 52px; font-weight: 600; line-height: 1.1;
            color: #f0e8d8; margin-bottom: 6px;
          }
          .wp-greeting-name { display: block; font-size: 68px; }
          .wp-greeting-name.gold { color: #c9a96e; }
          .wp-greeting-name.teal { color: #4a8a7a; }

          .wp-sub {
            font-size: 12px; color: #5a5040; margin-top: 20px;
            margin-bottom: 6px; line-height: 1.8;
          }
          .wp-joke { font-size: 11px; color: #3a3028; font-style: italic; margin-bottom: 0; }

          .wp-divider {
            width: 32px; height: 1px; background: #2a2520; margin: 36px 0;
          }

          .wp-btn {
            display: inline-flex; align-items: center; gap: 10px;
            border: none; padding: 16px 40px; cursor: pointer;
            font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
            letter-spacing: 0.14em; text-transform: uppercase; transition: all 0.2s;
            width: fit-content;
          }
          .btn-gold { background: #c9a96e; color: #0a0906; }
          .btn-gold:hover { background: #e0c080; transform: translateX(4px); }
          .btn-teal { background: #4a8a7a; color: #0a0906; }
          .btn-teal:hover { background: #5aaa9a; transform: translateX(4px); }

          /* NAV arrows */
          .wp-nav {
            position: absolute; bottom: 48px; right: 72px;
            display: flex; gap: 12px; z-index: 10;
          }
          .wp-arrow {
            width: 40px; height: 40px; border: 1px solid #2a2520;
            background: transparent; color: #6b6050; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; transition: all 0.2s;
          }
          .wp-arrow:hover { border-color: #c9a96e; color: #c9a96e; }

          /* Dots */
          .wp-dots {
            position: absolute; bottom: 56px; left: 56px;
            display: flex; gap: 8px;
          }
          .wp-dot-ind {
            width: 20px; height: 2px; background: #2a2520; transition: all 0.3s;
          }
          .wp-dot-ind.active { background: #c9a96e; width: 32px; }

          .wp-footer {
            position: absolute; top: 32px; left: 40px;
            font-size: 9px; color: #2a2218; letter-spacing: 0.15em; text-transform: uppercase;
          }
        `}</style>
        <div className="wp-root">
          {/* LEFT — photo */}
          <div className="wp-image-side">
            <div
              className="wp-image"
              style={{ backgroundImage: `url(${p.image})` }}
            />
            <div className="wp-image-overlay" />
            <div className="wp-image-name">{p.name}</div>
          </div>

          {/* RIGHT — content */}
          <div className="wp-content-side">
            <div className="wp-grid" />
            <div className="wp-badge"><div className="wp-dot" />SOW Portal · Internal Access</div>
            <div className="wp-logo">Arcodic</div>

            <div className={`wp-card ${exiting ? `exit-${exitDir}` : 'enter-right'}`}>
              <div className="wp-greeting">
                {p.greeting}
                <span className={`wp-greeting-name ${p.nameStyle}`}>{p.name}.</span>
              </div>
              <p className="wp-sub">{p.sub}</p>
              {p.joke && <p className="wp-joke">{p.joke}</p>}
              <div className="wp-divider" />
              <button
                className={`wp-btn ${p.btnClass}`}
                onClick={() => setWelcomed(true)}
              >
                {p.btnText}
              </button>
            </div>

            {/* Arrow nav */}
            <div className="wp-nav">
              <button className="wp-arrow" onClick={() => goTo('right')}>←</button>
              <button className="wp-arrow" onClick={() => goTo('left')}>→</button>
            </div>

            {/* Dots */}
            <div className="wp-dots">
              {profiles.map((_, i) => (
                <div key={i} className={`wp-dot-ind ${i === activeProfile ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="wp-footer">ARCODIC · Digital Service Provider</div>
        </div>
      </>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&family=Pinyon+Script&family=Great+Vibes&family=Dancing+Script:wght@700&family=Pacifico&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0a0906;
          --surface:   #111008;
          --card:      #16130e;
          --border:    #2a2520;
          --border2:   #1e1a15;
          --gold:      #c9a96e;
          --gold-dim:  #8a7250;
          --gold-faint:#2a2218;
          --cream:     #e8d5b0;
          --muted:     #6b6050;
          --text:      #d4c5a8;
          --text-dim:  #8a7d6b;
          --white:     #f0e8d8;
          --red:       #c0614a;
          --teal:      #4a8a7a;
          --amber:     #c09050;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          transition: background 0.4s, border-color 0.4s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled {
          background: rgba(10,9,6,0.92);
          backdrop-filter: blur(20px);
          border-color: var(--border);
        }
        .nav-brand {
          display: flex; align-items: center; gap: 12px;
        }
        .nav-logo {
          width: 32px; height: 32px;
          background: var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700; font-size: 16px;
          color: var(--bg);
          letter-spacing: 0;
        }
        .nav-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 600;
          color: var(--white);
          letter-spacing: 0.05em;
        }
        .nav-name span { color: var(--gold-dim); font-weight: 400; }
        .nav-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--gold);
          color: var(--bg);
          border: none; cursor: pointer;
          padding: 9px 22px;
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          transition: background 0.2s, transform 0.1s;
        }
        .nav-btn:hover { background: var(--cream); }
        .nav-btn:active { transform: scale(0.97); }

        /* ── PAGE ── */
        .page {
          max-width: 900px;
          margin: 0 auto;
          padding: 100px 40px 120px;
        }

        /* ── DOCUMENT ── */
        .doc {
          background: var(--surface);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        /* ── DOC HEADER ── */
        .doc-header {
          padding: 64px 64px 48px;
          border-bottom: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }
        .doc-header::before {
          content: '';
          position: absolute; top: 0; right: 0;
          width: 300px; height: 300px;
          background: radial-gradient(circle at 100% 0%, rgba(201,169,110,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .doc-header-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 52px;
        }
        .doc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px; font-weight: 600;
          color: var(--white);
          line-height: 1.05;
          letter-spacing: -0.01em;
        }
        .doc-id {
          font-size: 11px; color: var(--gold-dim);
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-top: 10px;
        }
        .doc-agency {
          text-align: right;
        }
        .doc-agency-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 700;
          color: var(--gold);
          letter-spacing: 0.15em; text-transform: uppercase;
        }
        .doc-agency-sub {
          font-size: 10px; color: var(--muted);
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-top: 4px;
        }
        .doc-parties {
          display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
        }
        .party-box {
          padding: 24px;
          border: 1px solid var(--border2);
          background: var(--card);
        }
        .party-label {
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--gold-dim); margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .party-label::after {
          content: ''; flex: 1; height: 1px; background: var(--border2);
        }

        /* ── BODY ── */
        .doc-body { padding: 64px; }

        /* ── SECTION ── */
        .section { margin-bottom: 56px; }
        .section-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border2);
        }
        .section-num {
          font-size: 10px; color: var(--gold);
          letter-spacing: 0.1em; font-weight: 500;
          min-width: 24px;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600;
          color: var(--white);
          letter-spacing: 0.02em;
        }
        .section-icon {
          margin-left: auto;
          color: var(--gold-dim);
          opacity: 0.6;
        }

        /* ── EDITABLE ── */
        input.editable, textarea.editable {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'DM Mono', monospace;
          font-size: inherit;
          line-height: inherit;
          width: 100%;
          resize: none;
          padding: 2px 4px;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s, background 0.2s;
          border-radius: 0;
        }
        input.editable:hover, textarea.editable:hover {
          border-color: var(--border);
          background: rgba(201,169,110,0.03);
        }
        input.editable:focus, textarea.editable:focus {
          border-color: var(--gold-dim);
          background: rgba(201,169,110,0.05);
        }
        input.editable::placeholder, textarea.editable::placeholder {
          color: var(--muted); opacity: 0.5;
        }
        .field-large {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600;
          color: var(--white);
        }
        .field-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600;
          color: var(--white);
        }
        .field-muted {
          color: var(--text-dim); font-size: 12px;
        }

        /* ── CLIENT ROW ── */
        .client-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--border2);
          font-size: 12px;
        }
        .client-row:last-child { border-bottom: none; }
        .client-key { color: var(--muted); min-width: 130px; letter-spacing: 0.05em; }
        .client-val input.editable { text-align: right; color: var(--text); }

        /* ── OVERVIEW ── */
        .overview-grid {
          display: grid; gap: 4px;
        }

        /* ── SCOPE ── */
        .scope-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
          background: var(--border2);
          border: 1px solid var(--border2);
        }
        .scope-col {
          background: var(--card);
          padding: 24px;
        }
        .scope-col-header {
          display: flex; align-items: center; gap: 8px;
          color: var(--accent, var(--gold));
          font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
          font-weight: 500; margin-bottom: 20px;
        }
        .scope-add {
          margin-left: auto;
          background: transparent; border: 1px solid var(--border);
          color: var(--muted); cursor: pointer;
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, color 0.2s;
        }
        .scope-add:hover { border-color: var(--gold-dim); color: var(--gold); }
        .scope-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .scope-item {
          display: flex; align-items: center; gap: 6px;
        }
        .scope-bullet { color: var(--gold-dim); flex-shrink: 0; }
        .scope-input {
          background: transparent; border: none; outline: none;
          color: var(--text); font-family: 'DM Mono', monospace;
          font-size: 12px; flex: 1; min-width: 0;
          border-bottom: 1px solid transparent;
          transition: border-color 0.15s;
          padding: 1px 0;
        }
        .scope-input:hover { border-color: var(--border); }
        .scope-input:focus { border-color: var(--gold-dim); outline: none; }
        .scope-remove {
          background: none; border: none; cursor: pointer;
          color: var(--muted); opacity: 0;
          transition: opacity 0.15s, color 0.15s;
          padding: 2px;
          flex-shrink: 0;
        }
        .group-item:hover .scope-remove { opacity: 1; }
        .scope-remove:hover { color: var(--red); }

        /* ── TIMELINE ── */
        .timeline { display: flex; flex-direction: column; gap: 0; }
        .timeline-item {
          display: grid; grid-template-columns: 32px 1fr 1fr auto;
          align-items: center; gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border2);
        }
        .timeline-item:last-child { border-bottom: none; }
        .timeline-dot {
          width: 8px; height: 8px;
          background: var(--gold);
          border-radius: 50%;
          justify-self: center;
          box-shadow: 0 0 0 3px rgba(201,169,110,0.15);
        }
        .timeline-date input.editable {
          text-align: right; color: var(--muted); font-size: 11px;
        }
        .tl-remove {
          background: none; border: none; cursor: pointer;
          color: var(--muted); opacity: 0;
          transition: opacity 0.15s, color 0.15s;
          padding: 4px;
        }
        .timeline-item:hover .tl-remove { opacity: 1; }
        .tl-remove:hover { color: var(--red); }
        .timeline-add {
          margin-top: 16px;
          display: flex; align-items: center; gap: 8px;
          background: none; border: 1px dashed var(--border);
          color: var(--muted); cursor: pointer;
          padding: 10px 16px;
          font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 0.08em;
          width: 100%;
          transition: border-color 0.2s, color 0.2s;
        }
        .timeline-add:hover { border-color: var(--gold-dim); color: var(--gold); }

        /* ── FINANCE ── */
        .finance-card {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 40px;
          position: relative; overflow: hidden;
        }
        .finance-card::before {
          content: '';
          position: absolute; bottom: 0; right: 0;
          width: 200px; height: 200px;
          background: radial-gradient(circle at 100% 100%, rgba(201,169,110,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .finance-total-label {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold-dim); margin-bottom: 8px;
        }
        .finance-total {
          display: flex; align-items: flex-end; gap: 6px;
          margin-bottom: 32px;
        }
        .finance-currency {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; color: var(--gold-dim);
        }

        /* ── CURRENCY SELECT ── */
        .currency-select {
          position: relative;
          display: flex; align-items: baseline;
          flex-shrink: 0;
        }
        .currency-trigger {
          display: flex; align-items: baseline; gap: 4px;
          background: transparent; border: none; cursor: pointer;
          padding: 0 6px 0 0;
          transition: opacity 0.2s;
        }
        .currency-trigger:hover { opacity: 0.7; }
        .currency-symbol-preview {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; color: var(--gold-dim);
          line-height: 1;
        }
        .currency-code-preview {
          font-size: 10px; color: var(--muted);
          letter-spacing: 0.1em; text-transform: uppercase;
          align-self: flex-end; margin-bottom: 4px;
        }
        .currency-chevron {
          font-size: 7px; color: var(--muted);
          align-self: flex-end; margin-bottom: 5px; margin-left: 2px;
        }
        .currency-symbol-print {
          display: none;
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; color: var(--gold-dim);
        }
        .currency-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0;
          z-index: 200;
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: 0 24px 48px rgba(0,0,0,0.6);
          min-width: 220px;
        }
        .currency-dropdown-inner {
          max-height: 280px; overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .currency-option {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 14px;
          background: none; border: none; cursor: pointer;
          text-align: left; transition: background 0.15s;
          border-bottom: 1px solid var(--border2);
        }
        .currency-option:last-child { border-bottom: none; }
        .currency-option:hover { background: var(--gold-faint); }
        .currency-option.active { background: rgba(201,169,110,0.1); }
        .co-symbol {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px; color: var(--gold);
          min-width: 24px; text-align: center;
        }
        .co-code {
          font-size: 11px; color: var(--white);
          letter-spacing: 0.08em; font-weight: 500;
          min-width: 36px;
        }
        .co-name {
          font-size: 11px; color: var(--muted);
        }
        .finance-amount input.editable {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px; font-weight: 700;
          color: var(--white); line-height: 1;
          width: 260px;
        }
        .finance-divider {
          height: 1px; background: var(--border2); margin-bottom: 28px;
        }
        .finance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .finance-item-label {
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 6px;
        }
        .finance-item input.editable {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600;
          color: var(--cream);
        }

        /* ── TWO COLUMN ── */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }

        /* ── SIGNATURE ── */
        .sig-pad {
          border: 1px solid var(--border2);
          padding: 24px;
          background: var(--card);
        }
        .sig-label {
          display: block;
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold-dim); margin-bottom: 16px;
        }
        .sig-canvas-wrap {
          position: relative; margin-bottom: 16px;
        }
        .sig-canvas {
          width: 100%; height: 100px;
          cursor: crosshair;
          display: block;
          border-bottom: 1px solid var(--border);
          background: rgba(0,0,0,0.2);
          touch-action: none;
        }
        .sig-placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: var(--muted);
          font-style: italic; pointer-events: none;
          letter-spacing: 0.05em;
        }
        .sig-clear {
          position: absolute; top: 6px; right: 6px;
          background: none; border: 1px solid var(--border);
          color: var(--muted); cursor: pointer;
          width: 26px; height: 26px;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s, color 0.2s;
        }
        .sig-canvas-wrap:hover .sig-clear { opacity: 1; }
        .sig-clear:hover { color: var(--red); border-color: var(--red); }
        .sig-type-input {
          width: 100%; background: rgba(0,0,0,0.2);
          border: none; border-bottom: 1px solid var(--border);
          color: var(--cream); font-size: 36px;
          padding: 8px 4px; outline: none;
          transition: border-color 0.2s;
          min-height: 72px;
        }
        .sig-type-input:focus { border-bottom-color: var(--gold-dim); }
        .sig-type-input::placeholder { color: var(--muted); font-size: 14px; font-family: 'DM Mono', monospace; }
        .sig-meta {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .meta-key {
          font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 3px;
        }
        .meta-val { font-size: 12px; color: var(--text); }

        /* ── LEGAL FOOTER ── */
        .legal {
          padding: 24px 64px 48px;
          border-top: 1px solid var(--border2);
          font-size: 10px; color: var(--muted);
          line-height: 1.8; letter-spacing: 0.03em;
        }

        /* ── STATUS BAR ── */
        .status-bar {
          position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 24px;
          background: rgba(22,19,14,0.95);
          border: 1px solid var(--border);
          padding: 12px 28px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          white-space: nowrap;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4a9b6f;
          box-shadow: 0 0 8px #4a9b6f;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        .status-text {
          font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--muted);
        }
        .status-sep { width: 1px; height: 16px; background: var(--border); }
        .status-link {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--gold-dim);
          transition: color 0.2s;
        }
        .status-link:hover { color: var(--gold); }

        /* ── HELPERS ── */
        .mt-4  { margin-top:  16px; }
        .mb-2  { margin-bottom: 8px; }

        /* ── PRINT ── */
        @media print {
          :root {
            --bg: #fff; --surface: #fff; --card: #f9f9f7;
            --border: #e0dcd5; --border2: #ece8e0;
            --gold: #8a6a30; --gold-dim: #a07840; --gold-faint: #f5f0e8;
            --cream: #5a4520; --muted: #888070;
            --text: #1a1510; --text-dim: #6b6050; --white: #0a0806;
          }
          @page { margin: 18mm; size: A4; }
          body { background: #fff; }
          .nav, .status-bar, .print-hide { display: none !important; }
          .page { padding: 0; max-width: 100%; }
          .doc { border: none; }
          .doc-header, .doc-body { padding: 40px; }
          input.editable, textarea.editable { border-bottom-color: transparent !important; background: transparent !important; }
          .sig-canvas { background: transparent; }
          .currency-trigger { display: none !important; }
          .currency-symbol-print { display: inline !important; }
          .scope-grid { background: #ece8e0; }
          .finance-card { background: var(--card); }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''} print-hide`}>
        <div className="nav-brand">
          <div className="nav-logo">A</div>
          <span className="nav-name">ARCODIC <span>SOW Portal</span></span>
        </div>
        <button className="nav-btn" onClick={() => window.print()}>
          <Download size={13} />
          Generate PDF
        </button>
      </nav>

      <div className="page">
        <div className="doc">

          {/* ── HEADER ── */}
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
              {/* Client */}
              <div className="party-box">
                <div className="party-label"><User size={10} />Client</div>
                <Field
                  className="field-name mb-2"
                  value={data.client.name}
                  onChange={v => set('client.name', v)}
                  placeholder="Client name"
                />
                <Field
                  className="field-muted"
                  value={data.client.address}
                  onChange={v => set('client.address', v)}
                  multiline rows={2}
                  placeholder="Address"
                />
              </div>
              {/* Contact */}
              <div className="party-box">
                <div className="party-label"><Briefcase size={10} />Contact Details</div>
                {[
                  { key: 'contact', label: 'Primary Contact' },
                  { key: 'email',   label: 'Email' },
                  { key: 'phone',   label: 'Phone' },
                ].map(({ key, label }) => (
                  <div className="client-row" key={key}>
                    <span className="client-key">{label}</span>
                    <div className="client-val" style={{ flex: 1 }}>
                      <Field
                        value={data.client[key]}
                        onChange={v => set(`client.${key}`, v)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="doc-body">

            {/* 01 — Overview */}
            <div className="section">
              <div className="section-header">
                <span className="section-num">01</span>
                <h2 className="section-title">Project Overview</h2>
                <Briefcase size={14} className="section-icon" />
              </div>
              <div className="overview-grid">
                <Field
                  className="field-large mb-2"
                  value={data.project.title}
                  onChange={v => set('project.title', v)}
                  placeholder="Project title"
                />
                <Field
                  className="field-muted"
                  value={data.project.description}
                  onChange={v => set('project.description', v)}
                  multiline rows={3}
                  placeholder="Project description"
                />
              </div>
            </div>

            {/* 02 — Scope */}
            <div className="section">
              <div className="section-header">
                <span className="section-num">02</span>
                <h2 className="section-title">Scope of Work</h2>
                <Layers size={14} className="section-icon" />
              </div>
              <div className="scope-grid">
                <ScopeColumn
                  icon={Globe}
                  label="Pages & Screens"
                  accent="var(--teal)"
                  items={data.scope.pages}
                  onAdd={() => scopeAdd('pages')}
                  onRemove={i => scopeRemove('pages', i)}
                  onEdit={(i, v) => scopeEdit('pages', i, v)}
                />
                <ScopeColumn
                  icon={Zap}
                  label="Functionality"
                  accent="var(--gold)"
                  items={data.scope.features}
                  onAdd={() => scopeAdd('features')}
                  onRemove={i => scopeRemove('features', i)}
                  onEdit={(i, v) => scopeEdit('features', i, v)}
                />
                <ScopeColumn
                  icon={Code2}
                  label="Integrations"
                  accent="var(--amber)"
                  items={data.scope.integrations}
                  onAdd={() => scopeAdd('integrations')}
                  onRemove={i => scopeRemove('integrations', i)}
                  onEdit={(i, v) => scopeEdit('integrations', i, v)}
                />
              </div>
            </div>

            {/* 03 — Timeline + Finance */}
            <div className="section two-col">
              {/* Timeline */}
              <div>
                <div className="section-header">
                  <span className="section-num">03</span>
                  <h2 className="section-title">Milestones</h2>
                  <Calendar size={14} className="section-icon" />
                </div>
                <div className="timeline">
                  {data.timeline.map((m, i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-dot" />
                      <Field
                        value={m.desc}
                        onChange={v => timelineEdit(i, 'desc', v)}
                        placeholder="Milestone"
                      />
                      <div className="timeline-date">
                        <input
                          type="date"
                          className="editable"
                          value={m.date}
                          onChange={e => timelineEdit(i, 'date', e.target.value)}
                          style={{ textAlign: 'right', color: 'var(--muted)', fontSize: '11px' }}
                        />
                      </div>
                      <button className="tl-remove print-hide" onClick={() => removeMilestone(i)}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="timeline-add print-hide" onClick={addMilestone}>
                  <Plus size={12} /> Add Milestone
                </button>
              </div>

              {/* Finance */}
              <div>
                <div className="section-header">
                  <span className="section-num">04</span>
                  <h2 className="section-title">Financial Terms</h2>
                  <CreditCard size={14} className="section-icon" />
                </div>
                <div className="finance-card">
                  <div className="finance-total-label">Total Project Fee</div>
                  <div className="finance-total">
                    <CurrencySelect
                      value={data.pricing.currency}
                      onChange={v => set('pricing.currency', v)}
                    />
                    <div className="finance-amount">
                      <Field
                        value={data.pricing.total}
                        onChange={v => set('pricing.total', v)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="finance-divider" />
                  <div className="finance-grid">
                    <div className="finance-item">
                      <div className="finance-item-label">Deposit Required</div>
                      <Field
                        value={data.pricing.deposit}
                        onChange={v => set('pricing.deposit', v)}
                        placeholder="50%"
                      />
                    </div>
                    <div className="finance-item">
                      <div className="finance-item-label">Included Revisions</div>
                      <Field
                        value={data.pricing.revisions}
                        onChange={v => set('pricing.revisions', v)}
                        placeholder="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 05 — Signatures */}
            <div className="section">
              <div className="section-header">
                <span className="section-num">05</span>
                <h2 className="section-title">Acceptance & Signing</h2>
                <PenTool size={14} className="section-icon" />
              </div>
              <div className="two-col">
                <TypeSignPad
                  label="ARCODIC"
                  signatory="A. Arcodic Representative"
                  date={today}
                  value={arcSig}
                  onChange={setArcSig}
                  locked={sent}
                />
                <div className="sig-pad print-hide" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'rgba(201,169,110,0.03)', border:'1px dashed var(--border)' }}>
                  <div style={{ fontSize:11, color:'var(--muted)', textAlign:'center', letterSpacing:'0.05em' }}>
                    {sent ? '✓ Signing link sent to client' : 'Client will sign via their unique link'}
                  </div>
                  {!sent && (
                    <button
                      onClick={() => { setSendError(''); setShowSendModal(true); }}
                      style={{
                        background: arcSig.trim() ? 'var(--gold)' : 'var(--border)',
                        color: arcSig.trim() ? 'var(--bg)' : 'var(--muted)',
                        border:'none', padding:'12px 28px',
                        cursor: arcSig.trim() ? 'pointer' : 'not-allowed',
                        fontFamily:"'DM Mono', monospace", fontSize:11,
                        fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase',
                        transition:'all 0.2s',
                      }}
                    >Send to Client →</button>
                  )}
                  {sent && <div style={{ fontSize:10, color:'#4a9b6f', letterSpacing:'0.08em' }}>Awaiting client signature</div>}
                </div>
                {/* Print placeholder for client sig */}
                <div className="sig-pad" style={{ display:'none' }}>
                  <span className="sig-label">CLIENT</span>
                  <div style={{ minHeight:72, borderBottom:'1px solid var(--border)', marginBottom:16 }} />
                  <div className="sig-meta">
                    <div><div className="meta-key">Signatory</div><div className="meta-val">{data.client.name}</div></div>
                    <div><div className="meta-key">Date</div><div className="meta-val" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="legal">
            This Statement of Work is governed by and incorporated into the Master Service Agreement between ARCODIC and the Client.
            Any functionality, screen, feature, or integration not expressly listed above is excluded from this engagement.
            ARCODIC reserves the right to adjust implementation tools or libraries where technically necessary without material impact to deliverables.
          </div>
        </div>
      </div>

      {/* SEND TO CLIENT MODAL */}
      {showSendModal && (
        <div style={{
          position:'fixed', inset:0, zIndex:200,
          background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24,
        }}>
          <div style={{
            background:'var(--card)', border:'1px solid var(--border)',
            padding:40, maxWidth:440, width:'100%',
          }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color:'var(--white)', marginBottom:8 }}>
              Send to Client
            </h3>
            <p style={{ fontSize:11, color:'var(--muted)', marginBottom:28, lineHeight:1.7 }}>
              The client will receive an email with a unique link to review and sign the SOW. Your signature will be locked once sent.
            </p>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--gold-dim)', marginBottom:8 }}>Client Email</div>
              <input
                type="email"
                placeholder={data.client.email || 'client@company.com'}
                value={clientEmailInput}
                onChange={e => setClientEmailInput(e.target.value)}
                style={{
                  width:'100%', background:'var(--surface)', border:'1px solid var(--border)',
                  borderRadius:0, color:'var(--text)', fontFamily:"'DM Mono', monospace",
                  fontSize:13, padding:'12px 14px', outline:'none',
                  transition:'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--gold-dim)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                onKeyDown={e => e.key === 'Enter' && sendToClient()}
              />
            </div>
            {sendError && <p style={{ color:'var(--red)', fontSize:11, marginBottom:16 }}>{sendError}</p>}
            <div style={{ display:'flex', gap:12 }}>
              <button
                onClick={() => setShowSendModal(false)}
                style={{
                  flex:1, background:'transparent', border:'1px solid var(--border)',
                  color:'var(--muted)', padding:'12px 0', cursor:'pointer',
                  fontFamily:"'DM Mono', monospace", fontSize:11,
                  letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.2s',
                }}
              >Cancel</button>
              <button
                onClick={sendToClient}
                disabled={sending}
                style={{
                  flex:2, background:'var(--gold)', border:'none',
                  color:'var(--bg)', padding:'12px 0', cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily:"'DM Mono', monospace", fontSize:11, fontWeight:500,
                  letterSpacing:'0.1em', textTransform:'uppercase',
                  opacity: sending ? 0.7 : 1, transition:'all 0.2s',
                }}
              >{sending ? 'Sending…' : 'Send Signing Link'}</button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS BAR */}
      <div className="status-bar print-hide">
        <div className="status-dot" />
        <span className="status-text">{sent ? 'Sent to client' : 'All changes saved'}</span>
        <div className="status-sep" />
        <button className="status-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑ Top
        </button>
        <div className="status-sep" />
        <button className="status-link" onClick={() => window.print()}>
          Print / PDF
        </button>
      </div>
    </>
  );
}
