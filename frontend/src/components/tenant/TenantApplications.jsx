// src/components/tenant/TenantApplications.jsx
// Shows all lease applications the tenant has submitted with live status

import React, { useState, useEffect } from "react";
import {
  HiClock, HiCheckCircle, HiXCircle, HiDocumentText,
  HiLocationMarker, HiRefresh, HiPhotograph, HiExclamation
} from "react-icons/hi";
import { API_BASE } from "../../config";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    badge: "bg-gray-100 text-gray-600",
    icon: HiDocumentText,
    desc: "Not yet submitted",
  },
  pending: {
    label: "Pending Review",
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: HiClock,
    desc: "Waiting for landlord response",
  },
  accepted: {
    label: "Accepted",
    badge: "bg-green-50 text-green-700 border border-green-200",
    icon: HiCheckCircle,
    desc: "Landlord accepted your application",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-50 text-red-700 border border-red-200",
    icon: HiXCircle,
    desc: "Application was not successful",
  },
};

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

export default function TenantApplications({ token, onBrowse }) {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/lease-applications/my`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const filtered = filter === "all"
    ? applications
    : applications.filter(a => a.status === filter);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({length: 3}).map((_,i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse flex gap-4">
            <div className="w-24 h-20 bg-gray-100 rounded-xl shrink-0"/>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-2/3"/>
              <div className="h-3 bg-gray-100 rounded w-1/3"/>
              <div className="h-3 bg-gray-100 rounded w-1/2"/>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {["all","pending","accepted","rejected"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "All Applications" : STATUS_CONFIG[f]?.label || f}
              {f === "all" && applications.length > 0 && (
                <span className="ml-1.5 bg-white/20 px-1 rounded text-[10px]">{applications.length}</span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition font-semibold"
        >
          <HiRefresh/> Refresh
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-600 font-bold">
            {filter === "all" ? "No applications yet" : `No ${filter} applications`}
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            {filter === "all"
              ? "Browse available properties and apply for the one you like"
              : "Your applications with this status will appear here"}
          </p>
          {filter === "all" && (
            <button
              onClick={onBrowse}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition"
            >
              Browse Properties
            </button>
          )}
        </div>
      )}

      {/* Application cards */}
      <div className="space-y-4">
        {filtered.map(app => {
          const cfg    = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;
          const Icon   = cfg.icon;
          const prop   = app.property;
          const images = parseImages(prop?.images);
          const imgUrl = prop?.mainImage || images[0] || null;

          return (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition">
              <div className="flex gap-4">
                {/* Property image */}
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {imgUrl ? (
                    <img src={imgUrl} alt={prop?.title} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiPhotograph className="text-gray-300 text-2xl"/>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-black text-gray-900 text-sm leading-tight">
                        {prop?.title || "Property"}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <HiLocationMarker className="shrink-0"/>
                        <span>{prop?.district}{prop?.sector ? `, ${prop.sector}` : ""}</span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}>
                      <Icon className="text-xs"/> {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    {prop?.rentAmount && (
                      <span className="font-bold text-gray-700">
                        {Number(prop.rentAmount).toLocaleString()} RWF/mo
                      </span>
                    )}
                    {app.moveInDate && (
                      <span className="flex items-center gap-1">
                        <HiClock/> Move-in: {new Date(app.moveInDate).toLocaleDateString("en-GB", {day:"2-digit",month:"short",year:"numeric"})}
                      </span>
                    )}
                    {app.duration && <span>{app.duration} months</span>}
                  </div>

                  {/* Landlord note on accepted/rejected */}
                  {app.landlordNote && (
                    <div className={`mt-2.5 text-xs px-3 py-2 rounded-xl border ${
                      app.status === "accepted"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-orange-50 border-orange-200 text-orange-700"
                    }`}>
                      <span className="font-bold">Landlord: </span>{app.landlordNote}
                    </div>
                  )}

                  {/* Next step hint */}
                  {app.status === "accepted" && (
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-blue-600 font-bold">
                      <HiDocumentText/>
                      Check your Agreements tab — the landlord will send you a lease to sign.
                    </div>
                  )}

                  {/* Applied date */}
                  <p className="text-[10px] text-gray-400 mt-2">
                    Applied {new Date(app.createdAt).toLocaleDateString("en-GB", {day:"2-digit",month:"short",year:"numeric"})}
                    {app.respondedAt && ` · Responded ${new Date(app.respondedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}