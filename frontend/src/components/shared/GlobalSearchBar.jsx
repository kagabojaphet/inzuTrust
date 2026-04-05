// src/components/shared/GlobalSearchBar.jsx
// Debounced global search — works for all roles: tenant, landlord, admin, agent
// Props: token, onNavigate(tabId, itemId?) — called when user clicks a result
import { useState, useEffect, useRef, useCallback } from "react";
import {
  HiSearch, HiX, HiOfficeBuilding, HiUsers, HiDocumentText,
  HiExclamationCircle, HiUser,
} from "react-icons/hi";
// Import HiWrench from hi2 to fix the export error
import { HiWrench } from "react-icons/hi2";
import { API_BASE } from "../../config";

// ── Result type config ────────────────────────────────────────────────────────
const TYPE_META = {
  properties:  { label:"Property",    icon:HiOfficeBuilding, tab:"properties",  color:"blue"   },
  tenants:     { label:"Tenant",      icon:HiUsers,          tab:"tenants",     color:"indigo" },
  agreements:  { label:"Agreement",   icon:HiDocumentText,   tab:"agreements",  color:"green"  },
  disputes:    { label:"Dispute",     icon:HiExclamationCircle, tab:"disputes", color:"red"    },
  maintenance: { label:"Maintenance", icon:HiWrench,         tab:"maintenance", color:"amber"  },
  users:       { label:"User",        icon:HiUser,           tab:"users",       color:"slate"  },
};

const COLOR_CLASSES = {
  blue:   "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
  green:  "bg-green-50 text-green-600",
  red:    "bg-red-50 text-red-600",
  amber:  "bg-amber-50 text-amber-600",
  slate:  "bg-slate-100 text-slate-600",
};

function getTitle(type, item) {
  switch (type) {
    case "properties":  return item.title;
    case "tenants":     return `${item.firstName} ${item.lastName}`;
    case "users":       return `${item.firstName} ${item.lastName}`;
    case "agreements":  return item.property?.title || `Agreement #${item.id.slice(0,6)}`;
    case "disputes":    return item.title || item.docId;
    case "maintenance": return item.title;
    default: return item.title || item.id;
  }
}

function getSubtitle(type, item) {
  switch (type) {
    case "properties":  return `${item.district} · ${item.type} · RWF ${Number(item.rentAmount||0).toLocaleString()}/mo`;
    case "tenants":     return item.email;
    case "users":       return `${item.email} · ${item.role}`;
    case "agreements":  return `${item.status} · ${item.tenant ? `${item.tenant.firstName} ${item.tenant.lastName}` : ""}`;
    case "disputes":    return `${item.docId || ""} · ${item.status} · ${item.category}`;
    case "maintenance": return `${item.priority} · ${item.status} · ${item.property?.title || ""}`;
    default: return "";
  }
}

export default function GlobalSearchBar({ token, onNavigate }) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState({});
  const [loading,  setLoading]  = useState(false);
  const [open,      setOpen]      = useState(false);
  const [total,    setTotal]    = useState(0);
  const inputRef = useRef(null);
  const boxRef   = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Debounced search
  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults({}); setTotal(0); setOpen(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&limit=4`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data || {});
        setTotal(data.total || 0);
        setOpen(true);
      }
    } catch (e) { console.error("[Search]", e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 350);
    return () => clearTimeout(t);
  }, [query, search]);

  const clear = () => { setQuery(""); setResults({}); setOpen(false); inputRef.current?.focus(); };

  const handleSelect = (type, item) => {
    const meta = TYPE_META[type];
    setOpen(false);
    setQuery("");
    onNavigate?.(meta?.tab || type, item.id);
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="relative w-full max-w-xs lg:max-w-sm" ref={boxRef}>
      {/* Input */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search properties, tenants, disputes..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50 outline-none focus:bg-white focus:border-blue-200 transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"/>
        )}
        {!loading && query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <HiX className="text-sm"/>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-[480px] overflow-y-auto">

          {/* Summary */}
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              {total} result{total !== 1 ? "s" : ""} for "{query}"
            </p>
            <button onClick={clear} className="text-[10px] text-blue-600 font-bold hover:underline">Clear</button>
          </div>

          {/* Grouped results */}
          {Object.entries(results).map(([type, items]) => {
            if (!items?.length) return null;
            const meta = TYPE_META[type];
            if (!meta) return null;
            const IconComp = meta.icon;
            const colorCls = COLOR_CLASSES[meta.color] || COLOR_CLASSES.blue;

            return (
              <div key={type}>
                {/* Group header */}
                <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${colorCls}`}>
                    <IconComp className="text-[10px]"/>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    {meta.label}s ({items.length})
                  </span>
                </div>

                {/* Items */}
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(type, item)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center gap-3 border-b border-gray-50 last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
                      <IconComp className="text-sm"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{getTitle(type, item)}</p>
                      <p className="text-[11px] text-gray-400 truncate capitalize">{getSubtitle(type, item)}</p>
                    </div>
                    {/* Status pill where relevant */}
                    {item.status && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize shrink-0">
                        {item.status.replace("_"," ")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}

          {/* No results inside open state (search ran but returned empty after debounce) */}
          {!hasResults && !loading && query.length >= 2 && (
            <div className="px-4 py-8 text-center">
              <HiSearch className="text-3xl text-gray-200 mx-auto mb-2"/>
              <p className="text-sm text-gray-400">No results for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}