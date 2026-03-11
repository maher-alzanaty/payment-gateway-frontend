"use client";

import router from "next/router";
import { useEffect, useState } from "react";

type TransactionFromBackend = {
  method?: { name: string; accountNumber: string } | null;
  proof?: string | null;
  status: string;
};

type PaymentFromBackend = {
  id: string;
  clientName: string;
  amount: number;
  status: string;
  transactions?: TransactionFromBackend[];
};

export default function AdminDashboard() {
  const [payments, setPayments] = useState<PaymentFromBackend[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/payments");
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const changeStatus = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "تم الدفع" }),
      });

      if (!res.ok) throw new Error("حدث خطأ أثناء تحديث الحالة");

      const updatedPayment = await res.json();
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? updatedPayment : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4">جاري تحميل البيانات...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة تحكم المدفوعات</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">العميل</th>
              <th className="px-4 py-2 border-b">المبلغ</th>
              <th className="px-4 py-2 border-b">طريقة الدفع</th>
              <th className="px-4 py-2 border-b">رقم الحساب</th>
              <th className="px-4 py-2 border-b">الحالة</th>
              <th className="px-4 py-2 border-b">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const firstTransaction = p.transactions?.[0];
              return (
                <tr key={p.id} className="text-center">
                  <td className="px-4 py-2 border-b">{p.clientName}</td>
                  <td className="px-4 py-2 border-b">{p.amount}</td>
                  <td className="px-4 py-2 border-b">
                    {firstTransaction?.method?.name || "غير متوفر"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {firstTransaction?.method?.accountNumber || "-"}
                  </td>
                  <td className="px-4 py-2 border-b">{p.status}</td>
                  <td className="px-4 py-2 border-b">
                    {p.status !== "تم الدفع" && (
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        onClick={() => changeStatus(p.id)}
                      >
                        تغيير الحالة
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}