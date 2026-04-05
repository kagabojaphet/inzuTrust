// src/components/agent/AgentOverview.jsx
import { HiOfficeBuilding, HiClock, HiCog, HiCheckCircle, HiExclamation, HiUsers } from "react-icons/hi";
import AgentStatCard from "./AgentStatCard";
import { PriorityBadge, StatusBadge } from "./AgentBadges";

export default function AgentOverview({ stats, properties, requests, tenants, setActive }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Agent Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Your assigned properties and active tasks.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AgentStatCard label="Properties"  value={properties.length} icon={HiOfficeBuilding} color="blue"/>
        <AgentStatCard label="Tenants"     value={tenants.length}    icon={HiUsers}          color="indigo"/>
        <AgentStatCard label="Open Tasks"  value={stats.open}        icon={HiClock}          color="amber"/>
        <AgentStatCard label="Resolved"    value={stats.resolved}    icon={HiCheckCircle}    color="green"/>
      </div>

      {/* Emergency alert */}
      {stats.emergency > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <HiExclamation className="text-red-500 text-xl shrink-0"/>
          <p className="text-sm font-bold text-red-700">
            {stats.emergency} emergency {stats.emergency === 1 ? "request needs" : "requests need"} immediate attention.
          </p>
          <button onClick={() => setActive("maintenance")}
            className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition shrink-0">
            View Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent maintenance */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-sm">Recent Maintenance Tasks</h3>
            <button onClick={() => setActive("maintenance")} className="text-blue-600 text-xs font-bold hover:underline">View all</button>
          </div>
          {requests.slice(0, 5).length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No tasks assigned yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.slice(0, 5).map(r => (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400 truncate">{r.property?.title || "—"}</p>
                  </div>
                  <PriorityBadge priority={r.priority}/>
                  <StatusBadge status={r.status}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tenants */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-sm">Tenants</h3>
            <button onClick={() => setActive("tenants")} className="text-blue-600 text-xs font-bold hover:underline">View all</button>
          </div>
          {tenants.slice(0, 5).length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No tenants in your properties</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tenants.slice(0, 5).map(({ tenant, property }, i) => (
                <div key={`${tenant.id}-${i}`} className="px-5 py-3 flex items-center gap-3">
                  <img src={`https://ui-avatars.com/api/?name=${tenant.firstName}+${tenant.lastName}&background=dbeafe&color=2563eb&bold=true&size=32`}
                    className="w-8 h-8 rounded-full shrink-0" alt=""/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{tenant.firstName} {tenant.lastName}</p>
                    <p className="text-xs text-gray-400 truncate">{property.title}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">{tenant.email?.split("@")[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}