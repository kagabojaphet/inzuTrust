// src/components/tenant/Maintenance.jsx
// KEY FIX: property selector now uses GET /api/agreements/my
// and falls back to fetching property list directly if agreement join is missing
import React, { useState, useEffect, useCallback } from "react";
import {
  HiPlus, HiX, HiRefresh, HiCheckCircle, HiClock,
  HiCog, HiChat, HiStar, HiChevronDown, HiSearch,
  HiExclamationCircle,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

const hdrs  = tk => ({ Authorization: `Bearer ${tk}` });
const hdrsJ = tk => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";

const PRIORITY_META = {
  emergency: { badge:"bg-red-100 text-red-700 border-red-200",         label:"Emergency" },
  high:      { badge:"bg-orange-100 text-orange-700 border-orange-200", label:"High"     },
  medium:    { badge:"bg-amber-100 text-amber-700 border-amber-200",    label:"Medium"   },
  low:       { badge:"bg-gray-100 text-gray-600 border-gray-200",      label:"Low"      },
};
const STATUS_META = {
  open:         { badge:"bg-yellow-50 text-yellow-700 border-yellow-200", icon:HiClock,            label:"Open"         },
  acknowledged: { badge:"bg-blue-50 text-blue-700 border-blue-200",       icon:HiCheckCircle,      label:"Acknowledged" },
  in_progress:  { badge:"bg-indigo-50 text-indigo-700 border-indigo-200", icon:HiCog,              label:"In Progress"  },
  resolved:     { badge:"bg-green-50 text-green-700 border-green-200",    icon:HiCheckCircle,      label:"Resolved"     },
  rejected:     { badge:"bg-red-50 text-red-600 border-red-200",          icon:HiExclamationCircle,label:"Rejected"     },
  cancelled:    { badge:"bg-gray-100 text-gray-500 border-gray-200",      icon:HiX,                label:"Cancelled"    },
};
const CATEGORIES = ["plumbing","electrical","structural","appliance","pest_control","cleaning","security","internet","other"];

// Status check — exclude known dead statuses
const DEAD = ["rejected","cancelled","expired","terminated","draft"];
const isActive = s => !s || !DEAD.includes(s.toLowerCase().trim());

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width={200} height={16} borderRadius={6}/>
        <Skeleton width={80} height={20} borderRadius={20}/>
      </div>
      <div className="flex gap-2">
        <Skeleton width={70} height={18} borderRadius={20}/>
        <Skeleton width={90} height={18} borderRadius={20}/>
      </div>
      <Skeleton width={260} height={12} borderRadius={4}/>
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <HiStar className={`text-2xl transition ${n <= value ? "text-amber-400" : "text-gray-200"}`}/>
        </button>
      ))}
    </div>
  );
}

