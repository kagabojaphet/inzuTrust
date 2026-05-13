// src/components/landlord/LDOverview.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  HiCheckCircle, HiCash, HiExclamation, HiPlus,
  HiDocumentAdd, HiCog, HiRefresh, HiChevronRight, HiX,
  HiShieldCheck, HiExclamationCircle,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

const formatRWF = (n) => {
  if (!n || isNaN(n)) return "0 RWF";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M RWF`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k RWF`;
  return `${n} RWF`;
};

const hdrs = tk => ({ Authorization: `Bearer ${tk}` });

const makeMonthBuckets = (n = 6) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      month:   d.toLocaleDateString("en-GB", { month: "short" }),
      year:    d.getFullYear(),
      mon:     d.getMonth(),
      revenue: 0,
    };
  });
};

const buildChart = (paidPayments, agreements) => {
  const months = makeMonthBuckets(6);
  if (paidPayments.length > 0) {
    paidPayments.forEach(p => {
      const d = new Date(p.paidAt || p.createdAt);
      const bucket = months.find(m => m.year === d.getFullYear() && m.mon === d.getMonth());
      if (bucket) bucket.revenue += Number(p.amount || 0);
    });
  } else {
    agreements
      .filter(a => a.status === "signed" && a.rentAmount)
      .forEach(a => {
        const leaseStart = new Date(a.startDate || a.signedAt || a.createdAt);
        const leaseEnd   = new Date(a.endDate   || "2099-12-31");
        months.forEach(m => {
          const bucketDate = new Date(m.year, m.mon, 1);
          if (leaseStart <= bucketDate && bucketDate <= leaseEnd) {
            m.revenue += Number(a.rentAmount);
          }
        });
      });
  }
  return months.map(m => ({ month: m.month, revenue: m.revenue }));
};

// ── Skeletons ─────────────────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <div className="flex justify-between items-start mb-3">
      <Skeleton width={110} height={12} borderRadius={6}/>
      <Skeleton width={40} height={40} borderRadius={12}/>
    </div>
    <Skeleton width={150} height={28} borderRadius={6} className="mb-2"/>
    <Skeleton width={120} height={12} borderRadius={6}/>
  </div>
);

const ChartSkeleton = () => (
  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <Skeleton width={150} height={16} borderRadius={6} className="mb-1.5"/>
        <Skeleton width={120} height={12} borderRadius={6}/>
      </div>
      <Skeleton width={110} height={34} borderRadius={12}/>
    </div>
    <Skeleton height={220} borderRadius={12}/>
  </div>
);

const QuickActionsSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <Skeleton width={110} height={16} borderRadius={6} className="mb-4"/>
    <div className="grid grid-cols-2 gap-3">
      {[0,1,2,3].map(i => <Skeleton key={i} height={72} borderRadius={12}/>)}
    </div>
  </div>
);

const PortfolioSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <Skeleton width={120} height={16} borderRadius={6} className="mb-4"/>
    <div className="flex items-center gap-5">
      <Skeleton circle width={96} height={96}/>
      <div className="space-y-2">
        <Skeleton width={110} height={14} borderRadius={6}/>
        <Skeleton width={90}  height={14} borderRadius={6}/>
      </div>
    </div>
  </div>
);

const TenantRowSkeleton = () => (
  <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-gray-50">
    <div className="col-span-3 flex items-center gap-2.5">
      <Skeleton circle width={32} height={32}/>
      <div>
        <Skeleton width={80} height={13} borderRadius={6}/>
        <Skeleton width={50} height={10} borderRadius={6} className="mt-1"/>
      </div>
    </div>
    <div className="col-span-3">
      <Skeleton width={130} height={13} borderRadius={6}/>
      <Skeleton width={70}  height={18} borderRadius={20} className="mt-1"/>
    </div>
    <div className="col-span-2"><Skeleton width={80} height={13} borderRadius={6}/></div>
    <div className="col-span-2"><Skeleton height={6} borderRadius={6}/></div>
    <div className="col-span-2 flex justify-end gap-2">
      <Skeleton circle width={28} height={28}/>
      <Skeleton circle width={28} height={28}/>
    </div>
  </div>
);

