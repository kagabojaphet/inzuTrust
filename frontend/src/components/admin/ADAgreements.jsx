// src/components/admin/ADAgreements.jsx
// Admin view: all agreements across platform — view, force-terminate, handle termination disputes
import { useState, useEffect, useCallback } from "react";
import { HiDocumentText, HiX, HiCheck, HiSearch, HiChevronDown, HiExclamationCircle } from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ADPageHeader  from "./shared/ADPageHeader";
import ADStatusBadge from "./shared/ADStatusBadge";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization:`Bearer ${tk}`, "Content-Type":"application/json" });
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtRWF  = n => n ? `RWF ${Number(n).toLocaleString()}` : "—";

const FILTERS = [
  {val:"",                  label:"All"},
  {val:"pending_signature", label:"Pending"},
  {val:"signed",            label:"Signed"},
  {val:"terminated",        label:"Terminated"},
  {val:"expired",           label:"Expired"},
  {val:"termination_requested", label:"Term. Requested"},
];

// ── Agreement detail drawer ───────────────────────────────────────────────────
function AgreementDrawer({ agreement: a, token, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [reason,  setReason]  = useState("");
  const [tab,     setTab]     = useState("details");

  const forceTerminate = async () => {
    if (!reason.trim()) { alert("Please provide a reason."); return; }
    if (!confirm("Force-terminate this agreement?")) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/agreements/${a.id}/terminate`, {
        method:"PUT", headers: hdrs(token),
        body: JSON.stringify({ reason, forceByAdmin: true }),
      });
      const data = await res.json();
      if (data.success) { onUpdated(); onClose(); }
      else alert(data.message);
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  const resolveTermination = async (approve) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/agreements/${a.id}/termination/resolve`, {
        method:"PUT", headers: hdrs(token),
        body: JSON.stringify({ approve, adminNote: reason }),
      });
      const data = await res.json();
      if (data.success) { onUpdated(); onClose(); }
      else alert(data.message);
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="absolute inset-0" onClick={onClose}/>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-black text-gray-900">Agreement #{a.docId}</h3>
            <p className="text-xs text-gray-400">Admin View</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          {["details","actions"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5 flex-1">
          {tab === "details" ? (
            <>
              <ADStatusBadge status={a.status}/>

              {/* Parties */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Parties</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  {[
                    { role:"Landlord", name:a.landlordName || `${a.landlord?.firstName} ${a.landlord?.lastName}`, email:a.landlord?.email },
                    { role:"Tenant",   name:a.tenantName   || `${a.tenant?.firstName} ${a.tenant?.lastName}`,   email:a.tenant?.email   },
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
                    { label:"Property",  value: a.property?.title || a.propertyAddress || "—" },
                    { label:"Rent",      value: fmtRWF(a.rentAmount) },
                    { label:"Duration",  value: `${a.leaseDuration} months` },
                    { label:"Start",     value: fmtDate(a.startDate)   },
                    { label:"End",       value: fmtDate(a.endDate)     },
                    { label:"Signed At", value: fmtDate(a.signedAt)    },
                  ].map((r,i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{r.label}</span>
                      <span className="font-bold text-gray-900">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Termination request if pending */}
              {a.terminationRequest && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-orange-600 mb-2">⚠️ Termination Request</p>
                  <p className="text-xs text-orange-800 font-semibold">Requested by: {a.terminationRequest.requestedByRole}</p>
                  <p className="text-xs text-orange-700 mt-1">{a.terminationRequest.reason}</p>
                  <p className="text-xs text-orange-500 mt-1">Proposed date: {fmtDate(a.terminationRequest.proposedDate)}</p>
                </div>
              )}
            </>
          ) : (
            /* Actions tab */
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Admin Actions</p>

              {/* Resolve termination request */}
              {a.status === "termination_requested" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-black text-orange-800">Termination Dispute Pending</p>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                    placeholder="Admin note (optional)..."
                    className="w-full border border-orange-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none resize-none"/>
                  <div className="flex gap-2">
                    <button onClick={() => resolveTermination(true)} disabled={loading}
                      className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-1">
                      <HiCheck/> Approve Termination
                    </button>
                    <button onClick={() => resolveTermination(false)} disabled={loading}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 disabled:opacity-60 transition flex items-center justify-center gap-1">
                      <HiX/> Reject Request
                    </button>
                  </div>
                </div>
              )}

              {/* Force terminate */}
              {["signed","active","termination_requested"].includes(a.status) && (
                <div className="border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-black text-red-700 flex items-center gap-1.5"><HiExclamationCircle/> Force Terminate</p>
                  <p className="text-xs text-gray-500">Immediately terminates the agreement. Use for legal reasons or admin override.</p>
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
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400 font-semibold">
                  This agreement is already {a.status}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function AgreementRow({ a, onView }) {
  return (
    <div className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.8fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-mono font-bold text-gray-700">#{a.docId}</p>
        <p className="text-[10px] text-gray-400 truncate">{a.property?.title || a.propertyAddress || "—"}</p>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{a.landlordName || `${a.landlord?.firstName} ${a.landlord?.lastName}`}</p>
        <p className="text-[10px] text-gray-400">→ {a.tenantName || `${a.tenant?.firstName} ${a.tenant?.lastName}`}</p>
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
        className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
        View
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ADAgreements({ token }) {
  const [agreements, setAgreements] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("");
  const [viewing,    setViewing]    = useState(null);

  const stats = {
    total:      agreements.length,
    signed:     agreements.filter(a => a.status === "signed").length,
    pending:    agreements.filter(a => a.status === "pending_signature").length,
    terminated: agreements.filter(a => a.status === "terminated").length,
    disputed:   agreements.filter(a => a.status === "termination_requested").length,
  };

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/agreements/all`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) setAgreements(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = agreements.filter(a => {
    const q = search.toLowerCase();
    const matchS = !statusF || a.status === statusF;
    const matchQ = !q ||
      a.docId?.toLowerCase().includes(q) ||
      a.landlordName?.toLowerCase().includes(q) ||
      a.tenantName?.toLowerCase().includes(q)   ||
      a.property?.title?.toLowerCase().includes(q);
    return matchS && matchQ;
  });

  return (
    <div className="space-y-5">
      {viewing && <AgreementDrawer agreement={viewing} token={token} onClose={() => setViewing(null)} onUpdated={load}/>}

      <ADPageHeader title="Agreements" sub="All lease agreements across the platform" onRefresh={load} loading={loading}>
        {stats.disputed > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black rounded-xl">
            <HiExclamationCircle/> {stats.disputed} Dispute{stats.disputed>1?"s":""} Pending
          </span>
        )}
      </ADPageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Total",      value:stats.total,      color:"bg-blue-500"   },
          { label:"Signed",     value:stats.signed,     color:"bg-green-500"  },
          { label:"Pending",    value:stats.pending,    color:"bg-yellow-500" },
          { label:"Terminated", value:stats.terminated, color:"bg-red-500"    },
          { label:"Disputes",   value:stats.disputed,   color:"bg-orange-500" },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 px-4 py-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <HiDocumentText className="text-white text-base"/>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
              {loading ? <Skeleton width={30} height={20}/> : <p className="text-xl font-black text-gray-900">{s.value}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.8fr_auto] gap-4 px-5 py-3.5 bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-400">
          <div>Document</div><div>Parties</div><div>Rent</div><div>Period</div><div>Status</div><div>Action</div>
        </div>
        <div>
          {loading ? (
            Array.from({length:5}).map((_,i) => (
              <div key={i} className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.8fr_auto] gap-4 px-5 py-4 items-center border-b border-gray-50">
                {Array.from({length:6}).map((_,j) => <Skeleton key={j} height={14} borderRadius={6}/>)}
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
              <p className="text-gray-500 font-bold">{search||statusF ? "No agreements match" : "No agreements yet"}</p>
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