// src/components/tenant/TenantAgreements.jsx
import React, { useEffect, useState } from "react";
import { HiPencilAlt, HiRefresh } from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

import AgreementCard from "./agreements/AgreementCard";
import SignModal     from "./agreements/SignModal";
import { isPendingStatus } from "./agreements/agreementHelpers";

export default function TenantAgreements({ token, user }) {
  const [agreements, setAgreements] = useState(null);
  const [signing,    setSigning]    = useState(null);

  const tenantName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Tenant";

  const load = async () => {
    try {
      const res  = await fetch(`${API_BASE}/agreements/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAgreements(data.success ? (data.data || []) : []);
    } catch {
      setAgreements([]);
    }
  };

  useEffect(() => { load(); }, [token]);

  const handleSigned = id => {
    setAgreements(prev =>
      prev.map(a => a.id === id ? { ...a, status: "signed", tenantSigned: true } : a)
    );
  };

  const loading = agreements === null;
  const pending = !loading
    ? agreements.filter(a => isPendingStatus(a.status)).length
    : 0;

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">My Agreements</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? (
                <Skeleton width={130} height={13} borderRadius={6} inline/>
              ) : pending > 0 ? (
                <span className="text-orange-500 font-semibold">
                  ⚠ {pending} agreement{pending > 1 ? "s" : ""} awaiting your signature
                </span>
              ) : (
                `${agreements.length} lease agreement${agreements.length !== 1 ? "s" : ""}`
              )}
            </p>
          </div>
          <button onClick={load}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-semibold transition">
            <HiRefresh/> Refresh
          </button>
        </div>

        {/* Pending action banner */}
        {!loading && pending > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <HiPencilAlt className="text-blue-600 text-xl"/>
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-900 text-sm">Action Required</p>
              <p className="text-blue-700 text-xs mt-0.5">
                {pending} lease agreement{pending > 1 ? "s" : ""} waiting for your e-signature.
              </p>
            </div>
            <button
              onClick={() => { const first = agreements.find(a => isPendingStatus(a.status)); if (first) setSigning(first); }}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition shrink-0">
              Sign Now →
            </button>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div><Skeleton width={200} height={16} borderRadius={6} className="mb-1.5"/><Skeleton width={140} height={12} borderRadius={6}/></div>
                  <Skeleton width={90} height={26} borderRadius={20}/>
                </div>
                <div className="grid grid-cols-4 gap-4">{[0,1,2,3].map(j => <Skeleton key={j} height={40} borderRadius={8}/>)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Sign modal — shown inline when tenant clicks Sign Agreement */}
        {signing && (
          <SignModal
          
            agreement={signing}
            tenantName={tenantName}
            token={token}
            onClose={() => setSigning(null)}
            onSigned={handleSigned}
          />
        )}

        {/* Cards — hidden while signing so modal takes full content area */}
        {!loading && !signing && agreements.length > 0 && (
          <div className="space-y-4">
            {agreements.map(a => (
              <AgreementCard key={a.id} agreement={a} onSign={setSigning}/>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && agreements.length === 0 && (
          <div className="bg-gray-50 rounded-3xl p-14 text-center border border-gray-200">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-600 font-semibold">No lease agreements yet.</p>
            <p className="text-sm text-gray-400 mt-1">Your landlord will send you a lease once a property is agreed upon.</p>
          </div>
        )}
      </div>
    </SkeletonTheme>
  );
}