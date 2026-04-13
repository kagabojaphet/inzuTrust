// src/components/admin/ADAgreements.jsx
// Admin: all agreements, termination dispute resolution, force-terminate
import { useState, useEffect, useCallback } from "react";
import {
  HiDocumentText, HiX, HiCheck, HiSearch,
  HiChevronDown, HiExclamationCircle, HiClock,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ADPageHeader  from "./shared/ADPageHeader";
import ADStatusBadge from "./shared/ADStatusBadge";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization:`Bearer ${tk}`, "Content-Type":"application/json" });
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtRWF  = n => n ? `RWF ${Number(n).toLocaleString()}` : "—";
const safeTermReq = (raw) => { try { return raw ? JSON.parse(raw) : {}; } catch { return {}; } };

const FILTERS = [
  {val:"",                       label:"All"           },
  {val:"pending_signature",      label:"Pending Sig."  },
  {val:"signed",                 label:"Signed"        },
  {val:"termination_requested",  label:"⚠️ Disputes"   },
  {val:"terminated",             label:"Terminated"    },
  {val:"expired",                label:"Expired"       },
];

// ── Detail + Actions drawer ────────────────────────────────────────────────
function AgreementDrawer({ agreement: a, token, onClose, onUpdated }) {
  const [loading,  setLoading]  = useState(false);
  const [reason,   setReason]   = useState("");
  const [tab,      setTab]      = useState("details");
  const [error,    setError]    = useState("");

  const termReq = safeTermReq(a.terminationRequest);

  const forceTerminate = async () => {
    if (!reason.trim()) { setError("Please provide a reason."); return; }
    if (!window.confirm("Force-terminate this agreement? This cannot be undone.")) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/agreements/${a.id}/terminate`, {
        method:"PUT", headers: hdrs(token),
        body: JSON.stringify({ reason, forceByAdmin: true }),
      });
      const data = await res.json();
      if (data.success) { onUpdated(); onClose(); }
      else setError(data.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const resolveTermination = async (approve) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/agreements/${a.id}/termination/resolve`, {
        method:"PUT", headers: hdrs(token),
        body: JSON.stringify({ approve, adminNote: reason }),
      });
      const data = await res.json();
      if (data.success) { onUpdated(); onClose(); }
      else setError(data.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="absolute inset-0" onClick={onClose}/>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-black text-gray-900">Agreement #{a.docId}</h3>
            <p className="text-xs text-gray-400">Admin Controls</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 shrink-0">
          {["details","actions"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {t}
              {t === "actions" && a.status === "termination_requested" && (
                <span className="ml-1 inline-flex w-4 h-4 bg-orange-500 text-white text-[8px] rounded-full items-center justify-center">!</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="shrink-0"/> {error}
            </div>
          )}

          {tab === "details" && (
            <>
              <ADStatusBadge status={a.status}/>

              {/* Parties */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Parties</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  {[
                    { role:"Landlord", name: a.landlordName || `${a.landlord?.firstName||""} ${a.landlord?.lastName||""}`, email: a.landlord?.email },
                    { role:"Tenant",   name: a.tenantName   || `${a.tenant?.firstName||""} ${a.tenant?.lastName||""}`,     email: a.tenant?.email   },
                  ].map((r,i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400 font-semibold w-20 shrink-0">{r.role}</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lease info */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Lease Details</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-100">
                  {[
                    { label:"Property",   value: a.property?.title || a.propertyAddress || "—" },
                    { label:"Rent",       value: fmtRWF(a.rentAmount) },
                    { label:"Duration",   value: `${a.leaseDuration} months` },
                    { label:"Start",      value: fmtDate(a.startDate) },
                    { label:"End",        value: fmtDate(a.endDate)   },
                    { label:"Signed At",  value: fmtDate(a.signedAt)  },
                    { label:"Landlord ✓", value: a.landlordSigned ? "Yes" : "No" },
                    { label:"Tenant ✓",   value: a.tenantSigned   ? "Yes" : "No" },
                  ].map((r,i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{r.label}</span>
                      <span className="font-bold text-gray-900">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Termination request details */}
              {a.terminationRequest && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Termination Request</p>
                  <div className={`rounded-xl p-4 border space-y-2 ${
                    termReq.disputed ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
                  }`}>
                    <div className="flex items-center gap-2">
                      {termReq.disputed ? <HiExclamationCircle className="text-red-500"/> : <HiClock className="text-orange-500"/>}
                      <p className={`text-xs font-black ${termReq.disputed ? "text-red-700" : "text-orange-700"}`}>
                        {termReq.disputed ? "Disputed — Admin Review Required" : "Pending Response"}
                      </p>
                    </div>
                    {[
                      { label:"Requested By",   value: termReq.requestedByRole },
                      { label:"Reason",         value: termReq.reason },
                      { label:"Proposed Date",  value: fmtDate(termReq.proposedDate) },
                      { label:"Requested At",   value: fmtDate(termReq.requestedAt) },
                      termReq.disputed && { label:"Counter Reason", value: termReq.counterReason },
                    ].filter(Boolean).map((r,i) => r && (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-500 font-semibold">{r.label}</span>
                        <span className="font-bold text-gray-800 max-w-[60%] text-right">{r.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "actions" && (
            <div className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Admin Actions</p>

              {/* Resolve disputed termination */}
              {a.status === "termination_requested" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-black text-orange-800 flex items-center gap-2">
                    <HiExclamationCircle/> Termination Dispute — Your Decision
                  </p>
                  <p className="text-xs text-orange-700 leading-relaxed">
                    <strong>Requested by:</strong> {termReq.requestedByRole || "—"}<br/>
                    <strong>Reason:</strong> {termReq.reason || "None given"}<br/>
                    {termReq.disputed && <><strong>Disputed:</strong> {termReq.counterReason || "No counter-reason"}</>}
                  </p>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                    placeholder="Admin note to both parties (optional)..."
                    className="w-full border border-orange-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none resize-none"/>
                  <div className="flex gap-2">
                    <button onClick={() => resolveTermination(true)} disabled={loading}
                      className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-1">
                      <HiCheck/> Approve — Terminate
                    </button>
                    <button onClick={() => resolveTermination(false)} disabled={loading}
                      className="flex-1 py-2.5 bg-gray-700 text-white rounded-xl text-xs font-black hover:bg-gray-800 disabled:opacity-60 transition flex items-center justify-center gap-1">
                      <HiX/> Reject — Keep Active
                    </button>
                  </div>
                </div>
              )}

              {/* Force terminate (any active agreement) */}
              {["signed","pending_signature","termination_requested"].includes(a.status) && (
                <div className="border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-black text-red-700 flex items-center gap-1.5">
                    <HiExclamationCircle/> Force Terminate (Admin Override)
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Immediately terminates the agreement. Both parties are notified. Use only for legal or administrative reasons.
                  </p>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                    placeholder="Reason for termination (required)..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none resize-none"/>
                  <button onClick={forceTerminate} disabled={loading || !reason.trim()}
                    className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 disabled:opacity-50 transition">
                    {loading ? "Processing..." : "Force Terminate Agreement"}
                  </button>
                </div>
              )}

              {["terminated","expired"].includes(a.status) && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-400 font-semibold">
                    This agreement is already <strong>{a.status}</strong>. No further actions available.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Table row ──────────────────────────────────────────────────────────────
function AgreementRow({ a, onView }) {
  const termReq = safeTermReq(a.terminationRequest);
  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.9fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition">
        <div className="min-w-0">
          <p className="text-xs font-mono font-bold text-gray-700">#{a.docId}</p>
          <p className="text-[10px] text-gray-400 truncate">{a.property?.title || a.propertyAddress || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{a.landlordName || `${a.landlord?.firstName||""} ${a.landlord?.lastName||""}`}</p>
          <p className="text-[10px] text-gray-400 truncate">→ {a.tenantName || `${a.tenant?.firstName||""} ${a.tenant?.lastName||""}`}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">{fmtRWF(a.rentAmount)}<span className="font-normal text-gray-400">/mo</span></p>
          <p className="text-[10px] text-gray-400">{a.leaseDuration} months</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">{fmtDate(a.startDate)}</p>
          <p className="text-[10px] text-gray-400">→ {fmtDate(a.endDate)}</p>
        </div>
        <ADStatusBadge status={a.status}/>
        <button onClick={() => onView(a)}
          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition whitespace-nowrap">
          {a.status === "termination_requested" ? "⚠️ Review" : "View"}
        </button>
      </div>

      {/* Inline termination info strip */}
      {a.status === "termination_requested" && (
        <div className="mx-5 mb-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <HiClock className="text-orange-400 shrink-0 text-sm"/>
          <p className="text-xs text-orange-700">
            <span className="font-bold capitalize">{termReq.requestedByRole || "Party"}</span> requested termination
            {termReq.reason ? `: ${termReq.reason.slice(0,80)}${termReq.reason.length > 80 ? "…" : ""}` : ""}
            {termReq.disputed && <span className="ml-2 font-black text-red-600">— DISPUTED</span>}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function ADAgreements({ token }) {
  const [agreements, setAgreements] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("");
  const [viewing,    setViewing]    = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/agreements/all`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) setAgreements(data.data || []);
      else console.error("[ADAgreements]", data.message);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total:      agreements.length,
    signed:     agreements.filter(a => a.status === "signed").length,
    pending:    agreements.filter(a => a.status === "pending_signature").length,
    terminated: agreements.filter(a => a.status === "terminated").length,
    disputed:   agreements.filter(a => a.status === "termination_requested").length,
  };

  const filtered = agreements.filter(a => {
    const q = search.toLowerCase();
    const matchS = !statusF || a.status === statusF;
    const matchQ = !q ||
      (a.docId||"").toLowerCase().includes(q) ||
      (a.landlordName||"").toLowerCase().includes(q) ||
      (a.tenantName||"").toLowerCase().includes(q) ||
      (a.property?.title||"").toLowerCase().includes(q) ||
      (`${a.landlord?.firstName||""} ${a.landlord?.lastName||""}`).toLowerCase().includes(q) ||
      (`${a.tenant?.firstName||""} ${a.tenant?.lastName||""}`).toLowerCase().includes(q);
    return matchS && matchQ;
  });

  return (
    <div className="space-y-5">
      {viewing && (
        <AgreementDrawer agreement={viewing} token={token} onClose={() => setViewing(null)} onUpdated={load}/>
      )}

      <ADPageHeader title="Agreements" sub="All lease agreements across the platform" onRefresh={load} loading={loading}>
        {stats.disputed > 0 && (
          <button onClick={() => setStatusF("termination_requested")}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black rounded-xl hover:bg-orange-100 transition">
            <HiExclamationCircle/> {stats.disputed} Dispute{stats.disputed > 1 ? "s" : ""} Pending
          </button>
        )}
      </ADPageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Total",      value:stats.total,      color:"bg-blue-500",   onClick: () => setStatusF("")                       },
          { label:"Signed",     value:stats.signed,     color:"bg-green-500",  onClick: () => setStatusF("signed")                 },
          { label:"Pending",    value:stats.pending,    color:"bg-yellow-500", onClick: () => setStatusF("pending_signature")       },
          { label:"Terminated", value:stats.terminated, color:"bg-red-500",    onClick: () => setStatusF("terminated")             },
          { label:"Disputes",   value:stats.disputed,   color:"bg-orange-500", onClick: () => setStatusF("termination_requested")  },
        ].map((s,i) => (
          <button key={i} onClick={s.onClick}
            className={`bg-white rounded-2xl border border-gray-200 px-4 py-3.5 flex items-center gap-3 hover:shadow-sm transition text-left ${
              statusF === (i===0?"":i===1?"signed":i===2?"pending_signature":i===3?"terminated":"termination_requested") ? "ring-2 ring-blue-300" : ""
            }`}>
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <HiDocumentText className="text-white text-base"/>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
              {loading ? <Skeleton width={30} height={20}/> : <p className="text-xl font-black text-gray-900">{s.value}</p>}
            </div>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by doc ID, landlord, tenant, property..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"/>
        </div>
        <div className="relative">
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none cursor-pointer">
            {FILTERS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
          </select>
          <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"/>
        </div>
        {(search || statusF) && (
          <button onClick={() => { setSearch(""); setStatusF(""); }}
            className="text-xs text-blue-600 font-bold hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.9fr_auto] gap-4 px-5 py-3.5 bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-400">
          <div>Document</div><div>Parties</div><div>Rent</div><div>Period</div><div>Status</div><div>Action</div>
        </div>
        <div>
          {loading ? (
            Array.from({length:5}).map((_,i) => (
              <div key={i} className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.9fr_auto] gap-4 px-5 py-4 items-center border-b border-gray-50">
                {Array.from({length:6}).map((_,j) => <Skeleton key={j} height={14} borderRadius={6}/>)}
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
              <p className="text-gray-500 font-bold">
                {search || statusF ? "No agreements match your filters" : "No agreements yet"}
              </p>
              {(search || statusF) && (
                <button onClick={() => { setSearch(""); setStatusF(""); }}
                  className="mt-3 text-xs text-blue-600 font-bold hover:underline">Clear filters</button>
              )}
            </div>
          ) : (
            filtered.map(a => <AgreementRow key={a.id} a={a} onView={setViewing}/>)
          )}
        </div>
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{" "}
          <span className="font-bold text-gray-600">{agreements.length}</span> agreements
        </p>
      )}
    </div>
  );
}