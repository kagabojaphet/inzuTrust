// src/pages/PropertyDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiLocationMarker, HiPhotograph, HiShieldCheck, HiHeart,
  HiCalendar, HiArrowRight, HiLightningBolt, HiCheckCircle,
  HiChevronLeft, HiStar, HiHome, HiOfficeBuilding
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";
import ApplyLeaseModal from "../components/tenant/ApplyLeaseModal";

const TYPE_LABELS = {
  house: "House", apartment: "Apartment", room: "Room",
  land: "Land", commercial: "Commercial",
};

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

export default function PropertyDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user, token } = useAuth();

  const isTenant   = user?.role === "tenant";
  const isLoggedIn = !!token;

  const [property,    setProperty]    = useState(null);
  const [similar,     setSimilar]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeImg,   setActiveImg]   = useState(0);
  const [showApply,   setShowApply]   = useState(false);
  const [applied,     setApplied]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saved,       setSaved]       = useState(false);

  // Load property
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/properties/${id}`);
        const data = await res.json();
        const prop = data.data || data;
        setProperty(prop);

        // Load similar properties (same district, different id)
        const allRes  = await fetch(`${API_BASE}/properties`);
        const allData = await allRes.json();
        const all     = Array.isArray(allData) ? allData : allData.data || [];
        setSimilar(all.filter(p => p.id !== id && p.district === prop.district).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Check if already applied
    const checkApplied = async () => {
      if (!token || !isTenant) return;
      try {
        const res  = await fetch(`${API_BASE}/lease-applications/my`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const found = (data.data || []).find(a =>
            a.propertyId === id && ["draft","pending","accepted"].includes(a.status)
          );
          if (found) setApplied(true);
        }
      } catch {}
    };

    fetchProperty();
    checkApplied();
  }, [id, token, isTenant]);

  const handleApplyClick = () => {
    if (!isLoggedIn || !isTenant) {
      // Redirect to register with property context
      const title = encodeURIComponent(property?.title || "");
      navigate(`/register/tenant?action=apply&propertyId=${id}&propertyTitle=${title}`);
      return;
    }
    setShowApply(true);
  };

  const handleApplySuccess = () => {
    setShowApply(false);
    setApplied(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-6"/>
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="h-72 bg-gray-200 rounded-2xl mb-6"/>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"/>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"/>
              <div className="h-32 bg-gray-200 rounded-xl mb-6"/>
            </div>
            <div className="w-80 h-96 bg-gray-200 rounded-2xl"/>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <HiOfficeBuilding className="text-6xl text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 font-semibold">Property not found</p>
          <button onClick={() => navigate("/properties")}
            className="mt-4 text-blue-600 font-bold hover:underline">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const images    = [property.mainImage, ...parseImages(property.images)].filter(Boolean);
  const amenities = parseImages(property.amenities);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* Apply modal */}
      {showApply && (
        <ApplyLeaseModal
          property={property}
          token={token}
          onClose={() => setShowApply(false)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-xl border border-green-200 p-4 max-w-sm flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <HiCheckCircle className="text-green-500 text-2xl shrink-0"/>
          <div className="flex-1">
            <p className="text-sm font-black text-gray-900">Application Submitted!</p>
            <p className="text-xs text-gray-500 mt-0.5">The landlord will review and respond soon.</p>
          </div>
          {isTenant && (
            <button
              onClick={() => navigate("/tenant/dashboard?tab=applications")}
              className="text-xs font-black text-blue-600 hover:underline shrink-0"
            >
              View
            </button>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <button onClick={() => navigate("/")} className="hover:text-blue-600 transition">Home</button>
          <span>›</span>
          <button onClick={() => navigate("/properties")} className="hover:text-blue-600 transition">Listings</button>
          <span>›</span>
          <span className="text-gray-700 font-semibold truncate">{property.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Image gallery */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative h-72 bg-gray-200 rounded-2xl overflow-hidden">
                {images[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiPhotograph className="text-gray-300 text-6xl"/>
                  </div>
                )}
                {images[activeImg] && (
                  <span className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] px-2.5 py-1 rounded-lg font-semibold">
                    Main Living Area
                  </span>
                )}
              </div>
              {/* Thumbnail column */}
              {images.length > 1 && (
                <div className="flex flex-col gap-3 w-32 shrink-0">
                  {images.slice(1, 3).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImg(i + 1)}
                      className={`flex-1 bg-gray-200 rounded-xl overflow-hidden cursor-pointer transition hover:opacity-90 ${activeImg === i+1 ? "ring-2 ring-blue-600" : ""}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover"/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl font-black text-gray-900 leading-tight">{property.title}</h1>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 flex-wrap">
                  <HiLocationMarker className="text-gray-400 shrink-0"/>
                  <span>
                    {property.address && `${property.address} • `}
                    {TYPE_LABELS[property.type] || property.type}
                    {property.bedrooms  > 0 && ` • ${property.bedrooms} Bed`}
                    {property.bathrooms > 0 && ` • ${property.bathrooms} Bath`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSaved(s => !s)}
                className={`flex items-center gap-1.5 text-sm font-bold transition shrink-0 ${saved ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
              >
                <HiHeart className="text-xl"/> {saved ? "Saved" : "Save"}
              </button>
            </div>

            {/* Verified badges */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {property.isVerified && (
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-3 py-1.5 rounded-full">
                  <HiShieldCheck/> INZUTRUST VERIFIED
                </span>
              )}
              {property.status === "available" && (
                <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-black px-3 py-1.5 rounded-full">
                  <HiLightningBolt/> INSTANT APPLY
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-900 mb-2">Property Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {property.description || "No description provided for this property."}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-black text-gray-900 mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenities.slice(0, 6).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-100 rounded-xl px-3 py-2">
                      <HiCheckCircle className="text-green-500 shrink-0"/> {a}
                    </div>
                  ))}
                </div>
                {amenities.length > 6 && (
                  <button className="text-sm text-blue-600 font-bold mt-2 hover:underline">
                    Show all {amenities.length} amenities
                  </button>
                )}
              </div>
            )}

            {/* Location */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-gray-900">Location</h2>
                <span className="text-sm text-gray-400">
                  {property.district}{property.sector && `, ${property.sector}`}
                </span>
              </div>
              <div className="w-full h-52 bg-gray-200 rounded-2xl overflow-hidden">
                <iframe
                  title="property-location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${property.address || ""} ${property.district} ${property.sector || ""} Rwanda`
                  )}&output=embed`}
                />
              </div>
            </div>

            {/* Similar properties */}
            {similar.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-gray-900 mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similar.map(p => {
                    const imgs   = parseImages(p.images);
                    const imgUrl = p.mainImage || imgs[0] || null;
                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/properties/${p.id}`)}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer group"
                      >
                        <div className="h-36 bg-gray-100 overflow-hidden">
                          {imgUrl
                            ? <img src={imgUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                            : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-3xl"/></div>
                          }
                        </div>
                        <div className="p-3">
                          <p className="font-black text-gray-900 text-sm line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.bedrooms > 0 && `${p.bedrooms} Bed • `}
                            {p.bathrooms > 0 && `${p.bathrooms} Bath • `}
                            {Number(p.rentAmount).toLocaleString()} RWF/mo
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ────────────────────────────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">

              {/* Price */}
              <div className="mb-4">
                <p className="text-3xl font-black text-gray-900">
                  ${Number(property.rentAmount).toLocaleString()}
                  <span className="text-base font-normal text-gray-400"> /month</span>
                </p>
              </div>

              {/* Fee breakdown */}
              <div className="space-y-2.5 pb-4 border-b border-gray-100 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-bold text-gray-900">
                    ${Number(property.rentAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cleaning Fee</span>
                  <span className="font-bold text-gray-900">$150</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trust Fee (One-time)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-400 line-through text-xs">$50</span>
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Free for Pro</span>
                  </div>
                </div>
              </div>

              {/* Trust score required */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-wide">Trust Score Required</span>
                  <span className="text-sm font-black text-blue-600">100+</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mb-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "65%" }}/>
                </div>
                <p className="text-[10px] text-blue-600 leading-relaxed">
                  Your Trust Score is based on payment history and verified background.{" "}
                  <button
                    onClick={() => navigate("/tenant/dashboard?tab=trust")}
                    className="underline font-bold"
                  >
                    Check your score
                  </button>
                </p>
              </div>

              {/* Apply button */}
              {applied ? (
                <div className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl text-sm font-black mb-3">
                  <HiCheckCircle/> Application Submitted
                </div>
              ) : property.status === "occupied" ? (
                <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl text-sm font-bold text-center mb-3">
                  Not Available
                </div>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black hover:bg-blue-700 transition mb-3 flex items-center justify-center gap-2"
                >
                  Apply for Lease <HiArrowRight/>
                </button>
              )}

              <button className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <HiCalendar className="text-gray-400"/> Schedule Viewing
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                You won't be charged until the lease is signed.
              </p>

              {/* InzuTrust Guarantee */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2.5">
                <HiShieldCheck className="text-green-600 text-xl shrink-0 mt-0.5"/>
                <div>
                  <p className="text-xs font-black text-green-800">InzuTrust Guarantee</p>
                  <p className="text-[10px] text-green-700 mt-0.5 leading-relaxed">
                    Every lease signed via InzuTrust is protected against fraud and includes rental payment reporting to boost your credit.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}