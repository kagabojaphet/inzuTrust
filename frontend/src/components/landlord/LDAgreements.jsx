// src/components/landlord/LDAgreements.jsx
// Table layout — matches LDProperties style exactly
import React, { useEffect, useState, useCallback } from "react";
import {
  HiPlus, HiDocumentText, HiRefresh, HiSearch,
  HiCheckCircle, HiClock, HiExclamationCircle,
  HiEye, HiDotsVertical, HiShieldCheck,
  HiChevronDown, HiLocationMarker, HiX,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

import CreateLeaseWizard from "./agreements/CreateLeaseWizard";
import TerminateModal    from "../shared/TerminateModal";

const hdrs    = tk => ({ Authorization: `Bearer ${tk}` });
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—";
const fmtRWF  = n => n ? `RWF ${Number(n).toLocaleString()}` : "—";
const initials = (f="", l="") => `${(f||"")[0]||""}${(l||"")[0]||""}`.toUpperCase() || "?";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  signed:                { label:"Signed",      style:"bg-green-50 text-green-700 border-green-200",   dot:"bg-green-500"  },
  pending_signature:     { label:"Pending Sig", style:"bg-blue-50 text-blue-700 border-blue-200",      dot:"bg-blue-500"   },
  draft:                 { label:"Draft",       style:"bg-gray-100 text-gray-500 border-gray-200",     dot:"bg-gray-400"   },
  termination_requested: { label:"Terminating", style:"bg-orange-50 text-orange-700 border-orange-200",dot:"bg-orange-500" },
  terminated:            { label:"Terminated",  style:"bg-red-50 text-red-700 border-red-200",         dot:"bg-red-500"    },
  expired:               { label:"Expired",     style:"bg-amber-50 text-amber-700 border-amber-200",   dot:"bg-amber-500"  },
};
const getCfg = raw => STATUS[raw] || STATUS.draft;

