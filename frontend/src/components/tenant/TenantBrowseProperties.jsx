// src/components/tenant/TenantBrowseProperties.jsx
// Shown in the "Browse Properties" tab of TenantDashboard
// Fetches all public listings and lets tenant apply directly from dashboard

import React, { useState, useEffect } from "react";
import {
  HiSearch, HiFilter, HiLocationMarker, HiHome,
  HiCurrencyDollar, HiX, HiCheckCircle, HiClock,
  HiOfficeBuilding, HiPhotograph
} from "react-icons/hi";
import { API_BASE } from "../../config";

const TYPE_LABELS = {
  house: "House", apartment: "Apartment", room: "Room",
  land: "Land", commercial: "Commercial",
};

const STATUS_COLOR = {
  available: "bg-green-50 text-green-700",
  occupied:  "bg-gray-100 text-gray-500",
};

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Apply Lease Modal ─────────────────────────────────────────────────────────
function ApplyModal({ property, token, onClose, onSuccess }) {
  const [message,    setMessage]    = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [duration,   setDuration]   = useState(12);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) return setError("Please write a short message to the landlord.");
    if (!moveInDate)      return setError("Please select a move-in date.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/lease-applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property.id,
          message,
          moveInDate,
          duration: Number(duration),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit application");
      onSuccess(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Apply for Lease</h2>
            <p className="text-sm text-gray-500 mt-0.5">{property.title}</p>
            <p className="text-xs text-gray-400">{property.district}{property.sector ? `, ${property.sector}` : ""}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-1">
            <HiX className="text-xl"/>
          </button>
        </div>

        {/* Property summary */}
        <div className="mx-6 mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-bold text-blue-800">Monthly Rent</span>
          <span className="text-lg font-black text-blue-700">
            {Number(property.rentAmount).toLocaleString()} RWF
          </span>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Move-in Date *
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={e => setMoveInDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={inp}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Duration (months)
              </label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className={inp}>
                {[3,6,12,18,24].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
              Message to Landlord *
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Introduce yourself and explain why you're a good fit for this property..."
              className={`${inp} resize-none`}
            />
            <p className="text-[10px] text-gray-400 mt-1">{message.length}/500 characters</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Submitting...</>
              ) : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success Toast ─────────────────────────────────────────────────────────────
function SuccessToast({ onClose, onViewApplications }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-green-200 p-5 max-w-sm animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <HiCheckCircle className="text-green-600 text-xl"/>
        </div>
        <div>
          <p className="font-black text-gray-900 text-sm">Application Submitted!</p>
          <p className="text-xs text-gray-500 mt-0.5">
            The landlord will review your application. You'll be notified once they respond.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onViewApplications}
              className="text-xs font-black text-blue-600 hover:underline"
            >
              View My Applications
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({ property, onApply, appliedIds }) {
  const images   = parseImages(property.images);
  const imgUrl   = property.mainImage || images[0] || null;
  const applied  = appliedIds.has(property.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiPhotograph className="text-gray-300 text-5xl"/>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLOR[property.status] || "bg-gray-100 text-gray-500"}`}>
          {property.status === "available" ? "Available" : "Occupied"}
        </span>
        {property.isVerified && (
          <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
            Verified
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-1">{property.title}</h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
            {TYPE_LABELS[property.type] || property.type}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <HiLocationMarker className="shrink-0"/>
          <span>{property.district}{property.sector ? `, ${property.sector}` : ""}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><HiHome/> {property.bedrooms} bed</span>}
          {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400">Monthly</p>
            <p className="text-base font-black text-gray-900">
              {Number(property.rentAmount).toLocaleString()} <span className="text-xs font-bold text-gray-400">RWF</span>
            </p>
          </div>

          {applied ? (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-xs font-black">
              <HiCheckCircle/> Applied
            </div>
          ) : property.status === "occupied" ? (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-400 px-3 py-2 rounded-xl text-xs font-bold">
              Not Available
            </div>
          ) : (
            <button
              onClick={() => onApply(property)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition"
            >
              Apply Lease
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TenantBrowseProperties({ token, onNavigateToApplications }) {
  const [properties,    setProperties]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("all");
  const [selectedProp,  setSelectedProp]  = useState(null);
  const [appliedIds,    setAppliedIds]    = useState(new Set());
  const [showSuccess,   setShowSuccess]   = useState(false);

  // Load all public properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/properties`);
        const data = await res.json();
        const list = Array.isArray(data) ? data
                   : Array.isArray(data.data) ? data.data
                   : [];
        setProperties(list);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    };

    // Load tenant's existing applications to mark already-applied
    const fetchMyApplications = async () => {
      if (!token) return;
      try {
        const res  = await fetch(`${API_BASE}/lease-applications/my`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const ids = new Set(
            data.data
              .filter(a => ["draft","pending","accepted"].includes(a.status))
              .map(a => a.propertyId)
          );
          setAppliedIds(ids);
        }
      } catch {}
    };

    fetchProperties();
    fetchMyApplications();
  }, [token]);

  const handleApplySuccess = (application) => {
    setAppliedIds(prev => new Set([...prev, application.propertyId]));
    setSelectedProp(null);
    setShowSuccess(true);
  };

  const filtered = properties.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.district?.toLowerCase().includes(search.toLowerCase()) ||
      p.sector?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <>
      {/* Apply modal */}
      {selectedProp && (
        <ApplyModal
          property={selectedProp}
          token={token}
          onClose={() => setSelectedProp(null)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* Success toast */}
      {showSuccess && (
        <SuccessToast
          onClose={() => setShowSuccess(false)}
          onViewApplications={() => {
            setShowSuccess(false);
            if (onNavigateToApplications) onNavigateToApplications();
          }}
        />
      )}

      <div className="space-y-5">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, district, sector..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition bg-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all","house","apartment","room","land","commercial"].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                  typeFilter === t
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t === "all" ? "All Types" : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-black text-gray-900">{filtered.length}</span> properties found
            {appliedIds.size > 0 && (
              <span className="ml-2 text-green-600 font-semibold">
                · {appliedIds.size} applied
              </span>
            )}
          </p>
          {appliedIds.size > 0 && (
            <button
              onClick={onNavigateToApplications}
              className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
            >
              <HiClock/> View my applications
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({length: 6}).map((_,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100"/>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"/>
                  <div className="h-3 bg-gray-100 rounded w-1/2"/>
                  <div className="h-6 bg-gray-100 rounded w-1/3"/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <HiOfficeBuilding className="text-5xl text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-500 font-semibold">No properties found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <PropertyCard
                key={p.id}
                property={p}
                onApply={setSelectedProp}
                appliedIds={appliedIds}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}