// src/components/landlord/agents/AgentTable.jsx
// Added: pagination (prev/next + page numbers), permission pill for all 7 perms
import React, { useState } from "react";
import {
  HiOfficeBuilding, HiCheckCircle, HiClock, HiEye,
  HiChevronLeft, HiChevronRight,
} from "react-icons/hi";
import { fmtDate, isOnline, PERM_LABELS, PERM_COLORS } from "./agentHelpers";

const PAGE_SIZE = 8;

function PermPill({ permKey, active }) {
  if (!active) return null;
  const meta = PERM_LABELS[permKey];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded border ${PERM_COLORS[meta.color]}`}>
      {meta.label}
    </span>
  );
}

function OnlineBadge({ agent }) {
  if (isOnline(agent.lastSeenAt)) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>Online
      </span>
    );
  }
  return <span className="text-[10px] text-gray-400">{agent.lastSeenAt ? fmtDate(agent.lastSeenAt) : "Never"}</span>;
}

function SkeletonRow({ i }) {
  return (
    <div key={`sk-${i}`} className="grid grid-cols-12 gap-3 px-5 py-4 items-center animate-pulse border-b border-gray-50">
      <div className="col-span-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0"/>
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-200 rounded w-28"/>
          <div className="h-2.5 bg-gray-100 rounded w-36"/>
        </div>
      </div>
      <div className="col-span-2"><div className="h-5 bg-gray-200 rounded-full w-20"/></div>
      <div className="col-span-2"><div className="h-3 bg-gray-200 rounded w-20"/></div>
      <div className="col-span-1"><div className="h-3 bg-gray-200 rounded w-8 mx-auto"/></div>
      <div className="col-span-3 flex gap-1">
        <div className="h-5 bg-gray-200 rounded w-16"/>
        <div className="h-5 bg-gray-100 rounded w-20"/>
      </div>
      <div className="col-span-1 flex justify-end"><div className="h-8 bg-gray-200 rounded-xl w-16"/></div>
    </div>
  );
}

export default function AgentTable({ agents, loading, onView }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(agents.length / PAGE_SIZE));
  const paged      = agents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when agents list changes
  React.useEffect(() => { setPage(1); }, [agents.length]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
        <div className="col-span-3">Agent</div>
        <div className="col-span-2">KYC Status</div>
        <div className="col-span-2">Last Seen</div>
        <div className="col-span-1 text-center">Props</div>
        <div className="col-span-3">Permissions</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`sk-${i}`} i={i}/>)
        ) : paged.length === 0 ? (
          <div className="py-16 text-center">
            <HiOfficeBuilding className="text-4xl text-gray-200 mx-auto mb-3"/>
            <p className="text-sm font-semibold text-gray-400">No agents found</p>
          </div>
        ) : (
          paged.map(({ agent: a, properties: props }) => {
            // Aggregate all permissions across all assigned properties
            const allPerms = Object.fromEntries(Object.keys(PERM_LABELS).map(k => [k, false]));
            props.forEach(p => {
              Object.keys(allPerms).forEach(k => { if (p.permissions?.[k]) allPerms[k] = true; });
            });

            return (
              <div key={a.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-gray-50/60 transition group">
                {/* Agent */}
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=dbeafe&color=2563eb&bold=true`}
                      alt="" className="w-9 h-9 rounded-xl"/>
                    {isOnline(a.lastSeenAt) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"/>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{a.firstName} {a.lastName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{a.email}</p>
                    {a.phone && <p className="text-[10px] text-gray-300">{a.phone}</p>}
                  </div>
                </div>

                {/* KYC */}
                <div className="col-span-2">
                  {a.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <HiCheckCircle className="text-xs"/> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <HiClock className="text-xs"/> Pending
                    </span>
                  )}
                </div>

                {/* Last seen */}
                <div className="col-span-2"><OnlineBadge agent={a}/></div>

                {/* Properties count */}
                <div className="col-span-1 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 text-xs font-black">
                    {props.length}
                  </span>
                </div>

                {/* Permissions */}
                <div className="col-span-3 flex flex-wrap gap-1">
                  {Object.entries(allPerms).map(([k, v]) => <PermPill key={k} permKey={k} active={v}/>)}
                  {!Object.values(allPerms).some(Boolean) && (
                    <span className="text-[10px] text-gray-300 italic">None</span>
                  )}
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => onView({ agent: a, properties: props })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                    <HiEye className="text-sm"/> View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && agents.length > PAGE_SIZE && (
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page <span className="font-bold text-gray-700">{page}</span> of{" "}
            <span className="font-bold text-gray-700">{totalPages}</span> ·{" "}
            <span className="font-bold text-gray-700">{agents.length}</span> agent{agents.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <HiChevronLeft/> Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              if (pg < 1 || pg > totalPages) return null;
              return (
                <button key={`pg-${pg}`} onClick={() => setPage(pg)}
                  className={`w-8 h-8 text-xs font-black rounded-xl transition ${
                    pg === page ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              Next <HiChevronRight/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}