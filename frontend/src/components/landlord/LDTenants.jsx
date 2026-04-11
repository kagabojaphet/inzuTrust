import React, { useState, useEffect, useCallback } from "react";
import { HiSearch, HiRefresh, HiUsers, HiShieldCheck, HiChartBar } from "react-icons/hi";
import { fetchTenants } from "./tenants/tenantHelpers";
import TenantTable from "./tenants/TenantTable";
import TenantDrawer from "./tenants/TenantDrawer";

const LIMIT = 10;

export default function LDTenants({ token }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

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
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, page, debSearch]);

  useEffect(() => { load(); }, [load]);

  // Dynamic Statistics with Unique Icons
  const stats = [
    { 
      label: "Active Tenants", 
      value: tenants.filter(t => t.status === "signed" || t.status === "active").length,
      icon: HiUsers,
      color: "blue"
    },
    { 
      label: "KYC Verified", 
      value: tenants.filter(t => t.isVerified).length,
      icon: HiShieldCheck,
      color: "green"
    },
    { 
      label: "Avg Trust Score", 
      value: Math.round(tenants.filter(t => t.trustScore).reduce((s, t) => s + (t.trustScore || 100), 0) / (tenants.length || 1)) || 100,
      icon: HiChartBar,
      color: "indigo"
    },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-0 max-w-7xl mx-auto">
      {selected && <TenantDrawer tenant={selected} onClose={() => setSelected(null)} />}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Landlord Tenants</h2>
          <p className="text-sm text-gray-400 font-medium">Manage your active rental relationships</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-3 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition shadow-sm">
            <HiRefresh className={loading ? "animate-spin" : ""} />
          </button>
          <div className="relative flex-1 md:w-64">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-12 h-12 bg-${s.color}-50 rounded-2xl flex items-center justify-center shrink-0`}>
                <s.icon className={`text-${s.color}-600 text-xl`} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 leading-none">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Component */}
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