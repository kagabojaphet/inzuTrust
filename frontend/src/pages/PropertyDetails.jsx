import React, { useState } from "react";
import {
  HiLocationMarker, HiHeart, HiCheckCircle, HiShieldCheck,
  HiChevronRight, HiWifi, HiHome
} from "react-icons/hi";

const formatRWF = (n) => `$${n.toLocaleString()}`;

const property = {
  title: "Modern Urban Studio in Downtown",
  address: "123 Downtown Ave, Metro City | Studio • 1 Bath • 650 sqft",
  price: 2450,
  securityDeposit: 2450,
  cleaningFee: 150,
  trustFee: 0,
  trustScoreRequired: 720,
  verified: true,
  instantApply: true,
  description: `Experience urban living at its finest in this sleek, modern studio located in the heart of Metro City. Features floor-to-ceiling windows with panoramic city views, high-end stainless steel appliances, and a minimalist design philosophy that maximizes every square inch.

Located just steps away from the financial district and the city's best dining experiences. This property includes access to a 24/7 fitness center and a rooftop lounge.`,
  amenities: [
    { icon: "wifi",     label: "High-speed Wi-Fi"    },
    { icon: "parking",  label: "Underground Parking" },
    { icon: "gym",      label: "On-site Gym"         },
    { icon: "rooftop",  label: "Rooftop Lounge"      },
    { icon: "laundry",  label: "In-unit Laundry"     },
    { icon: "pet",      label: "Pet Friendly"        },
  ],
  totalAmenities: 24,
  location: "Metro City, Downtown District",
  images: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80",
  ],
};

const similarProperties = [
  {
    id: 1,
    title: "Modern Industrial Loft",
    details: "2 Beds • 1 Bath • $2,100/mo",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&q=80",
  },
  {
    id: 2,
    title: "Skyline View Penthouse",
    details: "1 Bed • 2 Baths • $3,200/mo",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
  },
  {
    id: 3,
    title: "The Residence at Park Ave",
    details: "Studio • 1 Bath • $1,800/mo",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80",
  },
];

const AmenityIcon = ({ icon }) => {
  const icons = {
    wifi:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
    parking:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
    gym:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    rooftop:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    laundry:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    pet:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  };
  return <span className="text-gray-500">{icons[icon] || icons.wifi}</span>;
};

export default function PropertyDetails({ onBack }) {
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <button onClick={onBack} className="hover:text-blue-600 transition">Home</button>
        <HiChevronRight className="text-gray-300" />
        <button onClick={onBack} className="hover:text-blue-600 transition">Listings</button>
        <HiChevronRight className="text-gray-300" />
        <span className="text-gray-600 font-medium">Modern Urban Studio</span>
      </nav>

      {/* Main grid: images + booking card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Image gallery */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
            {/* Main large image */}
            <div className="col-span-2 relative">
              <img
                src={property.images[0]}
                alt="Main Living Area"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                Main Living Area
              </div>
            </div>
            {/* Side thumbnails */}
            <div className="flex flex-col gap-2">
              {property.images.slice(1).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`View ${i + 2}`}
                  className="w-full h-[79px] object-cover cursor-pointer hover:opacity-90 transition"
                />
              ))}
            </div>
          </div>

          {/* Title + Save */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">
                {property.title}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <HiLocationMarker className="text-gray-400 shrink-0" />
                {property.address}
              </p>
            </div>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition shrink-0 ${saved ? "border-red-300 text-red-500 bg-red-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <HiHeart className={saved ? "text-red-500" : "text-gray-400"} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full">
              <HiShieldCheck className="text-blue-600" />
              INZUTRUST VERIFIED
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-black px-3 py-1.5 rounded-full">
              <HiCheckCircle className="text-green-600" />
              INSTANT APPLY
            </div>
          </div>

          {/* Property Description */}
          <div>
            <h2 className="text-base font-black text-gray-900 mb-3">Property Description</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              {property.description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* What this place offers */}
          <div>
            <h2 className="text-base font-black text-gray-900 mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-3">
              {(showAllAmenities ? property.amenities : property.amenities.slice(0, 4)).map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <AmenityIcon icon={a.icon} />
                  {a.label}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="mt-4 text-blue-600 text-sm font-bold underline hover:text-blue-700 transition"
            >
              {showAllAmenities ? "Show less" : `Show all ${property.totalAmenities} amenities`}
            </button>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-gray-900">Location</h2>
              <span className="text-sm text-gray-500">{property.location}</span>
            </div>
            {/* Map placeholder using OpenStreetMap embed */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-48 relative bg-gray-100">
              <iframe
                title="Property Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=114.0,22.2,114.4,22.5&layer=mapnik&marker=22.35,114.2"
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
              />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Property Location
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          <div className="pb-8">
            <h2 className="text-base font-black text-gray-900 mb-4">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarProperties.map(p => (
                <div key={p.id} className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition cursor-pointer group">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Card (sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">

            {/* Price */}
            <div>
              <span className="text-3xl font-black text-gray-900">${property.price.toLocaleString()}</span>
              <span className="text-gray-400 text-sm font-medium">/month</span>
            </div>

            {/* Fee breakdown */}
            <div className="space-y-2.5 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Security Deposit</span>
                <span className="font-semibold text-gray-900">${property.securityDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cleaning Fee</span>
                <span className="font-semibold text-gray-900">${property.cleaningFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Trust Fee (One-time)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-400 line-through text-xs">$50</span>
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">Free to Pro</span>
                </div>
              </div>
            </div>

            {/* Trust Score Required */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-black uppercase tracking-wider text-blue-500 mb-1">TRUST SCORE REQUIRED</p>
              <p className="text-2xl font-black text-blue-700">{property.trustScoreRequired}+</p>
              <p className="text-xs text-blue-500 mt-1 leading-relaxed">
                Your Trust Score is based on payment history and renter rating.{" "}
                <button className="underline font-semibold hover:text-blue-700">Track your score</button>
              </p>
            </div>

            {/* CTA Buttons */}
            <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition">
              Apply for Lease
            </button>
            <button className="w-full border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
              Schedule Viewing
            </button>

            {/* Fine print */}
            <p className="text-center text-xs text-gray-400 leading-relaxed">
              You won't be charged until the lease is signed.
            </p>

            {/* InzuTrust Guarantee */}
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
    </div>
  );
}