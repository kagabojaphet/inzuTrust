// src/components/admin/ADProperties.jsx
// Pixel-perfect match to design reference (Images 2 & 3)
// - UPI badge in orange on card
// - Missing doc badges in red/amber, present docs in green
// - Auto-status: all 4 checked → Approve; else → Request More Info / under_review
// - Leaflet map (no API key) for selected property
// - Full skeleton loading + responsive
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  HiCheckCircle, HiX, HiSearch, HiRefresh, HiLocationMarker,
  HiPhotograph, HiDocumentText, HiExclamation, HiShieldCheck,
  HiDownload, HiCog, HiMap,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

const hdrs   = tk => ({ Authorization: `Bearer ${tk}` });

const timeAgo = d => {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const STATUS_TABS = [
  { key: "pending",      label: "Pending Review" },
  { key: "under_review", label: "In Progress"    },
  { key: "verified",     label: "Approved"       },
  { key: "rejected",     label: "Rejected"       },
];

// ── Leaflet Map (lazy-loaded, no API key) ─────────────────────────────────────
function LeafletMap({ lat, lng, title }) {
  const mapRef  = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!lat || !lng || initRef.current) return;

    // Dynamically load Leaflet CSS + JS
    const loadLeaflet = async () => {
      // CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id   = "leaflet-css";
        link.rel  = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }
      // JS
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
          script.onload  = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (!mapRef.current) return;
      initRef.current = true;

      const L   = window.L;
      const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom:     19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="background:#dc2626;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize:   [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b>SELECTED PLOT</b><br/>${title || "Property"}`)
        .openPopup();
    };

    loadLeaflet().catch(console.error);

    return () => {
      if (window.L && mapRef.current && initRef.current) {
        try { window.L.map(mapRef.current).remove(); } catch (_) {}
      }
    };
  }, [lat, lng, title]);

  if (!lat || !lng) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h4 className="text-sm font-black text-gray-900">Property Location</h4>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=14`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <HiMap className="text-sm"/> Open Maps
        </a>
      </div>
      <div ref={mapRef} style={{ height: 160 }} className="w-full z-0"/>
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GIS Coordinates</p>
        <p className="text-xs font-mono text-gray-700 mt-0.5">
          {Number(lat).toFixed(4)}°S &nbsp; {Number(lng).toFixed(4)}°E
        </p>
      </div>
    </div>
  );
}

// ── Doc badge — shows green if present, red/amber if missing ──────────────────
function DocBadge({ label, ok }) {
  if (ok) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
        <HiDocumentText className="text-gray-400 text-xs shrink-0"/>
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600">
      <HiExclamation className="text-red-500 text-xs shrink-0"/>
      Missing {label}
    </span>
  );
}

// ── Property card — matches Image 2 exactly ───────────────────────────────────
function PropertyCard({ property: p, selected, onSelect }) {
  const accentColor = {
    pending:      "border-l-[5px] border-l-amber-400",
    under_review: "border-l-[5px] border-l-blue-400",
    verified:     "border-l-[5px] border-l-green-500",
    rejected:     "border-l-[5px] border-l-red-500",
  }[p.verificationStatus] || "border-l-[5px] border-l-amber-400";

  const img = p.mainImage || (Array.isArray(p.images) && p.images[0]) || null;

  return (
    <div
      onClick={() => onSelect(p)}
      className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        selected?.id === p.id
          ? "border-blue-400 ring-2 ring-blue-100 shadow-md"
          : "border-gray-200"
      } ${accentColor}`}
    >
      <div className="flex gap-4 p-4 items-start">
        {/* Thumbnail */}
        <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {img
            ? <img src={img} alt={p.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center">
                <HiPhotograph className="text-gray-300 text-2xl"/>
              </div>
          }
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          {/* UPI + time — UPI in orange like Image 2 */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {p.upiNumber && (
              <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                UPI: {p.upiNumber}
              </span>
            )}
            <span className="text-[11px] text-gray-400">
              · Submitted {timeAgo(p.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-gray-900 text-[15px] leading-snug truncate">
            {p.title}
          </h3>

          {/* Location */}
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <HiLocationMarker className="shrink-0 text-gray-400"/>
            {p.district}{p.sector ? `, ${p.sector}` : ""}
          </p>

          {/* Document badges */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <DocBadge label="Land Title" ok={p.hasLandTitle}/>
            <DocBadge label="Tax Proof"  ok={p.hasTaxProof}/>
            <DocBadge label="Owner ID"   ok={p.hasOwnerIdDoc}/>
          </div>
        </div>

        {/* Right: submitted by + button */}
        <div className="shrink-0 flex flex-col items-end justify-between gap-3 self-stretch">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-medium">Submitted by</p>
            <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
              {p.landlord ? `${p.landlord.firstName} ${p.landlord.lastName}` : "Landlord —"}
            </p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onSelect(p); }}
            className={`px-5 py-2 rounded-xl text-sm font-black transition whitespace-nowrap ${
              selected?.id === p.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "border-2 border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white"
            }`}
          >
            Review Case
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 border-l-[5px] border-l-gray-200 p-4 flex gap-4 animate-pulse">
      <div className="w-28 h-20 bg-gray-200 rounded-xl shrink-0"/>
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-gray-200 rounded-full w-40"/>
        <div className="h-4 bg-gray-200 rounded-full w-56"/>
        <div className="h-3 bg-gray-100 rounded-full w-32"/>
        <div className="flex gap-2 mt-1">
          <div className="h-6 bg-gray-100 rounded-full w-24"/>
          <div className="h-6 bg-gray-100 rounded-full w-24"/>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end justify-between">
        <div className="space-y-1"><div className="h-2.5 bg-gray-100 rounded w-16"/><div className="h-3 bg-gray-200 rounded w-20"/></div>
        <div className="h-9 bg-gray-200 rounded-xl w-28"/>
      </div>
    </div>
  );
}

// ── Review panel — matches Image 2/3 right panel exactly ─────────────────────
function ReviewPanel({ property: p, token, onUpdated }) {
  const [checks, setChecks] = useState({
    upi:        false,
    landTitle:  false,
    taxClear:   false,
    idVerified: false,
  });
  const [note,    setNote]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const accuracy     = Math.round((checkedCount / 4) * 100);
  const allChecked   = checkedCount === 4;

  const toggle = key => setChecks(p => ({ ...p, [key]: !p[key] }));

  const handleAction = async (action) => {
    setLoading(true); setError("");
    try {
      let url, body;
      if (action === "approve") {
        url  = `${API_BASE}/admin/properties/${p.id}/verify`;
        body = { note };
      } else if (action === "reject") {
        url  = `${API_BASE}/admin/properties/${p.id}/reject`;
        body = { reason: note || "Rejected by admin" };
      } else {
        // Request More Info → mark as under_review via verify endpoint
        url  = `${API_BASE}/admin/properties/${p.id}/verify`;
        body = { note: note || "Additional information requested" };
      }

      const res  = await fetch(url, {
        method:  "PUT",
        headers: { ...hdrs(token), "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) onUpdated();
      else setError(data.message || "Action failed");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const PROTOCOLS = [
    { key: "upi",        label: "UPI Validation",          desc: "Matches Rwanda Land Management System records."   },
    { key: "landTitle",  label: "Land Title Authenticity", desc: "Check for QR code validity and physical stamps."  },
    { key: "taxClear",   label: "Tax Clearance (RRA)",     desc: "Verify no outstanding property tax liabilities."  },
    { key: "idVerified", label: "Identity Verification",   desc: "Owner ID matches Irembo database profile."        },
  ];

  return (
    <div className="space-y-4">

      {/* Trust score card — matches Image 2 exactly */}
      <div className="bg-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10"/>
        <div className="absolute right-4 -bottom-8 w-20 h-20 rounded-full bg-white/10"/>
        <div className="relative z-10 flex items-center justify-between mb-1">
          <p className="text-[10px] font-black uppercase tracking-[2px] text-blue-200">
            Trust Score Threshold
          </p>
          <HiCog className="text-blue-300 text-base"/>
        </div>
        <p className="text-4xl font-black relative z-10 leading-none mt-1">
          {accuracy === 0 ? "0%" : `${accuracy.toFixed(1)}%`}
        </p>
        <p className="text-xs text-blue-200 mt-2 relative z-10 leading-relaxed">
          System accuracy for Rwanda Registry synchronization
        </p>
      </div>

      {/* Verification Protocol card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h4 className="font-black text-gray-900 text-sm flex items-center gap-2 mb-5">
          <span className="text-blue-600">
            {/* custom double-line icon to match Image 2 */}
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="13" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 8v0M11.5 11.5l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          Verification Protocol
        </h4>

        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-bold">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {PROTOCOLS.map(c => (
            <div
              key={c.key}
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => toggle(c.key)}
            >
              {/* Custom checkbox — matches Image 2/3 */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                checks[c.key]
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-300 group-hover:border-blue-400 bg-white"
              }`}>
                {checks[c.key] && (
                  <svg width="10" height="8" fill="none" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900 leading-snug">{c.label}</p>
                <p className="text-[12px] text-gray-400 leading-relaxed mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-5">
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
            Verification Note
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. Missing tax clearance certificate..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none text-gray-700"
          />
        </div>

        {/* Action buttons — auto-enabled based on checks */}
        <div className="space-y-2.5 mt-5">
          {/* Approve — only enabled when all 4 checked */}
          <button
            onClick={() => handleAction("approve")}
            disabled={loading || !allChecked}
            title={!allChecked ? "Complete all 4 protocol checks to approve" : ""}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition ${
              allChecked && !loading
                ? "bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"/>
              : <HiCheckCircle className="text-base"/>
            }
            Approve Listing
          </button>

          {/* Reject */}
          <button
            onClick={() => handleAction("reject")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 transition disabled:opacity-60 shadow-sm shadow-red-100"
          >
            <HiX className="text-base"/> Reject &amp; Notify
          </button>

          {/* Request More Info */}
          <button
            onClick={() => handleAction("review")}
            disabled={loading}
            className="w-full py-2.5 text-gray-500 text-xs font-semibold hover:text-gray-700 transition"
          >
            Request More Info
          </button>
        </div>
      </div>

      {/* Map — only shown if property has coordinates */}
      {p.latitude && p.longitude && (
        <LeafletMap lat={p.latitude} lng={p.longitude} title={p.title}/>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ADProperties({ token }) {
  const [allProperties, setAllProperties] = useState({
    pending: [], under_review: [], verified: [], rejected: [],
  });
  const [counts,   setCounts]   = useState({ pending:0, under_review:0, verified:0, rejected:0 });
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("pending");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statuses = ["pending", "under_review", "verified", "rejected"];
      const results  = await Promise.all(
        statuses.map(s =>
          fetch(`${API_BASE}/admin/properties?status=${s}&limit=100`, { headers: hdrs(token) })
            .then(r => r.json())
            .catch(() => ({ data: [], pagination: { total: 0 } }))
        )
      );
      const [pend, rev, app, rej] = results;
      setAllProperties({
        pending:      pend.data || [],
        under_review: rev.data  || [],
        verified:     app.data  || [],
        rejected:     rej.data  || [],
      });
      setCounts({
        pending:      pend.pagination?.total ?? pend.data?.length ?? 0,
        under_review: rev.pagination?.total  ?? rev.data?.length  ?? 0,
        verified:     app.pagination?.total  ?? app.data?.length  ?? 0,
        rejected:     rej.pagination?.total  ?? rej.data?.length  ?? 0,
      });
    } catch (err) {
      console.error("[ADProperties]", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const properties = allProperties[tab] || [];
  const filtered   = properties.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase())    ||
    p.district?.toLowerCase().includes(search.toLowerCase()) ||
    `${p.landlord?.firstName || ""} ${p.landlord?.lastName || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPending = counts.pending + counts.under_review;

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Property Verification Queue</h1>
            <p className="text-sm text-gray-500 mt-1">
              Validate Rwanda land titles and tax compliance certificates.
              {totalPending > 0 && (
                <span className="ml-1.5 font-bold text-orange-500">
                  {totalPending} awaiting review
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              <HiRefresh className={loading ? "animate-spin" : ""}/>
              Sync Registry
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-sm shadow-blue-200">
              <HiDownload/> Export Report
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-5 items-start">

          {/* Left: list */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Tabs — matches Image 2 */}
            <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
              {STATUS_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSelected(null); }}
                  className={`pb-3 px-5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    tab === t.key
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                  {counts[t.key] > 0 && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                      tab === t.key
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {counts[t.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full max-w-sm">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              />
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i}/>)
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
                  <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
                  <p className="text-gray-500 font-semibold text-sm">No properties in this queue</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {search
                      ? `No results for "${search}"`
                      : "Properties submitted by landlords will appear here"}
                  </p>
                </div>
              ) : (
                filtered.map(p => (
                  <PropertyCard key={p.id} property={p} selected={selected} onSelect={setSelected}/>
                ))
              )}
            </div>

            {/* Count */}
            {!loading && filtered.length > 0 && (
              <p className="text-sm text-gray-400 text-center">
                Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{" "}
                <span className="font-bold text-gray-600">{properties.length}</span> properties
              </p>
            )}
          </div>

          {/* Right panel — desktop */}
          <div className="w-72 xl:w-80 shrink-0 hidden lg:block">
            {selected ? (
              <ReviewPanel
                key={selected.id}
                property={selected}
                token={token}
                onUpdated={() => { setSelected(null); fetchAll(); }}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center sticky top-4">
                <HiShieldCheck className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-sm font-semibold text-gray-400">Select a property to review</p>
                <p className="text-xs text-gray-300 mt-1">Click "Review Case" on any property card</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: review panel as bottom sheet */}
        {selected && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)}/>
            <div className="relative w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900 truncate pr-4">{selected.title}</h3>
                <button onClick={() => setSelected(null)} className="shrink-0 p-1.5 text-gray-400 hover:text-gray-700 rounded-xl">
                  <HiX className="text-xl"/>
                </button>
              </div>
              <ReviewPanel
                key={selected.id}
                property={selected}
                token={token}
                onUpdated={() => { setSelected(null); fetchAll(); }}
              />
            </div>
          </div>
        )}

      </div>
    </SkeletonTheme>
  );
}