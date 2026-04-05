// src/components/agent/AgentTenants.jsx
// Agent view: all tenants across their assigned properties
import { useState } from "react";
import { HiUsers, HiSearch, HiMail, HiPhone, HiBadgeCheck } from "react-icons/hi";

const isOnline = d => d && Date.now() - new Date(d) < 3 * 60 * 1000;

export default function AgentTenants({ tenants, loading }) {
  const [search, setSearch] = useState("");

  const filtered = tenants.filter(({ tenant }) => {
    const q = search.toLowerCase();
    return !q ||
      `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(q) ||
      tenant.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500 mt-0.5">All tenants in your assigned properties.</p>
        </div>
        <span className="text-sm font-bold text-gray-400">{tenants.length} tenant{tenants.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"/>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-gray-400 text-sm">Loading tenants...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <HiUsers className="text-5xl text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 font-semibold">{search ? "No tenants match your search" : "No tenants yet"}</p>
          <p className="text-xs text-gray-400 mt-1">Tenants appear here once they have signed lease agreements</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(({ tenant, property, since }, i) => (
            <div key={`${tenant.id}-${i}`} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 hover:shadow-sm transition">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${tenant.firstName}+${tenant.lastName}&background=dbeafe&color=2563eb&bold=true&size=48`}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt=""/>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline(tenant.lastSeenAt) ? "bg-green-400" : "bg-gray-300"}`}/>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black text-gray-900 text-sm">{tenant.firstName} {tenant.lastName}</p>
                  {tenant.isVerified && <HiBadgeCheck className="text-blue-500 shrink-0" title="KYC Verified"/>}
                </div>

                <a href={`mailto:${tenant.email}`}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mt-0.5 transition truncate">
                  <HiMail className="shrink-0"/> {tenant.email}
                </a>

                {tenant.phone && (
                  <a href={`tel:${tenant.phone}`}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mt-0.5 transition">
                    <HiPhone className="shrink-0"/> {tenant.phone}
                  </a>
                )}

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full truncate max-w-[160px]">
                    🏠 {property.title}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Since {new Date(since).toLocaleDateString("en-GB", { month:"short", year:"numeric" })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}