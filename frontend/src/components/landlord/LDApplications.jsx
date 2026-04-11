// src/components/landlord/LDApplications.jsx
// Split into: applications/AppRow.jsx + applications/DetailDrawer.jsx + applications/RespondModal.jsx
import { useState, useEffect, useCallback } from "react";
import { HiDocumentText, HiRefresh } from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AppRow        from "./applications/AppRow";
import DetailDrawer  from "./applications/DetailDrawer";
import RespondModal  from "./applications/RespondModal";

const API    = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FILTERS = [
  { key:"all",      label:"All"      },
  { key:"pending",  label:"Pending"  },
  { key:"accepted", label:"Accepted" },
  { key:"rejected", label:"Rejected" },
];

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2fr_2fr_1.4fr_1fr_1.2fr_auto] gap-4 px-5 py-4 items-center border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5">
        <Skeleton circle width={36} height={36}/>
        <div><Skeleton width={110} height={12} borderRadius={4}/><Skeleton width={85} height={10} borderRadius={4} className="mt-1"/></div>
      </div>
      <div className="flex items-center gap-2.5">
        <Skeleton width={36} height={36} borderRadius={8}/>
        <div><Skeleton width={110} height={12} borderRadius={4}/><Skeleton width={60} height={10} borderRadius={4} className="mt-1"/></div>
      </div>
      <Skeleton width={90} height={12} borderRadius={4}/>
      <Skeleton width={70} height={12} borderRadius={4}/>
      <Skeleton width={75} height={22} borderRadius={20}/>
      <Skeleton width={32} height={32} borderRadius={8}/>
    </div>
  );
}

export default function LDApplications({ token }) {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");
  const [responding,   setResponding]   = useState(null);
  const [viewing,      setViewing]      = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/lease-applications/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDone = updated => {
    setApplications(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
    setResponding(null);
  };

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === "pending").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const filtered = filter === "all" ? applications : applications.filter(a => a.status === filter);

  return (
    <>
      {responding && (
        <RespondModal application={responding} token={token} onClose={() => setResponding(null)} onDone={handleDone}/>
      )}
      {viewing && (
        <DetailDrawer application={viewing} onClose={() => setViewing(null)}
          onRespond={app => { setViewing(null); setResponding(app); }}/>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Lease Applications</h2>
            <p className="text-sm text-gray-500 mt-0.5">Review and respond to tenant applications for your properties</p>
          </div>
          <button onClick={load}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-semibold transition">
            <HiRefresh className={loading ? "animate-spin" : ""}/> Refresh
          </button>
        </div>

        {/* Filter tabs with counts */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ${
                  filter === f.key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_2fr_1.4fr_1fr_1.2fr_auto] gap-4 px-5 py-3.5 bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-400">
            <div>Tenant</div>
            <div>Property</div>
            <div>Move-in</div>
            <div>Rent</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          <div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i}/>)
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-600 font-bold">
                  {filter === "all" ? "No applications yet" : `No ${filter} applications`}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === "all"
                    ? "Applications from tenants will appear here once they apply for your properties"
                    : `Applications with this status will appear here`}
                </p>
              </div>
            ) : (
              filtered.map(app => (
                <AppRow key={app.id} app={app} onView={setViewing} onRespond={setResponding}/>
              ))
            )}
          </div>
        </div>

        {/* Footer count */}
        {!loading && applications.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{" "}
            <span className="font-bold text-gray-600">{applications.length}</span> applications
          </p>
        )}
      </div>
    </>
  );
}