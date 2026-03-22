// src/pages/Properties.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiSearch, HiLocationMarker, HiPhotograph, HiOfficeBuilding,
  HiShieldCheck, HiStar, HiArrowRight
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

const TYPE_LABELS = {
  house: "House", apartment: "Apartment", room: "Room",
  land: "Land", commercial: "Commercial",
};

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

export default function Properties() {
  const navigate        = useNavigate();
  const { token, user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [district,   setDistrict]   = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [appliedIds, setAppliedIds] = useState(new Set());

  const DISTRICTS = ["Gasabo","Kicukiro","Nyarugenge","Musanze","Rubavu","Huye","Muhanga"];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/properties`);
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : data.data || []);
      } catch {}
      finally { setLoading(false); }
    };

    const fetchApplied = async () => {
      if (!token || user?.role !== "tenant") return;
      try {
        const res  = await fetch(`${API_BASE}/lease-applications/my`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setAppliedIds(new Set(
            (data.data || [])
              .filter(a => ["draft","pending","accepted"].includes(a.status))
              .map(a => a.propertyId)
          ));
        }
      } catch {}
    };

    fetchAll();
    fetchApplied();
  }, [token, user]);

  const filtered = properties.filter(p => {
    const matchS = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.district?.toLowerCase().includes(search.toLowerCase()) ||
      p.sector?.toLowerCase().includes(search.toLowerCase());
    const matchD = district   === "all" || p.district === district;
    const matchT = typeFilter === "all" || p.type     === typeFilter;
    return matchS && matchD && matchT;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* Hero */}
      <div className="bg-white border-b border-gray-200 px-4 py-10 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Find Your Next Home in Rwanda</h1>
        <p className="text-gray-500 mb-6">Browse verified properties across Kigali and beyond</p>

        <div className="max-w-xl mx-auto relative mb-4">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"/>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by neighbourhood, street or landmark..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition"
          />
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white focus:outline-none">
            <option value="all">Location (All)</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white focus:outline-none">
            <option>Price Range</option>
            <option>Under 200,000 RWF</option>
            <option>200,000 – 500,000 RWF</option>
            <option>500,000 – 1,000,000 RWF</option>
            <option>1,000,000+ RWF</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white focus:outline-none">
            <option value="all">Property Type</option>
            {Object.entries(TYPE_LABELS).map(([k,v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-black text-gray-900">{filtered.length}</span> properties found
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100"/>
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded w-3/4"/>
                  <div className="h-3 bg-gray-100 rounded w-1/2"/>
                  <div className="h-9 bg-gray-100 rounded mt-3"/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <HiOfficeBuilding className="text-6xl text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-600 font-semibold">No properties found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => {
              const imgs    = parseImages(p.images);
              const imgUrl  = p.mainImage || imgs[0] || null;
              const applied = appliedIds.has(p.id);

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/properties/${p.id}`)}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiPhotograph className="text-gray-300 text-5xl"/>
                      </div>
                    )}
                    {p.isVerified && (
                      <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <HiShieldCheck className="text-xs"/> VERIFIED
                      </span>
                    )}
                    {applied && (
                      <span className="absolute top-2 right-2 bg-green-500/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        Applied
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white font-black text-sm">
                        RWF {Number(p.rentAmount).toLocaleString()}
                        <span className="font-normal text-xs"> /mo</span>
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-1 cursor-pointer hover:text-blue-600 transition"
                        onClick={() => navigate(`/properties/${p.id}`)}>
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <HiStar className="text-yellow-400 text-xs"/>
                        <span className="text-xs font-bold text-gray-600">4.8</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <HiLocationMarker className="shrink-0"/>
                      {p.district}{p.sector ? `, ${p.sector}` : ""}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {p.bedrooms  > 0 && <span>{p.bedrooms} Beds</span>}
                      {p.bathrooms > 0 && <span>{p.bathrooms} Baths</span>}
                      <span>{TYPE_LABELS[p.type] || p.type}</span>
                    </div>
                    <button onClick={() => navigate(`/properties/${p.id}`)}
                      className="w-full flex items-center justify-center gap-1.5 border border-blue-200 text-blue-600 text-xs font-black py-2 rounded-xl hover:bg-blue-50 transition">
                      View Details <HiArrowRight className="text-xs"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">‹</button>
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-black">1</button>
            <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">2</button>
            <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">3</button>
            <span className="text-gray-400 text-xs">…</span>
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-sm">›</button>
          </div>
        )}
      </div>
    </div>
  );
}