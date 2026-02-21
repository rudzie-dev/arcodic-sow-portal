import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const App = () => {
  // Initial state for a clean form
  const initialFormState = {
    clientName: "",
    clientEmail: "",
    status: "sent",
    arcodicSignature: "",
    data: {
      scope: {
        pages: ["Home Page", "Product Page", "Contact Page"],
      },
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Function to wipe the form state
  const handleNewSOW = () => {
    setFormData(initialFormState);
    setMessage("");
    setGeneratedLink("");
  };

  const sendSOW = async () => {
    setLoading(true);
    setMessage("");
    setGeneratedLink("");

    try {
      // 1. Insert the SOW into the database
      // The SQL trigger we ran will automatically create the token in 'sow_tokens'
      const { data: sowData, error: sowError } = await supabase
        .from("sows")
        .insert([
          {
            client_name: formData.clientName,
            client_email: formData.clientEmail,
            status: "sent",
            data: formData.data,
            arcodic_signature: formData.arcodicSignature,
          },
        ])
        .select()
        .single();

      if (sowError) throw sowError;

      // 2. Wait a split second for the trigger and then fetch the generated token
      const { data: tokenData, error: tokenError } = await supabase
        .from("sow_tokens")
        .select("token")
        .eq("sow_id", sowData.id)
        .single();

      if (tokenError) throw tokenError;

      // 3. Construct the client-facing URL
      const signingUrl = `${window.location.origin}/sign/${tokenData.token}`;
      setGeneratedLink(signingUrl);
      setMessage("SOW created and secure token generated!");

    } catch (error) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">SOW Generator</h1>
          <button 
            onClick={handleNewSOW}
            className="bg-white border border-gray-300 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-gray-50"
          >
            + New SOW
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-md mb-6 ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        {generatedLink && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-sm text-blue-700 font-bold">Client Signing Link:</p>
            <div className="flex mt-2">
              <input 
                readOnly 
                value={generatedLink} 
                className="flex-1 text-xs p-2 border rounded bg-white"
              />
              <button 
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              placeholder="e.g. Acme Corp"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Client Email</label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleInputChange}
              placeholder="client@example.com"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Your Signature</label>
            <input
              type="text"
              name="arcodicSignature"
              value={formData.arcodicSignature}
              onChange={handleInputChange}
              placeholder="Type your name to sign"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 italic"
            />
          </div>

          <button
            onClick={sendSOW}
            disabled={loading || !formData.clientName || !formData.clientEmail}
            className={`w-full py-4 rounded-md font-bold text-white transition ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating..." : "Generate & Send SOW"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;