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

  // Load Dashboard Data
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

  // CREATE SOW
  const sendSOW = async () => {
    setLoading(true);
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

      const { data: tData } = await supabase
        .from("sow_tokens")
        .select("token")
        .eq("sow_id", sowData.id)
        .single();

      setGeneratedLink(`${window.location.origin}/sign/${tData?.token}`);
      setMessage("Success! SOW created.");
      fetchSows(); // Refresh Dashboard
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // DELETE SOW
  const deleteSow = async (id) => {
    if (!window.confirm("Delete this SOW?")) return;
    const { error } = await supabase.from("sows").delete().eq("id", id);
    if (!error) fetchSows();
  };

  // PRINT / VIEW FUNCTION
  const printSow = (sow) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>SOW - ${sow.client_name}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>Statement of Work</h1>
          <p><strong>Client:</strong> ${sow.client_name} (${sow.client_email})</p>
          <p><strong>Status:</strong> ${sow.status}</p>
          <hr/>
          <h3>Signatures</h3>
          <div style="display: flex; justify-content: space-between; margin-top: 50px;">
            <div>
              <p><strong>Provider Signature:</strong></p>
              <p style="font-family: cursive; font-size: 24px; border-bottom: 1px solid #000;">${sow.arcodic_signature || "Pending"}</p>
              <p style="font-size: 12px;">Signed at: ${sow.arcodic_signed_at || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Client Signature:</strong></p>
              <p style="font-family: cursive; font-size: 24px; border-bottom: 1px solid #000;">${sow.client_signature || "Pending"}</p>
              <p style="font-size: 12px;">Signed at: ${sow.client_signed_at || 'Pending'}</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* SECTION 1: GENERATOR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">New SOW Generator</h1>
            <button onClick={handleNewSOW} className="text-indigo-600 hover:underline text-sm font-medium">+ Clear Form</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Client Name" className="p-2 border rounded" />
            <input name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="Client Email" className="p-2 border rounded" />
            <input name="arcodicSignature" value={formData.arcodicSignature} onChange={handleInputChange} placeholder="Your Signature (Type Name)" className="p-2 border rounded italic" />
          </div>

          <button onClick={sendSOW} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400">
            {loading ? "Processing..." : "Create & Generate Link"}
          </button>

          {generatedLink && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm flex justify-between items-center">
              <span className="truncate mr-2">Link: {generatedLink}</span>
              <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="bg-blue-600 text-white px-3 py-1 rounded">Copy</button>
            </div>
          )}
        </div>

        {/* SECTION 2: DASHBOARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Management Dashboard</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Status</th>
                <th className="p-4">Signatures</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sows.map((sow) => (
                <tr key={sow.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{sow.client_name}</div>
                    <div className="text-xs text-gray-500">{sow.client_email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${sow.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {sow.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-xs space-y-1">
                    <div>✍️ Me: <span className="italic">{sow.arcodic_signature || 'N/A'}</span></div>
                    <div>✍️ Client: <span className="italic">{sow.client_signature || 'Pending'}</span></div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => printSow(sow)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View/Print</button>
                    <button onClick={() => deleteSow(sow.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;