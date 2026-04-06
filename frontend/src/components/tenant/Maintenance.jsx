// src/components/tenant/Maintenance.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  HiPlus, HiX, HiChevronDown, HiRefresh,
  HiCheckCircle, HiClock, HiExclamation, HiPhotograph,
  HiCog, HiChat, HiStar,
} from "react-icons/hi";
import { API_BASE } from "../../config";

const hdrs = (tk) => ({ Authorization: `Bearer ${tk}` });

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const PRIORITY_META = {
  emergency: { badge: "bg-red-100 text-red-700 border border-red-200",    label: "Emergency" },
  high:      { badge: "bg-orange-100 text-orange-700 border border-orange-200", label: "High"   },
  medium:    { badge: "bg-amber-100 text-amber-700 border border-amber-200",  label: "Medium"   },
  low:       { badge: "bg-gray-100 text-gray-600 border border-gray-200",  label: "Low"       },
};

const STATUS_META = {
  open:          { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",  icon: HiClock,        label: "Open"        },
  acknowledged:  { badge: "bg-blue-50 text-blue-700 border border-blue-200",        icon: HiCheckCircle,  label: "Acknowledged" },
  in_progress:   { badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",  icon: HiCog,          label: "In Progress"  },
  resolved:      { badge: "bg-green-50 text-green-700 border border-green-200",     icon: HiCheckCircle,  label: "Resolved"     },
  rejected:      { badge: "bg-red-50 text-red-600 border border-red-200",           icon: HiX,            label: "Rejected"     },
  cancelled:     { badge: "bg-gray-100 text-gray-500 border border-gray-200",       icon: HiX,            label: "Cancelled"    },
};

const CATEGORIES = ["plumbing", "electrical", "hvac", "structural", "appliances", "pest_control", "cleaning", "security", "other"];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-5 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-gray-100 rounded-full w-16" />
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-64" />
    </div>
  );
}

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} type="button">
          <HiStar className={`text-2xl transition ${n <= value ? "text-amber-400" : "text-gray-200"}`} />
        </button>
      ))}
    </div>
  );
}

