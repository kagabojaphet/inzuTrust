import React, { useEffect, useState } from "react";
import { HiSearch, HiEye, HiBan, HiCheckCircle, HiChevronDown, HiX } from "react-icons/hi";
import { API_BASE } from "../../config";

const MOCK = [
  { id:1, name:"Bosco Mutabazi",    email:"bosco@gmail.com",   role:"Tenant",   status:"Active",   joined:"Oct 01, 2023", trustScore:88, kyc:"Verified"      },
  { id:2, name:"Aline Uwimana",     email:"aline@gmail.com",   role:"Landlord", status:"Active",   joined:"Sep 15, 2023", trustScore:92, kyc:"Verified"      },
  { id:3, name:"David Nkurunziza",  email:"david@gmail.com",   role:"Tenant",   status:"Pending",  joined:"Oct 20, 2023", trustScore:null, kyc:"Pending"     },
  { id:4, name:"Grace Mukamana",    email:"grace@gmail.com",   role:"Landlord", status:"Active",   joined:"Aug 30, 2023", trustScore:78, kyc:"Under Review"  },
  { id:5, name:"Eric Habimana",     email:"eric@gmail.com",    role:"Tenant",   status:"Suspended",joined:"Jul 10, 2023", trustScore:42, kyc:"Rejected"      },
  { id:6, name:"Diane Ingabire",    email:"diane@gmail.com",   role:"Landlord", status:"Active",   joined:"Oct 12, 2023", trustScore:85, kyc:"Verified"      },
];

const roleBadge = {
  Tenant:   "bg-blue-50 text-blue-700 border border-blue-200",
  Landlord: "bg-purple-50 text-purple-700 border border-purple-200",
  Admin:    "bg-gray-100 text-gray-700",
};
const statusBadge = {
  Active:    "bg-green-50 text-green-700 border border-green-200",
  Pending:   "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Suspended: "bg-red-50 text-red-600 border border-red-200",
};
const kycBadge = {
  Verified:      "bg-green-50 text-green-700",
  Pending:       "bg-yellow-50 text-yellow-700",
  "Under Review":"bg-blue-50 text-blue-700",
  Rejected:      "bg-red-50 text-red-600",
};

export default function ADUsers({ token }) {
  const [users,     setUsers]     = useState(MOCK);
  const [search,    setSearch]    = useState("");
  const [roleFilter,setRoleFilter]= useState("All");
  const [selected,  setSelected]  = useState(null);
  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/users`, { headers: hdrs });
        if (res.ok) { const d = await res.json(); if (d.data?.length) setUsers(d.data); }
      } catch {}
    })();
  }, []);

  const handleSuspend = async (id) => {
    try { await fetch(`${API_BASE}/admin/users/${id}/suspend`, { method: "PUT", headers: hdrs }); } catch {}
    setUsers(u => u.map(x => x.id === id ? { ...x, status: x.status === "Suspended" ? "Active" : "Suspended" } : x));
  };

  const handleVerifyKyc = async (id) => {
    try { await fetch(`${API_BASE}/admin/kyc/${id}/approve`, { method: "PUT", headers: hdrs }); } catch {}
    setUsers(u => u.map(x => x.id === id ? { ...x, kyc: "Verified" } : x));
  };

  const filtered = users.filter(u => {
    const matchSearch = `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">User Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-64">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
        {["All", "Tenant", "Landlord"].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              roleFilter === r ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>{r}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100
          text-[9px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-3">USER</div>
          <div className="col-span-2">ROLE</div>
          <div className="col-span-2">KYC</div>
          <div className="col-span-1">TRUST</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map(u => (
            <div key={u.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition">
              <div className="col-span-3 flex items-center gap-2.5">
                <img src={`https://ui-avatars.com/api/?name=${u.name}&background=dbeafe&color=1d4ed8&bold=true&size=30`}
                  className="w-8 h-8 rounded-full shrink-0" alt={u.name} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[u.role]}`}>{u.role}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kycBadge[u.kyc] || kycBadge.Pending}`}>{u.kyc}</span>
              </div>
              <div className="col-span-1 text-sm font-black text-blue-600">{u.trustScore ?? "—"}</div>
              <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[u.status]}`}>{u.status}</span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <button onClick={() => setSelected(u)} title="View"
                  className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                  <HiEye className="text-sm" />
                </button>
                {u.kyc !== "Verified" && (
                  <button onClick={() => handleVerifyKyc(u.id)} title="Approve KYC"
                    className="w-7 h-7 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                    <HiCheckCircle className="text-sm" />
                  </button>
                )}
                <button onClick={() => handleSuspend(u.id)} title={u.status === "Suspended" ? "Activate" : "Suspend"}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                    u.status === "Suspended" ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-500 hover:bg-red-100"
                  }`}>
                  {u.status === "Suspended" ? <HiCheckCircle className="text-sm" /> : <HiBan className="text-sm" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
          <div className="bg-white w-80 h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">User Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700"><HiX className="text-xl" /></button>
            </div>
            <div className="text-center mb-6">
              <img src={`https://ui-avatars.com/api/?name=${selected.name}&background=dbeafe&color=1d4ed8&bold=true&size=64`}
                className="w-16 h-16 rounded-full mx-auto mb-3" alt={selected.name} />
              <h4 className="font-black text-gray-900">{selected.name}</h4>
              <p className="text-xs text-gray-400">{selected.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[selected.role]}`}>{selected.role}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[selected.status]}`}>{selected.status}</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Joined",      value: selected.joined       },
                { label: "KYC Status",  value: selected.kyc          },
                { label: "Trust Score", value: selected.trustScore ?? "N/A" },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{r.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => handleSuspend(selected.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                  selected.status === "Suspended" ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-500 text-white hover:bg-red-600"
                }`}>
                {selected.status === "Suspended" ? "Activate" : "Suspend"}
              </button>
              {selected.kyc !== "Verified" && (
                <button onClick={() => handleVerifyKyc(selected.id)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                  Approve KYC
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}