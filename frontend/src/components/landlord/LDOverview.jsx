import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  HiCheckCircle, HiCash, HiExclamation, HiPlus,
  HiDocumentAdd, HiCog, HiRefresh, HiChevronRight, HiX
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ── Fallback mock data ────────────────────────────────────────────────────────
const MOCK_STATS     = { activeAgreements:10, rentCollected:4500000, pendingPayments:350000, occupancyRate:10, rentGrowth:15 };
const MOCK_CHART     = [
  { month:"Jan", revenue:2100000 }, { month:"Feb", revenue:2400000 },
  { month:"Mar", revenue:2300000 }, { month:"Apr", revenue:2700000 },
  { month:"May", revenue:2500000 }, { month:"Jun", revenue:3200000 },
];
const MOCK_PORTFOLIO = { occupied:10, vacant:2, total:12 };
const MOCK_TENANTS   = [
  { id:1, name:"Bosco",   property:"Kigali Heights Apt 4B", income:1200000, risk:"Low",    status:"Verified",      ago:"2h ago" },
  { id:2, name:"Claire",  property:"Vision City Villa #12", income:2500000, risk:"Medium", status:"Pending Check", ago:"5h ago" },
  { id:3, name:"Arangwa", property:"Kimironko Studio 2A",   income:450000,  risk:"Low",    status:"Verified",      ago:"1d ago" },
];

const formatRWF = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M RWF`;
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}k RWF`;
  return `${n} RWF`;
};

const riskColor   = { Low:"text-green-600",  Medium:"text-yellow-600", High:"text-red-500"  };
const riskBar     = { Low:"bg-green-500",     Medium:"bg-yellow-400",   High:"bg-red-500"    };
const riskBarW    = { Low:"35%",              Medium:"65%",             High:"90%"           };
const statusBadge = {
  "Verified":      "bg-green-50 text-green-700 border border-green-200",
  "Pending Check": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Flagged":       "bg-red-50 text-red-600 border border-red-200",
};

// ── Skeleton pieces ───────────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <div className="flex justify-between items-start mb-3">
      <Skeleton width={110} height={12} borderRadius={6} />
      <Skeleton width={40} height={40} borderRadius={12} />
    </div>
    <Skeleton width={150} height={28} borderRadius={6} className="mb-2" />
    <Skeleton width={120} height={12} borderRadius={6} />
  </div>
);

const ChartSkeleton = () => (
  <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <Skeleton width={150} height={16} borderRadius={6} className="mb-1.5" />
        <Skeleton width={120} height={12} borderRadius={6} />
      </div>
      <Skeleton width={110} height={34} borderRadius={12} />
    </div>
    <Skeleton height={220} borderRadius={12} />
  </div>
);

const QuickActionsSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <Skeleton width={110} height={16} borderRadius={6} className="mb-4" />
    <div className="grid grid-cols-2 gap-3">
      {[0,1,2,3].map(i => <Skeleton key={i} height={72} borderRadius={12} />)}
    </div>
  </div>
);

const PortfolioSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <Skeleton width={120} height={16} borderRadius={6} className="mb-4" />
    <div className="flex items-center gap-5">
      <Skeleton circle width={96} height={96} />
      <div className="space-y-2">
        <Skeleton width={110} height={14} borderRadius={6} />
        <Skeleton width={90}  height={14} borderRadius={6} />
      </div>
    </div>
  </div>
);