const riskColor   = { Low:"text-green-600", Medium:"text-yellow-600", High:"text-red-500" };
const riskBar     = { Low:"bg-green-500",   Medium:"bg-yellow-400",   High:"bg-red-500"   };
const riskBarW    = { Low:"35%",            Medium:"65%",             High:"90%"          };
const statusBadge = {
  "Verified":      "bg-green-50 text-green-700 border border-green-200",
  "Pending Check": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Flagged":       "bg-red-50 text-red-600 border border-red-200",
};

const riskFromScore = score => {
  if (score == null) return "Medium";
  if (score >= 75)   return "Low";
  if (score >= 50)   return "Medium";
  return "High";
};

const formatYAxis = v => {
  if (v === 0) return "0";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
  return `${v}`;
};

// ── Agreement Banner — shows only if landlord hasn't signed ──────────────────
function AgreementBanner({ token, setActive }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/platform-agreement/status`, { headers: hdrs(token) })
      .then(r => r.json())
      .then(d => { if (d.success) setShow(!d.data?.hasSigned); })
      .catch(() => {}); // non-fatal — banner just won't show
  }, [token]);

  if (!show) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <HiExclamationCircle className="text-amber-600 text-xl"/>
        </div>
        <div>
          <p className="text-sm font-black text-amber-900">Platform Agreement Required</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Sign the InzuTrust Listing Agreement to publish properties and unlock all features.
          </p>
        </div>
      </div>
      <button
        onClick={() => setActive("settings")}
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black hover:bg-amber-700 transition">
        <HiShieldCheck/> Sign Now
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LDOverview({ token, setActive }) {
  const [stats,     setStats]     = useState(null);
  const [chart,     setChart]     = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [tenants,   setTenants]   = useState(null);
  const [period,    setPeriod]    = useState("This Year");
  const [error,     setError]     = useState(null);

  const loading = !stats || !tenants;

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setError(null);
    setStats(null); setTenants(null);

    try {
      const [propsRes, appsRes, agreementsRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE}/properties/my/list`,          { headers: hdrs(token) }),
        fetch(`${API_BASE}/lease-applications/received`, { headers: hdrs(token) }),
        fetch(`${API_BASE}/agreements`,                  { headers: hdrs(token) }),
        fetch(`${API_BASE}/payments`,                    { headers: hdrs(token) }),
      ]);

      const [propsD, appsD, agreementsD, paymentsD] = await Promise.all([
        propsRes.ok      ? propsRes.json()      : { data: [] },
        appsRes.ok       ? appsRes.json()       : { data: [] },
        agreementsRes.ok ? agreementsRes.json() : { data: [] },
        paymentsRes.ok   ? paymentsRes.json()   : { data: [] },
      ]);

      const props      = propsD.data      || [];
      const apps       = appsD.data       || [];
      const agreements = agreementsD.data || [];
      const payments   = paymentsD.data   || paymentsD.rows || [];

      const occupied = props.filter(p => p.status === "occupied").length;
      const total    = props.length;
      setPortfolio({ occupied, vacant: total - occupied, total });

      const paidPayments    = payments.filter(p => p.status === "paid");
      const pendingPayments = payments.filter(p => ["pending","overdue"].includes(p.status));

      const rentCollected = paidPayments.length > 0
        ? paidPayments.reduce((s, p) => s + Number(p.amount || 0), 0)
        : agreements
            .filter(a => a.status === "signed")
            .reduce((s, a) => s + Number(a.rentAmount || 0), 0);

      const pendingTotal = pendingPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

      const now    = new Date();
      const thisM  = now.getMonth(), thisY = now.getFullYear();
      const prevDate = new Date(thisY, thisM - 1, 1);
      const prevM  = prevDate.getMonth(), prevY = prevDate.getFullYear();

      const thisMonRev = paidPayments
        .filter(p => { const d = new Date(p.paidAt||p.createdAt); return d.getMonth()===thisM && d.getFullYear()===thisY; })
        .reduce((s,p) => s + Number(p.amount||0), 0);

      const lastMonRev = paidPayments
        .filter(p => { const d = new Date(p.paidAt||p.createdAt); return d.getMonth()===prevM && d.getFullYear()===prevY; })
        .reduce((s,p) => s + Number(p.amount||0), 0);

      const rentGrowth = lastMonRev > 0
        ? Math.round(((thisMonRev - lastMonRev) / lastMonRev) * 100)
        : 0;

      const occRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      setStats({
        activeAgreements: agreements.filter(a => a.status === "signed").length,
        rentCollected,
        pendingPayments:  pendingTotal,
        occupancyRate:    occRate,
        rentGrowth,
        revenueSource: paidPayments.length > 0 ? "payments" : "agreements",
      });

      setChart(buildChart(paidPayments, agreements));

      const signedAgreements = agreements.filter(a => a.status === "signed" && a.tenant);

      if (signedAgreements.length > 0) {
        setTenants(signedAgreements.slice(0, 5).map(a => ({
          id:       a.id,
          name:     `${a.tenant.firstName||""} ${a.tenant.lastName||""}`.trim() || "Tenant",
          email:    a.tenant.email || "",
          property: a.property?.title || a.propertyAddress || "Property",
          income:   Number(a.rentAmount || 0),
          risk:     riskFromScore(a.tenant?.tenantProfile?.trustScore),
          status:   a.tenant?.isVerified ? "Verified" : "Pending Check",
          ago:      new Date(a.signedAt || a.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short" }),
        })));
      } else {
        const accepted = apps.filter(a => a.status === "accepted" && a.tenant).slice(0, 5);
        setTenants(accepted.map(a => ({
          id:       a.id,
          name:     `${a.tenant.firstName||""} ${a.tenant.lastName||""}`.trim() || "Applicant",
          email:    a.tenant.email || "",
          property: a.property?.title || "Property",
          income:   Number(a.property?.rentAmount || 0),
          risk:     "Medium",
          status:   "Pending Check",
          ago:      new Date(a.updatedAt||a.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short" }),
        })));
      }

    } catch (err) {
      console.error("[LDOverview]", err);
      setError("Could not load dashboard data. Please refresh.");
      const emptyBuckets = makeMonthBuckets(6).map(m => ({ month: m.month, revenue: 0 }));
      setStats({ activeAgreements:0, rentCollected:0, pendingPayments:0, occupancyRate:0, rentGrowth:0, revenueSource:"none" });
      setChart(emptyBuckets);
      setPortfolio({ occupied:0, vacant:0, total:0 });
      setTenants([]);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const occupancyPct = portfolio && portfolio.total > 0
    ? Math.round((portfolio.occupied / portfolio.total) * 100)
    : 0;

  const chartIsEmpty = chart && chart.every(m => m.revenue === 0);

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">

        {/* ── Agreement banner — only shows if not signed ── */}
        <AgreementBanner token={token} setActive={setActive}/>

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchAll} className="text-xs font-bold underline hover:text-red-800 ml-4 shrink-0">Retry</button>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {loading ? (
            <><StatCardSkeleton/><StatCardSkeleton/><StatCardSkeleton/></>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Active Agreements</p>
                  <p className="text-3xl font-black text-gray-900">{stats.activeAgreements}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">↑+{stats.occupancyRate}% occupancy rate</p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <HiCheckCircle className="text-purple-500 text-xl"/>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">
                    Rent Collected
                    {stats.revenueSource === "agreements" && (
                      <span className="ml-1 text-[9px] text-blue-400 font-bold">(estimated)</span>
                    )}
                  </p>
                  <p className="text-3xl font-black text-gray-900">{formatRWF(stats.rentCollected)}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    {stats.rentGrowth >= 0 ? `↑+${stats.rentGrowth}%` : `↓${stats.rentGrowth}%`} vs last month
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <HiCash className="text-green-500 text-xl"/>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Pending Payments</p>
                  <p className="text-3xl font-black text-orange-500">{formatRWF(stats.pendingPayments)}</p>
                  <p className="text-xs text-orange-500 font-semibold mt-1 flex items-center gap-1">
                    <HiExclamation className="text-sm"/>
                    {stats.pendingPayments > 0 ? "Action needed" : "All clear"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <HiExclamation className="text-orange-500 text-xl"/>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Revenue Chart + Right panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {loading ? <ChartSkeleton/> : (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-black text-gray-900">Revenue Overview</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Trends for the last 6 months</p>
                </div>
                <select value={period} onChange={e => setPeriod(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                  {["This Year","Last Year","Last 6 Months"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              {chartIsEmpty ? (
                <div className="h-[220px] flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <HiCash className="text-gray-300 text-3xl"/>
                  </div>
                  <p className="text-sm font-semibold text-gray-400">No payment records yet</p>
                  <p className="text-xs text-gray-300 text-center max-w-xs">
                    Revenue will appear here once tenants make rent payments.
                    {stats.rentCollected > 0 && (
                      <span className="block mt-1 text-blue-400">
                        Estimated from signed agreements: {formatRWF(stats.rentCollected)}
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chart} margin={{ top:5, right:10, left:0, bottom:0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={formatYAxis}/>
                    <Tooltip
                      formatter={v => [formatRWF(v), "Revenue"]}
                      contentStyle={{ borderRadius:"12px", border:"1px solid #e2e8f0", fontSize:"12px" }}/>
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5}
                      fill="url(#colorRevenue)"
                      dot={{ r:4, fill:"#2563eb", strokeWidth:2, stroke:"#fff" }}
                      activeDot={{ r:6 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          <div className="space-y-5">
            {loading ? (
              <><QuickActionsSkeleton/><PortfolioSkeleton/></>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-base font-black text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label:"New Listing",  icon:HiPlus,        action:() => setActive("add-property") },
                      { label:"Create Lease", icon:HiDocumentAdd, action:() => setActive("agreements")   },
                      { label:"Maintenance",  icon:HiCog,         action:() => setActive("maintenance")  },
                      { label:"Request Rent", icon:HiRefresh,     action:() => setActive("payments")     },
                    ].map((a, i) => (
                      <button key={i} onClick={a.action}
                        className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition group">
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow">
                          <a.icon className="text-blue-600 text-lg"/>
                        </div>
                        <span className="text-xs font-bold text-blue-700 text-center leading-tight">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-base font-black text-gray-900 mb-4">Portfolio Status</h3>
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path fill="none" stroke="#e2e8f0" strokeWidth="4"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        <path fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${occupancyPct}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-gray-900">{occupancyPct}%</span>
                        <span className="text-[9px] text-gray-400 font-semibold">Occupied</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"/>
                        <span className="text-xs text-gray-700 font-medium">Occupied ({portfolio.occupied})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-gray-200 rounded-full"/>
                        <span className="text-xs text-gray-500 font-medium">Vacant ({portfolio.vacant})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded-full"/>
                        <span className="text-xs text-gray-400 font-medium">Total ({portfolio.total})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Tenant Overview Table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            {loading
              ? <Skeleton width={140} height={16} borderRadius={6}/>
              : <h3 className="text-base font-black text-gray-900">Tenant Overview</h3>
            }
            {!loading && (
              <button onClick={() => setActive("tenants")}
                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                View All <HiChevronRight/>
              </button>
            )}
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100
            text-[10px] font-black uppercase tracking-wider text-gray-400">
            <div className="col-span-3">Tenant</div>
            <div className="col-span-3">Property</div>
            <div className="col-span-2">Monthly Income</div>
            <div className="col-span-2">Risk Score</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({length:3}).map((_,i) => <TenantRowSkeleton key={i}/>)
            ) : (tenants||[]).length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-gray-400 text-sm font-semibold">No active tenants yet.</p>
                <p className="text-xs text-gray-300 mt-1">Tenants appear once you have signed lease agreements.</p>
              </div>
            ) : (
              (tenants||[]).map((t, i) => (
                <div key={t.id||i}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
                  <div className="col-span-2 md:col-span-3 flex items-center gap-2.5">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=dbeafe&color=2563eb&bold=true&size=32`}
                      className="w-8 h-8 rounded-full shrink-0" alt={t.name}/>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{t.ago}</p>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-3 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">{t.property}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[t.status]||statusBadge["Pending Check"]}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm font-semibold text-gray-900">{formatRWF(t.income)}</p>
                  </div>
                  <div className="hidden md:flex col-span-2 items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${riskBar[t.risk]||riskBar.Medium}`}
                        style={{ width: riskBarW[t.risk]||"65%" }}/>
                    </div>
                    <span className={`text-xs font-bold ${riskColor[t.risk]||riskColor.Medium}`}>{t.risk}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => setActive("tenants")}
                      className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 transition">
                      <HiX className="text-sm"/>
                    </button>
                    <button onClick={() => setActive("tenants")}
                      className="w-7 h-7 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 transition">
                      <HiChevronRight className="text-sm"/>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </SkeletonTheme>
  );
}