function RequestCard({ req, token, onUpdated }) {
  const [expanded,   setExpanded]   = useState(false);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rating,     setRating]     = useState(0);
  const [ratingDone, setRatingDone] = useState(!!req.tenantRating);
  const [detail,     setDetail]     = useState(null);

  const sm = STATUS_META[req.status]     || STATUS_META.open;
  const pm = PRIORITY_META[req.priority] || PRIORITY_META.medium;
  const SI = sm.icon;

  const loadDetail = async () => {
    try {
      const res  = await fetch(`${API_BASE}/maintenance/${req.id}`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) setDetail(data.data);
    } catch(e) { console.error(e); }
  };

  const handleExpand = () => { const n = !expanded; setExpanded(n); if (n && !detail) loadDetail(); };

  const handleCancel = async () => {
    if (!confirm("Cancel this request?")) return;
    const res = await fetch(`${API_BASE}/maintenance/${req.id}/status`, {
      method:"PUT", headers:hdrsJ(token), body:JSON.stringify({ status:"cancelled" }),
    });
    if (res.ok) { onUpdated(); setExpanded(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/maintenance/${req.id}/comments`, {
        method:"POST", headers:hdrsJ(token), body:JSON.stringify({ text:comment }),
      });
      if (res.ok) { setComment(""); await loadDetail(); onUpdated(); }
    } catch(e) { console.error(e); } finally { setSubmitting(false); }
  };

  const handleRate = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/maintenance/${req.id}/rate`, {
        method:"POST", headers:hdrsJ(token), body:JSON.stringify({ rating }),
      });
      if (res.ok) { setRatingDone(true); onUpdated(); }
    } catch(e) { console.error(e); } finally { setSubmitting(false); }
  };

  const comments = detail?.comments || req.comments || [];

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition hover:shadow-sm ${req.priority==="emergency"?"border-red-300":"border-gray-200"}`}>
      <div className="p-5 flex items-start gap-4 cursor-pointer" onClick={handleExpand}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sm.badge.split(" ").slice(0,2).join(" ")}`}>
          <SI className="text-lg"/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
            <h4 className="font-bold text-gray-900 text-sm truncate">{req.title}</h4>
            <div className="flex gap-1.5 flex-wrap shrink-0">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${pm.badge}`}>{pm.label}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sm.badge}`}>{sm.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] text-gray-400">📁 {req.category?.replace(/_/g," ")}</span>
            <span className="text-[11px] text-gray-400">📅 {fmtDate(req.createdAt)}</span>
            {req.property?.title && <span className="text-[11px] text-gray-400 truncate max-w-[140px]">🏠 {req.property.title}</span>}
          </div>
        </div>
        <HiChevronDown className={`text-gray-400 transition-transform shrink-0 mt-1 ${expanded?"rotate-180":""}`}/>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
          </div>
          {req.images?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {req.images.map((url,i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200"/>
                </a>
              ))}
            </div>
          )}
          {(detail?.assignedAgent || req.assignedAgent) && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-0.5">Assigned Agent</p>
              <p className="text-sm font-bold text-indigo-800">
                {(detail?.assignedAgent || req.assignedAgent)?.firstName}{" "}
                {(detail?.assignedAgent || req.assignedAgent)?.lastName}
              </p>
            </div>
          )}
          {req.scheduledAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-500 mb-0.5">Scheduled Visit</p>
              <p className="text-sm font-bold text-blue-800">{fmtDate(req.scheduledAt)}</p>
            </div>
          )}
          {req.resolutionNote && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-600 mb-0.5">Resolution</p>
              <p className="text-sm text-green-800">{req.resolutionNote}</p>
            </div>
          )}
          {comments.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Updates ({comments.length})</p>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className={`rounded-xl px-3 py-2.5 text-xs ${c.isSystemNote?"bg-gray-50 text-gray-500 italic text-center":"bg-blue-50 text-blue-800"}`}>
                    {!c.isSystemNote && c.author && (
                      <p className="font-black text-[10px] mb-0.5 capitalize">{c.author.firstName} {c.author.lastName} · {c.author.role} · {fmtDate(c.createdAt)}</p>
                    )}
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {["open","acknowledged","in_progress"].includes(req.status) && (
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..."
                onKeyDown={e => e.key==="Enter" && handleComment()}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"/>
              <button onClick={handleComment} disabled={!comment.trim()||submitting}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-1">
                <HiChat className="text-sm"/> Send
              </button>
            </div>
          )}
          {req.status==="resolved" && !ratingDone && !req.tenantRating && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-800 mb-2">Rate the resolution</p>
              <StarRating value={rating} onChange={setRating}/>
              {rating > 0 && (
                <button onClick={handleRate} disabled={submitting}
                  className="mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 disabled:opacity-50 transition">
                  Submit Rating
                </button>
              )}
            </div>
          )}
          {(ratingDone || req.tenantRating) && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <HiStar className="text-amber-400"/> You rated this {req.tenantRating || rating}/5
            </p>
          )}
          {["open","acknowledged"].includes(req.status) && (
            <button onClick={handleCancel} className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline">
              Cancel this request
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── New Request Modal ─────────────────────────────────────────────────────────
function NewRequestModal({ token, onCreated, onClose }) {
  const [form,         setForm]         = useState({ propertyId:"", title:"", category:"plumbing", priority:"medium", description:"" });
  const [properties,   setProperties]   = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [rawDebug,     setRawDebug]     = useState(null); // raw API response for debugging

  useEffect(() => {
    const load = async () => {
      setLoadingProps(true);
      try {
        // ── Step 1: GET /api/agreements/my ─────────────────────────────────
        const res  = await fetch(`${API_BASE}/agreements/my`, { headers: hdrs(token) });
        const data = await res.json();

        setRawDebug({ status: res.status, success: data.success, count: data.data?.length, sample: data.data?.slice(0,2) });

        if (!data.success) {
          setError(`Could not load agreements (${res.status}): ${data.message}`);
          setLoadingProps(false);
          return;
        }

        const agreements = data.data || [];
        const seen  = new Set();
        const props = [];

        agreements.forEach(a => {
          if (!isActive(a.status)) return; // skip dead agreements

          // ── CRITICAL FIX ────────────────────────────────────────────────
          // The agreementController includes property as { model: Property, as: "property" }
          // BUT agreements table also has a plain `propertyId` column.
          // If the JOIN fails silently, a.property is null but a.propertyId still exists.
          // Solution: use a.property if available, otherwise fetch property separately
          // using the propertyId from the agreement.

          const propId    = a.property?.id    || a.propertyId;
          const propTitle = a.property?.title || a.propertyAddress || `Property (${propId?.slice(0,8)}...)`;
          const district  = a.property?.district || a.district || "";

          if (propId && !seen.has(propId)) {
            seen.add(propId);
            props.push({
              id:              propId,
              title:           propTitle,
              district,
              agreementStatus: a.status,
              agreementId:     a.id,
            });
          }
        });

        setProperties(props);
        if (props.length === 1) setForm(f => ({ ...f, propertyId: props[0].id }));
      } catch(e) {
        setError("Failed to load properties: " + e.message);
      } finally {
        setLoadingProps(false);
      }
    };
    load();
  }, [token]);

  const handleSubmit = async () => {
    if (!form.propertyId)        { setError("Please select a property."); return; }
    if (!form.title.trim())      { setError("Please enter a title."); return; }
    if (!form.description.trim()){ setError("Please describe the issue."); return; }
    setSubmitting(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/maintenance`, {
        method:"POST", headers:hdrsJ(token),
        body: JSON.stringify({
          propertyId:  form.propertyId,
          title:       form.title.trim(),
          description: form.description.trim(),
          category:    form.category,
          priority:    form.priority,
        }),
      });
      const data = await res.json();
      if (data.success) { onCreated(); onClose(); }
      else {
        setError(data.message || "Failed to submit.");
        if (data.debug) setRawDebug(data.debug);
      }
    } catch(e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">New Maintenance Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><HiX className="text-xl"/></button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-bold">
              {error}
              {rawDebug && (
                <details className="mt-2 text-[10px] text-red-400 font-normal">
                  <summary className="cursor-pointer font-bold">Debug info (share with developer)</summary>
                  <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40">{JSON.stringify(rawDebug,null,2)}</pre>
                </details>
              )}
            </div>
          )}

          {/* Property selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
              Property * <span className="normal-case font-normal text-gray-300">(from your signed leases)</span>
            </label>
            {loadingProps ? (
              <Skeleton height={42} borderRadius={12}/>
            ) : properties.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 space-y-1.5">
                <p className="font-bold">No active lease agreements found.</p>
                <p>Go to <strong>Agreements</strong> → sign your lease before filing a maintenance request.</p>
                {rawDebug && (
                  <details className="text-[10px] text-amber-500">
                    <summary className="cursor-pointer font-semibold">Debug: API response</summary>
                    <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40">{JSON.stringify(rawDebug,null,2)}</pre>
                  </details>
                )}
              </div>
            ) : (
              <select
                value={form.propertyId}
                onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="">Select your property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}{p.district ? ` — ${p.district}` : ""} ({p.agreementStatus})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
              placeholder="e.g. Leaking pipe in kitchen"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"/>
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority:e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white">
                {["low","medium","high","emergency"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))}
              placeholder="Describe the issue in as much detail as possible..." rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"/>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting || loadingProps || properties.length === 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <HiPlus/>}
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Maintenance({ token }) {
  const [requests,setRequests] = useState([]);
  const [stats,   setStats]    = useState({ total:0, open:0, inProgress:0, resolved:0, emergency:0 });
  const [loading, setLoading]  = useState(true);
  const [filter,  setFilter]   = useState("all");
  const [search,  setSearch]   = useState("");
  const [showForm,setShowForm] = useState(false);
  const [error,   setError]    = useState(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const [rRes,sRes] = await Promise.all([
        fetch(`${API_BASE}/maintenance?limit=100`, { headers:hdrs(token) }),
        fetch(`${API_BASE}/maintenance/stats`,     { headers:hdrs(token) }),
      ]);
      const [rData,sData] = await Promise.all([rRes.json(),sRes.json()]);
      if (rData.success) setRequests(rData.data || []);
      else setError(rData.message);
      if (sData.success) setStats(sData.data || {});
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = requests.filter(r => {
    const mf = filter==="all" || r.status===filter || r.priority===filter;
    const q  = search.toLowerCase();
    const ms = !q || r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q) || r.property?.title?.toLowerCase().includes(q);
    return mf && ms;
  });

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      {showForm && (
        <NewRequestModal
          token={token}
          onCreated={() => { fetchAll(); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Maintenance</h2>
            <p className="text-sm text-gray-400 mt-0.5">Track and manage your property maintenance requests</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition" title="Refresh">
              <HiRefresh className={loading?"animate-spin":""}/>
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              <HiPlus/> New Request
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {label:"Open",       value:stats.open,       colorV:"text-amber-600", colorB:"bg-amber-50" },
            {label:"In Progress",value:stats.inProgress, colorV:"text-blue-600",  colorB:"bg-blue-50"  },
            {label:"Resolved",   value:stats.resolved,   colorV:"text-green-600", colorB:"bg-green-50" },
            {label:"Emergency",  value:stats.emergency,  colorV:"text-red-600",   colorB:"bg-red-50"   },
          ].map((s,i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.colorB} flex items-center justify-center shrink-0`}>
                {loading ? <Skeleton circle width={24} height={24}/> : <span className={`text-xl font-black ${s.colorV}`}>{s.value}</span>}
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[["all","All"],["open","Open"],["in_progress","In Progress"],["resolved","Resolved"],["emergency","Emergency"]].map(([val,lbl]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter===val?"bg-blue-600 text-white shadow-sm":"bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">{Array.from({length:3}).map((_,i) => <SkeletonCard key={i}/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
            <div className="text-5xl mb-3">🔧</div>
            <p className="font-semibold text-gray-500">
              {search ? `No results for "${search}"` : filter==="all" ? "No maintenance requests yet" : `No ${filter.replace(/_/g," ")} requests`}
            </p>
            {filter==="all" && !search && (
              <button onClick={() => setShowForm(true)}
                className="mt-5 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition">
                File Your First Request
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(req => <RequestCard key={req.id} req={req} token={token} onUpdated={fetchAll}/>)}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center">
            Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{" "}
            <span className="font-bold text-gray-600">{requests.length}</span> requests
          </p>
        )}
      </div>
    </SkeletonTheme>
  );
}