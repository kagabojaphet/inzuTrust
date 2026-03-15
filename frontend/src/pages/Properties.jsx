import React, { useState } from "react";
import PropertyDetails from "./PropertyDetails";
import {
  HiSearch, HiHeart, HiChevronDown, HiChevronLeft, HiChevronRight,
  HiAdjustments
} from "react-icons/hi";

// ── Mock property data ──────────────────────────────────────────────────────
const properties = [
  {
    id: 1,
    title: "Hillside Panorama Villa",
    location: "Nyarutarama, Kigali",
    price: 1200000,
    priceLabel: "/mo",
    rating: 4.9,
    beds: 4, baths: 3, area: 240,
    verified: true,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
  },
  {
    id: 2,
    title: "The Emerald Heights",
    location: "Kiyovu, Kigali",
    price: 850000,
    priceLabel: "/mo",
    rating: 4.8,
    beds: 2, baths: 2, area: 105,
    verified: true,
    image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&q=80",
  },
  {
    id: 3,
    title: "Kimironko Loft House",
    location: "Kimironko, Kigali",
    price: 490000,
    priceLabel: "/mo",
    rating: 4.7,
    beds: 3, baths: 1, area: 86,
    verified: true,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  },
  {
    id: 4,
    title: "Kigali View Estate",
    location: "Rebero, Kigali",
    price: 2100000,
    priceLabel: "/mo",
    rating: 5.0,
    beds: 5, baths: 4, area: 410,
    verified: true,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  },
  {
    id: 5,
    title: "Downtown Studio Suites",
    location: "Muhero, Kigali",
    price: 500000,
    priceLabel: "/mo",
    rating: 4.6,
    beds: 1, baths: 1, area: 58,
    verified: true,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
  },
  {
    id: 6,
    title: "Kicukiro Garden Home",
    location: "Kicukiro, Kigali",
    price: 350000,
    priceLabel: "/mo",
    rating: 4.5,
    beds: 3, baths: 2, area: 150,
    verified: true,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  },
];

const ITEMS_PER_PAGE = 6;
const TOTAL_PAGES = 12;

const formatRWF = (n) => `RWF ${n.toLocaleString()}`;

// ── Verified Badge ──────────────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <div className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      VERIFIED
    </div>
  );
}

// ── Property Card ───────────────────────────────────────────────────────────
function PropertyCard({ property, onViewDetails }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Verified badge top-left */}
        <div className="absolute top-3 left-3">
          {property.verified && <VerifiedBadge />}
        </div>
        {/* Price tag bottom-left */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-black px-2.5 py-1 rounded-lg">
          {formatRWF(property.price)}<span className="font-normal opacity-75">{property.priceLabel}</span>
        </div>
        {/* Wishlist button top-right */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <HiHeart className={`text-base transition-colors ${liked ? "text-red-500" : "text-gray-300"}`} />
        </button>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{property.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-blue-600 text-xs">★</span>
            <span className="text-xs font-bold text-gray-700">{property.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Location */}
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {property.location}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-3 border-b border-gray-100">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {property.beds} Beds
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {property.baths} Baths
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {property.area}m²
          </span>
        </div>

        {/* View Details button */}
        <button onClick={() => onViewDetails(property)} className="w-full border border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 flex items-center justify-center gap-1.5">
          View Details
          <HiChevronRight className="text-base" />
        </button>
      </div>
    </div>
  );
}

// ── Select Dropdown ─────────────────────────────────────────────────────────
function FilterSelect({ label, options }) {
  const [value, setValue] = useState(options[0]);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => setValue(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
    </div>
  );
}

// ── Pagination ──────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  const pages = [];
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", total);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition"
      >
        <HiChevronLeft className="text-base" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition ${
              current === p
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition"
      >
        <HiChevronRight className="text-base" />
      </button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function Properties() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);

  if (selectedProperty) {
    return <PropertyDetails property={selectedProperty} onBack={() => setSelectedProperty(null)} />;
  }

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Browse Properties</h1>
        <p className="text-gray-500 mt-1 text-sm">Discover hand-picked, verified homes across Rwanda.</p>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-stretch sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by neighborhood, street or landmark..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <FilterSelect label="Location" options={["Location (All)", "Kigali", "Nyarutarama", "Kimironko", "Kicukiro", "Rebero"]} />
          <FilterSelect label="Price Range" options={["Price Range", "Under 500K", "500K – 1M", "1M – 2M", "2M+"]} />
          <FilterSelect label="Property Type" options={["Property Type", "House", "Apartment", "Studio", "Villa", "Estate"]} />

          {/* Filter icon button */}
          <button className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition shrink-0">
            <HiAdjustments className="text-lg" />
          </button>
        </div>
      </div>

      {/* Property grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <PropertyCard key={p.id} property={p} onViewDetails={setSelectedProperty} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <span className="text-5xl block mb-3">🏠</span>
          <p className="font-semibold">No properties found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination current={currentPage} total={TOTAL_PAGES} onChange={setCurrentPage} />
    </div>
  );
}