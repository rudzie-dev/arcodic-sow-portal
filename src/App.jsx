import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; 

const App = () => {
  const [sows, setSows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ clientName: "", clientEmail: "", arcodicSignature: "" });
  const [message, setMessage] = useState("");

  const fetchSows = async () => {
    const { data } = await supabase.from("sows").select("*").order("created_at", { ascending: false });
    if (data) setSows(data);
  };

  useEffect(() => { fetchSows(); }, []);

  const createSow = async () => {
    if (!formData.clientName || !formData.clientEmail) {
      return setMessage("Client Name and Email required");
    }
    setLoading(true);
    const { error } = await supabase.from("sows").insert([{
      client_name: formData.clientName,
      client_email: formData.clientEmail,
      arcodic_signature: formData.arcodicSignature,
      status: 'sent'
    }]);
    
    if (!error) {
      setMessage("SOW Created Successfully!");
      setFormData({ clientName: "", clientEmail: "", arcodicSignature: "" });
      fetchSows();
    } else {
      setMessage("Error: " + error.message);
    }
    setLoading(false);
  };

  const deleteSow = async (id) => {
    if (window.confirm("Delete this SOW permanently?")) {
      await supabase.from("sows").delete().eq("id", id);
      fetchSows();
    }
  };

  const printSow = (sow) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>SOW - ${sow.client_name}</title>
          <style>
            body { font-family: sans-serif; padding: 50px; line-height: 1.5; }
            .sig-section { display: flex; justify-content: space-between; margin-top: 50px; }
            .sig-box { width: 45%; border-top: 1px solid #000; padding-top: 10px; }
            .handwriting { font-family: cursive; font-size: 24px; }
          </style>
        </head>
        <body>
          <h1>Statement of Work</h1>
          <p><strong>Client:</strong> ${sow.client_name}</p>
          <p><strong>Email:</strong> ${sow.client_email}</p>
          <p><strong>Status:</strong> ${sow.status.toUpperCase()}</p>
          <div class="sig-section">
            <div class="sig-box">
              <div class="handwriting">${sow.arcodic_signature || 'Not Signed'}</div>
              <strong>Arcodic Signature</strong>
            </div>
            <div class="sig-box">
              <div class="handwriting">${sow.client_signature || 'Pending'}</div>
              <strong>Client Signature</strong>
            </div>
          </div>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: 'auto', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#111827' }}>Create New SOW</h2>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <input placeholder="Client Name" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          <input placeholder="Client Email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          <input placeholder="Your Signature" value={formData.arcodicSignature} onChange={e => setFormData({...formData, arcodicSignature: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontStyle: 'italic' }} />
        </div>
        <button onClick={createSow} disabled={loading} style={{ width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? "SAVING..." : "GENERATE SOW"}
        </button>
        {message && <p style={{ textAlign: 'center', color: '#4f46e5', marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>CLIENT</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>STATUS</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#374151' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sows.map(sow => (
              <tr key={sow.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontWeight: '600' }}>{sow.client_name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{sow.client_email}</div>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: sow.status === 'completed' ? '#dcfce7' : '#fef9c3', color: sow.status === 'completed' ? '#166534' : '#854d0e' }}>
                    {sow.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button onClick={() => printSow(sow)} style={{ marginRight: '15px', color: '#4f46e5', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>PRINT</button>
                  <button onClick={() => deleteSow(sow.id)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>DELETE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;