"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";


export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch(
      "https://payment-backend-app.onrender.com/admins/login", // <-- full backend URL
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // <-- crucial for cookies
      
      }
    );
console.log("email + pass",email,"  ",password);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    // Now the cookie should be stored in the browser automatically
    router.push("/admin-page/orders");
    
  } catch (err) {
    console.error(err);
    setError("Server error");
  }
  setLoading(false);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4 text-gray-700">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-200">
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            A
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Admin Login
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <label className="text-sm text-gray-600 absolute -top-2 left-2 bg-white px-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-600 absolute -top-2 left-2 bg-white px-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold p-3 rounded-xl hover:scale-105 hover:shadow-xl transform transition duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          &copy; {new Date().getFullYear()} Payment Admin
        </p>
      </div>
    </div>
  );
}