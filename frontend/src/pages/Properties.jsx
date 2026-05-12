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
        const data = await res.json();

        const incoming = Array.isArray(data)
          ? data
          : data.data || [];

        if (incoming.length > 0) {
          setProperties(incoming);
        } else {
          setProperties(mockProperties);
        }
      } catch (error) {
        setProperties(mockProperties);
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

    let matchPrice = true;

    if (priceFilter === "low") {
      matchPrice = p.price <= 500000;
    }

    if (priceFilter === "mid") {
      matchPrice =
        p.price > 500000 && p.price <= 1000000;
    }

    if (priceFilter === "high") {
      matchPrice = p.price > 1000000;
    }

    return (
      matchSearch &&
      matchDistrict &&
      matchType &&
      matchPrice
    );
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] w-full">

      {/* MAIN */}
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

        {/* FILTER BAR */}
        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-3 shadow-sm mb-8">

          <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.7fr_0.7fr_0.7fr_auto] gap-3">

            {/* SEARCH */}
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

            {/* LOCATION */}
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-[50px] bg-[#f8fafc] rounded-xl px-4 text-[13px] border border-transparent outline-none text-[#334155]"
            >
              <option value="all">Location (All)</option>

              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}

            </select>

            {/* PRICE */}
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

            {/* TYPE */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-[50px] bg-[#f8fafc] rounded-xl px-4 text-[13px] border border-transparent outline-none text-[#334155]"
            >
              <option value="all">Property Type</option>

              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}

            </select>

            {/* FILTER BTN */}
            <button className="h-[50px] w-full xl:w-[64px] bg-[#2563eb] rounded-xl flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-all">

              <HiAdjustments className="text-lg" />

            </button>

          </div>

        </div>

        {/* PROPERTY GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] h-[390px] animate-pulse"
              />
            ))}

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {filtered.map((property) => {
              const images = parseImages(property.images);

              const image =
                images[0] ||
                property.image ||
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop";

              return (
                <div
                  key={property.id}
                  className="bg-white border border-[#e5e7eb] rounded-[20px] overflow-hidden hover:shadow-lg transition-all duration-300"
                >

                  {/* IMAGE */}
                  <div className="relative h-[205px] overflow-hidden">

                    <img
                      src={image}
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-700"
                    />

                    {/* VERIFIED */}
                    <div className="absolute top-3 left-3 bg-[#10b981] text-white text-[9px] font-medium px-2.5 py-[5px] rounded-full flex items-center gap-1">

                      <HiShieldCheck className="text-xs" />
                      VERIFIED

                    </div>

                    {/* HEART */}
                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center">

                      <HiHeart className="text-[18px]" />

                    </button>

                    {/* PRICE */}
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[13px] px-3 py-[10px] rounded-[16px] font-medium">

                      RWF{" "}
                      {Number(
                        property.price || 450000
                      ).toLocaleString()}

                      <span className="text-white/70 text-[10px]">
                        {" "}
                        /mo
                      </span>

                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="p-4">

                    {/* TITLE + RATING */}
                    <div className="flex items-start justify-between gap-3 mb-3">

                      <h2 className="text-[15px] font-medium text-[#0f172a] leading-snug">
                        {property.title}
                      </h2>

                      <div className="flex items-center gap-1 text-[#2563eb] font-medium text-[12px] whitespace-nowrap mt-1">

                        <HiStar className="text-xs" />
                        {property.rating || 4.8}

                      </div>

                    </div>

                    {/* LOCATION */}
                    <div className="flex items-center gap-1 text-[#64748b] text-[12px] mb-4">

                      <HiLocationMarker className="text-sm" />

                      {property.district || "Kigali"}

                    </div>

                    {/* DIVIDER */}
                    <div className="border-t border-[#edf2f7] mb-4"></div>

                    {/* FEATURES */}
                    <div className="flex items-center gap-3 text-[#475569] text-[11px] mb-5 flex-wrap">

                      <div className="flex items-center gap-1">
                        <TbBed className="text-[15px]" />
                        {property.bedrooms || 3} Beds
                      </div>

                      <div className="flex items-center gap-1">
                        <TbBath className="text-[15px]" />
                        {property.bathrooms || 2} Baths
                      </div>

                      <div className="flex items-center gap-1">
                        <TbRulerMeasure className="text-[15px]" />
                        {property.size || 240}m²
                      </div>

                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() =>
                        navigate(`/properties/${property.id}`)
                      }
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

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-2 mt-14">

          <button className="w-9 h-9 rounded-xl border border-[#e5e7eb] bg-white flex items-center justify-center text-sm">
            <HiChevronLeft />
          </button>

          <button className="w-9 h-9 rounded-xl bg-[#2563eb] text-white text-[12px] font-medium">
            1
          </button>

          <button className="w-9 h-9 rounded-xl border border-[#e5e7eb] bg-white text-[12px]">
            2
          </button>

          <button className="w-9 h-9 rounded-xl border border-[#e5e7eb] bg-white text-[12px]">
            3
          </button>

          <span className="px-2 text-[#94a3b8] text-sm">...</span>

          <button className="w-9 h-9 rounded-xl border border-[#e5e7eb] bg-white text-[12px]">
            12
          </button>

          <button className="w-9 h-9 rounded-xl border border-[#e5e7eb] bg-white flex items-center justify-center text-sm">
            <HiChevronRight />
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   MOCK DATA
========================================= */

const mockProperties = [
  {
    id: 1,
    title: "Hillside Panorama Villa",
    district: "Nyarutarama, Kigali",
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3,
    size: 240,
    rating: 4.9,
    type: "house",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 2,
    title: "The Emerald Heights",
    district: "Kiyovu, Kigali",
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    size: 110,
    rating: 4.8,
    type: "apartment",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 3,
    title: "Kimironko Loft House",
    district: "Kimironko, Kigali",
    price: 450000,
    bedrooms: 3,
    bathrooms: 1,
    size: 95,
    rating: 4.7,
    type: "house",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 4,
    title: "Kigali View Estate",
    district: "Rebero, Kigali",
    price: 2100000,
    bedrooms: 5,
    bathrooms: 4,
    size: 450,
    rating: 5.0,
    type: "house",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 5,
    title: "Downtown Studio Suites",
    district: "Muhima, Kigali",
    price: 600000,
    bedrooms: 1,
    bathrooms: 1,
    size: 55,
    rating: 4.6,
    type: "apartment",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 6,
    title: "Kicukiro Garden Home",
    district: "Kicukiro, Kigali",
    price: 350000,
    bedrooms: 2,
    bathrooms: 2,
    size: 180,
    rating: 4.5,
    type: "house",
    image:
      "https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1200&auto=format&fit=crop",
  },
];