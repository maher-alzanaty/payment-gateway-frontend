"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { apiFetch } from "@/utils/api"; // <-- use your apiFetch

type Method = {
  id: number;
  name: string;
};

export default function TestPaymentPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [methodId, setMethodId] = useState(""); // string

  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [currency, setCurrency] = useState("USD");

  const [proof, setProof] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // ================= Fetch Methods =================
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await apiFetch("/methods");
        const data = await res.json();
        setMethods(data);
      } catch (err) {
        console.error("Error fetching methods:", err);
      }
    };
    fetchMethods();
  }, []);

  // ================= File Upload Preview =================
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setProof(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= Submit Payment =================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!proof) return alert("Please upload a payment proof");
    if (!methodId) return alert("Please select a payment method");

    const formData = new FormData();
    formData.append("clientName", clientName);
    formData.append("amount", amount);
    formData.append("currency", currency);
    formData.append("invoiceNo", invoiceNo);
    formData.append("methodId", String(methodId));
    formData.append("proof", proof);

    try {
      setLoading(true);
      const res = await apiFetch("/payments", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server error:", data);
        return alert(data.error || "Error sending payment");
      }

      console.log("Payment response:", data);
      alert("Payment sent successfully");

      // reset form
      setClientName("");
      setAmount("");
      setInvoiceNo("");
      setMethodId("");
      setProof(null);
      setPreview(null);
    } catch (err) {
      console.error("Error submitting payment:", err);
      alert("Error sending payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-5 text-center">Add Payment</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="border p-2 w-full rounded"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />

          <input
            className="border p-2 w-full rounded"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <input
            className="border p-2 w-full rounded"
            placeholder="Invoice No"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            required
          />

          <select
            className="border p-2 w-full rounded"
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            required
          >
            <option value="">Select Method</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            className="border p-2 w-full rounded"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="SAR">SAR</option>
            <option value="EUR">EUR</option>
          </select>

          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <img
              src={preview}
              className="h-32 object-cover rounded border mt-2"
              alt="Proof preview"
            />
          )}

          <button
            disabled={loading}
            className="bg-blue-600 text-white w-full py-2 rounded"
          >
            {loading ? "Sending..." : "Send Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}