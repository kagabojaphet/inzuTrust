// src/components/agent/AgentOverview.jsx
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiOfficeBuilding, HiClock, HiCog,
  HiCheckCircle, HiExclamation, HiUsers,
} from "react-icons/hi";
import AgentStatCard from "./AgentStatCard";
import { PriorityBadge, StatusBadge } from "./AgentBadges";

// ── Safe accessor helpers ─────────────────────────────────────────────────────
// tenants array can come in two shapes depending on which API endpoint was used:
//   Shape A (from GET /agents/my-tenants):   { tenant: {...}, property: {...}, agreementId, since }
//   Shape B (derived inline in AgentDashboard from my-properties): { ...user fields, property: "string" }
// We normalise both here so the component never crashes.

function getTenantUser(item) {
  if (!item) return null;
  // Shape A: item.tenant is the user object
  if (item.tenant && item.tenant.firstName) return item.tenant;
  // Shape B: item itself is the user object (firstName at top level)
  if (item.firstName) return item;
  return null;
}

function getTenantPropertyTitle(item) {
  if (!item) return "—";
  // Shape A: item.property.title
  if (item.property && typeof item.property === "object") return item.property.title || "—";
  // Shape B: item.property is a plain string title
  if (typeof item.property === "string") return item.property;
  return "—";
}

export default function AgentOverview({ stats, properties, requests, tenants = [], setActive, loading }) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">Agent Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Your assigned properties and active tasks.</p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AgentStatCard label="Properties" value={loading ? null : properties.length} icon={HiOfficeBuilding} color="blue"  loading={loading}/>
          <AgentStatCard label="Tenants"    value={loading ? null : tenants.length}    icon={HiUsers}          color="indigo" loading={loading}/>
          <AgentStatCard label="Open Tasks" value={loading ? null : stats.open}        icon={HiClock}          color="amber"  loading={loading}/>
          <AgentStatCard label="Resolved"   value={loading ? null : stats.resolved}    icon={HiCheckCircle}    color="green"  loading={loading}/>
        </div>

        {/* ── Emergency alert ── */}
        {!loading && stats.emergency > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <HiExclamation className="text-red-500 text-xl shrink-0"/>
            <p className="text-sm font-bold text-red-700">
              {stats.emergency} emergency {stats.emergency === 1 ? "request needs" : "requests need"} immediate attention.
            </p>
            <button
              onClick={() => setActive("maintenance")}
              className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition shrink-0"
            >
              View Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── Recent maintenance ── */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-sm">Recent Maintenance Tasks</h3>
              <button onClick={() => setActive("maintenance")} className="text-blue-600 text-xs font-bold hover:underline">
                View all
              </button>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <Skeleton width="70%" height={13} borderRadius={4}/>
                      <Skeleton width="45%" height={10} borderRadius={4} className="mt-1"/>
                    </div>
                    <Skeleton width={50} height={20} borderRadius={20}/>
                    <Skeleton width={60} height={20} borderRadius={20}/>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No tasks assigned yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {requests.slice(0, 5).map(r => (
                  <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 truncate">{r.property?.title || "—"}</p>
                    </div>
                    <PriorityBadge priority={r.priority}/>
                    <StatusBadge   status={r.status}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Tenants ── */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-sm">Tenants</h3>
              <button onClick={() => setActive("tenants")} className="text-blue-600 text-xs font-bold hover:underline">
                View all
              </button>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <Skeleton circle width={32} height={32}/>
                    <div className="flex-1">
                      <Skeleton width="60%" height={13} borderRadius={4}/>
                      <Skeleton width="40%" height={10} borderRadius={4} className="mt-1"/>
                    </div>
                    <Skeleton width={55} height={10} borderRadius={4}/>
                  </div>
                ))}
              </div>
            ) : tenants.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No tenants in your properties</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tenants.slice(0, 5).map((item, i) => {
                  // Safely extract tenant user + property name regardless of shape
                  const t     = getTenantUser(item);
                  const pName = getTenantPropertyTitle(item);

                  // If we still can't get a user object, skip this row silently
                  if (!t) return null;

                  const fullName = `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Unknown";

                  return (
                    <div key={`${t.id || i}-${i}`} className="px-5 py-3 flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=dbeafe&color=2563eb&bold=true&size=32`}
                        alt={fullName}
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{pName}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0 truncate max-w-[80px]">
                        {t.email?.split("@")[0] || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </SkeletonTheme>
  );
}