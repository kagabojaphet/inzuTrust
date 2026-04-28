// src/pages/Properties.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiSearch, HiLocationMarker, HiPhotograph, HiOfficeBuilding,
  HiShieldCheck, HiStar, HiArrowRight,
  HiViewGrid, HiViewList, HiMap
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

const TYPE_LABELS = {
  house: "House", 
  apartment: "Apartment", 
  room: "Room",
  land: "Land", 
  commercial: "Commercial",
};

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

export default function Properties() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list" | "map"

  const DISTRICTS = ["Gasabo", "Kicukiro", "Nyarugenge", "Musanze", "Rubavu", "Huye", "Muhanga"];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/properties`);
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : data.data || []);
      } catch {}
      finally { setLoading(false); }
    };

    const fetchApplied = async () => {
      if (!token || user?.role !== "tenant") return;
      try {
        const res = await fetch(`${API_BASE}/lease-applications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setAppliedIds(new Set(
            (data.data || [])
              .filter(a => ["draft", "pending", "accepted"].includes(a.status))
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
    const matchD = district === "all" || p.district === district;
    const matchT = typeFilter === "all" || p.type === typeFilter;
    return matchS && matchD && matchT;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* Top Header - Matches Figma */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
          
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900">Browse Properties</h1>
            <p className="text-gray-500 mt-1">Discover hand-picked, verified homes across Rwanda.</p>
          </div>

          {/* Search + Filters + View Toggle in one row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by neighborhood, street or landmark..."
                className="w-full pl-14 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select 
                value={district} 
                onChange={e => setDistrict(e.target.value)}
                className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none min-w-[160px]"
              >
                <option value="all">Location (All)</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none min-w-[160px]">
                <option>Price Range</option>
                <option>Under 200,000 RWF</option>
                <option>200,000 – 500,000 RWF</option>
                <option>500,000 – 1,000,000 RWF</option>
                <option>1,000,000+ RWF</option>
              </select>

              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
                className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none min-w-[160px]"
              >
                <option value="all">Property Type</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* View Toggle - As per your image */}
            <div className="flex bg-white border border-gray-200 rounded-2xl p-1 ml-auto">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <HiViewGrid className="text-2xl" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <HiViewList className="text-2xl" />
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={`p-3 rounded-xl transition ${viewMode === "map" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <HiMap className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
        <p className="text-sm text-gray-500 mb-8">
          <span className="font-black text-gray-900">{filtered.length}</span> properties found
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* skeletons */}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">No properties found</div>
        ) : viewMode === "list" ? (
          /* List View */
          <div className="space-y-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-5 hover:shadow-md transition">
                {/* Add your list view card here - similar to your landlord table but simplified */}
                <div className="w-32 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {parseImages(p.images)[0] && <img src={parseImages(p.images)[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-500">{p.district}</p>
                  <p className="text-xl font-black mt-2">RWF {Number(p.rentAmount).toLocaleString()}/mo</p>
                </div>
                <button onClick={() => navigate(`/properties/${p.id}`)} className="self-center px-8 py-3 bg-blue-600 text-white rounded-2xl">View Details</button>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View (default) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => {
              const imgs = parseImages(p.images);
              const imgUrl = p.mainImage || imgs[0] || null;
              const applied = appliedIds.has(p.id);

              return (
                <div key={p.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                  <div className="relative h-56 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => navigate(`/properties/${p.id}`)}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <HiPhotograph className="text-6xl text-gray-300 absolute inset-0 m-auto" />
                    )}
                    {p.isVerified && (
                      <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                        <HiShieldCheck className="text-xs" /> VERIFIED
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                      <p className="text-white font-black text-lg">
                        RWF {Number(p.rentAmount || 0).toLocaleString()}<span className="font-normal text-sm"> /mo</span>
                      </p>
                    </div>
                    <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center">♡</button>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-black text-lg leading-tight cursor-pointer" onClick={() => navigate(`/properties/${p.id}`)}>
                        {p.title}
                      </h3>
                      <div className="flex items-center text-yellow-400">
                        <HiStar className="text-lg" /> <span className="ml-1 text-sm font-bold text-gray-700">4.9</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                      <HiLocationMarker /> {p.district}{p.sector ? `, ${p.sector}` : ""}
                    </p>
                    <button 
                      onClick={() => navigate(`/properties/${p.id}`)}
                      className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}