import React, { useEffect, useState } from "react";
import { HiCheckCircle, HiClock, HiExclamation, HiDownload } from "react-icons/hi";
import { API_BASE } from "../../config"; // Corrected central import

const MOCK = [
  { id: 1, tenant: "Bosco Mutabazi",  property: "Kigali Heights Apt 4B", amount: 1200000, date: "Oct 01, 2026", method: "MTN MoMo",   status: "Paid"    },
  { id: 2, tenant: "Claire Uwera",    property: "Vision City Villa #12",  amount: 2500000, date: "Oct 01, 2026", method: "BK Transfer",status: "Paid"    },
  { id: 3, tenant: "Arangwa Jean",    property: "Kimironko Studio 2A",    amount: 450000,  date: "Oct 05, 2026", method: "MTN MoMo",   status: "Pending" },
  { id: 4, tenant: "David Nzeyimana", property: "Rebero Heights Unit 5",  amount: 800000,  date: "Sep 01, 2026", method: "Airtel",     status: "Overdue" },
  { id: 5, tenant: "Bosco Mutabazi",  property: "Kigali Heights Apt 4B",  amount: 1200000, date: "Sep 01, 2026", method: "MTN MoMo",   status: "Paid"    },
];

const statusStyle = {
  Paid:    { badge: "bg-green-50 text-green-700",   icon: <HiCheckCircle className="text-green-500" /> },
  Pending: { badge: "bg-yellow-50 text-yellow-700", icon: <HiClock className="text-yellow-500" />       },
  Overdue: { badge: "bg-red-50 text-red-600",       icon: <HiExclamation className="text-red-500" />   },
};

const formatRWF = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M RWF`;
  return `${(n / 1000).toFixed(0)}k RWF`;
};

export default function LDPayments({ token }) {
  const [payments, setPayments] = useState(MOCK);
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${API_BASE}/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { 
          const d = await res.json(); 
          setPayments(d.data || MOCK); 
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      }
    };
    fetchPayments();
  }, [token]);

  const totalCollected = payments.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const totalPending   = payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const totalOverdue   = payments.filter(p => p.status === "Overdue").reduce((s, p) => s + p.amount, 0);

  const filtered = filter === "all" ? payments : payments.filter(p => p.status.toLowerCase() === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Payments</h2>
          <p className="text-sm text-gray-400 mt-0.5">{payments.length} transactions</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
          <HiDownload /> Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: totalCollected, color: "text-green-600", bg: "bg-green-50", icon: <HiCheckCircle className="text-green-500 text-xl" /> },
          { label: "Pending",         value: totalPending,   color: "text-yellow-600",bg: "bg-yellow-50",icon: <HiClock className="text-yellow-500 text-xl" />      },
          { label: "Overdue",         value: totalOverdue,   color: "text-red-600",   bg: "bg-red-50",   icon: <HiExclamation className="text-red-500 text-xl" />   },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{formatRWF(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "paid", "pending", "overdue"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-3">TENANT</div>
          <div className="col-span-3">PROPERTY</div>
          <div className="col-span-2">DATE</div>
          <div className="col-span-1">METHOD</div>
          <div className="col-span-2 text-right">AMOUNT</div>
          <div className="col-span-1 text-right">STATUS</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((p, i) => {
            const s = statusStyle[p.status] || statusStyle.Paid;
            return (
              <div key={p.id || i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
                <div className="col-span-3 flex items-center gap-2">
                  <img src={`https://ui-avatars.com/api/?name=${p.tenant}&background=dbeafe&color=2563eb&bold=true&size=28`}
                    className="w-7 h-7 rounded-full shrink-0" alt={p.tenant} />
                  <span className="text-sm font-semibold text-gray-900 truncate">{p.tenant}</span>
                </div>
                <div className="col-span-3 text-xs text-gray-500 truncate">{p.property}</div>
                <div className="col-span-2 text-xs text-gray-500">{p.date}</div>
                <div className="col-span-1 text-xs text-gray-500">{p.method}</div>
                <div className="col-span-2 text-right text-sm font-black text-gray-900">{formatRWF(p.amount)}</div>
                <div className="col-span-1 text-right">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
                    {s.icon} {p.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}