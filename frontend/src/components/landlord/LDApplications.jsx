// src/components/landlord/LDApplications.jsx
import React, { useState, useEffect } from "react";
import {
  HiCheckCircle, HiXCircle, HiClock, HiDocumentText,
  HiLocationMarker, HiPhotograph, HiRefresh, HiCalendar,
  HiMail, HiChevronDown, HiChevronUp, HiX, HiEye,
  HiExclamationCircle
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:    { label: "Draft",    badge: "bg-gray-100 text-gray-600 border border-gray-200",          icon: HiDocumentText    },
  pending:  { label: "Pending",  badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",     icon: HiClock           },
  accepted: { label: "Accepted", badge: "bg-green-50 text-green-700 border border-green-200",        icon: HiCheckCircle     },
  rejected: { label: "Rejected", badge: "bg-red-50 text-red-700 border border-red-200",              icon: HiXCircle         },
};

const FILTERS = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

const fmtDate = d => d
  ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const fmtRWF = n => n ? `${Number(n).toLocaleString()} RWF` : "—";

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Respond Modal ─────────────────────────────────────────────────────────────
function RespondModal({ application, token, onClose, onDone }) {
  const [status,      setStatus]      = useState("accepted");
  const [landlordNote, setLandlordNote] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

  const handleSubmit = async () => {
    if (status === "rejected" && !landlordNote.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/lease-applications/${application.id}/respond`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ status, landlordNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to respond");
      onDone(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tenant = application.tenant;
  const prop   = application.property;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900">Review Application</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {tenant?.firstName} {tenant?.lastName} → {prop?.title}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiX className="text-xl"/>
          </button>
        </div>

        {/* Tenant summary */}
        <div className="px-6 pt-5">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-5">
            <div className="flex justify-between">
              <span className="text-gray-500">Tenant</span>
              <span className="font-bold text-gray-900">{tenant?.firstName} {tenant?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-bold text-gray-700">{tenant?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Move-in Date</span>
              <span className="font-bold text-gray-700">{fmtDate(application.moveInDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-bold text-gray-700">{application.duration} months</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="shrink-0"/> {error}
            </div>
          )}

          {/* Decision */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Decision *</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStatus("accepted")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border-2 transition ${
                  status === "accepted" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"
                }`}>
                <HiCheckCircle/> Accept
              </button>
              <button onClick={() => setStatus("rejected")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border-2 transition ${
                  status === "rejected" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-500 hover:border-red-300"
                }`}>
                <HiXCircle/> Reject
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Note to Tenant {status === "accepted" ? "(recommended)" : "(required)"}
            </label>
            <textarea value={landlordNote} onChange={e => setLandlordNote(e.target.value)} rows={3}
              placeholder={status === "accepted"
                ? "Welcome! Your application looks great. I will send the lease agreement within 24 hours."
                : "Thank you for applying. Unfortunately we cannot proceed because..."}
              className={`${inp} resize-none`}/>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className={`flex-1 py-3 rounded-xl text-sm font-black text-white transition disabled:opacity-60 flex items-center justify-center gap-2 ${
                status === "accepted" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</>
                : status === "accepted" ? "Accept Application" : "Reject Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail Drawer (view full application) ────────────────────────────────────
function DetailDrawer({ application: app, onClose, onRespond }) {
  const tenant = app.tenant;
  const prop   = app.property;
  const cfg    = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const Icon   = cfg.icon;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-black text-gray-900 text-lg">Application Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiX className="text-xl"/>
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1">
          {/* Status */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${cfg.badge}`}>
            <Icon className="text-xs"/> {cfg.label}
          </span>

          {/* Property */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="h-32 bg-gray-200">
              {prop?.mainImage
                ? <img src={prop.mainImage} alt={prop.title} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-4xl"/></div>
              }
            </div>
            <div className="p-4">
              <p className="font-black text-gray-900">{prop?.title}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <HiLocationMarker/> {prop?.district}{prop?.sector ? `, ${prop.sector}` : ""}
              </p>
              <p className="text-sm font-black text-blue-600 mt-1">{fmtRWF(prop?.rentAmount)}/mo</p>
            </div>
          </div>

          {/* Tenant */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tenant</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                  {tenant?.firstName?.[0]}{tenant?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-black text-gray-900">{tenant?.firstName} {tenant?.lastName}</p>
                  <p className="text-xs text-gray-400">{tenant?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lease details */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Lease Details</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              {[
                { label: "Move-in Date", value: fmtDate(app.moveInDate) },
                { label: "Duration",     value: `${app.duration} months` },
                { label: "Applied",      value: fmtDate(app.createdAt)  },
                { label: "Responded",    value: fmtDate(app.respondedAt) },
              ].map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {app.message && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tenant Message</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                {app.message}
              </div>
            </div>
          )}

          {/* Landlord note */}
          {app.landlordNote && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Your Note</p>
              <div className={`rounded-xl p-4 text-sm leading-relaxed border ${
                app.status === "accepted" ? "bg-green-50 border-green-200 text-green-700" : "bg-orange-50 border-orange-200 text-orange-700"
              }`}>
                {app.landlordNote}
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        {app.status === "pending" && (
          <div className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
            <button onClick={() => { onClose(); onRespond(app); }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition">
              Review & Respond
            </button>
          </div>
        )}
        {app.status === "accepted" && (
          <div className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
            <div className="flex items-center gap-2 text-sm text-green-700 font-bold bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <HiCheckCircle/> Accepted — create lease from Agreements tab
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Table Row ────────────────────────────────────────────────────────────────
function AppRow({ app, onView, onRespond }) {
  const cfg    = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const Icon   = cfg.icon;
  const tenant = app.tenant;
  const prop   = app.property;

  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition group">

      {/* Tenant — col 3 */}
      <div className="col-span-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-[11px] font-black text-blue-600">
          {tenant?.firstName?.[0]}{tenant?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{tenant?.firstName} {tenant?.lastName}</p>
          <p className="text-[10px] text-gray-400 truncate">{tenant?.email}</p>
        </div>
      </div>

      {/* Property — col 3 */}
      <div className="col-span-3 flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
          {prop?.mainImage
            ? <img src={prop.mainImage} alt="" className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-sm"/></div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-700 truncate font-medium">{prop?.title || "—"}</p>
          <p className="text-[10px] text-gray-400 truncate flex items-center gap-0.5">
            <HiLocationMarker className="shrink-0 text-[9px]"/>{prop?.district}
          </p>
        </div>
      </div>

      {/* Move-in — col 2 */}
      <div className="col-span-2 text-xs text-gray-500">
        <p className="flex items-center gap-1"><HiCalendar className="text-gray-400 shrink-0"/>{fmtDate(app.moveInDate)}</p>
        <p className="text-gray-400 mt-0.5">{app.duration} months</p>
      </div>

      {/* Rent — col 1 */}
      <div className="col-span-1 text-xs font-bold text-blue-600">
        {fmtRWF(prop?.rentAmount)}
      </div>

      {/* Status — col 2 */}
      <div className="col-span-2">
        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${cfg.badge}`}>
          <Icon className="text-[10px]"/> {cfg.label}
        </span>
      </div>

      {/* Actions — col 1 */}
      <div className="col-span-1 flex items-center justify-end gap-1.5">
        <button onClick={() => onView(app)} title="View details"
          className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition">
          <HiEye className="text-sm"/>
        </button>
        {app.status === "pending" && (
          <button onClick={() => onRespond(app)} title="Respond"
            className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <HiCheckCircle className="text-sm"/>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main LDApplications ───────────────────────────────────────────────────────
export default function LDApplications({ token }) {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");
  const [responding,   setResponding]   = useState(null);
  const [viewing,      setViewing]      = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/lease-applications/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const handleDone = updated => {
    setApplications(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
    setResponding(null);
  };

  const filtered = filter === "all"
    ? applications
    : applications.filter(a => a.status === filter);

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === "pending").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  return (
    <>
      {responding && (
        <RespondModal
          application={responding}
          token={token}
          onClose={() => setResponding(null)}
          onDone={handleDone}
        />
      )}
      {viewing && (
        <DetailDrawer
          application={viewing}
          onClose={() => setViewing(null)}
          onRespond={app => { setViewing(null); setResponding(app); }}
        />
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900">Lease Applications</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review and respond to tenant applications for your properties
            </p>
          </div>
          <button onClick={load}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-semibold transition">
            <HiRefresh/> Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === f.key ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
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
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
            <div className="col-span-3">Tenant</div>
            <div className="col-span-3">Property</div>
            <div className="col-span-2">Move-in</div>
            <div className="col-span-1">Rent</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center animate-pulse">
                  <div className="col-span-3 flex items-center gap-2">
                    <Skeleton circle width={32} height={32}/>
                    <div><Skeleton width={100} height={12} borderRadius={6}/><Skeleton width={80} height={10} borderRadius={6} className="mt-1"/></div>
                  </div>
                  <div className="col-span-3"><Skeleton width={120} height={12} borderRadius={6}/></div>
                  <div className="col-span-2"><Skeleton width={80} height={12} borderRadius={6}/></div>
                  <div className="col-span-1"><Skeleton width={60} height={12} borderRadius={6}/></div>
                  <div className="col-span-2"><Skeleton width={70} height={22} borderRadius={20}/></div>
                  <div className="col-span-1 flex justify-end gap-1"><Skeleton circle width={28} height={28}/></div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-600 font-bold">
                  {filter === "all" ? "No applications yet" : `No ${filter} applications`}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === "all"
                    ? "Applications from tenants will appear here once they apply for your properties"
                    : "Applications with this status will appear here"}
                </p>
              </div>
            ) : (
              filtered.map(app => (
                <AppRow
                  key={app.id}
                  app={app}
                  onView={setViewing}
                  onRespond={setResponding}
                />
              ))
            )}
          </div>
        </div>

        {/* Summary footer */}
        {!loading && applications.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Showing {filtered.length} of {applications.length} applications
          </p>
        )}
      </div>
    </>
  );
}