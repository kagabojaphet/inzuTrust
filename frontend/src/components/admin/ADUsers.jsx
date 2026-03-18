import React, { useEffect, useState } from "react";
import { HiSearch, HiEye, HiBan, HiCheckCircle, HiX, HiFilter, HiUserGroup, HiShieldCheck, HiClock } from "react-icons/hi";
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
  Tenant:   "bg-blue-50 text-blue-700",
  Landlord: "bg-indigo-50 text-indigo-700",
  Admin:    "bg-slate-100 text-slate-700",
};
const statusBadge = {
  Active:    "bg-emerald-50 text-emerald-700",
  Pending:   "bg-amber-50 text-amber-700",
  Suspended: "bg-rose-50 text-rose-600",
};
const kycBadge = {
  Verified:       "bg-emerald-100 text-emerald-800",
  Pending:        "bg-amber-100 text-amber-800",
  "Under Review": "bg-blue-100 text-blue-800",
  Rejected:       "bg-rose-100 text-rose-800",
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage permissions, verify identities, and monitor trust scores.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-bold text-slate-700">{users.filter(u => u.status === 'Active').length} Online Now</span>
            </div>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
            { label: 'Total Users', val: users.length, icon: HiUserGroup, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'KYC Verified', val: users.filter(u => u.kyc === 'Verified').length, icon: HiShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Review', val: users.filter(u => u.kyc === 'Pending').length, icon: HiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}><stat.icon size={24}/></div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Table Actions / Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all" 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["All", "Tenant", "Landlord"].map(r => (
              <button 
                key={r} 
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roleFilter === r ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
             <HiFilter />
          </button>
        </div>
      </div>

      {/* Modern User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Account Role</th>
                <th className="px-6 py-4">Identity (KYC)</th>
                <th className="px-6 py-4 text-center">Trust</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${u.name}&background=eff6ff&color=2563eb&bold=true`}
                        className="w-9 h-9 rounded-full border border-slate-100 shadow-sm" alt={u.name} 
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight ${roleBadge[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${kycBadge[u.kyc] || kycBadge.Pending}`}>
                      {u.kyc}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-black ${u.trustScore >= 80 ? 'text-emerald-600' : u.trustScore >= 50 ? 'text-blue-600' : 'text-rose-500'}`}>
                        {u.trustScore ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${statusBadge[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelected(u)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <HiEye size={18} />
                      </button>
                      {u.kyc !== "Verified" && (
                        <button 
                          onClick={() => handleVerifyKyc(u.id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <HiCheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleSuspend(u.id)}
                        className={`p-2 rounded-lg transition-all ${
                          u.status === "Suspended" 
                            ? "text-emerald-500 hover:bg-emerald-50" 
                            : "text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                      >
                        {u.status === "Suspended" ? <HiCheckCircle size={18} /> : <HiBan size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Side-Panel Drawer */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Account Details</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition">
                <HiX size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="text-center mb-10">
                <div className="relative inline-block">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${selected.name}&background=eff6ff&color=2563eb&bold=true&size=128`}
                    className="w-24 h-24 rounded-3xl mx-auto shadow-xl border-4 border-white" alt={selected.name} 
                  />
                  <span className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-black border-2 border-white shadow-sm ${statusBadge[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
                <h4 className="mt-6 text-xl font-bold text-slate-900">{selected.name}</h4>
                <p className="text-sm text-slate-500 font-medium">{selected.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Trust Score</p>
                    <p className="text-lg font-black text-blue-600">{selected.trustScore || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">KYC Status</p>
                    <p className="text-sm font-bold text-slate-700">{selected.kyc}</p>
                </div>
              </div>

              <div className="space-y-1">
                {[
                  { label: "Account ID", value: `#USR-00${selected.id}` },
                  { label: "Registration Date", value: selected.joined },
                  { label: "User Role", value: selected.role },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between py-4 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{r.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                onClick={() => handleSuspend(selected.id)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  selected.status === "Suspended" 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "bg-white text-rose-600 border border-rose-100 hover:bg-rose-50"
                }`}
              >
                {selected.status === "Suspended" ? "Reactivate User" : "Suspend Account"}
              </button>
              {selected.kyc !== "Verified" && (
                <button 
                  onClick={() => handleVerifyKyc(selected.id)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all"
                >
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