// src/components/admin/ADUsers.jsx
// Responsiveness added — no style/design changes
import React, { useState, useEffect, useCallback } from "react";
import {
  HiSearch, HiEye, HiBan, HiCheckCircle, HiX,
  HiDownload, HiUserAdd, HiPencil,
  HiChevronLeft, HiChevronRight, HiRefresh,
  HiShieldCheck, HiDotsVertical,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

const hdrs = tk => ({ Authorization: `Bearer ${tk}` });

const fmtDate = d => d
  ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const fmtLastActive = d => {
  if (!d) return "Never";
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)        return "Just now";
  if (diff < 3600)      return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return fmtDate(d);
};

const getInitials = u =>
  `${u?.firstName?.[0] || ""}${u?.lastName?.[0] || ""}`.toUpperCase();

const isOnline = d => {
  if (!d) return false;
  return (Date.now() - new Date(d)) < 3 * 60 * 1000;
};

function TrustBar({ score }) {
  if (score == null) return <span className="text-xs text-gray-400">—</span>;
  const pct   = Math.min(Math.max(score, 0), 100);
  const color = pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex flex-col gap-1.5 min-w-[80px]">
      <span className="text-sm font-black" style={{ color }}>{pct}</span>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}/>
      </div>
    </div>
  );
}

function StatusBadge({ user }) {
  if (user.isSuspended) return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 text-[10px] font-black px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"/> Suspended
    </span>
  );
  if (!user.isVerified) return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/> Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-[10px] font-black px-2.5 py-1 rounded-full">
      <HiCheckCircle className="text-green-500 text-xs"/> Verified
    </span>
  );
}

function RoleBadge({ role }) {
  const s = {
    tenant:   "bg-blue-50 text-blue-700",
    landlord: "bg-indigo-50 text-indigo-700",
    admin:    "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide ${s[role] || s.tenant}`}>
      {role}
    </span>
  );
}

