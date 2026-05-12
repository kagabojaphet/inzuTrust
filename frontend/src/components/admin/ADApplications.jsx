// src/components/admin/ADApplications.jsx
// Admin view: all lease applications across platform with full details
import { useState, useEffect, useCallback } from "react";
import { HiClipboardList, HiSearch, HiChevronDown, HiX, HiLocationMarker, HiPhotograph } from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ADPageHeader  from "./shared/ADPageHeader";
import ADStatusBadge from "./shared/ADStatusBadge";

const API  = import.meta.env.VITE_API_URL || "https://inzutrust-api.onrender.com/api";
const hdrs = tk => ({ Authorization:`Bearer ${tk}` });
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtRWF  = n => n ? `RWF ${Number(n).toLocaleString()}` : "—";

const FILTERS = [
  {val:"",         label:"All"},
  {val:"pending",  label:"Pending"},
  {val:"accepted", label:"Accepted"},
  {val:"rejected", label:"Rejected"},
];

// ── Detail drawer ─────────────────────────────────────────────────────────────
function ApplicationDrawer({ app, onClose }) {
  const tenant = app.tenant;
  const prop   = app.property;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="absolute inset-0" onClick={onClose}/>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-black text-gray-900">Application Details</h3>
            <p className="text-xs text-gray-400">Admin View</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
        </div>

        <div className="p-6 space-y-5">
          <ADStatusBadge status={app.status}/>

          {/* Property */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <div className="h-28 bg-gray-200 overflow-hidden">
              {prop?.mainImage
                ? <img src={prop.mainImage} alt="" className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-4xl"/></div>
              }
            </div>
            <div className="p-4">
              <p className="font-black text-gray-900">{prop?.title || "—"}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <HiLocationMarker/>{prop?.district}{prop?.sector ? `, ${prop.sector}` : ""}
              </p>
              <p className="text-sm font-black text-blue-600 mt-1">{fmtRWF(prop?.rentAmount)}/mo</p>
            </div>
          </div>

          {/* Tenant */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tenant</p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                {tenant?.firstName?.[0]}{tenant?.lastName?.[0]}
              </div>
              <div>
                <p className="font-black text-gray-900">{tenant?.firstName} {tenant?.lastName}</p>
                <p className="text-xs text-gray-400">{tenant?.email}</p>
                {tenant?.phone && <p className="text-xs text-gray-400">{tenant.phone}</p>}
              </div>
            </div>
          </div>

          {/* Lease details */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Lease Details</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-100">
              {[
                { label:"Move-in Date", value:fmtDate(app.moveInDate) },
                { label:"Duration",     value:`${app.duration} months` },
                { label:"Applied",      value:fmtDate(app.createdAt)  },
                { label:"Responded",    value:fmtDate(app.respondedAt)},
                { label:"Landlord",     value:`${app.landlord?.firstName||""} ${app.landlord?.lastName||""}` },
              ].map((r,i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-400">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {app.message && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tenant Message</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 border border-gray-100 leading-relaxed">{app.message}</div>
            </div>
          )}
          {app.landlordNote && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Landlord Note</p>
              <div className={`rounded-xl p-4 text-sm leading-relaxed border ${
                app.status === "accepted" ? "bg-green-50 border-green-200 text-green-800" : "bg-orange-50 border-orange-200 text-orange-800"
              }`}>{app.landlordNote}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function ApplicationRow({ app, onView }) {
  const tenant = app.tenant;
  const prop   = app.property;
  return (
    <div className="grid grid-cols-[1.5fr_1.5fr_0.8fr_0.8fr_0.8fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-black text-blue-600 shrink-0">
          {tenant?.firstName?.[0]}{tenant?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{tenant?.firstName} {tenant?.lastName}</p>
          <p className="text-[10px] text-gray-400 truncate">{tenant?.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          {prop?.mainImage
            ? <img src={prop.mainImage} alt="" className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-sm"/></div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{prop?.title || "—"}</p>
          <p className="text-[10px] text-gray-400 truncate">{prop?.district || "—"}</p>
        </div>
      </div>

      <p className="text-xs font-bold text-blue-600">{fmtRWF(prop?.rentAmount)}</p>
      <p className="text-xs text-gray-500">{fmtDate(app.moveInDate)}</p>
      <ADStatusBadge status={app.status}/>
      <button onClick={() => onView(app)}
        className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
        View
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ADApplications({ token }) {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("");
  const [viewing, setViewing] = useState(null);

  const counts = {
    total:    apps.length,
    pending:  apps.filter(a => a.status === "pending").length,
    accepted: apps.filter(a => a.status === "accepted").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/lease-applications/all`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) setApps(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchS = !statusF || a.status === statusF;
    const matchQ = !q ||
      `${a.tenant?.firstName} ${a.tenant?.lastName}`.toLowerCase().includes(q) ||
      a.tenant?.email?.toLowerCase().includes(q) ||
      a.property?.title?.toLowerCase().includes(q);
    return matchS && matchQ;
  });

  return (
    <div className="space-y-5">
      {viewing && <ApplicationDrawer app={viewing} onClose={() => setViewing(null)}/>}

      <ADPageHeader title="Lease Applications" sub="All tenant applications across the platform" onRefresh={load} loading={loading}/>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total",    value:counts.total,    color:"bg-blue-500"   },
          { label:"Pending",  value:counts.pending,  color:"bg-yellow-500" },
          { label:"Accepted", value:counts.accepted, color:"bg-green-500"  },
          { label:"Rejected", value:counts.rejected, color:"bg-red-500"    },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 px-4 py-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <HiClipboardList className="text-white text-base"/>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
              {loading ? <Skeleton width={30} height={20}/> : <p className="text-xl font-black text-gray-900">{s.value}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.val} onClick={() => setStatusF(f.val)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              statusF === f.val ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {f.label}
            {f.val && counts[f.val] > 0 && (
              <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                statusF === f.val ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
              }`}>{counts[f.val]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by tenant, property..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"/>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.5fr_0.8fr_0.8fr_0.8fr_auto] gap-4 px-5 py-3.5 bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-400">
          <div>Tenant</div><div>Property</div><div>Rent</div><div>Move-in</div><div>Status</div><div>Action</div>
        </div>
        <div>
          {loading ? (
            Array.from({length:5}).map((_,i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1.5fr_0.8fr_0.8fr_0.8fr_auto] gap-4 px-5 py-4 items-center border-b border-gray-50">
                {Array.from({length:6}).map((_,j) => <Skeleton key={j} height={14} borderRadius={6}/>)}
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <HiClipboardList className="text-5xl text-gray-200 mx-auto mb-3"/>
              <p className="text-gray-500 font-bold">{search||statusF ? "No matches" : "No applications yet"}</p>
            </div>
          ) : (
            filtered.map(a => <ApplicationRow key={a.id} app={a} onView={setViewing}/>)
          )}
        </div>
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{" "}
          <span className="font-bold text-gray-600">{apps.length}</span> applications
        </p>
      )}
    </div>
  );
}