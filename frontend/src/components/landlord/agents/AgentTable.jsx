// src/components/landlord/agents/AgentTable.jsx
import React from "react";
import {
  HiOfficeBuilding, HiCheckCircle, HiClock,
  HiEye, HiX, HiPlus,
} from "react-icons/hi";
import { fmtDate, isOnline, PERM_LABELS, PERM_COLORS } from "./agentHelpers";

function PermissionPill({ permKey, active }) {
  if (!active) return null;
  const { label, color } = PERM_LABELS[permKey];
  return (
    <span className={`inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded border ${PERM_COLORS[color]}`}>
      {label}
    </span>
  );
}

function AgentStatusBadge({ agent }) {
  if (isOnline(agent.lastSeenAt)) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Online
      </span>
    );
  }
  return (
    <span className="text-[10px] text-gray-400 font-medium">
      {agent.lastSeenAt ? fmtDate(agent.lastSeenAt) : "Never"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-2.5 bg-gray-100 rounded w-36" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-24" /></td>
      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
      <td className="px-5 py-4"><div className="flex gap-1"><div className="h-5 bg-gray-200 rounded w-16" /><div className="h-5 bg-gray-100 rounded w-20" /></div></td>
      <td className="px-5 py-4"><div className="h-8 bg-gray-200 rounded-xl w-16 ml-auto" /></td>
    </tr>
  );
}

export default function AgentTable({ agents, loading, onView, onRevokeProperty, onAddProperty }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
        <div className="col-span-3">Agent</div>
        <div className="col-span-2">KYC Status</div>
        <div className="col-span-2">Last Seen</div>
        <div className="col-span-1 text-center">Properties</div>
        <div className="col-span-3">Permissions</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-5 py-4 items-center animate-pulse">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-28" />
                  <div className="h-2.5 bg-gray-100 rounded w-36" />
                </div>
              </div>
              <div className="col-span-2"><div className="h-5 bg-gray-200 rounded-full w-20" /></div>
              <div className="col-span-2"><div className="h-3 bg-gray-200 rounded w-20" /></div>
              <div className="col-span-1"><div className="h-3 bg-gray-200 rounded w-8 mx-auto" /></div>
              <div className="col-span-3 flex gap-1">
                <div className="h-5 bg-gray-200 rounded w-16" />
                <div className="h-5 bg-gray-100 rounded w-20" />
              </div>
              <div className="col-span-1 flex justify-end">
                <div className="h-8 bg-gray-200 rounded-xl w-16" />
              </div>
            </div>
          ))
        ) : agents.length === 0 ? (
          <div className="py-16 text-center">
            <HiOfficeBuilding className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">No agents found</p>
          </div>
        ) : (
          agents.map(({ agent: a, properties: assignedProps }) => {
            // Collect all unique permissions across assigned properties
            const allPerms = { canEditDetails: false, canManageTenants: false, canViewPayments: false, canHandleMaintenance: false };
            assignedProps.forEach(p => {
              Object.keys(allPerms).forEach(k => { if (p.permissions?.[k]) allPerms[k] = true; });
            });

            return (
              <div key={a.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-gray-50/60 transition group">
                {/* Agent info */}
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={`https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=dbeafe&color=2563eb&bold=true`}
                      alt="avatar"
                      className="w-9 h-9 rounded-xl"
                    />
                    {isOnline(a.lastSeenAt) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
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
                      <HiCheckCircle className="text-xs" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <HiClock className="text-xs" /> Pending KYC
                    </span>
                  )}
                </div>

                {/* Last seen */}
                <div className="col-span-2">
                  <AgentStatusBadge agent={a} />
                </div>

                {/* Properties count */}
                <div className="col-span-1 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 text-xs font-black">
                    {assignedProps.length}
                  </span>
                </div>

                {/* Permissions */}
                <div className="col-span-3 flex flex-wrap gap-1">
                  {Object.entries(allPerms).map(([k, v]) => (
                    <PermissionPill key={k} permKey={k} active={v} />
                  ))}
                  {!Object.values(allPerms).some(Boolean) && (
                    <span className="text-[10px] text-gray-300 italic">None assigned</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => onView({ agent: a, properties: assignedProps })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    <HiEye className="text-sm" /> View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}