// ── Request card ──────────────────────────────────────────────────────────────
function RequestCard({ req, token, onUpdated }) {
  const [expanded,   setExpanded]   = useState(false);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rating,     setRating]     = useState(0);
  const [ratingDone, setRatingDone] = useState(!!req.tenantRating);

  const statusMeta   = STATUS_META[req.status]   || STATUS_META.open;
  const priorityMeta = PRIORITY_META[req.priority] || PRIORITY_META.medium;
  const StatusIcon   = statusMeta.icon;

  const handleCancel = async () => {
    if (!confirm("Cancel this request?")) return;
    const res  = await fetch(`${API_BASE}/maintenance/${req.id}/status`, {
      method:  "PUT",
      headers: { ...hdrs(token), "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) onUpdated();
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`${API_BASE}/maintenance/${req.id}/comments`, {
      method:  "POST",
      headers: { ...hdrs(token), "Content-Type": "application/json" },
      body:    JSON.stringify({ text: comment }),
    });
    if (res.ok) { setComment(""); onUpdated(); }
    setSubmitting(false);
  };

  const handleRate = async () => {
    if (!rating) return;
    setSubmitting(true);
    const res = await fetch(`${API_BASE}/maintenance/${req.id}/rate`, {
      method:  "POST",
      headers: { ...hdrs(token), "Content-Type": "application/json" },
      body:    JSON.stringify({ rating }),
    });
    if (res.ok) { setRatingDone(true); onUpdated(); }
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition hover:shadow-sm">
      {/* Card header */}
      <div
        className="p-5 flex items-start gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusMeta.badge.split(" ").slice(0,2).join(" ")}`}>
          <StatusIcon className="text-lg" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm">{req.title}</h4>
            <div className="flex gap-1.5 flex-wrap shrink-0">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${priorityMeta.badge}`}>
                {priorityMeta.label}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusMeta.badge}`}>
                {statusMeta.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400">📁 {req.category?.replace(/_/g, " ")}</span>
            <span className="text-[11px] text-gray-400">📅 {fmtDate(req.createdAt)}</span>
            {req.property && <span className="text-[11px] text-gray-400 truncate">🏠 {req.property.title}</span>}
          </div>
        </div>

        <HiChevronDown className={`text-gray-400 transition-transform shrink-0 mt-1 ${expanded ? "rotate-180" : ""}`} />
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
          </div>

          {/* Images */}
          {req.images?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Photos</p>
              <div className="flex gap-2 flex-wrap">
                {req.images.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="attachment" className="w-20 h-20 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Agent assigned */}
          {req.assignedAgent && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-0.5">Assigned Agent</p>
              <p className="text-sm font-bold text-indigo-800">
                {req.assignedAgent.firstName} {req.assignedAgent.lastName}
              </p>
            </div>
          )}

          {/* Resolution note */}
          {req.resolutionNote && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-600 mb-0.5">Resolution Note</p>
              <p className="text-sm text-green-800">{req.resolutionNote}</p>
            </div>
          )}

          {/* Comments */}
          {req.comments?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                Updates ({req.comments.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {req.comments.map(c => (
                  <div key={c.id} className={`rounded-xl px-3 py-2.5 text-xs ${c.isSystemNote ? "bg-gray-50 text-gray-500 italic" : "bg-blue-50 text-blue-800"}`}>
                    {!c.isSystemNote && c.author && (
                      <p className="font-black text-[10px] mb-0.5">{c.author.firstName} {c.author.lastName} · {fmtDate(c.createdAt)}</p>
                    )}
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add comment */}
          {["open", "acknowledged", "in_progress"].includes(req.status) && (
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment or update..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                onKeyDown={e => e.key === "Enter" && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim() || submitting}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <HiChat className="text-sm" />
              </button>
            </div>
          )}

          {/* Rate resolution */}
          {req.status === "resolved" && !ratingDone && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-800 mb-2">Rate the resolution</p>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && (
                <button
                  onClick={handleRate}
                  disabled={submitting}
                  className="mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 disabled:opacity-50 transition"
                >
                  Submit Rating
                </button>
              )}
            </div>
          )}
          {req.tenantRating && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <HiStar className="text-amber-400" /> You rated this {req.tenantRating}/5
            </p>
          )}

          {/* Cancel button */}
          {["open", "acknowledged"].includes(req.status) && (
            <button
              onClick={handleCancel}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
            >
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
  const [form,       setForm]       = useState({ propertyId: "", title: "", category: "plumbing", priority: "medium", description: "" });
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  // Load tenant's active agreements to get properties
  useEffect(() => {
    fetch(`${API_BASE}/agreements`, { headers: hdrs(token) })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const props = [];
          (d.data || []).forEach(a => {
            if (a.property && a.status === "signed" && !props.find(p => p.id === a.property.id)) {
              props.push(a.property);
            }
          });
          setProperties(props);
          if (props.length === 1) setForm(f => ({ ...f, propertyId: props[0].id }));
        }
      })
      .catch(() => {});
  }, [token]);

  const handleSubmit = async () => {
    if (!form.propertyId || !form.title || !form.description) {
      setError("Property, title, and description are required."); return;
    }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/maintenance`, {
        method:  "POST",
        headers: { ...hdrs(token), "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onCreated(); onClose(); }
      else setError(data.message || "Failed to submit request");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">New Maintenance Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><HiX className="text-xl" /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-bold">{error}</div>
          )}

          {/* Property */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Property *</label>
            {properties.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-semibold">
                No active signed lease found. You need a signed agreement to file a maintenance request.
              </div>
            ) : (
              <select
                value={form.propertyId}
                onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title} — {p.district}</option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Leaking pipe in kitchen"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in as much detail as possible..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || properties.length === 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <HiPlus />}
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Maintenance component ────────────────────────────────────────────────
export default function Maintenance({ token }) {
  const [requests,  setRequests]  = useState([]);
  const [stats,     setStats]     = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, emergency: 0 });
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [showForm,  setShowForm]  = useState(false);
  const [error,     setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const [rRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/maintenance?limit=50`,  { headers: hdrs(token) }),
        fetch(`${API_BASE}/maintenance/stats`,     { headers: hdrs(token) }),
      ]);
      const [rData, sData] = await Promise.all([rRes.json(), sRes.json()]);
      if (rData.success) setRequests(rData.data || []);
      else setError(rData.message);
      if (sData.success) setStats(sData.data || {});
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = filter === "all"
    ? requests
    : requests.filter(r => r.status === filter || r.priority === filter);

  return (
    <div className="space-y-6">
      {showForm && (
        <NewRequestModal token={token} onCreated={fetchAll} onClose={() => setShowForm(false)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Maintenance</h2>
          <p className="text-sm text-gray-400 mt-0.5">Track and manage your property maintenance requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="p-2.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition"
          >
            <HiRefresh className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            <HiPlus /> New Request
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">{error}</div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open",        value: stats.open,        color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "In Progress", value: stats.inProgress,  color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Resolved",    value: stats.resolved,    color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Emergency",   value: stats.emergency,   color: "text-red-600",    bg: "bg-red-50"    },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={`text-xl font-black ${s.color}`}>{loading ? "—" : s.value}</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          ["all",         "All"        ],
          ["open",        "Open"       ],
          ["in_progress", "In Progress"],
          ["resolved",    "Resolved"   ],
          ["emergency",   "Emergency"  ],
        ].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              filter === val
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
          <div className="text-5xl mb-3">🔧</div>
          <p className="font-semibold text-gray-500">
            {filter === "all" ? "No maintenance requests yet" : `No ${filter.replace(/_/g, " ")} requests`}
          </p>
          {filter === "all" && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition"
            >
              File Your First Request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <RequestCard key={req.id} req={req} token={token} onUpdated={fetchAll} />
          ))}
        </div>
      )}
    </div>
  );
}