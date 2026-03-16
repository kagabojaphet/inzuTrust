import React, { useEffect, useState } from "react";
import LDPropertyDetail from "./LDPropertyDetail";
import { HiPlus, HiPencil, HiTrash, HiEye, HiSearch } from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ── API status → display label + style ───────────────────────────────────────
const STATUS_MAP = {
  available: { label: "Vacant",   style: "bg-yellow-50 text-yellow-700 border border-yellow-100" },
  occupied:  { label: "Occupied", style: "bg-green-50  text-green-700  border border-green-100"  },
};

// ── images comes back as a JSON string from your backend ─────────────────────
const parseImages = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const formatRWF = (n) => `${Number(n).toLocaleString()} RWF`;

// ── Property card skeleton ────────────────────────────────────────────────────
function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <Skeleton height={128} borderRadius={0} />
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton width={140} height={14} borderRadius={6} />
          <Skeleton width={56}  height={20} borderRadius={20} />
        </div>
        <Skeleton width={160} height={12} borderRadius={6} />
        <div className="flex items-center justify-between">
          <Skeleton width={110} height={14} borderRadius={6} />
          <Skeleton width={70}  height={20} borderRadius={20} />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton height={34} borderRadius={12} containerClassName="flex-1" />
          <Skeleton height={34} borderRadius={12} containerClassName="flex-1" />
          <Skeleton width={40}  height={34} borderRadius={12} />
        </div>
      </div>
    </div>
  );
}

export default function LDProperties({ token, setActive }) {
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [selectedId,  setSelectedId]  = useState(null); // null = list, id = detail

  const fetchProperties = async () => {
    // Use the landlord-specific endpoint — requires auth, returns only their properties
    const resolvedToken = token || localStorage.getItem("inzu_token") || "";

    if (!resolvedToken) {
      setError("Not authenticated — please log out and log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/properties/my/list`, {
        headers: { Authorization: `Bearer ${resolvedToken}` },
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setError(`Unexpected server response (${res.status}). Check your API URL.`);
        return;
      }

      const d = await res.json();

      if (res.ok) {
        // Normalise each property: parse images string → array, map status → display
        const normalised = (d.data || []).map(p => ({
          ...p,
          imagesList:    parseImages(p.images),
          statusDisplay: STATUS_MAP[p.status] || STATUS_MAP.available,
        }));
        setProperties(normalised);
      } else {
        setError(d.message || `Server error ${res.status}`);
      }
    } catch (err) {
      setError("Network error — is the server running?");
      console.error("fetchProperties error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    const resolvedToken = token || localStorage.getItem("inzu_token") || "";
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${resolvedToken}` },
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== id && p._id !== id));
      } else {
        const d = await res.json();
        alert(d.message || "Delete failed");
      }
    } catch {
      alert("Network error during delete.");
    }
  };

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q)    ||
      p.district?.toLowerCase().includes(q) ||
      p.sector?.toLowerCase().includes(q)
    );
  });

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      {/* ── Property Detail / Edit view ── */}
      {selectedId && (
        <LDPropertyDetail
          propertyId={selectedId}
          token={token}
          onBack={() => setSelectedId(null)}
        />
      )}

      {/* ── Properties list ── */}
      {!selectedId && (
      <div className="space-y-5 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Properties</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading
                ? <Skeleton width={130} height={13} borderRadius={6} inline />
                : `${properties.length} total propert${properties.length === 1 ? "y" : "ies"}`
              }
            </p>
          </div>
          {/* Navigates to the Add Property multi-step form page */}
          <button
            onClick={() => setActive("add-property")}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <HiPlus /> Add Property
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or district..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            <span className="flex-1">{error}</span>
            <button onClick={fetchProperties}
              className="text-xs font-bold underline hover:text-red-700">
              Retry
            </button>
          </div>
        )}

        {/* ── Skeleton grid ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Property grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => {
              const thumb = p.imagesList?.[0] || p.mainImage || null;
              const pid   = p.id || p._id;
              return (
                <div key={pid}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group">

                  {/* Image */}
                  <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {thumb ? (
                      <img src={thumb} alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏠</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{p.title || p.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.statusDisplay.style}`}>
                        {p.statusDisplay.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2 truncate">
                      📍 {p.district}{p.sector ? `, ${p.sector}` : ""}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-blue-600">
                        {formatRWF(p.rentAmount || p.rent)}/mo
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold capitalize">
                        {p.type}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setSelectedId(pid)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                        <HiEye /> View
                      </button>
                      <button onClick={() => setSelectedId(pid)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition">
                        <HiPencil /> Edit
                      </button>
                      <button onClick={() => handleDelete(pid)}
                        className="w-10 flex items-center justify-center border border-red-100 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition">
                        <HiTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
            <p className="text-3xl mb-3">🏠</p>
            <p className="text-gray-600 font-semibold">
              {search ? "No properties match your search." : "You haven't added any properties yet."}
            </p>
            {!search && (
              <button onClick={() => setActive("add-property")}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                Add Your First Property
              </button>
            )}
          </div>
        )}

      </div>
    
      )}
    </SkeletonTheme>
  );
}