function UserDrawer({ user: u, onClose, onSuspend, onVerifyKyc, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const profile = u.tenantProfile || u.landlordProfile;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-base font-black text-gray-900">Account Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400 transition">
            <HiX className="text-lg"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-7">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-black mx-auto shadow-lg">
                {getInitials(u)}
              </div>
              {isOnline(u.lastSeenAt) && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"/>
              )}
            </div>
            <h4 className="mt-5 text-xl font-black text-gray-900">{u.firstName} {u.lastName}</h4>
            <p className="text-sm text-gray-500">{u.email}</p>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              <RoleBadge role={u.role}/>
              <StatusBadge user={u}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Trust Score</p>
              <TrustBar score={u.trustScore}/>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">KYC Status</p>
              <p className={`text-sm font-bold ${u.isVerified ? "text-green-600" : "text-amber-600"}`}>
                {u.isVerified ? "Verified" : "Pending"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {u.authType === "google" ? "Google Auth" : "Email + OTP"}
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50 mb-6">
            {[
              { label: "Account ID",  value: u.id.slice(0, 8).toUpperCase() + "..." },
              { label: "Registered",  value: fmtDate(u.createdAt) },
              { label: "Last Active", value: fmtLastActive(u.lastSeenAt) },
              { label: "Auth Method", value: u.authType || "email" },
              { label: "Phone",       value: u.phone || "Not provided" },
              profile?.nationalId  && { label: "National ID", value: profile.nationalId  },
              profile?.companyName && { label: "Company",     value: profile.companyName },
              profile?.trustScore  && { label: "Trust (DB)",  value: `${profile.trustScore}/100` },
            ].filter(Boolean).map((r, i) => (
              <div key={i} className="flex justify-between py-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{r.label}</span>
                <span className="text-sm font-semibold text-gray-800 truncate max-w-[60%] text-right">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-2">
          {!u.isVerified && u.role !== "admin" && (
            <button onClick={() => onVerifyKyc(u.id)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <HiShieldCheck/> Approve KYC (+10 trust pts)
            </button>
          )}
          <button onClick={() => { onSuspend(u.id); }}
            className={`w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
              u.isSuspended
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
            }`}>
            {u.isSuspended ? <><HiCheckCircle/> Reactivate Account</> : <><HiBan/> Suspend Account</>}
          </button>
          {u.role !== "admin" && (
            confirmDelete ? (
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">
                  Cancel
                </button>
                <button onClick={() => { onDelete(u.id); onClose(); }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700">
                  Confirm Delete
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 text-red-500 text-xs font-bold hover:underline">
                Delete User Account
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mobile user card (shown < md) ─────────────────────────────────────────────
function MobileUserCard({ u, onView, onSuspend, onVerifyKyc }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm">
              {getInitials(u)}
            </div>
            {isOnline(u.lastSeenAt) && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"/>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{u.firstName} {u.lastName}</p>
            <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
          </div>
        </div>
        <button onClick={() => onView(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
          <HiEye className="text-base"/>
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <RoleBadge role={u.role}/>
        <StatusBadge user={u}/>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div>
          <p className="text-[10px] text-gray-400 font-semibold">Trust Score</p>
          <TrustBar score={u.trustScore}/>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-semibold">Last Active</p>
          <p className="text-xs text-gray-500 font-medium">{fmtLastActive(u.lastSeenAt)}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        {!u.isVerified && (
          <button onClick={() => onVerifyKyc(u.id)}
            className="flex-1 py-2 bg-blue-600 text-white text-[11px] font-black rounded-xl hover:bg-blue-700 transition">
            VERIFY KYC
          </button>
        )}
        <button onClick={() => onSuspend(u.id)}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition border ${
            u.isSuspended
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          }`}>
          {u.isSuspended ? "Reactivate" : "Suspend"}
        </button>
      </div>
    </div>
  );
}

function ActionsMenu({ user: u, onView, onSuspend, onVerifyKyc }) {
  return (
    <div className="relative flex items-center justify-end gap-1">
      <button onClick={() => onView(u)} title="View"
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
        <HiEye className="text-base"/>
      </button>
      {!u.isVerified && (
        <button onClick={() => onVerifyKyc(u.id)}
          className="px-2.5 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition">
          VERIFY
        </button>
      )}
      <button onClick={() => onSuspend(u.id)} title={u.isSuspended ? "Reactivate" : "Suspend"}
        className={`p-2 rounded-lg transition ${
          u.isSuspended
            ? "text-green-500 hover:bg-green-50"
            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
        }`}>
        {u.isSuspended ? <HiCheckCircle className="text-base"/> : <HiBan className="text-base"/>}
      </button>
      <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition" title="Edit">
        <HiPencil className="text-base"/>
      </button>
    </div>
  );
}

export default function ADUsers({ token }) {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);
  const [pagination,   setPagination]   = useState({ total: 0, totalPages: 1 });
  const [selected,     setSelected]     = useState(null);
  const [debSearch,    setDebSearch]    = useState("");

  const LIMIT = 10;

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debSearch, roleFilter, statusFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(debSearch              && { search: debSearch   }),
        ...(roleFilter   !== "all" && { role:   roleFilter  }),
        ...(statusFilter !== "all" && { status: statusFilter}),
      });
      const res  = await fetch(`${API_BASE}/admin/users?${params}`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (err) { console.error("[ADUsers]", err.message); }
    finally { setLoading(false); }
  }, [token, page, debSearch, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSuspend = async id => {
    await fetch(`${API_BASE}/admin/users/${id}/suspend`, { method: "PUT", headers: hdrs(token) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: !u.isSuspended } : u));
    if (selected?.id === id) setSelected(p => ({ ...p, isSuspended: !p.isSuspended }));
  };

  const handleVerifyKyc = async id => {
    await fetch(`${API_BASE}/admin/users/${id}/verify-kyc`, { method: "PUT", headers: hdrs(token) });
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, isVerified: true, trustScore: Math.min((u.trustScore || 100) + 10, 100) }
      : u
    ));
    if (selected?.id === id) setSelected(p => ({ ...p, isVerified: true }));
  };

  const handleDelete = async id => {
    await fetch(`${API_BASE}/admin/users/${id}`, { method: "DELETE", headers: hdrs(token) });
    setUsers(prev => prev.filter(u => u.id !== id));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
  };

  const handleExportCSV = () => {
    const rows = [
      ["Name", "Email", "Role", "Status", "Trust Score", "Joined"],
      ...users.map(u => [
        `${u.firstName} ${u.lastName}`, u.email, u.role,
        u.isSuspended ? "Suspended" : u.isVerified ? "Active" : "Pending",
        u.trustScore ?? "N/A", fmtDate(u.createdAt),
      ]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "inzutrust-users.csv";
    a.click();
  };

  const pageNums = () => {
    const total = pagination.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (page <= 4)  return [1,2,3,4,5,"...",total];
    if (page >= total - 3) return [1,"...",total-4,total-3,total-2,total-1,total];
    return [1,"...",page-1,page,page+1,"...",total];
  };

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      {selected && (
        <UserDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onSuspend={handleSuspend}
          onVerifyKyc={handleVerifyKyc}
          onDelete={handleDelete}
        />
      )}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Total platform users:{" "}
              {loading
                ? <Skeleton width={60} height={13} borderRadius={6} inline/>
                : <span className="font-bold text-gray-800">{pagination.total.toLocaleString()}</span>
              }
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
              <HiDownload/> <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition">
              <HiUserAdd/> <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 px-4 sm:px-5 py-3.5 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider shrink-0 hidden sm:block">Filters:</span>

          <div className="relative">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer">
              <option value="all">All Roles</option>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
              <option value="admin">Admin</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]">▾</span>
          </div>

          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unverified">Unverified</option>
              <option value="suspended">Suspended</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]">▾</span>
          </div>

          <div className="relative flex-1 min-w-[160px]">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"/>
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <HiX className="text-sm"/>
              </button>
            )}
          </div>

          {(roleFilter !== "all" || statusFilter !== "all" || search) && (
            <button onClick={() => { setRoleFilter("all"); setStatusFilter("all"); setSearch(""); }}
              className="text-blue-600 text-xs font-bold hover:underline shrink-0">
              Clear all
            </button>
          )}

          <button onClick={fetchUsers} className="ml-auto p-2 text-gray-400 hover:text-blue-600 transition shrink-0">
            <HiRefresh className={`text-base ${loading ? "animate-spin" : ""}`}/>
          </button>
        </div>

        {/* ── MOBILE: card layout (< md) ── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({length:4}).map((_,i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton width={40} height={40} borderRadius={12}/>
                  <div><Skeleton width={120} height={13} borderRadius={6} className="mb-1"/><Skeleton width={160} height={10} borderRadius={6}/></div>
                </div>
                <div className="flex gap-2"><Skeleton width={60} height={22} borderRadius={8}/><Skeleton width={70} height={22} borderRadius={20}/></div>
                <div className="flex justify-between"><Skeleton width={80} height={22} borderRadius={6}/><Skeleton width={80} height={12} borderRadius={6}/></div>
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <HiUserAdd className="text-4xl text-gray-200 mx-auto mb-3"/>
              <p className="text-sm font-semibold text-gray-400">No users found</p>
            </div>
          ) : (
            users.map(u => (
              <MobileUserCard
                key={u.id}
                u={u}
                onView={setSelected}
                onSuspend={handleSuspend}
                onVerifyKyc={handleVerifyKyc}
              />
            ))
          )}
        </div>

        {/* ── DESKTOP: table layout (≥ md) ── */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Trust Score</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton width={40} height={40} borderRadius={12}/>
                          <div><Skeleton width={120} height={12} borderRadius={6} className="mb-1"/><Skeleton width={160} height={10} borderRadius={6}/></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton width={60} height={22} borderRadius={8}/></td>
                      <td className="px-6 py-4"><Skeleton width={70} height={22} borderRadius={20}/></td>
                      <td className="px-6 py-4"><Skeleton width={80} height={22} borderRadius={6}/></td>
                      <td className="px-6 py-4"><Skeleton width={80} height={12} borderRadius={6}/></td>
                      <td className="px-6 py-4"><div className="flex justify-end gap-1"><Skeleton circle width={28} height={28}/><Skeleton circle width={28} height={28}/><Skeleton circle width={28} height={28}/></div></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <HiUserAdd className="text-4xl text-gray-200 mx-auto mb-3"/>
                      <p className="text-sm font-semibold text-gray-400">No users found</p>
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm">
                              {getInitials(u)}
                            </div>
                            {isOnline(u.lastSeenAt) && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"/>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{u.firstName} {u.lastName}</p>
                            <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><RoleBadge role={u.role}/></td>
                      <td className="px-6 py-4"><StatusBadge user={u}/></td>
                      <td className="px-6 py-4"><TrustBar score={u.trustScore}/></td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 font-medium">{fmtLastActive(u.lastSeenAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <ActionsMenu user={u} onView={setSelected} onSuspend={handleSuspend} onVerifyKyc={handleVerifyKyc}/>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-gray-500">
                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of{" "}
                <span className="font-bold text-gray-800">{pagination.total.toLocaleString()}</span> entries
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40">
                  <HiChevronLeft className="text-sm"/>
                </button>
                {pageNums().map((n, i) =>
                  n === "..." ? (
                    <span key={`d${i}`} className="w-8 text-center text-xs text-gray-400">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                        page === n ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}>
                      {n}
                    </button>
                  )
                )}
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40">
                  <HiChevronRight className="text-sm"/>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="md:hidden flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40">
                <HiChevronLeft className="text-sm"/>
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages,p+1))} disabled={page===pagination.totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40">
                <HiChevronRight className="text-sm"/>
              </button>
            </div>
          </div>
        )}
      </div>
    </SkeletonTheme>
  );
}