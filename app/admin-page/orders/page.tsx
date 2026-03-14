"use client";

import { useEffect, useState } from "react";
import ProofModal from "@/components/ProofModal";
import { saveAs } from "file-saver"; // For CSV download
import { apiFetch } from "@/utils/api";

import { useRouter } from "next/navigation";




type Method = { id: string; name: string; };
type Transaction = { method?: Method | null; proof?: string | null; };
type Payment = {
  id: string;
  clientName: string;
  amount: number;
  invoiceNo: string;
  createdAt: string;
  status: string;
  transactions?: Transaction[];
};

export default function OrdersPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [methods, setMethods] = useState<Method[]>([]);
  const [proof, setProof] = useState<string | null>(null);
  

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Date range filter
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Sort
  const [sortAsc, setSortAsc] = useState(true);
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

  // ================= Fetch payments =================
 const fetchPayments = async () => {
  try {
    setLoading(true);
    const res = await apiFetch("/payments"); // use apiFetch
    if (!res.ok) throw new Error("Failed to fetch payments");
    const data: Payment[] = await res.json();
    setPayments(data);
  } catch (err) {
    console.error("Error fetching payments:", err);
  } finally {
    setLoading(false);
  }
};

  // ================= Fetch methods =================
const fetchMethods = async () => {
  try {
    const res = await apiFetch("/methods");
    if (!res.ok) throw new Error("Failed to fetch methods");
    const data: Method[] = await res.json();
    setMethods(data);
  } catch (err) {
    console.error("Error fetching methods:", err);
  }
};

  useEffect(() => {
    fetchPayments();
    fetchMethods();
  }, []);

  // ================= Update status =================
  const updateStatus = async (id: string, newStatus: string) => {
  try {
    const res = await apiFetch(`/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    const updatedPayment = await res.json();
    setPayments((prev) => prev.map((p) => (p.id === id ? updatedPayment : p)));
  } catch (err) {
    console.error(err);
  }
};
  // ================= Filter & Sort =================
  const filteredPayments = payments
    .filter((p) => {
      const t = p.transactions?.[0];
      const text = (
        p.clientName + p.invoiceNo + p.amount + p.status
      ).toLowerCase();
      const statusMatch = statusFilter === "all" || p.status === statusFilter;
      const methodMatch = methodFilter === "all" || t?.method?.id === methodFilter;

      const date = new Date(p.createdAt);
      const dateMatch =
        (!startDate || date >= startDate) && (!endDate || date <= endDate);

      return text.includes(search.toLowerCase()) && statusMatch && methodMatch && dateMatch;
    })
    .sort((a, b) =>
      sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // ================= Pagination =================
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const jumpToPage = (page: number) => {
    if (page < 1) setCurrentPage(1);
    else if (page > totalPages) setCurrentPage(totalPages);
    else setCurrentPage(page);
  };

  // ================= Export CSV =================
  const exportCSV = () => {
    const headers = ["Client", "Amount", "Invoice", "Date", "Method", "Status"];
    const rows = filteredPayments.map((p) => {
      const t = p.transactions?.[0];
      return [
        p.clientName,
        p.amount,
        p.invoiceNo,
        new Date(p.createdAt).toLocaleDateString(),
        t?.method?.name || "-",
        p.status,
      ].join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "orders.csv");
  };

  if (loading) return <p className="p-4">Loading payments...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="تم الدفع">Paid</option>
          <option value="مرفوض">Rejected</option>
        </select>

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

        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
        />

        <button
          className="bg-gray-400 px-3 py-1 rounded"
          onClick={() => setSortAsc(!sortAsc)}
        >
          Sort by Date {sortAsc ? "↑" : "↓"}
        </button>

        <select
          className="border p-2 rounded"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
        >
          <option value={5}>5 rows/page</option>
          <option value={10}>10 rows/page</option>
          <option value={20}>20 rows/page</option>
          <option value={50}>50 rows/page</option>
        </select>

        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={exportCSV}
        >
          Export CSV
        </button>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th>Client</th>
              <th>Amount</th>
              <th>Invoice</th>
              <th>Date</th>
              <th>Method</th>
              <th>Proof</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.map((p) => {
              const t = p.transactions?.[0];
             const proofUrl = t?.proof ? `${process.env.NEXT_PUBLIC_API_URL}${t.proof}` : null;
              return (
                <tr key={p.id} className="border-t text-center">
                  <td>{p.clientName}</td>
                  <td>{p.amount}</td>
                  <td>{p.invoiceNo}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{t?.method?.name || "-"}</td>
                  <td>
                    {proofUrl && (
                      <img
                        src={proofUrl}
                        className="h-10 mx-auto cursor-pointer rounded"
                        onClick={() => setProof(proofUrl)}
                      />
                    )}
                  </td>
                  <td>{p.status}</td>
                  <td className="flex gap-2 justify-center">
                    <button
                      className="bg-green-600 text-white px-2 py-2 my-2 rounded"
                      onClick={() => updateStatus(p.id, "تم الدفع")}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-2 my-2 rounded"
                      onClick={() => updateStatus(p.id, "مرفوض")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Proof Modal */}
      {proof && <ProofModal image={proof} onClose={() => setProof(null)} />}
    </div>
  );
}