const TenantRowSkeleton = () => (
  <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-gray-50">
    <div className="col-span-3 flex items-center gap-2.5">
      <Skeleton circle width={32} height={32} />
      <div>
        <Skeleton width={80} height={13} borderRadius={6} />
        <Skeleton width={50} height={10} borderRadius={6} className="mt-1" />
      </div>
    </div>
    <div className="col-span-3">
      <Skeleton width={130} height={13} borderRadius={6} />
      <Skeleton width={70}  height={18} borderRadius={20} className="mt-1" />
    </div>
    <div className="col-span-2"><Skeleton width={80} height={13} borderRadius={6} /></div>
    <div className="col-span-2"><Skeleton height={6} borderRadius={6} /></div>
    <div className="col-span-2 flex justify-end gap-2">
      <Skeleton circle width={28} height={28} />
      <Skeleton circle width={28} height={28} />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function LDOverview({ token, setActive }) {
  const [stats,     setStats]     = useState(null);
  const [chart,     setChart]     = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [tenants,   setTenants]   = useState(null);
  const [period,    setPeriod]    = useState("This Year");

  // null = still loading; set to data or mock on resolve
  const loading = !stats || !tenants;

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          fetch(`${API_BASE}/landlords/dashboard/stats`, { headers }),
          fetch(`${API_BASE}/landlords/tenants`,          { headers }),
        ]);

        if (statsRes.ok) {
          const d = await statsRes.json();
          setStats(d.data?.stats      || d.data || MOCK_STATS);
          setChart(d.data?.revenueChart           || MOCK_CHART);
          setPortfolio(d.data?.portfolio          || MOCK_PORTFOLIO);
        } else {
          setStats(MOCK_STATS);
          setChart(MOCK_CHART);
          setPortfolio(MOCK_PORTFOLIO);
        }

        if (tenantsRes.ok) {
          const d = await tenantsRes.json();
          setTenants(d.data?.slice(0, 5) || MOCK_TENANTS);
        } else {
          setTenants(MOCK_TENANTS);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStats(MOCK_STATS);
        setChart(MOCK_CHART);
        setPortfolio(MOCK_PORTFOLIO);
        setTenants(MOCK_TENANTS);
      }
    };

    fetchAll();
  }, [token]);

  const occupancyPct = portfolio
    ? portfolio.total > 0 ? Math.round((portfolio.occupied / portfolio.total) * 100) : 0
    : 0;

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-5">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              {/* Active Agreements */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Active Agreements</p>
                  <p className="text-3xl font-black text-gray-900">{stats.activeAgreements}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">↑+{stats.occupancyRate}% occupancy rate</p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <HiCheckCircle className="text-purple-500 text-xl" />
                </div>
              </div>

              {/* Rent Collected */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Rent Collected</p>
                  <p className="text-3xl font-black text-gray-900">{formatRWF(stats.rentCollected)}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">↑+{stats.rentGrowth}% vs last month</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <HiCash className="text-green-500 text-xl" />
                </div>
              </div>

              {/* Pending Payments */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Pending Payments</p>
                  <p className="text-3xl font-black text-orange-500">{formatRWF(stats.pendingPayments)}</p>
                  <p className="text-xs text-orange-500 font-semibold mt-1 flex items-center gap-1">
                    <HiExclamation className="text-sm" /> Action needed
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <HiExclamation className="text-orange-500 text-xl" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Revenue Chart + Right panel ── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Chart */}
          {loading ? <ChartSkeleton /> : (
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-gray-900">Revenue Overview</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Trends for the last 6 months</p>
                </div>
                <select value={period} onChange={e => setPeriod(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                  {["This Year","Last Year","Last 6 Months"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chart} margin={{ top:5, right:10, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={v => [formatRWF(v),"Revenue"]}
                    contentStyle={{ borderRadius:"12px", border:"1px solid #e2e8f0", fontSize:"12px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                    dot={{ r:4, fill:"#2563eb", strokeWidth:2, stroke:"#fff" }}
                    activeDot={{ r:6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Right panel */}
          <div className="space-y-5">
            {loading ? (
              <><QuickActionsSkeleton /><PortfolioSkeleton /></>
            ) : (
              <>
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-base font-black text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label:"New Listing",  icon:HiPlus,        action:() => setActive("properties") },
                      { label:"Create Lease", icon:HiDocumentAdd, action:() => setActive("agreements") },
                      { label:"Maintenance",  icon:HiCog,         action:() => {} },
                      { label:"Request Rent", icon:HiRefresh,     action:() => setActive("payments")   },
                    ].map((a, i) => (
                      <button key={i} onClick={a.action}
                        className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition group">
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow">
                          <a.icon className="text-blue-600 text-lg" />
                        </div>
                        <span className="text-xs font-bold text-blue-700 text-center leading-tight">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Portfolio Status */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-base font-black text-gray-900 mb-4">Portfolio Status</h3>
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path fill="none" stroke="#e2e8f0" strokeWidth="4"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${occupancyPct}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-gray-900">{occupancyPct}%</span>
                        <span className="text-[9px] text-gray-400 font-semibold">Occupied</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                        <span className="text-xs text-gray-700 font-medium">Occupied ({portfolio.occupied})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                        <span className="text-xs text-gray-500 font-medium">Vacant ({portfolio.vacant})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Tenant Risk Table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            {loading
              ? <Skeleton width={140} height={16} borderRadius={6} />
              : <h3 className="text-base font-black text-gray-900">Tenant Overview</h3>
            }
            {!loading && (
              <button onClick={() => setActive("tenants")}
                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                View All <HiChevronRight />
              </button>
            )}
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100
            text-[10px] font-black uppercase tracking-wider text-gray-400">
            <div className="col-span-3">TENANT</div>
            <div className="col-span-3">PROPERTY</div>
            <div className="col-span-2">MONTHLY INCOME</div>
            <div className="col-span-2">RISK SCORE</div>
            <div className="col-span-2 text-right">ACTIONS</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <TenantRowSkeleton key={i} />)
              : (tenants || []).map((t, i) => (
                <div key={t.id || i}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
                  <div className="col-span-3 flex items-center gap-2.5">
                    <img
                      src={`https://ui-avatars.com/api/?name=${t.name}&background=dbeafe&color=2563eb&bold=true&size=32`}
                      className="w-8 h-8 rounded-full shrink-0" alt={t.name} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-[10px] text-gray-400">{t.ago}</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-700 font-medium">{t.property}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[t.status] || statusBadge["Verified"]}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-900">{formatRWF(t.income)}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${riskBar[t.risk] || riskBar.Low}`}
                        style={{ width: riskBarW[t.risk] || "35%" }} />
                    </div>
                    <span className={`text-xs font-bold ${riskColor[t.risk] || riskColor.Low}`}>{t.risk}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 transition">
                      <HiX className="text-sm" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 transition">
                      <HiChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </SkeletonTheme>
  );
}