// ── Actions menu ──────────────────────────────────────────────────────────────
function ActionsMenu({ agreement, onView, onTerminate, userId }) {
  const [open, setOpen] = useState(false);
  const canTerminate = ["signed"].includes(agreement.status);
  const canRespond   = agreement.status === "termination_requested";

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
        <HiDotsVertical/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl w-40 py-1 overflow-hidden">
            <button onClick={() => { onView(agreement); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
              <HiEye className="text-gray-400 shrink-0"/> View
            </button>
            {(canTerminate || canRespond) && (
              <button onClick={() => { onTerminate(agreement); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                <HiX className="text-red-400 shrink-0"/>
                {canRespond ? "Respond" : "Terminate"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Stat cards ────────────────────────────────────────────────────────────────
function StatCards({ agreements, loading }) {
  const stats = [
    { label:"Total",    value:agreements.length,                                              iconBg:"bg-blue-500",   icon:HiDocumentText      },
    { label:"Active",   value:agreements.filter(a=>a.status==="signed").length,               iconBg:"bg-green-500",  icon:HiShieldCheck       },
    { label:"Pending",  value:agreements.filter(a=>a.status==="pending_signature").length,    iconBg:"bg-amber-500",  icon:HiClock             },
    { label:"Issues",   value:agreements.filter(a=>["termination_requested","terminated"].includes(a.status)).length, iconBg:"bg-red-500", icon:HiExclamationCircle },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s,i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
            <s.icon className="text-xl text-white"/>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            {loading
              ? <Skeleton width={40} height={24} borderRadius={6}/>
              : <p className="text-2xl font-black text-gray-900 leading-tight">{s.value}</p>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Table row skeleton ────────────────────────────────────────────────────────
function RowSkeleton() {
  return (
    <div className="grid gap-4 px-5 py-4 items-center border-b border-gray-50"
      style={{ gridTemplateColumns:"2fr 1.5fr 120px 130px 110px 100px 80px" }}>
      <div className="flex items-center gap-3">
        <Skeleton width={32} height={32} borderRadius={99}/>
        <div><Skeleton width={100} height={13} borderRadius={6}/><Skeleton width={70} height={10} borderRadius={6} className="mt-1"/></div>
      </div>
      <div className="flex items-center gap-2"><Skeleton width={32} height={32} borderRadius={8}/><Skeleton width={90} height={12} borderRadius={6}/></div>
      <Skeleton width={80} height={12} borderRadius={6}/>
      <Skeleton width={90} height={12} borderRadius={6}/>
      <Skeleton width={70} height={12} borderRadius={6}/>
      <Skeleton width={80} height={22} borderRadius={20}/>
      <div className="flex justify-end"><Skeleton circle width={28} height={28}/></div>
    </div>
  );
}

// ── Agreement table row ───────────────────────────────────────────────────────
function AgreementRow({ agreement: a, onView, onTerminate, userId }) {
  const cfg = getCfg(a.status);
  const tenantFirst = a.tenant?.firstName || a.tenantName?.split(" ")[0] || "Tenant";
  const tenantLast  = a.tenant?.lastName  || a.tenantName?.split(" ")[1] || "";
  const propTitle   = a.property?.title   || a.propertyAddress || "Property";
  const propDist    = a.property?.district|| a.district || "";

  return (
    <div className="grid gap-4 px-5 py-4 items-center hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
      style={{ gridTemplateColumns:"2fr 1.5fr 120px 130px 110px 100px 80px" }}>

      {/* Tenant */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
          {initials(tenantFirst, tenantLast)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{tenantFirst} {tenantLast}</p>
          <p className="text-[11px] text-gray-400 truncate">{a.tenant?.email || a.tenantEmail || "—"}</p>
        </div>
      </div>

      {/* Property */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
          {a.property?.mainImage
            ? <img src={a.property.mainImage} alt="" className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center">
                <HiDocumentText className="text-gray-300 text-xs"/>
              </div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{propTitle}</p>
          {propDist && <p className="text-[11px] text-gray-400 truncate flex items-center gap-0.5"><HiLocationMarker className="text-[10px]"/>{propDist}</p>}
        </div>
      </div>

      {/* Rent */}
      <div>
        <p className="text-sm font-black text-blue-700">{fmtRWF(a.rentAmount)}</p>
        <p className="text-[10px] text-gray-400">per month</p>
      </div>

      {/* Period */}
      <div>
        <p className="text-[11px] text-gray-700 font-medium">{fmtDate(a.startDate)}</p>
        <p className="text-[11px] text-gray-400">→ {fmtDate(a.endDate)}</p>
      </div>

      {/* Duration */}
      <div>
        <p className="text-sm text-gray-700 font-semibold">{a.leaseDuration || "—"} mo</p>
        <p className="text-[10px] text-gray-400 font-mono">#{a.docId?.slice(-8) || a.id?.slice(0,8)}</p>
      </div>

      {/* Status */}
      <div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${cfg.style}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
          {cfg.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionsMenu agreement={a} onView={onView} onTerminate={onTerminate} userId={userId}/>
      </div>
    </div>
  );
}

// ── Agreement detail drawer ───────────────────────────────────────────────────
function AgreementDrawer({ agreement: a, onClose, onTerminate, token, userId }) {
  if (!a) return null;
  const cfg         = getCfg(a.status);
  const tenantFirst = a.tenant?.firstName || a.tenantName?.split(" ")[0] || "Tenant";
  const tenantLast  = a.tenant?.lastName  || a.tenantName?.split(" ")[1] || "";

  let termReq = null;
  try { termReq = a.terminationRequest ? JSON.parse(a.terminationRequest) : null; } catch {}
  const termDisputed = termReq?.disputed;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 flex flex-col overflow-hidden">

        {/* Drawer header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-black text-gray-900">Agreement Details</h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">#{a.docId || a.id?.slice(0,8)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition"><HiX className="text-xl"/></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Status */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border ${cfg.style}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}/>{cfg.label}
          </span>

          {/* Tenant */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tenant</p>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                {initials(tenantFirst, tenantLast)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{tenantFirst} {tenantLast}</p>
                <p className="text-xs text-gray-400">{a.tenant?.email || a.tenantEmail || "—"}</p>
              </div>
            </div>
          </div>

          {/* Property */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Property</p>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="font-bold text-gray-900 text-sm">{a.property?.title || a.propertyAddress || "—"}</p>
              {(a.property?.district || a.district) && (
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <HiLocationMarker className="text-[11px]"/>{a.property?.district || a.district}
                </p>
              )}
            </div>
          </div>

          {/* Lease terms grid */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Lease Terms</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"Monthly Rent",  value:fmtRWF(a.rentAmount) },
                { label:"Duration",      value:`${a.leaseDuration || "—"} months` },
                { label:"Start Date",    value:fmtDate(a.startDate) },
                { label:"End Date",      value:fmtDate(a.endDate) },
                { label:"Security Dep.", value:fmtRWF(a.securityDeposit) },
              ].map((d,i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{d.label}</p>
                  <p className="text-sm font-bold text-gray-900">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Signatures</p>
            <div className="flex gap-3">
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.landlordSigned?"text-green-600":"text-gray-400"}`}>
                <HiCheckCircle className={a.landlordSigned?"text-green-500":"text-gray-300"}/> You signed
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.tenantSigned?"text-green-600":"text-amber-600"}`}>
                <HiCheckCircle className={a.tenantSigned?"text-green-500":"text-amber-400"}/>
                {a.tenantSigned ? "Tenant signed" : "Awaiting tenant"}
              </div>
            </div>
          </div>

          {/* Additional terms */}
          {a.additionalTerms && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Additional Terms</p>
              <p className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5 leading-relaxed">{a.additionalTerms}</p>
            </div>
          )}

          {/* Termination info */}
          {termReq && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Termination Request</p>
              <div className={`rounded-xl px-4 py-3 border text-xs space-y-1 ${termDisputed?"bg-purple-50 border-purple-200":"bg-orange-50 border-orange-200"}`}>
                <p className={`font-bold ${termDisputed?"text-purple-700":"text-orange-700"}`}>
                  {termDisputed ? "⚠️ Disputed — Admin reviewing" : "Pending response"}
                </p>
                <p className="text-gray-600">Reason: {termReq.reason}</p>
                {termDisputed && termReq.counterReason && <p className="text-gray-600">Counter: {termReq.counterReason}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Drawer footer */}
        {["signed","termination_requested"].includes(a.status) && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button onClick={() => { onTerminate(a); onClose(); }}
              className={`w-full py-3 rounded-xl text-sm font-black transition ${
                a.status === "termination_requested"
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
              }`}>
              {a.status === "termination_requested" ? "Respond to Request" : "Request Termination"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LDAgreements({ token, user }) {
  const [agreements,  setAgreements]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("all");
  const [showWizard,  setShowWizard]  = useState(false);
  const [prefill,     setPrefill]     = useState(null);
  const [terminating, setTerminating] = useState(null);
  const [viewing,     setViewing]     = useState(null);
  const [page,        setPage]        = useState(1);
  const PAGE_SIZE = 8;

  const userId = user?.id || null;

  const fetchAgreements = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/agreements`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) setAgreements(data.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAgreements(); }, [fetchAgreements]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = agreements.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || a.tenantName?.toLowerCase().includes(q)
      || a.tenant?.firstName?.toLowerCase().includes(q)
      || a.tenant?.lastName?.toLowerCase().includes(q)
      || a.tenant?.email?.toLowerCase().includes(q)
      || a.property?.title?.toLowerCase().includes(q)
      || a.propertyAddress?.toLowerCase().includes(q)
      || a.docId?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  // Status filter tabs
  const TABS = [
    { key:"all",                    label:"All" },
    { key:"signed",                 label:"Active" },
    { key:"pending_signature",      label:"Pending" },
    { key:"termination_requested",  label:"Terminating" },
    { key:"terminated",             label:"Ended" },
  ];
  const tabCounts = {};
  TABS.forEach(t => { tabCounts[t.key] = t.key === "all" ? agreements.length : agreements.filter(a => a.status === t.key).length; });

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">

      {/* Wizard */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-4 bg-white rounded-2xl overflow-hidden">
            <CreateLeaseWizard
              token={token} user={user} prefill={prefill}
              onClose={() => { setShowWizard(false); setPrefill(null); }}
              onCreated={() => { fetchAgreements(); setShowWizard(false); setPrefill(null); }}
            />
          </div>
        </div>
      )}

      {/* Terminate modal */}
      {terminating && (
        <TerminateModal
          agreement={terminating}
          token={token}
          userId={userId}
          userRole="landlord"
          onClose={() => setTerminating(null)}
          onDone={() => { setTerminating(null); fetchAgreements(); }}
        />
      )}

      {/* Agreement drawer */}
      {viewing && (
        <AgreementDrawer
          agreement={viewing}
          onClose={() => setViewing(null)}
          onTerminate={setTerminating}
          token={token}
          userId={userId}
        />
      )}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Agreements</h2>
            <p className="text-sm text-gray-400 mt-0.5">Manage all lease agreements with your tenants</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAgreements}
              className="p-2.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition" title="Refresh">
              <HiRefresh className={loading?"animate-spin":""}/>
            </button>
            <button onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition">
              <HiPlus/> New Agreement
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatCards agreements={agreements} loading={loading}/>

        {/* Search + status filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by tenant, property, doc ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition"/>
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              {TABS.map(t => (
                <option key={t.key} value={t.key}>
                  {t.label}{tabCounts[t.key] > 0 ? ` (${tabCounts[t.key]})` : ""}
                </option>
              ))}
            </select>
            <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"/>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

          {/* Column headers */}
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400"
            style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 120px 130px 110px 100px 80px", gap:"16px" }}>
            <div>Tenant</div>
            <div>Property</div>
            <div>Rent</div>
            <div>Period</div>
            <div>Duration</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          <div>
            {loading ? (
              Array.from({length:5}).map((_,i) => <RowSkeleton key={i}/>)
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-600 font-semibold">
                  {search || statusFilter !== "all" ? "No agreements match your filters" : "No agreements yet"}
                </p>
                {!search && statusFilter === "all" && (
                  <button onClick={() => setShowWizard(true)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                    Create First Agreement
                  </button>
                )}
              </div>
            ) : (
              paginated.map(a => (
                <AgreementRow
                  key={a.id}
                  agreement={a}
                  onView={setViewing}
                  onTerminate={setTerminating}
                  userId={userId}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer: count + pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-gray-400">
              Showing <span className="font-bold text-gray-600">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span>{" "}
              of <span className="font-bold text-gray-600">{filtered.length}</span> agreements
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition text-sm font-bold">‹</button>
                {Array.from({length:totalPages},(_,i)=>i+1)
                  .filter(n => n===1||n===totalPages||Math.abs(n-page)<=1)
                  .reduce((acc,n,idx,arr) => { if(idx>0&&n-arr[idx-1]>1) acc.push("..."); acc.push(n); return acc; },[])
                  .map((n,i) => n==="..." ? (
                    <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition ${page===n?"bg-blue-600 text-white":"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {n}
                    </button>
                  ))
                }
                <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition text-sm font-bold">›</button>
              </div>
            )}
          </div>
        )}
      </div>
    </SkeletonTheme>
  );
}