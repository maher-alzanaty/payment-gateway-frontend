"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Payment } from "@/types/payment";
import { apiFetch } from "@/utils/api"; // ✅ use the global fetch

type Method = { id: string; name: string };

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [methodFilter, setMethodFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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

  // ================= Fetch payments & methods =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentsRes = await apiFetch("/payments");
        const paymentsData: Payment[] = await paymentsRes.json();
        setPayments(paymentsData);

        const methodsRes = await apiFetch("/methods");
        const methodsData: Method[] = await methodsRes.json();
        setMethods(methodsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // ================= Filtered payments =================
  const filteredPayments = payments.filter((p) => {
    const t = p.transactions?.[0];

    if (methodFilter !== "all" && t?.method?.id !== methodFilter) return false;
    if (userFilter && !p.clientName.toLowerCase().includes(userFilter.toLowerCase()))
      return false;

    const paymentDate = new Date(p.createdAt);
    if (startDate && paymentDate < startDate) return false;
    if (endDate && paymentDate > endDate) return false;

    return true;
  });

  const paid = filteredPayments.filter((p) => p.status === "تم الدفع");
  const unpaid = filteredPayments.filter((p) => p.status !== "تم الدفع");
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0);

  const chartData = filteredPayments.reduce<Record<string, { date: string; revenue: number }>>(
    (acc, p) => {
      const day = new Date(p.createdAt).toLocaleDateString();
      if (!acc[day]) acc[day] = { date: day, revenue: 0 };
      if (p.status === "تم الدفع") acc[day].revenue += p.amount;
      return acc;
    },
    {}
  );

  const chartArray = Object.values(chartData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6 items-end">
        {/* Date pickers, method filter, user filter */}
       <DatePicker
  selected={startDate}
  onChange={(date: Date | null) => setStartDate(date)}
  className="border p-2 rounded"
  dateFormat="dd/MM/yyyy"
/>

<DatePicker
  selected={endDate}
  onChange={(date: Date | null) => setEndDate(date)}
  className="border p-2 rounded"
  dateFormat="dd/MM/yyyy"
/>





        <div>
          <label className="block mb-1">Method</label>
          <select
            className="border p-2 rounded"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="all">All Methods</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">User/Client</label>
          <input
            type="text"
            placeholder="Filter by user/client"
            className="border p-2 rounded"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Summary & Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 shadow rounded">
          <h2>Total Orders</h2>
          <p className="text-2xl">{filteredPayments.length}</p>
        </div>
        <div className="bg-white p-6 shadow rounded">
          <h2>Paid</h2>
          <p className="text-2xl">{paid.length}</p>
        </div>
        <div className="bg-white p-6 shadow rounded">
          <h2>Unpaid</h2>
          <p className="text-2xl">{unpaid.length}</p>
        </div>
        <div className="bg-white p-6 shadow rounded">
          <h2>Revenue</h2>
          <p className="text-2xl">{revenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 shadow rounded">
        <h2 className="mb-4 font-bold">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartArray}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#1D4ED8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}