import React, { useEffect, useState } from "react";
import { HiDownload, HiCheckCircle, HiClock, HiExclamation, HiSearch } from "react-icons/hi";
// CHANGE THIS LINE: Point to your central config
import { API_BASE } from "../../config"; 

const MOCK = [
  { id:1, from:"Bosco Mutabazi",   to:"Aline Uwimana",   property:"Kigali Heights Apt 4B", amount:1200000, date:"Oct 01, 2023", type:"Rent",    status:"Completed", escrow:false },
  { id:2, from:"Claire Uwera",     to:"Diane Ingabire",  property:"Vision City Villa #12",  amount:2500000, date:"Oct 01, 2023", type:"Rent",    status:"In Escrow", escrow:true  },
  { id:3, from:"David Nkurunziza", to:"Grace Mukamana",  property:"Kimironko Studio 2A",    amount:450000,  date:"Oct 05, 2023", type:"Deposit", status:"In Escrow", escrow:true  },
  { id:4, from:"Eric Habimana",    to:"Jean Kamanzi",    property:"Rebero Heights Unit 5",  amount:800000,  date:"Sep 28, 2023", type:"Rent",    status:"Overdue",    escrow:false },
  { id:5, from:"Arangwa Jean",     to:"Aline Uwimana",   property:"Nyarutarama Penthouse",  amount:3500000, date:"Oct 10, 2023", type:"Rent",    status:"Completed", escrow:false },
];

const statusStyle = {
  "Completed": "bg-green-50 text-green-700 border border-green-200",
  "In Escrow": "bg-blue-50 text-blue-700 border border-blue-200",
  "Overdue":   "bg-red-50 text-red-600 border border-red-200",
  "Pending":   "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const statusIcon = {
  "Completed": <HiCheckCircle className="text-green-500" />,
  "In Escrow": <HiClock className="text-blue-500" />,
  "Overdue":   <HiExclamation className="text-red-500" />,
  "Pending":   <HiClock className="text-yellow-500" />,
};

const fmt = n => `${(n/1000).toFixed(0)}k RWF`;
const fmtB = n => n >= 1e9 ? `${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : `${n}`;

export default function ADPayments({ token }) {
  const [txns,   setTxns]   = useState(MOCK);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/payments`, { headers: hdrs });
        if (res.ok) { 
            const d = await res.json(); 
            if (d.data?.length) setTxns(d.data); 
        }
      } catch (err) {
        console.error("Payment fetch error:", err);
      }
    })();
  }, [token]);

  const handleRelease = async (id) => {
    try { 
        const res = await fetch(`${API_BASE}/admin/escrow/${id}/release`, { 
            method: "PUT", 
            headers: hdrs 
        }); 
        if(res.ok) {
            setTxns(t => t.map(x => x.id === id ? { ...x, status: "Completed", escrow: false } : x));
        }
    } catch (err) {
        console.error("Release error:", err);
    }
  };

  const total     = txns.reduce((s, t) => s + t.amount, 0);
  const escrow    = txns.filter(t => t.escrow).reduce((s, t) => s + t.amount, 0);
  const overdue   = txns.filter(t => t.status === "Overdue").reduce((s, t) => s + t.amount, 0);

  const filtered = txns.filter(t => {
    const matchF = filter === "all" || t.status.toLowerCase().replace(" ", "-") === filter;
    const matchS = `${t.from} ${t.to} ${t.property}`.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Payments & Escrow</h2>
          <p className="text-sm text-gray-400 mt-0.5">{txns.length} total transactions</p>
        </div>
        <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
          <HiDownload /> Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Volume",    value: `RWF ${fmtB(total)}`,  color: "text-gray-900",   bg: "bg-blue-50",   icon: <HiCheckCircle className="text-blue-500 text-xl" /> },
          { label: "In Escrow",       value: `RWF ${fmtB(escrow)}`, color: "text-blue-600",   bg: "bg-blue-50",   icon: <HiClock className="text-blue-500 text-xl" /> },
          { label: "Overdue Amount", value: `RWF ${fmtB(overdue)}`,color: "text-red-600",    bg: "bg-red-50",    icon: <HiExclamation className="text-red-500 text-xl" /> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-64">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
        {["all","completed","in-escrow","overdue","pending"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>{f === "all" ? "All" : f.replace("-"," ")}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-2">FROM</div>
          <div className="col-span-2">TO</div>
          <div className="col-span-3">PROPERTY</div>
          <div className="col-span-1">TYPE</div>
          <div className="col-span-1">DATE</div>
          <div className="col-span-1">AMOUNT</div>
          <div className="col-span-2 text-right">STATUS / ACTION</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((t, i) => (
            <div key={t.id || i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition">
              <div className="col-span-2 text-sm font-medium text-gray-900 truncate">{t.from}</div>
              <div className="col-span-2 text-sm text-gray-600 truncate">{t.to}</div>
              <div className="col-span-3 text-xs text-gray-500 truncate">{t.property}</div>
              <div className="col-span-1 text-xs text-gray-500 uppercase">{t.type}</div>
              <div className="col-span-1 text-xs text-gray-400">{t.date.split(",")[0]}</div>
              <div className="col-span-1 text-sm font-black text-gray-900">{fmt(t.amount)}</div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${statusStyle[t.status]}`}>
                  {statusIcon[t.status]} {t.status}
                </span>
                {t.escrow && (
                  <button onClick={() => handleRelease(t.id)}
                    className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg hover:bg-blue-100 transition whitespace-nowrap">
                    Release
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}