// src/components/tenant/TenantApplications.jsx
import React, { useState, useEffect } from "react";
import {
  HiClock, HiCheckCircle, HiXCircle, HiDocumentText,
  HiLocationMarker, HiRefresh, HiPhotograph, HiEye,
  HiX, HiCalendar, HiOfficeBuilding, HiShieldCheck
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:    { label: "Draft",    badge: "bg-gray-100 text-gray-600 border border-gray-200",        icon: HiDocumentText },
  pending:  { label: "Pending",  badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",   icon: HiClock        },
  accepted: { label: "Accepted", badge: "bg-green-50 text-green-700 border border-green-200",      icon: HiCheckCircle  },
  rejected: { label: "Rejected", badge: "bg-red-50 text-red-700 border border-red-200",            icon: HiXCircle      },
};

const FILTERS = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

const fmtDate = d => d
  ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const fmtRWF = n => n ? `${Number(n).toLocaleString()} RWF` : "—";

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ app, onClose }) {
  const cfg  = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  const prop = app.property;
  const imgUrl = prop?.mainImage || parseImages(prop?.images)[0] || null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-black text-gray-900 text-lg">Application Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <HiX className="text-xl"/>
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1">

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${cfg.badge}`}>
            <Icon className="text-xs"/> {cfg.label}
          </span>

          {/* Property card */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <div className="h-36 bg-gray-200">
              {imgUrl
                ? <img src={imgUrl} alt={prop?.title} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center">
                    <HiPhotograph className="text-gray-300 text-4xl"/>
                  </div>
              }
            </div>
            <div className="p-4">
              <p className="font-black text-gray-900">{prop?.title || "Property"}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <HiLocationMarker/> {prop?.district}{prop?.sector ? `, ${prop.sector}` : ""}
              </p>
              {prop?.rentAmount && (
                <p className="text-sm font-black text-blue-600 mt-1">{fmtRWF(prop.rentAmount)}/mo</p>
              )}
            </div>
          </div>

          {/* Lease details */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Lease Details</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              {[
                { label: "Move-in Date", value: fmtDate(app.moveInDate)  },
                { label: "Duration",     value: `${app.duration} months`  },
                { label: "Applied On",   value: fmtDate(app.createdAt)   },
                { label: "Responded",    value: fmtDate(app.respondedAt) },
              ].map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Your message */}
          {app.message && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Your Message</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                {app.message}
              </div>
            </div>
          )}

          {/* Landlord note */}
          {app.landlordNote && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Landlord Note</p>
              <div className={`rounded-xl p-4 text-sm leading-relaxed border ${
                app.status === "accepted"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-orange-50 border-orange-200 text-orange-700"
              }`}>
                {app.landlordNote}
              </div>
            </div>
          )}

          {/* Next step hint */}
          {app.status === "accepted" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <HiShieldCheck className="text-blue-500 text-xl shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-black text-blue-800">Next Step</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                  Your application was accepted! Check the <strong>Agreements</strong> tab — your landlord will send you a lease to review and sign.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Table Row ────────────────────────────────────────────────────────────────
function AppRow({ app, onView }) {
  const cfg    = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;
  const Icon   = cfg.icon;
  const prop   = app.property;
  const imgUrl = prop?.mainImage || parseImages(prop?.images)[0] || null;

  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">

      {/* Property — col 4 */}
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
          {imgUrl
            ? <img src={imgUrl} alt={prop?.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center">
                <HiOfficeBuilding className="text-gray-300 text-lg"/>
              </div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{prop?.title || "Property"}</p>
          <p className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate">
            <HiLocationMarker className="shrink-0 text-[9px]"/>
            {prop?.district}{prop?.sector ? `, ${prop.sector}` : ""}
          </p>
        </div>
      </div>

      {/* Rent — col 2 */}
      <div className="col-span-2 text-sm font-bold text-blue-600">
        {fmtRWF(prop?.rentAmount)}
      </div>

      {/* Move-in — col 2 */}
      <div className="col-span-2 text-xs text-gray-500">
        <p className="flex items-center gap-1">
          <HiCalendar className="text-gray-400 shrink-0"/>{fmtDate(app.moveInDate)}
        </p>
        <p className="text-gray-400 mt-0.5">{app.duration} months</p>
      </div>

      {/* Status — col 2 */}
      <div className="col-span-2">
        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${cfg.badge}`}>
          <Icon className="text-[10px]"/> {cfg.label}
        </span>
      </div>

      {/* Applied — col 1 */}
      <div className="col-span-1 text-[10px] text-gray-400">
        {fmtDate(app.createdAt)}
      </div>

      {/* Actions — col 1 */}
      <div className="col-span-1 flex items-center justify-end">
        <button onClick={() => onView(app)} title="View details"
          className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition">
          <HiEye className="text-sm"/>
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TenantApplications({ token, onBrowse }) {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");
  const [viewing,      setViewing]      = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/lease-applications/my`, {
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
      {viewing && <DetailDrawer app={viewing} onClose={() => setViewing(null)}/>}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
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
          <button onClick={load}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-semibold transition">
            <HiRefresh/> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
            <div className="col-span-4">Property</div>
            <div className="col-span-2">Rent</div>
            <div className="col-span-2">Move-in</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Applied</div>
            <div className="col-span-1 text-right">View</div>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <Skeleton width={40} height={40} borderRadius={12}/>
                    <div><Skeleton width={100} height={12} borderRadius={6}/><Skeleton width={70} height={10} borderRadius={6} className="mt-1"/></div>
                  </div>
                  <div className="col-span-2"><Skeleton width={70} height={12} borderRadius={6}/></div>
                  <div className="col-span-2"><Skeleton width={80} height={12} borderRadius={6}/></div>
                  <div className="col-span-2"><Skeleton width={70} height={22} borderRadius={20}/></div>
                  <div className="col-span-1"><Skeleton width={50} height={10} borderRadius={6}/></div>
                  <div className="col-span-1 flex justify-end"><Skeleton circle width={28} height={28}/></div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-600 font-bold">
                  {filter === "all" ? "No applications yet" : `No ${filter} applications`}
                </p>
                <p className="text-sm text-gray-400 mt-1 mb-5">
                  {filter === "all"
                    ? "Browse available properties and apply for the one you like"
                    : "Your applications with this status will appear here"}
                </p>
                {filter === "all" && (
                  <button onClick={onBrowse}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition">
                    Browse Properties
                  </button>
                )}
              </div>
            ) : (
              filtered.map(app => (
                <AppRow key={app.id} app={app} onView={setViewing}/>
              ))
            )}
          </div>
        </div>

        {/* Summary */}
        {!loading && applications.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Showing {filtered.length} of {applications.length} applications
          </p>
        )}
      </div>
    </>
  );
}