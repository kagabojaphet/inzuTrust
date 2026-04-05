// src/components/landlord/tenants/TenantTable.jsx
import React from "react";
import { HiChevronLeft, HiChevronRight, HiCheckCircle, HiClock } from "react-icons/hi";
import { formatRWF, RISK, getRisk, STATUS_BADGE } from "./tenantHelpers";

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-gray-50 animate-pulse">
      <div className="col-span-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="h-2.5 bg-gray-100 rounded w-36" />
        </div>
      </div>
      <div className="col-span-3"><div className="h-3 bg-gray-200 rounded w-32" /></div>
      <div className="col-span-1"><div className="h-4 bg-gray-200 rounded w-8" /></div>
      <div className="col-span-2"><div className="h-2 bg-gray-200 rounded w-full" /></div>
      <div className="col-span-2"><div className="h-5 bg-gray-200 rounded-full w-20" /></div>
      <div className="col-span-1 flex justify-end"><div className="w-7 h-7 rounded-full bg-gray-200" /></div>
    </div>
  );
}

// ── Trust score pill ──────────────────────────────────────────────────────────
function TrustScore({ score }) {
  if (score === null || score === undefined) return <span className="text-gray-300 text-xs">—</span>;
  const color = score >= 80 ? "text-green-600" : score >= 55 ? "text-amber-600" : "text-red-500";
  return <span className={`text-sm font-black ${color}`}>{score}</span>;
}

// ── Risk bar ──────────────────────────────────────────────────────────────────
function RiskBar({ score }) {
  const risk = getRisk(score);
  const r    = RISK[risk];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${r.bar}`} style={{ width: r.width }} />
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${r.badge}`}>{risk}</span>
    </div>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────
export default function TenantTable({ tenants, loading, page, totalPages, total, onPageChange, onView }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
        <div className="col-span-3">Tenant</div>
        <div className="col-span-3">Property</div>
        <div className="col-span-1">Trust</div>
        <div className="col-span-2">Risk Level</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">View</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : tenants.length === 0
          ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-gray-400">No tenants found</p>
              <p className="text-xs text-gray-300 mt-1">Tenants will appear once lease agreements are signed</p>
            </div>
          )
          : tenants.map(t => {
            const statusKey = t.status?.toLowerCase() || "active";
            return (
              <div key={t.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition group">
                {/* Tenant info */}
                <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=dbeafe&color=2563eb&bold=true&size=32`}
                    className="w-8 h-8 rounded-full shrink-0"
                    alt={t.firstName}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{t.firstName} {t.lastName}</p>
                      {t.isVerified && <HiCheckCircle className="text-green-500 text-xs shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{t.email}</p>
                  </div>
                </div>

                {/* Property */}
                <div className="col-span-3 min-w-0">
                  <p className="text-sm text-gray-700 font-medium truncate">{t.property}</p>
                  <p className="text-[10px] text-gray-400">{formatRWF(t.rentAmount)}/mo</p>
                </div>

                {/* Trust score */}
                <div className="col-span-1">
                  <TrustScore score={t.trustScore} />
                </div>

                {/* Risk bar */}
                <div className="col-span-2">
                  <RiskBar score={t.trustScore} />
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[statusKey] || STATUS_BADGE.active}`}>
                    {t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Active"}
                  </span>
                </div>

                {/* View */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => onView(t)}
                    className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-sm opacity-80 group-hover:opacity-100"
                  >
                    <HiChevronRight className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-gray-700">{tenants.length}</span> of{" "}
            <span className="font-bold text-gray-700">{total}</span> tenants
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <HiChevronLeft className="text-sm" />
            </button>
            <span className="text-xs font-bold text-gray-600 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <HiChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}