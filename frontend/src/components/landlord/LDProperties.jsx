// src/components/landlord/LDProperties.jsx
import React, { useEffect, useState } from "react";
import LDPropertyDetail from "./LDPropertyDetail";
import {
  HiPlus, HiPencil, HiTrash, HiEye, HiSearch,
  HiDotsVertical, HiOfficeBuilding, HiCheckCircle,
  HiExclamationCircle, HiCurrencyDollar, HiViewGrid,
  HiViewList, HiPhotograph, HiRefresh, HiChevronDown,
  HiAdjustments, HiLocationMarker,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  available: { label:"Vacant",   style:"bg-amber-50 text-amber-700 border border-amber-200", dot:"bg-amber-400" },
  occupied:  { label:"Occupied", style:"bg-green-50 text-green-700 border border-green-200", dot:"bg-green-500" },
  draft:     { label:"Draft",    style:"bg-gray-100 text-gray-500 border border-gray-200",   dot:"bg-gray-400"  },
};

const parseImages = raw => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const fmtRWF = n => n ? `RWF ${Number(n).toLocaleString()}` : "—";

const fmtSince = d => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { month:"short", year:"numeric" });
};

const getInitials = (firstName="", lastName="") =>
  `${(firstName||"")[0]||""}${(lastName||"")[0]||""}`.toUpperCase() || "?";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon:Icon, iconBg, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="text-xl text-white"/>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Actions menu ──────────────────────────────────────────────────────────────
