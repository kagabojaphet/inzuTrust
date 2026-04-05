// src/components/landlord/LDTenants.jsx
import React, { useState, useEffect, useCallback } from "react";
import { HiSearch, HiRefresh, HiUsers } from "react-icons/hi";
import { fetchTenants } from "./tenants/tenantHelpers";
import TenantTable from "./tenants/TenantTable";
import TenantDrawer from "./tenants/TenantDrawer";

const LIMIT = 10;

export default function LDTenants({ token }) {
  const [tenants,    setTenants]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [debSearch,  setDebSearch]  = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [error,      setError]      = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTenants(token, { page, limit: LIMIT, search: debSearch });
      setTenants(result.tenants);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (e) {
      console.error("[LDTenants]", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, page, debSearch]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      {/* Drawer */}
      {selected && <TenantDrawer tenant={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Tenants</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? "Loading..." : `${total} tenant${total !== 1 ? "s" : ""} from active agreements`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition"
            title="Refresh"
          >
            <HiRefresh className={loading ? "animate-spin" : ""} />
          </button>
          <div className="relative w-56">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tenants..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Stats strip — only when data loaded */}
      {!loading && tenants.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Tenants",   value: tenants.filter(t => t.status === "signed").length },
            { label: "KYC Verified",     value: tenants.filter(t => t.isVerified).length },
            { label: "Avg Trust Score",  value: Math.round(tenants.filter(t => t.trustScore).reduce((s, t) => s + t.trustScore, 0) / (tenants.filter(t => t.trustScore).length || 1)) || "—" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <HiUsers className="text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <TenantTable
        tenants={tenants}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onView={setSelected}
      />
    </div>
  );
}