import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  HiSearch,
  HiLocationMarker,
  HiStar,
  HiChevronLeft,
  HiChevronRight,
  HiShieldCheck,
  HiHeart,
  HiAdjustments
} from "react-icons/hi";

import { TbBed, TbBath, TbRulerMeasure } from "react-icons/tb";

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

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function Properties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const DISTRICTS = [
    "Gasabo",
    "Kicukiro",
    "Nyarugenge",
    "Musanze",
    "Rubavu",
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/properties`);

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        const incoming =
          data?.data
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

        setProperties(incoming);
      } catch (error) {
        console.error("Failed to fetch properties:", error);

        // HARD RULE: no mock, no fake data
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filtered = properties.filter((p) => {
    const title = p.title?.toLowerCase() || "";
    const districtName = p.district?.toLowerCase() || "";

    const matchSearch =
      !search ||
      title.includes(search.toLowerCase()) ||
      districtName.includes(search.toLowerCase());

    const matchDistrict =
      district === "all" || p.district === district;

    const matchType =
      typeFilter === "all" || p.type === typeFilter;

    const price = Number(p.rentAmount || 0);

    let matchPrice = true;

    if (priceFilter === "low") matchPrice = price <= 500000;
    if (priceFilter === "mid") matchPrice = price > 500000 && price <= 1000000;
    if (priceFilter === "high") matchPrice = price > 1000000;

    return matchSearch && matchDistrict && matchType && matchPrice;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] w-full">

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-8">

        {/* HEADER */}
        <div className="mb-7">
          <h1 className="text-[22px] md:text-[26px] leading-tight font-medium text-[#0f172a] mb-1">
            Browse Properties
          </h1>

          <p className="text-[#64748b] text-[13px] font-normal">
            Discover hand-picked, verified homes across Rwanda.
          </p>
        </div>

        {/* FILTER BAR (UNCHANGED) */}
        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-3 shadow-sm mb-8">

          <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.7fr_0.7fr_0.7fr_auto] gap-3">

            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-lg" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by neighborhood, street or landmark..."
                className="w-full h-[50px] bg-[#f8fafc] rounded-xl border border-transparent focus:border-[#2563eb] outline-none pl-11 pr-4 text-[13px]"
              />
            </div>

            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-[50px] bg-[#f8fafc] rounded-xl px-4 text-[13px] border border-transparent outline-none text-[#334155]"
            >
              <option value="all">Location (All)</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="h-[50px] bg-[#f8fafc] rounded-xl px-4 text-[13px] border border-transparent outline-none text-[#334155]"
            >
              <option value="all">Price Range</option>
              <option value="low">Below 500K</option>
              <option value="mid">500K - 1M</option>
              <option value="high">1M+</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-[50px] bg-[#f8fafc] rounded-xl px-4 text-[13px] border border-transparent outline-none text-[#334155]"
            >
              <option value="all">Property Type</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <button className="h-[50px] w-full xl:w-[64px] bg-[#2563eb] rounded-xl flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-all">
              <HiAdjustments className="text-lg" />
            </button>

          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] h-[390px] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No properties found from backend.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {filtered.map((property) => {
              const images = parseImages(property.images);

              const image =
                images[0] ||
                property.mainImage ||
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop";

              const rating = Number(property.rating || 0);
              const reviewCount = Number(property.reviewCount || 0);

              return (
                <div
                  key={property.id}
                  className="bg-white border border-[#e5e7eb] rounded-[20px] overflow-hidden hover:shadow-lg transition-all duration-300"
                >

                  <div className="relative h-[205px] overflow-hidden">

                    <img
                      src={image}
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-700"
                    />

                    <div className="absolute top-3 left-3 bg-[#10b981] text-white text-[9px] px-2.5 py-[5px] rounded-full flex items-center gap-1">
                      <HiShieldCheck className="text-xs" />
                      VERIFIED
                    </div>

                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center">
                      <HiHeart className="text-[18px]" />
                    </button>

                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[13px] px-3 py-[10px] rounded-[16px] font-medium">
                      RWF {Number(property.rentAmount || 0).toLocaleString()}
                      <span className="text-white/70 text-[10px]"> /mo</span>
                    </div>

                  </div>

                  <div className="p-4">

                    <div className="flex items-start justify-between gap-3 mb-2">

                      <h2 className="text-[15px] font-medium text-[#0f172a] leading-snug">
                        {property.title}
                      </h2>

                      <div className="flex items-center gap-1 text-[#2563eb] font-medium text-[12px] whitespace-nowrap mt-1">
                        <HiStar className="text-xs" />
                        {rating.toFixed(1)}
                        <span className="text-[10px] text-gray-400 ml-1">
                          ({reviewCount})
                        </span>
                      </div>

                    </div>

                    <div className="flex items-center gap-1 text-[#64748b] text-[12px] mb-4">
                      <HiLocationMarker />
                      {property.district || "Kigali"}
                    </div>

                    <div className="flex gap-3 text-[11px] mb-5">

                      <div className="flex items-center gap-1">
                        <TbBed />
                        {property.bedrooms || 0}
                      </div>

                      <div className="flex items-center gap-1">
                        <TbBath />
                        {property.bathrooms || 0}
                      </div>

                      <div className="flex items-center gap-1">
                        <TbRulerMeasure />
                        {property.squareMeters || 0}m²
                      </div>

                    </div>

                    <button
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="w-full h-[44px] bg-[#f1f5f9] hover:bg-[#2563eb] hover:text-white transition-all rounded-xl font-medium text-[13px] text-[#0f172a]"
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