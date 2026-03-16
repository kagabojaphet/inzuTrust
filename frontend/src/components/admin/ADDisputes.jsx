// ── ADDisputes ────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { HiCheckCircle, HiExclamation, HiX, HiChevronDown } from "react-icons/hi";
import { API_BASE } from "../../config";

const MOCK_DISPUTES = [
  { id:1, title:"Rent deposit withheld",  tenant:"Bosco Mutabazi",   landlord:"Aline Uwimana",  property:"Kigali Heights Apt 4B", opened:"Oct 20, 2023", priority:"High",   status:"Open"     },
  { id:2, title:"Property damage claim",  tenant:"Claire Uwera",     landlord:"Diane Ingabire", property:"Vision City Villa #12",  opened:"Oct 22, 2023", priority:"Medium", status:"Open"     },
  { id:3, title:"Lease termination",      tenant:"David Nkurunziza", landlord:"Grace Mukamana", property:"Kimironko Studio 2A",    opened:"Oct 23, 2023", priority:"Low",    status:"Open"     },
  { id:4, title:"Maintenance ignored",    tenant:"Eric Habimana",    landlord:"Jean Kamanzi",   property:"Rebero Heights Unit 5",  opened:"Oct 01, 2023", priority:"Medium", status:"Resolved" },
  { id:5, title:"Unjustified eviction",   tenant:"Arangwa Jean",     landlord:"Aline Uwimana",  property:"Nyarutarama Penthouse",  opened:"Sep 28, 2023", priority:"High",   status:"Resolved" },
];

const priorityStyle = {
  High:   "bg-red-50 text-red-600 border border-red-200",
  Medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Low:    "bg-gray-100 text-gray-600",
};
const statusStyle = {
  Open:     "bg-red-50 text-red-600 border border-red-200",
  Resolved: "bg-green-50 text-green-700 border border-green-200",
};

export function ADDisputes({ token }) {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [filter,   setFilter]   = useState("all");
  const [expanded, setExpanded] = useState(null);
  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/disputes`, { headers: hdrs });
        if (res.ok) { const d = await res.json(); if (d.data?.length) setDisputes(d.data); }
      } catch {}
    })();
  }, []);

  const handleResolve = async (id) => {
    try { await fetch(`${API_BASE}/admin/disputes/${id}/resolve`, { method: "PUT", headers: hdrs }); } catch {}
    setDisputes(d => d.map(x => x.id === id ? { ...x, status: "Resolved" } : x));
  };

  const open     = disputes.filter(d => d.status === "Open").length;
  const resolved = disputes.filter(d => d.status === "Resolved").length;
  const filtered = filter === "all" ? disputes : disputes.filter(d => d.status.toLowerCase() === filter);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Dispute Resolution</h2>
        <p className="text-sm text-gray-400 mt-0.5">{open} open · {resolved} resolved</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <HiExclamation className="text-red-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{open}</p>
            <p className="text-xs text-gray-500 font-semibold">Open</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <HiCheckCircle className="text-green-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{resolved}</p>
            <p className="text-xs text-gray-500 font-semibold">Resolved</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all","open","resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(d => (
          <div key={d.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.status === "Open" ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{d.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.tenant} vs. {d.landlord} · {d.property}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityStyle[d.priority]}`}>{d.priority}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[d.status]}`}>{d.status}</span>
                <HiChevronDown className={`text-gray-400 transition-transform ${expanded === d.id ? "rotate-180" : ""}`} />
              </div>
            </div>
            {expanded === d.id && (
              <div className="px-5 pb-4 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Tenant",   value: d.tenant   },
                    { label: "Landlord", value: d.landlord },
                    { label: "Property", value: d.property },
                    { label: "Opened",   value: d.opened   },
                  ].map((r, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{r.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{r.value}</p>
                    </div>
                  ))}
                </div>
                {d.status === "Open" && (
                  <button onClick={() => handleResolve(d.id)}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition flex items-center gap-2">
                    <HiCheckCircle /> Mark as Resolved
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ADDisputes;