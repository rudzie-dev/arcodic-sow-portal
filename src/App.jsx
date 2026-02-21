import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; 

const App = () => {
  const initialFormState = {
    clientName: "",
    clientEmail: "",
    arcodicSignature: "",
    data: { scope: { pages: ["Home Page", "Product Page"] } },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [sows, setSows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const fetchSows = async () => {
    const { data, error } = await supabase
      .from("sows")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setSows(data);
  };

  useEffect(() => {
    fetchSows();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewSOW = () => {
    setFormData(initialFormState);
    setMessage("");
    setGeneratedLink("");
  };

  const createSow = async () => {
    if (!formData.clientName || !formData.clientEmail) {
      setMessage("Error: Client name and email are required.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const { data: sowData, error: sowError } = await supabase
        .from("sows")
        .insert([{
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          status: "sent",
          data: formData.data,
          arcodic_signature: formData.arcodicSignature,
        }])
        .select().single();

      if (sowError) throw sowError;

      // Fetch the token for the link (Assuming sow_tokens table exists as per previous steps)
      const { data: tData } = await supabase
        .from("sow_tokens")
        .select("token")
        .eq("sow_id", sowData.id)
        .single();

      const link = `${window.location.origin}/sign/${tData?.token}`;
      setGeneratedLink(link);
      setMessage("SOW Created Successfully!");
      fetchSows();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSow = async (id) => {
    if (!window.confirm("Delete this SOW permanently?")) return;
    const { error } = await supabase.from("sows").delete().eq("id", id);
    if (!error) fetchSows();
  };

  const printSow = (sow) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>SOW - ${sow.client_name}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 50px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .sig-box { display: flex; justify-content: space-between; margin-top: 60px; }
            .sig { width: 40%; border-top: 1px solid #000; padding-top: 10px; }
            .sig-name { font-family: 'Cursive', cursive; font-size: 24px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Statement of Work</h1>
            <p><strong>Client:</strong> ${sow.client_name} (${sow.client_email})</p>
            <p><strong>Date:</strong> ${new Date(sow.created_at).toLocaleDateString()}</p>
          </div>
          <div class="content">
            <h3>Project Scope</h3>
            <p>Standard web development package including Home and Product pages.</p>
          </div>
          <div class="sig-box">
            <div class="sig">
              <div class="sig-name">${sow.arcodic_signature || 'Not Signed'}</div>
              <strong>Arcodic (Provider)</strong>
            </div>
            <div class="sig">
              <div class="sig-name">${sow.client_signature || 'Pending'}</div>
              <strong>Client Approval</strong>
            </div>
          </div>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* ORIGINAL FORM UI */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black tracking-tight italic text-indigo-900">ARCODIC SOW</h1>
            <button onClick={handleNewSOW} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition uppercase tracking-widest">+ Reset Form</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-gray-500 mb-1">Client Name</label>
              <input name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Acme Corp" className="p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-gray-500 mb-1">Client Email</label>
              <input name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="hr@acme.com" className="p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-gray-500 mb-1">Your Signature</label>
              <input name="arcodicSignature" value={formData.arcodicSignature} onChange={handleInputChange} placeholder="Type Name" className="p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none italic font-serif" />
            </div>
          </div>

          <button onClick={createSow} disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:bg-gray-300 shadow-lg">
            {loading ? "SAVING..." : "GENERATE SOW & SECURE LINK"}
          </button>

          {message && <p className="mt-4 text-center font-bold text-indigo-600 uppercase text-sm tracking-tight">{message}</p>}

          {generatedLink && (
            <div className="mt-6 p-4 bg-gray-900 text-white rounded-xl flex items-center justify-between">
              <code className="text-xs truncate mr-4">{generatedLink}</code>
              <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap">COPY LINK</button>
            </div>
          )}
        </section>

        {/* ORIGINAL DASHBOARD UI */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-700">DOCUMENT MANAGEMENT</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 font-bold">
                  <th className="p-6">Client / Email</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Signatures</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sows.map((sow) => (
                  <tr key={sow.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-6">
                      <p className="font-bold text-gray-900">{sow.client_name}</p>
                      <p className="text-xs text-gray-400">{sow.client_email}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${sow.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {sow.status}
                      </span>
                    </td>
                    <td className="p-6 text-[11px] text-gray-500 space-y-1 font-medium">
                      <p>ME: <span className="italic font-serif text-gray-900">{sow.arcodic_signature || '---'}</span></p>
                      <p>CLIENT: <span className="italic font-serif text-gray-900">{sow.client_signature || 'WAITING...'}</span></p>
                    </td>
                    <td className="p-6 text-right space-x-4">
                      <button onClick={() => printSow(sow)} className="text-xs font-bold text-indigo-600 hover:underline">PRINT</button>
                      <button onClick={() => deleteSow(sow.id)} className="text-xs font-bold text-red-400 hover:text-red-600">DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;