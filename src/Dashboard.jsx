import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SUPABASE_URL = 'https://ctjwqktzdvbfijoqnxvo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0andxa3R6ZHZiZmlqb3FueHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODY3MDksImV4cCI6MjA4NzA2MjcwOX0.ng2Ek0nFDteMqsQM-Or-TCBkp424uyCKbWjNbJ7MpUo';

// FIX #8: complete symbol map for all 20 currencies defined in App.jsx
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
  QAR: 'ر.ق',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  ZAR: 'R',
  NGN: '₦',
  EGP: 'E£',
  TRY: '₺',
  BRL: 'R$',
  MXN: 'MX$',
  SGD: 'S$',
  KWD: 'د.ك',
};

const fetchSOWs = async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/sows?select=id,created_at,status,client_name,client_email,data,arcodic_signed_at,client_signed_at,arcodic_signature,client_signature&order=created_at.desc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch: HTTP ${res.status}`);
  return res.json();
};

const STATUS = {
  draft:     { label: 'Draft',    icon: '◦', color: '#4a4035', bg: 'rgba(74,64,53,0.15)',   pulse: false },
  sent:      { label: 'Awaiting', icon: '◎', color: '#c9a96e', bg: 'rgba(201,169,110,0.1)', pulse: true  },
  completed: { label: 'Signed',   icon: '◉', color: '#4a9b6f', bg: 'rgba(74,155,111,0.1)',  pulse: false },
};

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric' });
};

const fmtLong = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' });
};

// FIX #8: use complete symbol map with a safe fallback
const currency = (data) => {
  const code   = data?.pricing?.currency || 'ZAR';
  const symbol = CURRENCY_SYMBOLS[code] || code;
  return `${symbol} ${data?.pricing?.total || '—'}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [sows,     setSows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);

  // FIX #11: useCallback ensures the stable reference used by both
  // useEffects is the same function, preventing stale closures
  const load = useCallback(async () => {
    try {
      const data = await fetchSOWs();
      setSows(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = sows.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.client_name?.toLowerCase().includes(q) ||
      s.client_email?.toLowerCase().includes(q) ||
      s.data?.project?.title?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = {
    all:       sows.length,
    draft:     sows.filter(s => s.status === 'draft').length,
    sent:      sows.filter(s => s.status === 'sent').length,
    completed: sows.filter(s => s.status === 'completed').length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Great+Vibes&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{background:#0a0906;}
        body{font-family:'DM Mono',monospace;color:#d4c5a8;-webkit-font-smoothing:antialiased;}
        @keyframes fadeUp   {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
        @keyframes shimmer  {0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes sigReveal{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

        .db-root{min-height:100vh;background:#0a0906;display:flex;flex-direction:column;}

        /* NAV */
        .db-nav{position:sticky;top:0;z-index:50;height:56px;padding:0 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,9,6,0.92);backdrop-filter:blur(20px);border-bottom:1px solid #1a1610;animation:fadeUp 0.4s ease both;}
        .db-nav-left{display:flex;align-items:center;gap:24px;}
        .db-logo{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:#f0e8d8;letter-spacing:-0.01em;cursor:pointer;}
        .db-logo span{color:#c9a96e;}
        .db-nav-sep{width:1px;height:16px;background:#2a2520;}
        .db-nav-title{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#4a4035;}
        .db-nav-right{display:flex;align-items:center;gap:16px;}
        .db-new-btn{display:flex;align-items:center;gap:8px;background:#c9a96e;color:#0a0906;border:none;padding:8px 20px;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;transition:all 0.2s;}
        .db-new-btn:hover{background:#ddb97e;}
        .db-refresh-btn{background:transparent;border:1px solid #2a2520;color:#6b6050;padding:7px 14px;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s;}
        .db-refresh-btn:hover{border-color:#c9a96e;color:#c9a96e;}

        /* STATS */
        .db-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1a1610;border-bottom:1px solid #1a1610;animation:fadeUp 0.4s 0.05s ease both;}
        .db-stat{background:#0a0906;padding:28px 40px;display:flex;flex-direction:column;gap:8px;cursor:pointer;transition:background 0.2s;position:relative;overflow:hidden;}
        .db-stat::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:transparent;transition:background 0.2s;}
        .db-stat:hover{background:#0e0c09;}
        .db-stat.active::after{background:#c9a96e;}
        .db-stat.active-sent::after{background:#c9a96e;}
        .db-stat.active-completed::after{background:#4a9b6f;}
        .db-stat.active-draft::after{background:#4a4035;}
        .db-stat-num{font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:700;color:#f0e8d8;line-height:1;}
        .db-stat-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#4a4035;}

        /* TOOLBAR */
        .db-toolbar{padding:20px 40px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #1a1610;animation:fadeUp 0.4s 0.1s ease both;}
        .db-search-wrap{position:relative;flex:1;max-width:320px;}
        .db-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:11px;color:#4a4035;pointer-events:none;}
        .db-search{width:100%;background:#0e0c09;border:1px solid #1e1a15;color:#d4c5a8;font-family:'DM Mono',monospace;font-size:11px;padding:9px 12px 9px 32px;outline:none;transition:border-color 0.2s;}
        .db-search:focus{border-color:#c9a96e;}
        .db-search::placeholder{color:#3a3028;}
        .db-count{font-size:10px;color:#3a3028;letter-spacing:0.08em;}

        /* TABLE */
        .db-table-wrap{flex:1;overflow-x:auto;animation:fadeUp 0.4s 0.15s ease both;}
        .db-table{width:100%;border-collapse:collapse;}
        .db-thead th{padding:12px 24px;text-align:left;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#3a3028;font-weight:400;white-space:nowrap;border-bottom:1px solid #1a1610;background:#0a0906;position:sticky;top:56px;}
        .db-thead th:first-child{padding-left:40px;}
        .db-row{border-bottom:1px solid #111008;transition:background 0.15s;}
        .db-row:hover{background:#0d0b08;}
        .db-row.is-expanded{background:#0d0b08;}
        .db-row:hover .db-row-action{opacity:1;}
        .db-row.is-expanded .db-row-action{opacity:1;}
        .db-td{padding:18px 24px;vertical-align:middle;font-size:11px;color:#8a7d6b;white-space:nowrap;}
        .db-td:first-child{padding-left:40px;}
        .db-td:last-child{padding-right:40px;}

        /* STATUS */
        .db-status{display:inline-flex;align-items:center;gap:7px;padding:4px 10px;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;font-weight:500;}
        .db-status-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .db-status-dot.pulse{animation:pulse-dot 1.8s ease-in-out infinite;}

        /* PROJECT COL */
        .db-project-title{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;color:#e8d5b0;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;}
        .db-project-sub{font-size:10px;color:#4a4035;}
        .db-client-name{color:#d4c5a8;margin-bottom:2px;}
        .db-client-email{font-size:10px;color:#4a4035;}
        .db-amount{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:600;color:#c9a96e;}

        /* ACTION */
        .db-row-action{opacity:0;transition:opacity 0.15s;display:flex;align-items:center;gap:8px;}
        .db-act-btn{background:transparent;border:1px solid #2a2520;color:#6b6050;padding:5px 12px;cursor:pointer;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.15s;white-space:nowrap;}
        .db-act-btn:hover{border-color:#c9a96e;color:#c9a96e;}
        .db-act-btn.primary{background:#c9a96e;color:#0a0906;border-color:#c9a96e;}
        .db-act-btn.primary:hover{background:#ddb97e;}

        /* SIGNATURE EXPANSION ROW */
        .db-sig-row{background:#0d0b08;border-bottom:1px solid #1a1610;animation:sigReveal 0.25s ease both;}
        .db-sig-panel{padding:24px 40px 32px;}
        .db-sig-panel-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#3a3028;margin-bottom:20px;display:flex;align-items:center;gap:10px;}
        .db-sig-panel-label::after{content:'';flex:1;height:1px;background:#1a1610;}
        .db-sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:700px;}
        .db-sig-card{background:#111008;border:1px solid #1e1a15;padding:20px 24px;}
        .db-sig-card-label{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#4a4035;margin-bottom:12px;}
        .db-sig-value{font-family:'Great Vibes',cursive;font-size:32px;color:#e8d5b0;margin-bottom:10px;min-height:44px;line-height:1.2;}
        .db-sig-meta{display:flex;gap:24px;}
        .db-sig-meta-item{display:flex;flex-direction:column;gap:2px;}
        .db-sig-meta-key{font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#3a3028;}
        .db-sig-meta-val{font-size:10px;color:#6b6050;}
        .db-sig-verified{display:flex;align-items:center;gap:6px;margin-top:12px;font-size:9px;color:#4a9b6f;letter-spacing:0.08em;}
        .db-sig-verified-dot{width:4px;height:4px;border-radius:50%;background:#4a9b6f;}

        /* EMPTY */
        .db-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 40px;gap:16px;color:#3a3028;}
        .db-empty-icon{font-size:32px;opacity:0.4;}
        .db-empty-title{font-family:'Cormorant Garamond',serif;font-size:24px;color:#4a4035;}
        .db-empty-sub{font-size:11px;color:#3a3028;}

        /* SKELETON */
        .db-skel{height:14px;background:linear-gradient(90deg,#111008 25%,#181410 50%,#111008 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}

        /* FOOTER */
        .db-footer{padding:20px 40px;border-top:1px solid #111008;display:flex;align-items:center;justify-content:space-between;}
        .db-footer-left{font-size:9px;color:#2a2218;letter-spacing:0.1em;text-transform:uppercase;}
        .db-footer-right{font-size:9px;color:#2a2218;}
      `}</style>

      <div className="db-root">
        {/* NAV */}
        <nav className="db-nav">
          <div className="db-nav-left">
            <div className="db-logo" onClick={() => navigate('/')}>ARC<span>.</span></div>
            <div className="db-nav-sep" />
            <div className="db-nav-title">SOW Dashboard</div>
          </div>
          <div className="db-nav-right">
            <button className="db-refresh-btn" onClick={load}>↻ Refresh</button>
            <button className="db-new-btn" onClick={() => navigate('/')}>+ New SOW</button>
          </div>
        </nav>

        {/* STATS */}
        <div className="db-stats">
          {[
            { key:'all',       label:'Total SOWs', num:counts.all       },
            { key:'sent',      label:'Awaiting',   num:counts.sent      },
            { key:'completed', label:'Signed',     num:counts.completed },
            { key:'draft',     label:'Drafts',     num:counts.draft     },
          ].map(s => (
            <div key={s.key} className={`db-stat ${filter===s.key ? `active active-${s.key}` : ''}`} onClick={() => setFilter(s.key)}>
              <div className="db-stat-num">{loading ? '—' : s.num}</div>
              <div className="db-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div className="db-toolbar">
          <div className="db-search-wrap">
            <span className="db-search-icon">⌕</span>
            <input className="db-search" placeholder="Search client, project…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="db-count">{loading ? '' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}</div>
        </div>

        {/* TABLE */}
        <div className="db-table-wrap">
          {error ? (
            <div className="db-empty">
              <div className="db-empty-icon">⚠</div>
              <div className="db-empty-title">Failed to load</div>
              <div className="db-empty-sub">{error}</div>
            </div>
          ) : loading ? (
            <table className="db-table"><tbody>{[...Array(5)].map((_,i) => (
              <tr key={i} className="db-row">{[260,180,120,80,100,80].map((w,j) => (
                <td key={j} className="db-td"><div className="db-skel" style={{width:w}} /></td>
              ))}</tr>
            ))}</tbody></table>
          ) : filtered.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">◌</div>
              <div className="db-empty-title">No SOWs found</div>
              <div className="db-empty-sub">{search ? 'Try a different search' : 'Create your first SOW to get started'}</div>
            </div>
          ) : (
            <table className="db-table">
              <thead className="db-thead">
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Client Signed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sow, idx) => {
                  const st         = STATUS[sow.status] || STATUS.draft;
                  const isExpanded = expanded === sow.id;
                  return (
                    <React.Fragment key={sow.id}>
                      <tr
                        className={`db-row ${isExpanded ? 'is-expanded' : ''}`}
                        style={{ animationDelay: `${idx * 0.03}s` }}
                        onClick={() => sow.status === 'completed' && setExpanded(isExpanded ? null : sow.id)}
                      >
                        <td className="db-td">
                          <div className="db-project-title">{sow.data?.project?.title || 'Untitled Project'}</div>
                          <div className="db-project-sub">{fmt(sow.created_at)}</div>
                        </td>
                        <td className="db-td">
                          <div className="db-client-name">{sow.client_name || '—'}</div>
                          <div className="db-client-email">{sow.client_email || '—'}</div>
                        </td>
                        <td className="db-td">
                          <div className="db-amount">{currency(sow.data)}</div>
                        </td>
                        <td className="db-td">
                          <div className="db-status" style={{ background:st.bg, color:st.color }}>
                            <div className={`db-status-dot ${st.pulse ? 'pulse' : ''}`} style={{ background:st.color }} />
                            {st.label}
                          </div>
                        </td>
                        <td className="db-td">{fmt(sow.arcodic_signed_at)}</td>
                        <td className="db-td">
                          {sow.status === 'completed' ? (
                            <div>
                              <div style={{ color:'#4a9b6f', fontSize:11 }}>{sow.client_name}</div>
                              <div style={{ fontSize:9, color:'#3a3028', marginTop:2 }}>{fmt(sow.client_signed_at)}</div>
                            </div>
                          ) : (
                            <span style={{ color:'#2a2520' }}>—</span>
                          )}
                        </td>
                        <td className="db-td">
                          <div className="db-row-action">
                            {sow.status === 'completed' && (
                              <>
                                <button
                                  className="db-act-btn"
                                  onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : sow.id); }}
                                >
                                  {isExpanded ? 'Hide Sigs ↑' : 'View Sigs ↓'}
                                </button>
                                <button
                                  className="db-act-btn primary"
                                  onClick={e => {
                                    e.stopPropagation();
                                    localStorage.setItem('arcodic_sow_id', sow.id);
                                    navigate('/?sow=' + sow.id);
                                  }}
                                >Print</button>
                              </>
                            )}
                            {sow.status === 'sent' && (
                              <button className="db-act-btn" style={{ cursor:'default', opacity:0.5 }}>◎ Awaiting</button>
                            )}
                            {sow.status === 'draft' && (
                              // FIX #6 (draft resume): pass the sow ID so App.jsx can load the data
                              <button
                                className="db-act-btn primary"
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate('/?edit=' + sow.id);
                                }}
                              >Resume →</button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* SIGNATURE EXPANSION */}
                      {isExpanded && (
                        <tr className="db-sig-row">
                          <td colSpan={7} className="db-sig-panel">
                            <div className="db-sig-panel-label">Execution Record — Both Signatures</div>
                            <div className="db-sig-grid">

                              {/* ARCODIC */}
                              <div className="db-sig-card">
                                <div className="db-sig-card-label">ARCODIC · Service Provider</div>
                                <div className="db-sig-value">{sow.arcodic_signature || '—'}</div>
                                <div className="db-sig-meta">
                                  <div className="db-sig-meta-item">
                                    <div className="db-sig-meta-key">Signatory</div>
                                    <div className="db-sig-meta-val">A. Arcodic Representative</div>
                                  </div>
                                  <div className="db-sig-meta-item">
                                    <div className="db-sig-meta-key">Date</div>
                                    <div className="db-sig-meta-val">{fmtLong(sow.arcodic_signed_at)}</div>
                                  </div>
                                </div>
                                <div className="db-sig-verified"><div className="db-sig-verified-dot" />Signed & locked</div>
                              </div>

                              {/* CLIENT */}
                              <div className="db-sig-card">
                                <div className="db-sig-card-label">CLIENT · {sow.client_name}</div>
                                <div className="db-sig-value">{sow.client_signature || '—'}</div>
                                <div className="db-sig-meta">
                                  <div className="db-sig-meta-item">
                                    <div className="db-sig-meta-key">Signatory</div>
                                    <div className="db-sig-meta-val">{sow.client_name}</div>
                                  </div>
                                  <div className="db-sig-meta-item">
                                    <div className="db-sig-meta-key">Date</div>
                                    <div className="db-sig-meta-val">{fmtLong(sow.client_signed_at)}</div>
                                  </div>
                                </div>
                                <div className="db-sig-verified"><div className="db-sig-verified-dot" />Signed & locked</div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER */}
        <div className="db-footer">
          <div className="db-footer-left">ARCODIC · Statement of Work System</div>
          <div className="db-footer-right">Auto-refreshes every 15s · Click a signed row to view signatures</div>
        </div>
      </div>
    </>
  );
}
