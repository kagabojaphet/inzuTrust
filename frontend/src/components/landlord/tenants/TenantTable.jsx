import React from "react";
import { HiChevronLeft, HiChevronRight, HiCheckCircle } from "react-icons/hi";
import { formatRWF, STATUS_BADGE } from "./tenantHelpers";

function TrustScore({ score }) {
  // Logic: Ensure score is never empty (Default to 100)
  const displayScore = (score === null || score === undefined) ? 100 : score;
  const color = displayScore >= 80 ? "text-green-600" : displayScore >= 55 ? "text-amber-600" : "text-red-500";
  
  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-black ${color}`}>{displayScore}</span>
      <span className="text-[8px] text-gray-400 uppercase font-black tracking-tighter">Points</span>
    </div>
  );
}

export default function TenantTable({ tenants, loading, page, totalPages, total, onPageChange, onView }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Header Grid */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="col-span-4">Tenant Identity</div>
            <div className="col-span-4">Property & Lease</div>
            <div className="col-span-1 text-center">Trust</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">View</div>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-12 text-center text-gray-400 font-bold uppercase text-xs animate-pulse">
                Syncing with Database...
              </div>
            ) : tenants.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No active tenants</p>
              </div>
            ) : (
              tenants.map(t => {
                const statusKey = t.status?.toLowerCase() || "active";
                return (
                  <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50/80 transition-all group">
                    {/* Tenant */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={`https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=EEF2FF&color=4F46E5&bold=true`}
                          className="w-10 h-10 rounded-xl shrink-0 border border-blue-50"
                          alt="avatar"
                        />
                        {t.isVerified && <HiCheckCircle className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full text-sm" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{t.firstName} {t.lastName}</p>
                        <p className="text-[11px] text-gray-400 font-medium truncate">{t.email}</p>
                      </div>
                    </div>

                    {/* Property */}
                    <div className="col-span-4 min-w-0">
                      <p className="text-sm text-gray-700 font-bold truncate">{t.property}</p>
                      <p className="text-[11px] text-blue-600 font-black uppercase">
                        {formatRWF(t.rentAmount)} <span className="text-gray-400 font-medium">/ month</span>
                      </p>
                    </div>

                    {/* Trust Score */}
                    <div className="col-span-1">
                      <TrustScore score={t.trustScore} />
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider border ${STATUS_BADGE[statusKey] || STATUS_BADGE.active}`}>
                        {t.status?.replace("_", " ") || "Active"}
                      </span>
                    </div>

                    {/* View Action */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => onView(t)}
                        className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm rounded-xl transition-all"
                      >
                        <HiChevronRight className="text-xl" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      {!loading && total > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
            Showing <span className="text-gray-900">{tenants.length}</span> of {total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <HiChevronLeft />
            </button>
            <span className="text-xs font-black text-gray-700 px-2">{page} / {totalPages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <HiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}