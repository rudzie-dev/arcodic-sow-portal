import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; // Ensure this path is correct

const App = () => {
  // 1. Initial Blank State Helper
  const initialFormState = {
    clientName: "",
    clientEmail: "",
    status: "sent",
    arcodicSignature: "",
    clientSignature: "",
    data: {
      scope: {
        pages: ["Home Page", "Product Page", "Contact Page"],
      },
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 2. Reset Function
  const handleNewSOW = () => {
    setFormData(initialFormState);
    setMessage("Form cleared. Ready for a new client.");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendSOW = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .select();

      if (error) throw error;

      setMessage("SOW Sent Successfully!");
      // Option: Auto-clear form after sending
      // handleNewSOW(); 
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SOW Generator</h1>

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="space-y-4 bg-white shadow p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Client Details</h2>
          <button 
            onClick={handleNewSOW}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded"
          >
            + Start Fresh / New SOW
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium">Client Name</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            placeholder="e.g. Hooli Labs"
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Client Email</label>
          <input
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleInputChange}
            placeholder="client@example.com"
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Your Signature (Internal)</label>
          <input
            type="text"
            name="arcodicSignature"
            value={formData.arcodicSignature}
            onChange={handleInputChange}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        <button
          onClick={sendSOW}
          disabled={loading || !formData.clientName}
          className={`w-full py-3 rounded text-white font-bold ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Processing..." : "Create & Send SOW"}
        </button>
      </div>
    </div>
  );
};

export default App;