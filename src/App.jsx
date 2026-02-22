import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Download, Briefcase, User, Layers, 
  Calendar, CreditCard, PenTool, CheckCircle2, 
  ChevronRight, Zap, Globe, Code2, Link as LinkIcon, ExternalLink, ArrowLeft, Send
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CONSTANTS & CONFIG
───────────────────────────────────────────── */
const SUPABASE_URL = 'https://ctjwqktzdvbfijoqnxvo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0andxa3R6ZHZiZmlqb3FueHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODY3MDksImV4cCI6MjA4NzA2MjcwOX0.ng2Ek0nFDteMqsQM-Or-TCBkp424uyCKbWjNbJ7MpUo';

const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼',   name: 'Saudi Riyal' }
];

const SIGN_FONTS = [
  { id: 'caveat',   name: 'Handwritten', family: "'Caveat', cursive" },
  { id: 'sacramento', name: 'Elegant',     family: "'Sacramento', cursive" },
  { id: 'shadows',  name: 'Playful',     family: "'Shadows Into Light', cursive" }
];

/* ─────────────────────────────────────────────
   COMPONENT: TypeSignPad
───────────────────────────────────────────── */
const TypeSignPad = ({ value, onChange, fontId, onFontChange }) => {
  return (
    <div className="sign-pad-container">
      <div className="font-selector">
        {SIGN_FONTS.map(f => (
          <button 
            key={f.id} 
            type="button"
            onClick={() => onFontChange(f.id)}
            className={`font-btn ${fontId === f.id ? 'active' : ''}`}
            style={{ fontFamily: f.family }}
          >
            Aa
          </button>
        ))}
      </div>
      <input
        className="sign-input"
        placeholder="Type your name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: SIGN_FONTS.find(f => f.id === fontId)?.family }}
      />
      <div className="sign-meta">Digitally verified via Arcodic Auth</div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN APP COMPONENT
───────────────────────────────────────────── */
export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Data State
  const [data, setData] = useState({
    projectName: '',
    clientName: '',
    clientEmail: '',
    startDate: '',
    timeline: '',
    currency: CURRENCIES[0],
    totalValue: '',
    scope: [''],
    milestones: [{ desc: '', amount: '' }],
    paymentTerms: '50% upfront, 50% upon completion.'
  });

  // UI State
  const [signature, setSignature] = useState('');
  const [fontId, setFontId] = useState('caveat');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState(false);
  const [clientSig, setClientSig] = useState(null);
  const [sowId, setSowId] = useState(null);

  // Auth & Persistence
  useEffect(() => {
    const stored = localStorage.getItem('arcodic_user');
    if (!stored) navigate('/');
    else {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setSignature(parsed.name);
    }

    // Recover draft
    const draft = localStorage.getItem('arcodic_draft');
    if (draft) {
      try { setData(JSON.parse(draft)); } catch(e) {}
    }
  }, [navigate]);

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('arcodic_draft', JSON.stringify(data));
  }, [data]);

  // Polling for signature
  useEffect(() => {
    if (!sowId || clientSig) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/sows?id=eq.${sowId}&select=client_signature`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
        });
        const rows = await res.json();
        if (rows?.[0]?.client_signature) {
          setClientSig(rows[0].client_signature);
          clearInterval(interval);
        }
      } catch (e) { console.error("Poll err:", e); }
    }, 8000);
    return () => clearInterval(interval);
  }, [sowId, clientSig]);

  const updateData = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const sendSOW = async () => {
    if (!data.clientEmail || !data.projectName) {
      setSendError("Please fill in project name and client email.");
      return;
    }
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/send-sow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          creatorName: user.name,
          arcodicSignature: signature,
          arcodicFont: fontId
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send');
      setSent(true);
      setSowId(result.id);
      setShowSendModal(false);
      localStorage.removeItem('arcodic_draft');
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const copySigningLink = () => {
    if (!sowId) return;
    const url = `${window.location.origin}/sign/${sowId}`;
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <style>{`
        :root {
          --bg: #0a0a0a;
          --panel: #141414;
          --border: #222;
          --border-hover: #333;
          --gold: #d4af37;
          --gold-muted: #8a6d1a;
          --text: #e0e0e0;
          --muted: #888;
          --red: #ff4d4d;
          --green: #00ff88;
        }

        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Caveat&family=Sacramento&family=Shadows+Into+Light&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        .app-container { min-height: 100vh; display: flex; flex-direction: column; }

        /* HEADER */
        .editor-header {
          position: sticky;
          top: 0;
          background: rgba(10,10,10,0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
        }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .back-btn { background: none; border: none; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: 'DM Mono', monospace; font-size: 12px; transition: color 0.2s; }
        .back-btn:hover { color: var(--gold); }
        .header-title { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: -0.01em; }

        /* MAIN CONTENT */
        .content-wrap { max-width: 900px; margin: 40px auto; width: 100%; padding: 0 24px 100px; }
        
        .form-section { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 32px; margin-bottom: 24px; }
        .section-label { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--gold); margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        label { font-size: 11px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
        input, textarea, select {
          background: #000;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: #fff;
          padding: 12px;
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        input:focus, textarea:focus { outline: none; border-color: var(--gold-muted); }

        /* REPEATER FIELDS */
        .repeater-item { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
        .btn-icon { background: none; border: 1px solid var(--border); color: var(--muted); padding: 10px; cursor: pointer; border-radius: 6px; display: flex; transition: all 0.2s; }
        .btn-icon:hover { background: #1a1a1a; color: var(--red); border-color: var(--red); }
        .btn-add { background: none; border: 1px dashed var(--border); color: var(--muted); padding: 12px; width: 100%; cursor: pointer; border-radius: 6px; font-size: 12px; font-family: 'DM Mono', monospace; margin-top: 8px; transition: all 0.2s; }
        .btn-add:hover { border-color: var(--gold); color: var(--gold); }

        /* SIGNATURE PAD */
        .sign-pad-container { background: #000; border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin-top: 12px; }
        .font-selector { display: flex; gap: 8px; margin-bottom: 16px; }
        .font-btn { width: 40px; height: 40px; border-radius: 6px; border: 1px solid var(--border); background: var(--panel); color: #fff; cursor: pointer; font-size: 20px; transition: all 0.2s; }
        .font-btn.active { border-color: var(--gold); color: var(--gold); background: #1a1a1a; }
        .sign-input { width: 100%; background: none; border: none; border-bottom: 1px solid var(--border); border-radius: 0; font-size: 32px; padding: 10px 0; margin-bottom: 8px; text-align: center; }
        .sign-meta { font-family: 'DM Mono', monospace; font-size: 9px; color: #444; text-align: center; text-transform: uppercase; }

        /* MODAL */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: var(--panel); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 440px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .modal-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
        .modal-desc { color: var(--muted); font-size: 14px; margin-bottom: 24px; line-height: 1.5; }

        .btn-primary { background: var(--gold); color: #000; border: none; border-radius: 6px; padding: 14px 24px; font-weight: 600; cursor: pointer; font-size: 14px; transition: transform 0.1s; display: flex; align-items: center; gap: 8px; justify-content: center; width: 100%; }
        .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* STATUS BAR */
        .status-bar { position: fixed; bottom: 24px; right: 24px; background: var(--panel); border: 1px solid var(--border); border-radius: 99px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; font-size: 12px; font-family: 'DM Mono', monospace; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #444; }
        .status-dot.active { background: var(--gold); box-shadow: 0 0 10px var(--gold); animation: pulse 2s infinite; }
        .status-dot.done { background: var(--green); }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>

      {/* HEADER */}
      <header className="editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div className="header-title">{data.projectName || 'Untitled SOW'}</div>
        </div>
        <div className="header-right">
          <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '12px' }} onClick={() => setShowSendModal(true)}>
            {sent ? 'Re-send Document' : 'Generate & Send'} <Send size={14} />
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="content-wrap">
        {/* CLIENT INFO */}
        <section className="form-section">
          <div className="section-label"><User size={14} /> Client Details</div>
          <div className="grid">
            <div className="field">
              <label>Client Name</label>
              <input value={data.clientName} onChange={e => updateData('clientName', e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="field">
              <label>Client Email</label>
              <input value={data.clientEmail} onChange={e => updateData('clientEmail', e.target.value)} placeholder="e.g. john@company.com" />
            </div>
          </div>
        </section>

        {/* PROJECT INFO */}
        <section className="form-section">
          <div className="section-label"><Briefcase size={14} /> Project Details</div>
          <div className="field" style={{ marginBottom: 24 }}>
            <label>Project Title</label>
            <input value={data.projectName} onChange={e => updateData('projectName', e.target.value)} placeholder="e.g. Web Development - Q4" />
          </div>
          <div className="grid">
            <div className="field">
              <label>Start Date</label>
              <input type="date" value={data.startDate} onChange={e => updateData('startDate', e.target.value)} />
            </div>
            <div className="field">
              <label>Estimated Timeline</label>
              <input value={data.timeline} onChange={e => updateData('timeline', e.target.value)} placeholder="e.g. 12 Weeks" />
            </div>
          </div>
        </section>

        {/* FINANCIALS */}
        <section className="form-section">
          <div className="section-label"><CreditCard size={14} /> Pricing & Milestones</div>
          <div className="grid" style={{ marginBottom: 24 }}>
            <div className="field">
              <label>Currency</label>
              <select value={data.currency.code} onChange={e => updateData('currency', CURRENCIES.find(c => c.code === e.target.value))}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
              </select>
            </div>
            <div className="field">
              <label>Total Value</label>
              <input type="number" value={data.totalValue} onChange={e => updateData('totalValue', e.target.value)} placeholder="0.00" />
            </div>
          </div>
          
          <label style={{ marginBottom: 8, display: 'block' }}>Payment Schedule</label>
          {data.milestones.map((m, i) => (
            <div key={i} className="repeater-item">
              <input style={{ flex: 3 }} placeholder="Milestone description..." value={m.desc} onChange={e => {
                const copy = [...data.milestones]; copy[i].desc = e.target.value; updateData('milestones', copy);
              }} />
              <input style={{ flex: 1 }} type="number" placeholder="Amount" value={m.amount} onChange={e => {
                const copy = [...data.milestones]; copy[i].amount = e.target.value; updateData('milestones', copy);
              }} />
              <button className="btn-icon" onClick={() => {
                const copy = data.milestones.filter((_, idx) => idx !== i); updateData('milestones', copy);
              }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button className="btn-add" onClick={() => updateData('milestones', [...data.milestones, { desc: '', amount: '' }])}>
            + Add Milestone
          </button>
        </section>

        {/* SCOPE */}
        <section className="form-section">
          <div className="section-label"><Layers size={14} /> Scope of Work</div>
          {data.scope.map((s, i) => (
            <div key={i} className="repeater-item">
              <textarea style={{ flex: 1 }} rows={2} placeholder="Itemize project scope..." value={s} onChange={e => {
                const copy = [...data.scope]; copy[i] = e.target.value; updateData('scope', copy);
              }} />
              <button className="btn-icon" onClick={() => {
                const copy = data.scope.filter((_, idx) => idx !== i); updateData('scope', copy);
              }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button className="btn-add" onClick={() => updateData('scope', [...data.scope, ''])}>
            + Add Scope Item
          </button>
        </section>

        {/* SIGNATURE */}
        <section className="form-section">
          <div className="section-label"><PenTool size={14} /> Creator Signature</div>
          <TypeSignPad 
            value={signature} 
            onChange={setSignature} 
            fontId={fontId} 
            onFontChange={setFontId} 
          />
        </section>
      </main>

      {/* MODAL: SEND SOW */}
      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Ready to send?</div>
            <p className="modal-desc">
              This will generate a secure signing link and email it to <strong>{data.clientEmail}</strong>. You'll be notified once they sign.
            </p>
            {sendError && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '16px' }}>{sendError}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn-primary" style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }} onClick={() => setShowSendModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" disabled={sending} onClick={sendSOW}>
                {sending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS BAR */}
      <div className="status-bar">
        <div className={`status-dot ${clientSig ? 'done' : sent ? 'active' : ''}`} />
        <span>{clientSig ? 'Fully Signed' : sent ? 'Awaiting Client' : 'Drafting'}</span>
        {sent && (
          <button type="button" style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', padding: 0, fontSize: '11px', marginLeft: 4 }} onClick={copySigningLink}>
            <LinkIcon size={12} />
          </button>
        )}
      </div>
    </div>
  );
}