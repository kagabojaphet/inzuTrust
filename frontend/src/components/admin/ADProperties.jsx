// ── ADProperties ──────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { HiCheckCircle, HiX, HiEye, HiSearch, HiBan } from "react-icons/hi";
import { API_BASE } from "../../config";

const MOCK_PROPS = [
  { id:1, title:"Kigali Heights Apt 4B",  owner:"Aline Uwimana",   location:"KG 7 Ave, Kigali",     type:"Apartment", rent:1200000, status:"Verified",        submitted:"Oct 01, 2023" },
  { id:2, title:"Vision City Villa #12",  owner:"Diane Ingabire",  location:"Vision City, Kigali",  type:"Villa",     rent:2500000, status:"Pending Review",  submitted:"Oct 18, 2023" },
  { id:3, title:"Kimironko Studio 2A",    owner:"Grace Mukamana",  location:"Kimironko, Kigali",    type:"Studio",    rent:450000,  status:"Under Review",    submitted:"Oct 20, 2023" },
  { id:4, title:"Nyarutarama Penthouse",  owner:"Aline Uwimana",   location:"Nyarutarama, Kigali",  type:"House",     rent:3500000, status:"Verified",        submitted:"Sep 15, 2023" },
  { id:5, title:"Rebero Heights Unit 5",  owner:"Jean Kamanzi",    location:"Rebero, Kigali",       type:"Apartment", rent:800000,  status:"Rejected",        submitted:"Oct 05, 2023" },
];

const statusStyle = {
  "Verified":       "bg-green-50 text-green-700 border border-green-200",
  "Pending Review": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Under Review":   "bg-blue-50 text-blue-700 border border-blue-200",
  "Rejected":       "bg-red-50 text-red-600 border border-red-200",
};

const formatRWF = n => `${(n/1000).toFixed(0)}k RWF`;

export function ADProperties({ token }) {
  const [props,   setProps]   = useState(MOCK_PROPS);
  const [search,  setSearch]  = useState("");
  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/properties`, { headers: hdrs });
        if (res.ok) { const d = await res.json(); if (d.data?.length) setProps(d.data); }
      } catch {}
    })();
  }, []);

  const handleApprove = async (id) => {
    try { await fetch(`${API_BASE}/admin/properties/${id}/verify`, { method: "PUT", headers: hdrs }); } catch {}
    setProps(p => p.map(x => x.id === id ? { ...x, status: "Verified" } : x));
  };

  const handleReject = async (id) => {
    try { await fetch(`${API_BASE}/admin/properties/${id}/reject`, { method: "PUT", headers: hdrs }); } catch {}
    setProps(p => p.map(x => x.id === id ? { ...x, status: "Rejected" } : x));
  };

  const filtered = props.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.owner?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Property Verification</h2>
          <p className="text-sm text-gray-400 mt-0.5">{props.filter(p => p.status !== "Verified").length} pending verification</p>
        </div>
        <div className="relative w-64">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-3">PROPERTY</div>
          <div className="col-span-2">OWNER</div>
          <div className="col-span-2">TYPE</div>
          <div className="col-span-1">RENT</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map(p => (
            <div key={p.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
              <div className="col-span-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                <p className="text-[10px] text-gray-400">{p.location}</p>
              </div>
              <div className="col-span-2 text-sm text-gray-600 truncate">{p.owner}</div>
              <div className="col-span-2 text-xs text-gray-500">{p.type}</div>
              <div className="col-span-1 text-xs font-bold text-blue-600">{formatRWF(p.rent)}</div>
              <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[p.status]}`}>{p.status}</span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                {p.status !== "Verified" && (
                  <button onClick={() => handleApprove(p.id)}
                    className="w-7 h-7 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                    <HiCheckCircle className="text-sm" />
                  </button>
                )}
                {p.status !== "Rejected" && (
                  <button onClick={() => handleReject(p.id)}
                    className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition">
                    <HiX className="text-sm" />
                  </button>
                )}
                <button className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                  <HiEye className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ADProperties;