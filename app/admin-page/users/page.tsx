"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch } from "@/utils/api"; // <-- use apiFetch

type Admin = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ================= Fetch Admins =================
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/admins");
      const data: Admin[] = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ================= Add/Edit Admin =================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const url = editAdmin ? `/admins/${editAdmin.id}` : "/admins";
      const method = editAdmin ? "PATCH" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) throw new Error("Error saving admin");

      fetchAdmins();
      setShowForm(false);
      setEditAdmin(null);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ المستخدم");
    }
  };

  // ================= Edit Admin =================
  const handleEdit = (admin: Admin) => {
    setEditAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setPassword("");
    setShowForm(true);
  };

  // ================= Delete Admin =================
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      const res = await apiFetch(`/admins/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error deleting admin");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف المستخدم");
    }
  };

  if (loading) return <p className="p-4">Loading admins...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admins</h1>

      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setShowForm(true)}
      >
        Add Admin
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">
              {editAdmin ? "Edit Admin" : "Add Admin"}
            </h2>

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
                <label className="block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>

              <div>
                <label className="block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border p-2 w-full rounded"
                  required={!editAdmin}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setShowForm(false);
                    setEditAdmin(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((a) => (
            <tr key={a.id} className="border-t text-center">
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
              <td className="flex gap-2 justify-center">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(a)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(a.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}