function ActionsMenu({ pid, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
        <HiDotsVertical/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-36 py-1 overflow-hidden">
            <button onClick={() => { onView(pid); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
              <HiEye className="text-gray-400"/> View
            </button>
            <button onClick={() => { onEdit(pid); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
              <HiPencil className="text-gray-400"/> Edit
            </button>
            <div className="border-t border-gray-100 my-1"/>
            <button onClick={() => { onDelete(pid); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
              <HiTrash className="text-red-400"/> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Active Tenant cell ────────────────────────────────────────────────────────
function TenantCell({ tenant }) {
  if (!tenant) return <span className="text-gray-300 text-sm">—</span>;
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
        {getInitials(tenant.firstName, tenant.lastName)}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {tenant.firstName} {tenant.lastName?.charAt(0)}.
        </p>
        {tenant.since && (
          <p className="text-[10px] text-gray-400">Since {fmtSince(tenant.since)}</p>
        )}
      </div>
    </div>
  );
}

// ── Table row (now 13 cols to add Active Tenant) ──────────────────────────────
function PropertyRow({ p, checked, onCheck, onView, onEdit, onDelete }) {
  const pid    = p.id || p._id;
  const thumb  = p.imagesList?.[0] || p.mainImage || null;
  const status = STATUS_MAP[p.status] || STATUS_MAP.available;

  return (
    <div className={`grid grid-cols-13 gap-3 px-5 py-4 items-center hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${
      checked ? "bg-blue-50/40" : ""
    }`} style={{ gridTemplateColumns:"36px 1fr 140px 130px 110px 1fr 80px" }}>

      {/* Checkbox */}
      <div className="flex items-center">
        <input type="checkbox" checked={checked} onChange={() => onCheck(pid)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"/>
      </div>

      {/* Property */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
          {thumb
            ? <img src={thumb} alt={p.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-xl"/></div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{p.title || p.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {p.bedrooms > 0 ? `${p.bedrooms} Bed` : "Studio"}
            {p.bathrooms > 0 ? ` • ${p.bathrooms} Bath` : ""}
            {p.area ? ` • ${p.area}m²` : ""}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="min-w-0">
        <p className="text-sm text-gray-700 font-medium truncate">{p.district}</p>
        <p className="text-[11px] text-gray-400 truncate">{p.sector || "—"}</p>
      </div>

      {/* Rent */}
      <div>
        <p className="text-sm font-black text-gray-900">{fmtRWF(p.rentAmount)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Due 1st of month</p>
      </div>

      {/* Status */}
      <div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${status.style}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}/>
          {status.label}
        </span>
      </div>

      {/* Active Tenant — new column */}
      <div><TenantCell tenant={p.activeTenant}/></div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionsMenu pid={pid} onView={onView} onEdit={onEdit} onDelete={onDelete}/>
      </div>
    </div>
  );
}

// ── Grid card (unchanged, tenant shown as small pill) ─────────────────────────
function PropertyCard({ p, onView, onEdit, onDelete }) {
  const pid    = p.id || p._id;
  const thumb  = p.imagesList?.[0] || p.mainImage || null;
  const status = STATUS_MAP[p.status] || STATUS_MAP.available;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
      <div className="h-36 bg-gray-100 overflow-hidden relative">
        {thumb
          ? <img src={thumb} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
          : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-4xl"/></div>
        }
        <span className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${status.style}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}/>{status.label}
        </span>
      </div>
      <div className="p-4">
        <p className="font-black text-gray-900 text-sm truncate mb-0.5">{p.title || p.name}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
          <HiLocationMarker className="shrink-0"/> {p.district}{p.sector ? `, ${p.sector}` : ""}
        </p>
        {p.activeTenant && (
          <div className="flex items-center gap-2 mb-2 bg-blue-50 rounded-lg px-2 py-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-black text-[9px] shrink-0">
              {getInitials(p.activeTenant.firstName, p.activeTenant.lastName)}
            </div>
            <p className="text-[11px] text-blue-700 font-semibold truncate">
              {p.activeTenant.firstName} {p.activeTenant.lastName?.charAt(0)}.
            </p>
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-black text-blue-600">{fmtRWF(p.rentAmount)}<span className="text-gray-400 font-normal">/mo</span></span>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-semibold capitalize">{p.type}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onView(pid)}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
            <HiEye/> View
          </button>
          <button onClick={() => onEdit(pid)}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition">
            <HiPencil/> Edit
          </button>
          <button onClick={() => onDelete(pid)}
            className="w-9 flex items-center justify-center border border-red-100 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition">
            <HiTrash/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis like: 1 2 3 … 10
  const buildPages = () => {
    const pages = [];
    const addPage = (n) => { if (!pages.includes(n) && n >= 1 && n <= totalPages) pages.push(n); };

    // Always show first, last, current and neighbours
    [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].forEach(addPage);
    pages.sort((a, b) => a - b);

    // Insert ellipsis markers
    const result = [];
    pages.forEach((p, i) => {
      if (i > 0 && p - pages[i - 1] > 1) result.push("...");
      result.push(p);
    });
    return result;
  };

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-bold">
        ‹
      </button>

      {buildPages().map((item, i) =>
        item === "..." ? (
          <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
        ) : (
          <button key={item} onClick={() => onChange(item)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition ${
              page === item
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {item}
          </button>
        )
      )}

      {/* Next */}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-bold">
        ›
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LDProperties({ token, setActive }) {
  const [properties,     setProperties]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [locationFilter, setLocationFilter] = useState("all"); // ← NEW
  const [viewMode,       setViewMode]       = useState("table");
  const [selected,       setSelected]       = useState(new Set());
  const [selectedId,     setSelectedId]     = useState(null);
  const [page,           setPage]           = useState(1);
  const PAGE_SIZE = 5;

  const resolvedToken = token || localStorage.getItem("inzu_token") || "";

  const fetchProperties = async () => {
    if (!resolvedToken) { setError("Not authenticated."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/properties/my/list`, {
        headers: { Authorization: `Bearer ${resolvedToken}` },
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) { setError(`Server error (${res.status})`); return; }
      const d = await res.json();
      if (res.ok) {
        setProperties((d.data || []).map(p => ({
          ...p,
          imagesList: parseImages(p.images),
        })));
      } else {
        setError(d.message || `Error ${res.status}`);
      }
    } catch { setError("Network error — is the server running?"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); }, [token]);

  // ── Distinct districts for location filter ────────────────────────────────
  const districts = ["all", ...new Set(properties.map(p => p.district).filter(Boolean).sort())];

  const handleDelete = async pid => {
    if (!window.confirm("Delete this property?")) return;
    try {
      const res = await fetch(`${API_BASE}/properties/${pid}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${resolvedToken}` },
      });
      if (res.ok) setProperties(prev => prev.filter(p => (p.id||p._id) !== pid));
      else { const d = await res.json(); alert(d.message || "Delete failed"); }
    } catch { alert("Network error."); }
  };

  const toggleCheck = pid => setSelected(prev => {
    const next = new Set(prev);
    next.has(pid) ? next.delete(pid) : next.add(pid);
    return next;
  });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id || p._id)));
  };

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, locationFilter]);

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    const matchSearch    = !search || p.title?.toLowerCase().includes(q) || p.district?.toLowerCase().includes(q) || p.sector?.toLowerCase().includes(q);
    const matchStatus    = statusFilter   === "all" || p.status   === statusFilter;
    const matchLocation  = locationFilter === "all" || p.district === locationFilter;
    return matchSearch && matchStatus && matchLocation;
  });

  const totalPages       = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated        = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const total     = properties.length;
  const occupied  = properties.filter(p => p.status === "occupied").length;
  const vacant    = properties.filter(p => p.status === "available").length;
  const revenue   = properties.reduce((s, p) => s + Number(p.rentAmount || 0), 0);
  const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0;

  if (selectedId) {
    return <LDPropertyDetail propertyId={selectedId} token={token} onBack={() => setSelectedId(null)}/>;
  }

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Portfolio</span><span>/</span>
          <span className="text-gray-700 font-semibold">Properties List</span>
        </div>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">My Properties</h2>
            <p className="text-sm text-gray-400 mt-1">Manage your rental portfolio, track occupancy, and view performance metrics.</p>
          </div>
          <button onClick={() => setActive("add-property")}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm shrink-0">
            <HiPlus/> Add New Property
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? Array.from({length:4}).map((_,i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
              <Skeleton width={44} height={44} borderRadius={12} className="mb-3"/>
              <Skeleton width={60} height={11} borderRadius={4} className="mb-1"/>
              <Skeleton width={80} height={28} borderRadius={6}/>
            </div>
          )) : (
            <>
              <StatCard icon={HiOfficeBuilding}   iconBg="bg-blue-500"   label="Total Properties" value={total}            sub={`${total} in portfolio`}/>
              <StatCard icon={HiCheckCircle}       iconBg="bg-green-500"  label="Occupancy Rate"   value={`${occupancy}%`}  sub={`${occupied} of ${total} occupied`}/>
              <StatCard icon={HiExclamationCircle} iconBg="bg-amber-500"  label="Vacant Units"     value={vacant}           sub="Available now"/>
              <StatCard icon={HiCurrencyDollar}    iconBg="bg-purple-500" label="Monthly Revenue"  value={`RWF ${(revenue/1000000).toFixed(1)}M`} sub="Total portfolio"/>
            </>
          )}
        </div>

        {/* ── Search + filters + view toggle ── */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by property name, address..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition"/>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="occupied">Occupied</option>
              <option value="available">Vacant</option>
              <option value="draft">Draft</option>
            </select>
            <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"/>
          </div>

          {/* ── Location filter (NEW) ── */}
          <div className="relative">
            <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"/>
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
              className="appearance-none pl-8 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option value="all">All Locations</option>
              {districts.filter(d => d !== "all").map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"/>
          </div>

          {/* Refresh */}
          <button onClick={fetchProperties}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition">
            <HiRefresh/> Refresh
          </button>

          {/* Filter icon */}
          <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
            <HiAdjustments className="text-base"/>
          </button>

          {/* View toggle */}
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode("table")}
              className={`px-3 py-2.5 text-sm font-medium transition ${viewMode==="table"?"bg-blue-600 text-white":"text-gray-500 hover:bg-gray-50"}`}>
              <HiViewList className="text-base"/>
            </button>
            <button onClick={() => setViewMode("grid")}
              className={`px-3 py-2.5 text-sm font-medium transition ${viewMode==="grid"?"bg-blue-600 text-white":"text-gray-500 hover:bg-gray-50"}`}>
              <HiViewGrid className="text-base"/>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span><span className="flex-1">{error}</span>
            <button onClick={fetchProperties} className="text-xs font-bold underline hover:text-red-700">Retry</button>
          </div>
        )}

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-4">
            <span className="text-sm font-bold text-blue-800">{selected.size} selected</span>
            <button onClick={() => {
              if (window.confirm(`Delete ${selected.size} properties?`)) {
                selected.forEach(pid => handleDelete(pid));
                setSelected(new Set());
              }
            }} className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition">
              <HiTrash/> Delete selected
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 font-bold hover:underline">Clear</button>
          </div>
        )}

        {/* ── TABLE view ── */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header row */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400"
              style={{ display:"grid", gridTemplateColumns:"36px 1fr 140px 130px 110px 1fr 80px", gap:"12px" }}>
              <div className="flex items-center">
                <input type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"/>
              </div>
              <div>Property</div>
              <div>Location</div>
              <div>Monthly Rent</div>
              <div>Status</div>
              <div>Active Tenant</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Rows */}
            <div>
              {loading ? (
                Array.from({length:5}).map((_,i) => (
                  <div key={i} className="px-5 py-4 border-b border-gray-50"
                    style={{ display:"grid", gridTemplateColumns:"36px 1fr 140px 130px 110px 1fr 80px", gap:"12px", alignItems:"center" }}>
                    <Skeleton width={16} height={16} borderRadius={4}/>
                    <div className="flex items-center gap-3">
                      <Skeleton width={48} height={48} borderRadius={12}/>
                      <div><Skeleton width={110} height={13} borderRadius={6}/><Skeleton width={80} height={10} borderRadius={6} className="mt-1"/></div>
                    </div>
                    <Skeleton width={80} height={12} borderRadius={6}/>
                    <Skeleton width={90} height={12} borderRadius={6}/>
                    <Skeleton width={60} height={22} borderRadius={20}/>
                    <div className="flex items-center gap-2">
                      <Skeleton circle width={32} height={32}/>
                      <div><Skeleton width={80} height={12} borderRadius={6}/><Skeleton width={55} height={10} borderRadius={6} className="mt-1"/></div>
                    </div>
                    <div className="flex justify-end"><Skeleton circle width={28} height={28}/></div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <HiOfficeBuilding className="text-5xl text-gray-200 mx-auto mb-3"/>
                  <p className="text-gray-600 font-semibold">
                    {search || statusFilter !== "all" || locationFilter !== "all" ? "No properties match your filters" : "No properties yet"}
                  </p>
                  {!search && statusFilter === "all" && locationFilter === "all" && (
                    <button onClick={() => setActive("add-property")}
                      className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                      Add First Property
                    </button>
                  )}
                </div>
              ) : (
                paginated.map(p => (
                  <PropertyRow key={p.id||p._id} p={p}
                    checked={selected.has(p.id||p._id)}
                    onCheck={toggleCheck}
                    onView={setSelectedId}
                    onEdit={setSelectedId}
                    onDelete={handleDelete}/>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── GRID view ── */}
        {viewMode === "grid" && (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({length:6}).map((_,i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <Skeleton height={144} borderRadius={0}/>
                  <div className="p-4 space-y-2.5">
                    <Skeleton width={140} height={14} borderRadius={6}/>
                    <Skeleton width={100} height={11} borderRadius={6}/>
                    <div className="flex justify-between"><Skeleton width={110} height={14} borderRadius={6}/><Skeleton width={60} height={22} borderRadius={20}/></div>
                    <div className="flex gap-2 pt-1"><Skeleton height={34} borderRadius={12} containerClassName="flex-1"/><Skeleton height={34} borderRadius={12} containerClassName="flex-1"/><Skeleton width={36} height={34} borderRadius={12}/></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <HiOfficeBuilding className="text-5xl text-gray-200 mx-auto mb-3"/>
              <p className="text-gray-600 font-semibold">No properties match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(p => (
                <PropertyCard key={p.id||p._id} p={p} onView={setSelectedId} onEdit={setSelectedId} onDelete={handleDelete}/>
              ))}
            </div>
          )
        )}

        {/* ── Footer: count + pagination ── */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="font-bold text-gray-600">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)}</span>
              {" "}of{" "}
              <span className="font-bold text-gray-600">{filtered.length}</span> properties
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
          </div>
        )}

      </div>
    </SkeletonTheme>
  );
}