import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; 

const App = () => {
  const initialFormState = {
    clientName: "",
    clientEmail: "",
    status: "sent",
    arcodicSignature: "",
    data: { scope: { pages: ["Home Page", "Product Page"] } },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [sows, setSows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // --- DATABASE LOGIC ---
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

  const sendSOW = async () => {
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

      // Assuming your sow_tokens logic is handled via Supabase function or trigger
      // If not, we fetch the token here
      const { data: tData } = await supabase
        .from("sow_tokens")
        .select("token")
        .eq("sow_id", sowData.id)
        .single();

      const link = `${window.location.origin}/sign/${tData?.token}`;
      setGeneratedLink(link);
      setMessage("Success! SOW created and link generated.");
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
        <head><title>SOW - ${sow.client_name}</title></head>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
          <h1 style="color: #333;">Statement of Work</h1>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p><strong>Client:</strong> ${sow.client_name}</p>
            <p><strong>Email:</strong> ${sow.client_email}</p>
            <p><strong>Status:</strong> <span style="text-transform: uppercase;">${sow.status}</span></p>
          </div>
          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div style="width: 45%;">
              <p><strong>Provider Signature (Arcodic)</strong></p>
              <div style="font-family: 'Cursive', cursive; font-size: 28px; border-bottom: 2px solid #000; padding-bottom: 5px;">
                ${sow.arcodic_signature || "Pending"}
              </div>
            </div>
            <div style="width: 45%;">
              <p><strong>Client Signature</strong></p>
              <div style="font-family: 'Cursive', cursive; font-size: 28px; border-bottom: 2px solid #000; padding-bottom: 5px;">
                ${sow.client_signature || "Pending"}
              </div>
            </div>
          </div>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewSOW = () => {
    setFormData(initialFormState);
    setMessage("");
    setGeneratedLink("");
  };

  // --- EXACT UI RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* GENERATOR CARD */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black tracking-tight">SOW Generator</h1>
            <button 
              onClick={handleNewSOW}
              className="text-indigo-600 font-bold hover:text-indigo-800 transition"
            >
              + New SOW
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-gray-500 mb-1">Client Name</label>
              <input 
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="Acme Corp" 
                className="p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-gray-500 mb-1">Client Email</label>
              <input 
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                placeholder="hr@acme.com" 
                className="p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-gray-500 mb-1">Your Signature</label>
              <input 
                name="arcodicSignature"
                value={formData.arcodicSignature}
                onChange={handleInputChange}
                placeholder="Type your name" 
                className="p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none italic" 
              />
            </div>
          </div>

          <button 
            onClick={sendSOW}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Generate SOW & Secure Link"}
          </button>

          {message && (
            <p className={`mt-4 text-center font-medium ${message.includes('Error') ? 'text-red-500' : 'text-indigo-600'}`}>
              {message}
            </p>
          )}

          {generatedLink && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
              <code className="text-xs text-indigo-800 truncate">{generatedLink}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700"
              >
                Copy Link
              </button>
            </div>
          )}
        </section>

        {/* DASHBOARD TABLE */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold">Document Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                  <th className="p-6 font-black">Client / Email</th>
                  <th className="p-6 font-black">Status</th>
                  <th className="p-6 font-black">Signatures</th>
                  <th className="p-6 font-black text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sows.map((sow) => (
                  <tr key={sow.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-6">
                      <p className="font-bold text-gray-900">{sow.client_name}</p>
                      <p className="text-sm text-gray-500">{sow.client_email}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        sow.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {sow.status}
                      </span>
                    </td>
                    <td className="p-6 text-xs font-medium text-gray-600">
                      <p>Me: <span className="italic">{sow.arcodic_signature || 'N/A'}</span></p>
                      <p>Client: <span className="italic">{sow.client_signature || 'Waiting...'}</span></p>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => printSow(sow)} className="text-xs font-bold text-indigo-600 hover:underline">Print</button>
                        <button onClick={() => deleteSow(sow.id)} className="text-xs font-bold text-red-400 hover:text-red-600 transition">Delete</button>
                      </div>
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