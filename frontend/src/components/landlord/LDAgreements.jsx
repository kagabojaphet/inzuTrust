// src/components/landlord/LDAgreements.jsx
import React, { useEffect, useState } from "react";
import { HiPlus, HiDocumentText, HiX } from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

import CreateLeaseWizard from "./agreements/CreateLeaseWizard";
import AgreementTable    from "./agreements/AgreementTable";
import { mapDisplayStatus } from "./agreements/agreementHelpers";

function StatCards({ agreements, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4">
            <Skeleton width={60} height={11} borderRadius={4} className="mb-2"/>
            <Skeleton width={40} height={28} borderRadius={6}/>
          </div>
        ))}
      </div>
    );
  }
  const stats = [
    { label:"Active",   color:"text-green-600",  count: agreements.filter(a => mapDisplayStatus(a.status) === "Active").length   },
    { label:"Pending",  color:"text-blue-600",   count: agreements.filter(a => mapDisplayStatus(a.status) === "Pending").length  },
    { label:"Expiring", color:"text-yellow-600", count: agreements.filter(a => mapDisplayStatus(a.status) === "Expiring").length },
    { label:"Expired",  color:"text-red-500",    count: agreements.filter(a => mapDisplayStatus(a.status) === "Expired").length  },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 font-semibold mb-1">{s.label}</p>
          <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
        </div>
      ))}
    </div>
  );
}

export default function LDAgreements({ token, user }) {
  const [agreements, setAgreements] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [prefill,    setPrefill]    = useState(null);

  const hdrs = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/agreements`, { headers: hdrs });
      if (res.ok) { const d = await res.json(); setAgreements(d.data || []); }
      else setAgreements([]);
    } catch { setAgreements([]); }
  };

  useEffect(() => { load(); }, [token]);

  const loading = agreements === null;

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Agreements</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading
                ? <Skeleton width={120} height={13} borderRadius={6} inline/>
                : `${agreements.length} lease agreement${agreements.length !== 1 ? "s" : ""}`
              }
            </p>
          </div>
          <button
            onClick={() => { setPrefill(null); setShowCreate(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <HiPlus/> New Lease
          </button>
        </div>

        {/* Stat cards */}
        <StatCards agreements={agreements || []} loading={loading}/>

        {/* Inline create wizard */}
        {showCreate && (
          <div className="rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <HiDocumentText className="text-blue-600 text-lg"/>
                <p className="font-black text-gray-900">Create New Lease Agreement</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-700 transition">
                <HiX className="text-xl"/>
              </button>
            </div>
            <div>
              <CreateLeaseWizard
                token={token}
                user={user}
                prefill={prefill}
                onClose={() => setShowCreate(false)}
                onCreated={() => load()}
              />
            </div>
          </div>
        )}

        {/* Agreements table */}
        <AgreementTable
          agreements={agreements || []}
          loading={loading}
          onRenew={data => { setPrefill(data); setShowCreate(true); }}
          onCreateFirst={() => { setPrefill(null); setShowCreate(true); }}
        />

      </div>
    </SkeletonTheme>
  );
}