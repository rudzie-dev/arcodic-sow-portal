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
    if (!formData.clientName) return setMessage("Client Name required");
    setLoading(true);
    const { error } = await supabase.from("sows").insert([{
      client_name: formData.clientName,
      client_email: formData.clientEmail,
      arcodic_signature: formData.arcodicSignature,
      status: 'sent'
    }]);
    
    if (!error) {
      setMessage("SOW Created!");
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
        <head><title>SOW - ${sow.client_name}</title></head>
        <body style="font-family:sans-serif; padding:50px;">
          <h1>Statement of Work</h1>
          <p><strong>Client:</strong> ${sow.client_name} (${sow.client_email})</p>
          <hr/>
          <div style="display:flex; justify-content:space-between; margin-top:50px;">
            <div><strong>Arcodic Signature:</strong><br/><i style="font-size:24px;">${sow.arcodic_signature}</i></div>
            <div><strong>Client Signature:</strong><br/><i style="font-size:24px;">${sow.client_signature || 'Pending'}</i></div>
          </div>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '40px' }}>
        <h2 style={{ marginTop: 0 }}>SOW Generator</h2>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <input placeholder="Client Name" onChange={e => setFormData({...formData, clientName: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input placeholder="Client Email" onChange={e => setFormData({...formData, clientEmail: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input placeholder="Your Signature" onChange={e => setFormData({...formData, arcodicSignature: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontStyle: 'italic' }} />
        </div>
        <button onClick={createSow} disabled={loading} style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? "SAVING..." : "GENERATE & SAVE SOW"}
        </button>
        {message && <p style={{ textAlign: 'center', color: '#6366f1', fontWeight: 'bold' }}>{message}</p>}
      </div>

      <div style={{ background: '#fff', borderRadius: '15px', border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#888' }}>CLIENT</th>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#888' }}>STATUS</th>
              <th style={{ padding: '15px', textAlign: 'right', fontSize: '12px', color: '#888' }}>CONTROLS</th>
            </tr>
          </thead>
          <tbody>
            {sows.map(sow => (
              <tr key={sow.id} style={{ borderTop: '1px solid #f1f1f1' }}>
                <td style={{ padding: '15px' }}><strong>{sow.client_name}</strong><br/><span style={{ fontSize: '12px', color: '#666' }}>{sow.client_email}</span></td>
                <td style={{ padding: '15px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', background: sow.status === 'completed' ? '#dcfce7' : '#fef9c3' }}>{sow.status.toUpperCase()}</span></td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button onClick={() => printSow(sow)} style={{ marginRight: '15px', color: '#6366f1', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>PRINT</button>
                  <button onClick={() => deleteSow(sow.id)} style={{ color: '#f87171', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>DELETE</button>
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