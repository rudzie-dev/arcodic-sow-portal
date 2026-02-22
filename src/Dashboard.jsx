import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle, Search, Plus, 
  ExternalLink, MoreHorizontal, ChevronDown, 
  ChevronUp, Copy, Check, Filter, User, Calendar
} from 'lucide-react';

const SUPABASE_URL = 'https://ctjwqktzdvbfijoqnxvo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0andxa3R6ZHZiZmlqb3FueHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODY3MDksImV4cCI6MjA4NzA2MjcwOX0.ng2Ek0nFDteMqsQM-Or-TCBkp424uyCKbWjNbJ7MpUo';

const fetchSOWs = async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/sows?select=id,created_at,status,client_name,client_email,data,arcodic_signed_at,client_signed_at,arcodic_signature,client_signature&order=created_at.desc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [sows, setSows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const refresh = async () => {
    try {
      const data = await fetchSOWs();
      setSows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  const copyLink = (id) => {
    const url = `${window.location.origin}/sign/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSows = sows.filter(s => 
    s.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.data?.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
  const fmtValue = (s) => `${s.data?.currency?.symbol || '$'}${Number(s.data?.totalValue || 0).toLocaleString()}`;

  return (
    <div className="db-container">
      <style>{`
        :root {
          --bg: #0a0a0a;
          --panel: #141414;
          --border: #222;
          --gold: #d4af37;
          --text: #e0e0e0;
          --muted: #888;
        }

        .db-container { min-height: 100vh; background: var(--bg); color: var(--text); padding: 40px 24px; font-family: 'Inter', sans-serif; }
        .db-wrap { max-width: 1100px; margin: 0 auto; }

        /* HEADER */
        .db-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .db-title h1 { font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
        .db-title p { color: var(--muted); margin: 8px 0 0; font-family: 'DM Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }

        .btn-new { background: var(--gold); color: #000; border: none; border-radius: 8px; padding: 12px 20px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: transform 0.2s; }
        .btn-new:hover { transform: translateY(-2px); }

        /* SEARCH & FILTER */
        .db-controls { display: flex; gap: 16px; margin-bottom: 24px; }
        .search-wrap { flex: 1; position: relative; }
        .search-wrap input { width: 100%; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 10px 10px 10px 40px; color: #fff; font-size: 14px; }
        .search-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); }

        /* TABLE */
        .table-wrap { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 16px; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
        td { padding: 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
        tr.row-link { cursor: pointer; transition: background 0.2s; }
        tr.row-link:hover { background: #1a1a1a; }

        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .status-signed { background: rgba(0, 255, 136, 0.1); color: #00ff88; }
        .status-awaiting { background: rgba(212, 175, 55, 0.1); color: var(--gold); }

        .client-info { display: flex; flex-direction: column; }
        .client-email { font-size: 12px; color: var(--muted); }

        /* EXPANDED AREA */
        .expanded-content { background: #0c0c0c; padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-bottom: 1px solid var(--border); }
        .sig-box { border: 1px solid var(--border); border-radius: 12px; padding: 20px; position: relative; }
        .sig-label { position: absolute; top: -10px; left: 16px; background: #0c0c0c; padding: 0 8px; font-family: 'DM Mono', monospace; font-size: 9px; color: var(--muted); text-transform: uppercase; }
        .sig-text { font-size: 24px; margin: 12px 0; color: var(--gold); }
        .sig-meta { font-size: 11px; color: var(--muted); line-height: 1.6; }

        /* SKELETON */
        .skeleton { height: 20px; background: #222; border-radius: 4px; animation: pulse 1.5s infinite linear; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .action-btns { display: flex; gap: 8px; }
        .action-btn { background: none; border: 1px solid var(--border); color: var(--muted); padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { color: #fff; border-color: #444; }
      `}</style>

      <div className="db-wrap">
        <header className="db-header">
          <div className="db-title">
            <h1>SOW Dashboard</h1>
            <p>Arcodic Document Management System</p>
          </div>
          <button className="btn-new" onClick={() => navigate('/create')}>
            <Plus size={18} /> New SOW
          </button>
        </header>

        <div className="db-controls">
          <div className="search-wrap">
            <Search size={18} />
            <input 
              placeholder="Search project or client..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Value</th>
                <th>Created</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} style={{ padding: '20px' }}><div className="skeleton" /></td>
                  </tr>
                ))
              ) : filteredSows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
                    No documents found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSows.map(s => (
                  <React.Fragment key={s.id}>
                    <tr className="row-link" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                      <td style={{ fontWeight: 600 }}>{s.data?.projectName || 'Untitled'}</td>
                      <td>
                        <div className="client-info">
                          <span>{s.client_name}</span>
                          <span className="client-email">{s.client_email}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'DM Mono', fontWeight: 500 }}>{fmtValue(s)}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{fmtDate(s.created_at)}</td>
                      <td>
                        <span className={`status-badge ${s.status === 'signed' ? 'status-signed' : 'status-awaiting'}`}>
                          {s.status === 'signed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {s.status === 'signed' ? 'Signed' : 'Awaiting'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns" onClick={e => e.stopPropagation()}>
                          <button className="action-btn" title="Copy Signing Link" onClick={() => copyLink(s.id)}>
                            {copiedId === s.id ? <Check size={14} color="#00ff88" /> : <Copy size={14} />}
                          </button>
                          <button className="action-btn" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                            {expandedId === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === s.id && (
                      <tr>
                        <td colSpan={6} style={{ padding: 0 }}>
                          <div className="expanded-content">
                            <div className="sig-box">
                              <span className="sig-label">Arcodic Signature</span>
                              <div className="sig-text" style={{ fontFamily: "'Caveat', cursive" }}>{s.arcodic_signature}</div>
                              <div className="sig-meta">
                                <div>Signed by Arcodic Admin</div>
                                <div>{new Date(s.arcodic_signed_at).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="sig-box">
                              <span className="sig-label">Client Signature</span>
                              {s.client_signature ? (
                                <>
                                  <div className="sig-text" style={{ fontFamily: "'Caveat', cursive" }}>{s.client_signature}</div>
                                  <div className="sig-meta">
                                    <div>{s.client_name} ({s.client_email})</div>
                                    <div>{new Date(s.client_signed_at).toLocaleString()}</div>
                                  </div>
                                </>
                              ) : (
                                <div style={{ height: '80px', display: 'flex', alignItems: 'center', color: '#333', fontSize: '12px' }}>
                                  PENDING CLIENT ACTION
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}