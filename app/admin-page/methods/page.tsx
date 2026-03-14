"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { apiFetch } from "@/utils/api"; // <-- import apiFetch
import { useRouter } from "next/navigation";

type Method = {
  id: string;
  name: string;
  beneficiaryName: string;
  accountNumber: string;
  comingSoon: boolean;
  logo?: string;
};

export default function MethodsPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMethod, setEditMethod] = useState<Method | null>(null);
    const [isAdmin, setIsAdmin] = useState(false); // ✅ check login
     const router = useRouter();
  
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  
  
  
  
  
    useEffect(() => {
      const checkAdmin = async () => {
        try {
          const res = await fetch(
            "https://payment-backend-app.onrender.com/admins/me",
            { credentials: "include" } // crucial to send cookie
          );
          if (!res.ok) {
            router.push("/"); // redirect if not logged in
            return;
          }
          setIsAdmin(true);
        } catch (err) {
          router.push("/");
        }
      };
      checkAdmin();
    }, [router]);

  const getLogoUrl = (logo?: string) =>
    logo ? `${process.env.NEXT_PUBLIC_API_URL}${logo}` : "";

  // ==================== Method Form Modal ====================
  type MethodFormProps = {
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    initialData?: Method | null;
  };

  function MethodFormModal({ onClose, onSubmit, initialData }: MethodFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [beneficiaryName, setBeneficiaryName] = useState(initialData?.beneficiaryName || "");
    const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || "");
    const [comingSoon, setComingSoon] = useState(initialData?.comingSoon || false);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) setLogoFile(e.target.files[0]);
    };

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("name", name);
      formData.append("beneficiaryName", beneficiaryName);
      formData.append("accountNumber", accountNumber);
      formData.append("comingSoon", comingSoon ? "true" : "false");
      if (logoFile) formData.append("logo", logoFile);
      onSubmit(formData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow w-96">
          <h2 className="text-xl font-bold mb-4">{initialData ? "Edit Method" : "Add Method"}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block">Beneficiary</label>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border p-1 w-full rounded"
              />
              {logoFile && <p className="mt-1 text-sm text-gray-600">{logoFile.name}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={comingSoon}
                onChange={(e) => setComingSoon(e.target.checked)}
              />
              <span>Coming Soon</span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="bg-gray-500 text-white px-3 py-1 rounded">
                Cancel
              </button>
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==================== Fetch Methods ====================
  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/methods");
      if (!res.ok) throw new Error("Failed to fetch methods");
      const data: Method[] = await res.json();
      setMethods(data);
    } catch (err) {
      console.error("Error fetching methods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // ==================== Add/Edit Method ====================
  const handleSaveMethod = async (formData: FormData) => {
    try {
      if (editMethod) {
        const res = await apiFetch(`/methods/${editMethod.id}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to update method");
      } else {
        const res = await apiFetch("/methods", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Failed to add method");
      }
      fetchMethods();
      setEditMethod(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ==================== Delete Method ====================
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this method?")) return;
    try {
      const res = await apiFetch(`/methods/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete method");
      fetchMethods();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4">Loading methods...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>

      <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>
        Add Method
      </button>

      <table className="w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Beneficiary</th>
            <th>Account</th>
            <th>Coming Soon</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {methods.map((m) => (
            <tr key={m.id} className="border-t text-center">
              <td>{m.logo && <img src={getLogoUrl(m.logo)} className="h-8 mx-auto" alt={m.name} />}</td>
              <td>{m.name}</td>
              <td>{m.beneficiaryName}</td>
              <td>{m.accountNumber}</td>
              <td>{m.comingSoon ? "Yes" : "No"}</td>
              <td className="flex gap-2 justify-center">
                <button
                  className="bg-yellow-500 text-white px-2 py-2 my-2 rounded"
                  onClick={() => {
                    setEditMethod(m);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-2 my-2 rounded"
                  onClick={() => handleDelete(m.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <MethodFormModal
          onClose={() => {
            setShowForm(false);
            setEditMethod(null);
          }}
          onSubmit={handleSaveMethod}
          initialData={editMethod ?? null}
        />
      )}
    </div>
  );
}