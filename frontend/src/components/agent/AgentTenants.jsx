// src/components/agent/AgentTenants.jsx
// Handles both data shapes from backend:
//   Shape A (from /agents/my-tenants):  { tenant: {...}, property: {...}, since }
//   Shape B (derived from properties):  { id, firstName, ..., property: "Title" }
import { useState } from "react";
import {
  HiUsers, HiSearch, HiMail, HiPhone, HiBadgeCheck,
  HiChevronLeft, HiChevronRight,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PAGE_SIZE = 8;
const isOnline  = d => d && Date.now() - new Date(d) < 3 * 60 * 1000;

// ── Normalise either shape into a consistent object ────────────────────────
function normalise(item, idx) {
  // Shape A: { tenant: {id, firstName, ...}, property: {id, title, ...}, since }
  if (item?.tenant?.firstName) {
    return {
      key:        `${item.tenant.id}-${idx}`,
      id:          item.tenant.id,
      firstName:   item.tenant.firstName,
      lastName:    item.tenant.lastName,
      email:       item.tenant.email,
      phone:       item.tenant.phone,
      lastSeenAt:  item.tenant.lastSeenAt,
      isVerified:  item.tenant.isVerified,
      propertyTitle: item.property?.title || "—",
      since:       item.since || item.agreementId,
    };
  }
  // Shape B: flat object with firstName directly (derived in AgentDashboard)
  if (item?.firstName) {
    return {
      key:         `flat-${item.id || idx}-${idx}`,
      id:           item.id,
      firstName:    item.firstName,
      lastName:     item.lastName,
      email:        item.email,
      phone:        item.phone,
      lastSeenAt:   item.lastSeenAt,
      isVerified:   item.isVerified,
      propertyTitle: typeof item.property === "string" ? item.property : (item.property?.title || "—"),
      since:        item.since || null,
    };
  }
  return null; // skip malformed items
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
          <Skeleton circle width={48} height={48} className="shrink-0"/>
          <div className="flex-1 space-y-2">
            <Skeleton width="60%"  height={14} borderRadius={4}/>
            <Skeleton width="80%"  height={11} borderRadius={4}/>
            <Skeleton width="40%"  height={11} borderRadius={4}/>
            <Skeleton width="55%"  height={18} borderRadius={20}/>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AgentTenants({ tenants = [], loading }) {
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);

  // Normalise + filter out nulls
  const normalised = tenants.map(normalise).filter(Boolean);

  const filtered = normalised.filter(t => {
    const q = search.toLowerCase();
    return !q ||
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q) ||
      (t.propertyTitle || "").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on search change
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500 mt-0.5">All tenants in your assigned properties.</p>
        </div>
        <span className="text-sm font-bold text-gray-400">
          {loading ? "Loading..." : `${normalised.length} tenant${normalised.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, email, or property..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonCards/>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <HiUsers className="text-5xl text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 font-semibold">
            {search ? "No tenants match your search" : "No tenants yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Tenants appear here once they have signed lease agreements
          </p>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paged.map(t => {
              const online = isOnline(t.lastSeenAt);
              return (
                <div key={t.key} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 hover:shadow-sm transition">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={`https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=dbeafe&color=2563eb&bold=true&size=48`}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt=""/>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? "bg-green-400" : "bg-gray-300"}`}/>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-gray-900 text-sm truncate">{t.firstName} {t.lastName}</p>
                      {t.isVerified && <HiBadgeCheck className="text-blue-500 shrink-0" title="KYC Verified"/>}
                      {online && (
                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 shrink-0">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Online
                        </span>
                      )}
                    </div>

                    {t.email && (
                      <a href={`mailto:${t.email}`}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mt-0.5 transition truncate">
                        <HiMail className="shrink-0"/> {t.email}
                      </a>
                    )}

                    {t.phone && (
                      <a href={`tel:${t.phone}`}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mt-0.5 transition">
                        <HiPhone className="shrink-0"/> {t.phone}
                      </a>
                    )}

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full truncate max-w-[160px]">
                        🏠 {t.propertyTitle}
                      </span>
                      {t.since && (
                        <span className="text-[10px] text-gray-400">
                          Since {new Date(t.since).toLocaleDateString("en-GB", { month:"short", year:"numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          {filtered.length > PAGE_SIZE && (
            <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between">
              {/* Left: page info */}
              <p className="text-xs text-gray-400">
                Page <span className="font-bold text-gray-700">{page}</span> of{" "}
                <span className="font-bold text-gray-700">{totalPages}</span> ·{" "}
                <span className="font-bold text-gray-700">{filtered.length}</span> tenant{filtered.length !== 1 ? "s" : ""}
              </p>

              {/* Right: prev + numbers + next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <HiChevronLeft/> Prev
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (pg < 1 || pg > totalPages) return null;
                  return (
                    <button key={`pg-${pg}`}
                      onClick={() => setPage(pg)}
                      className={`w-8 h-8 text-xs font-black rounded-xl transition ${
                        pg === page ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {pg}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Next <HiChevronRight/>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}