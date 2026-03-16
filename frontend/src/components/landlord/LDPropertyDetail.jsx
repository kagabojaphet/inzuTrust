import React, { useEffect, useState } from "react";
import {
  HiArrowLeft, HiPencil, HiCheckCircle, HiShieldCheck,
  HiLightningBolt, HiLocationMarker, HiX, HiSave,
  HiPhotograph, HiChevronRight, HiExternalLink
} from "react-icons/hi";
import { MdWaterDrop, MdLocalParking, MdCleaningServices } from "react-icons/md";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseImages = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const formatRWF = (n) => `${Number(n).toLocaleString()} RWF`;

const STATUS_MAP = {
  available: { label: "Vacant",   style: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  occupied:  { label: "Occupied", style: "bg-green-50 text-green-700 border border-green-200"   },
};

const amenityIcons = {
  "High-speed Wi-Fi":    <HiLightningBolt className="text-blue-500" />,
  "Underground Parking": <MdLocalParking  className="text-blue-500" />,
  "On-site Gym":         <HiCheckCircle   className="text-blue-500" />,
  "Rooftop Lounge":      <HiCheckCircle   className="text-blue-500" />,
  "In-unit Laundry":     <MdCleaningServices className="text-blue-500" />,
  "Pet Friendly":        <HiCheckCircle   className="text-blue-500" />,
};

const PROPERTY_TYPES = ["house","apartment","room","land","commercial"];
const DISTRICTS      = ["Gasabo","Nyarugenge","Kicukiro","Bugesera","Gatsibo","Kayonza","Kirehe","Ngoma","Rwamagana"];

// ── Skeleton for detail view ──────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Gallery */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
            <Skeleton height={200} borderRadius={0} containerClassName="col-span-2" />
            <div className="flex flex-col gap-2">
              <Skeleton height={97} borderRadius={0} />
              <Skeleton height={97} borderRadius={0} />
            </div>
          </div>
          {/* Title */}
          <Skeleton width={280} height={28} borderRadius={8} />
          <Skeleton width={200} height={14} borderRadius={6} />
          <div className="flex gap-3">
            <Skeleton width={120} height={28} borderRadius={20} />
            <Skeleton width={100} height={28} borderRadius={20} />
          </div>
          {/* Description */}
          <Skeleton width={160} height={18} borderRadius={6} />
          <Skeleton count={3} height={13} borderRadius={6} className="mb-1" />
          {/* Amenities */}
          <Skeleton width={140} height={18} borderRadius={6} />
          <div className="grid grid-cols-2 gap-3">
            {[0,1,2,3].map(i => <Skeleton key={i} height={14} borderRadius={6} />)}
          </div>
        </div>
        <div>
          <Skeleton height={360} borderRadius={16} />
        </div>
      </div>
    </SkeletonTheme>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LDPropertyDetail({ propertyId, token, onBack }) {
  const [property, setProperty] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [mode,     setMode]     = useState("view"); // "view" | "edit"
  const [saving,   setSaving]   = useState(false);
  const [saveError,setSaveError]= useState("");
  const [saved,    setSaved]    = useState(false);
  const [activeImg,setActiveImg]= useState(0);

  // Edit form state — populated from property on mount
  const [form, setForm] = useState(null);

  const authHdr = { Authorization: `Bearer ${token || localStorage.getItem("inzu_token")}` };

  // ── Fetch single property ──────────────────────────────────────────────────
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/properties/${propertyId}`, { headers: authHdr });
        const d   = await res.json();
        if (res.ok) {
          const p = d.data;
          p.imagesList = parseImages(p.images);
          p.statusDisplay = STATUS_MAP[p.status] || STATUS_MAP.available;
          setProperty(p);
          // Pre-fill edit form
          setForm({
            title:       p.title       || "",
            type:        p.type        || "apartment",
            district:    p.district    || "",
            sector:      p.sector      || "",
            address:     p.address     || "",
            rentAmount:  p.rentAmount  || "",
            bedrooms:    p.bedrooms    || 0,
            bathrooms:   p.bathrooms   || 0,
            description: p.description || "",
            status:      p.status      || "available",
          });
        } else {
          setError(d.message || "Failed to load property.");
        }
      } catch {
        setError("Network error — could not load property.");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  // ── Save edits ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    if (!form.title.trim())   { setSaveError("Title is required.");    return; }
    if (!form.district.trim()){ setSaveError("District is required."); return; }
    if (!form.rentAmount)     { setSaveError("Rent is required.");     return; }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/properties/${propertyId}`, {
        method:  "PUT",
        headers: { ...authHdr, "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, rentAmount: Number(form.rentAmount) }),
      });
      const d = await res.json();
      if (res.ok) {
        const updated = { ...property, ...form, rentAmount: Number(form.rentAmount) };
        updated.statusDisplay = STATUS_MAP[updated.status] || STATUS_MAP.available;
        setProperty(updated);
        setMode("view");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSaveError(d.message || "Update failed.");
      }
    } catch {
      setSaveError("Network error during save.");
    } finally {
      setSaving(false);
    }
  };

  // ── Field helper ────────────────────────────────────────────────────────────
  const Field = ({ label, children }) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="max-w-5xl space-y-5">

        {/* ── Back + actions bar ── */}
        <div className="flex items-center justify-between">
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition">
            <HiArrowLeft /> Back to Properties
          </button>

          {!loading && !error && (
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <HiCheckCircle /> Saved!
                </span>
              )}
              {mode === "view" ? (
                <button onClick={() => setMode("edit")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                  <HiPencil /> Edit Property
                </button>
              ) : (
                <>
                  <button onClick={() => { setMode("view"); setSaveError(""); }}
                    className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                    <HiX /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-60">
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      : <><HiSave /> Save Changes</>
                    }
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && <DetailSkeleton />}

        {/* ════════════════════════════════════════════
            VIEW MODE
        ════════════════════════════════════════════ */}
        {!loading && !error && mode === "view" && property && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: detail */}
            <div className="lg:col-span-2 space-y-6">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="hover:text-blue-600 cursor-pointer" onClick={onBack}>Listings</span>
                <HiChevronRight className="text-gray-300" />
                <span className="text-gray-700 font-semibold">{property.title}</span>
              </nav>

              {/* Gallery */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                {/* Main image */}
                <div className="col-span-2 relative">
                  <img
                    src={property.imagesList?.[activeImg] || property.mainImage}
                    alt="main"
                    className="w-full h-52 object-cover"
                  />
                  {property.imagesList?.length > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      Main View
                    </div>
                  )}
                </div>
                {/* Thumbnails */}
                <div className="flex flex-col gap-2">
                  {(property.imagesList?.slice(0, 3) || []).map((img, i) => (
                    <img key={i} src={img} alt={`thumb-${i}`}
                      onClick={() => setActiveImg(i)}
                      className={`w-full object-cover cursor-pointer transition ${
                        property.imagesList?.length > 3 && i === 2 ? "h-[65px] opacity-70 hover:opacity-100" : "h-[65px] hover:opacity-90"
                      }`} />
                  ))}
                  {(!property.imagesList?.length) && (
                    <div className="flex-1 bg-gray-100 flex items-center justify-center rounded-r-2xl">
                      <span className="text-3xl">🏠</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title + Save */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 leading-tight">{property.title}</h1>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <HiLocationMarker className="text-gray-400 shrink-0" />
                    {property.district}{property.sector ? `, ${property.sector}` : ""}
                    {property.address ? ` · ${property.address}` : ""}
                    {property.bedrooms > 0 && ` · ${property.bedrooms} Bed`}
                    {property.bathrooms > 0 && ` · ${property.bathrooms} Bath`}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full">
                  <HiShieldCheck /> INZUTRUST VERIFIED
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-black px-3 py-1.5 rounded-full">
                  <HiCheckCircle /> INSTANT APPLY
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${property.statusDisplay.style}`}>
                  {property.statusDisplay.label}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-semibold capitalize">
                  {property.type}
                </span>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-base font-black text-gray-900 mb-2">Property Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {property.description || "No description provided."}
                </p>
              </div>

              {/* Amenities (from utilities if available) */}
              {property.utilities && (
                <div>
                  <h2 className="text-base font-black text-gray-900 mb-3">What this place offers</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(
                      typeof property.utilities === "string"
                        ? JSON.parse(property.utilities)
                        : property.utilities
                    )
                      .filter(([, v]) => v)
                      .map(([key], i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-blue-500">✓</span>
                          <span className="capitalize">{key}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-black text-gray-900">Location</h2>
                  <span className="text-xs text-gray-500">{property.district}{property.sector ? `, ${property.sector}` : ""}</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 h-44 bg-gray-100">
                  <iframe
                    title="Location"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=30.0,−2.0,30.2,−1.8&layer=mapnik"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Right: booking card */}
            <div>
              <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div>
                  <span className="text-3xl font-black text-gray-900">{formatRWF(property.rentAmount)}</span>
                  <span className="text-gray-400 text-sm font-medium">/month</span>
                </div>

                {/* Fee breakdown */}
                <div className="space-y-2.5 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Security Deposit</span>
                    <span className="font-semibold">{formatRWF(property.rentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cleaning Fee</span>
                    <span className="font-semibold">150 RWF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trust Fee (One-time)</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 line-through text-xs">50 RWF</span>
                      <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">Free to Pro</span>
                    </div>
                  </div>
                </div>

                {/* Trust score */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1">TRUST SCORE REQUIRED</p>
                  <p className="text-2xl font-black text-blue-700">720+</p>
                  <p className="text-xs text-blue-500 mt-1 leading-relaxed">
                    Based on payment history and renter rating.
                  </p>
                </div>

                {/* CTAs */}
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm hover:bg-blue-700 transition">
                  Apply for Lease
                </button>
                <button className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                  Schedule Viewing
                </button>
                <p className="text-center text-xs text-gray-400">You won't be charged until the lease is signed.</p>

                {/* Guarantee */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <HiShieldCheck className="text-green-600 text-xl shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-green-700 mb-1">InzuTrust Guarantee</p>
                    <p className="text-xs text-green-600 leading-relaxed">
                      Every lease signed via InzuTrust is protected against fraud and includes rental payment reporting to boost your credit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            EDIT MODE
        ════════════════════════════════════════════ */}
        {!loading && !error && mode === "edit" && form && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Edit form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-black text-gray-900">Edit Property</h2>

              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {saveError}
                </div>
              )}

              {/* Title */}
              <Field label="Property Title *">
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Kigali Heights Apt 4B" className={inp} />
              </Field>

              {/* Type + Status */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className={inp}>
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className={inp}>
                    <option value="available">Vacant</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </Field>
              </div>

              {/* District + Sector */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="District *">
                  <select value={form.district} onChange={e => setForm({...form, district: e.target.value})}
                    className={inp}>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Sector">
                  <input value={form.sector} onChange={e => setForm({...form, sector: e.target.value})}
                    placeholder="e.g. Kacyiru" className={inp} />
                </Field>
              </div>

              {/* Address */}
              <Field label="Street Address">
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="e.g. KG 7 Ave, Plot 12" className={inp} />
              </Field>

              {/* Rent + Beds + Baths */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Rent (RWF) *">
                  <input type="number" value={form.rentAmount}
                    onChange={e => setForm({...form, rentAmount: e.target.value})}
                    placeholder="300000" min="0" className={inp} />
                </Field>
                <Field label="Bedrooms">
                  <input type="number" value={form.bedrooms}
                    onChange={e => setForm({...form, bedrooms: e.target.value})}
                    min="0" className={inp} />
                </Field>
                <Field label="Bathrooms">
                  <input type="number" value={form.bathrooms}
                    onChange={e => setForm({...form, bathrooms: e.target.value})}
                    min="0" className={inp} />
                </Field>
              </div>

              {/* Description */}
              <Field label="Description">
                <textarea value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={4} placeholder="Describe the property..."
                  className={`${inp} resize-none`} />
              </Field>

              {/* Save button */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setMode("view"); setSaveError(""); }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <><HiSave /> Save Changes</>
                  }
                </button>
              </div>
            </div>

            {/* Right: current images preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <HiPhotograph className="text-gray-400" /> Current Images
              </h3>
              {property.imagesList?.length > 0 ? (
                <div className="space-y-2">
                  {property.imagesList.map((img, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden">
                      <img src={img} alt={`img-${i}`}
                        className="w-full h-28 object-cover" />
                      {i === 0 && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                          MAIN
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">No images uploaded</p>
                </div>
              )}
              <p className="text-xs text-gray-400 text-center">
                To update images, use the Add Property flow.
              </p>
            </div>
          </div>
        )}

      </div>
    </SkeletonTheme>
  );
}