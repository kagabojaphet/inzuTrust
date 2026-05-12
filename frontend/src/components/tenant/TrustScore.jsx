// src/components/tenant/TrustScore.jsx
// Matches Figma: Trust Score Insights page
import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  HiCheckCircle, HiExclamationCircle, HiShieldCheck,
  HiDownload, HiShare, HiLightningBolt, HiClock,
  HiDocumentText, HiUserAdd, HiTrendingUp, HiX,
} from "react-icons/hi";
import { API_BASE } from "../../config";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem("inzu_token") ||
  localStorage.getItem("token") || "";

// Resolve API URL — handles both "/api" and "http://localhost:5000/api" formats
const apiUrl = (path) => {
  const base = API_BASE || import.meta.env.VITE_API_URL || "https://inzutrust-api.onrender.com/api";
  return `${base.replace(/\/$/, "")}${path}`;
};

// ── Score ranges — full 7-tier system ────────────────────────────────────────
const SCORE_RANGES = [
  { min: 95, max: 100, label: "Outstanding", color: "text-emerald-600", arc: "#10B981", bg: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200 text-emerald-700", desc: "You are among the top-tier tenants on InzuTrust. Landlords compete to rent to you."  },
  { min: 85, max: 94,  label: "Excellent",   color: "text-green-600",   arc: "#22C55E", bg: "bg-green-500",   light: "bg-green-50 border-green-200 text-green-700",       desc: "Your rental profile is outstanding. You qualify for premium properties."            },
  { min: 75, max: 84,  label: "Very Good",   color: "text-blue-600",   arc: "#2563EB", bg: "bg-blue-500",   light: "bg-blue-50 border-blue-200 text-blue-700",           desc: "Strong profile. Most landlords will approve your applications quickly."            },
  { min: 60, max: 74,  label: "Good",        color: "text-sky-600",    arc: "#0EA5E9", bg: "bg-sky-500",    light: "bg-sky-50 border-sky-200 text-sky-700",               desc: "Solid track record. A few improvements can move you to Very Good."                },
  { min: 45, max: 59,  label: "Fair",        color: "text-amber-600",  arc: "#F59E0B", bg: "bg-amber-500",  light: "bg-amber-50 border-amber-200 text-amber-700",         desc: "Your score is average. Focus on on-time payments to improve steadily."            },
  { min: 30, max: 44,  label: "Poor",        color: "text-orange-600", arc: "#F97316", bg: "bg-orange-500", light: "bg-orange-50 border-orange-200 text-orange-700",       desc: "Some issues detected. Address late payments and disputes to recover."              },
  { min: 0,  max: 29,  label: "Critical",    color: "text-red-600",    arc: "#EF4444", bg: "bg-red-500",    light: "bg-red-50 border-red-200 text-red-700",               desc: "Urgent action needed. Landlords may decline applications at this level."           },
];

const getRange = (score) =>
  SCORE_RANGES.find(r => score >= r.min && score <= r.max) || SCORE_RANGES[SCORE_RANGES.length - 1];

const getLabel = (score) => {
  const r = getRange(score);
  return { text: r.label, color: r.color };
};

// ── Score range bar — shown below the donut circle ────────────────────────────
function ScoreRangeBar({ score }) {
  const current = getRange(score);

  return (
    <div className="px-5 pb-5 w-full">
      {/* Status description badge */}
      <div className={`w-full text-center mb-4 px-3 py-2 rounded-xl border text-xs font-semibold leading-relaxed ${current.light}`}>
        {current.desc}
      </div>

      {/* Range segments — highest to lowest */}
      <div className="space-y-2">
        {SCORE_RANGES.map((r) => {
          const isActive = score >= r.min && score <= r.max;
          const isPassed = score > r.max;
          const fillPct  = isActive
            ? Math.round(((score - r.min) / Math.max(r.max - r.min, 1)) * 100)
            : 100;

          return (
            <div key={r.label} className="flex items-center gap-2.5">
              {/* Tier label */}
              <span className={`text-[10px] font-black w-20 text-right shrink-0 transition-colors ${
                isActive ? r.color : isPassed ? "text-gray-400" : "text-gray-200"
              }`}>
                {r.label}
              </span>

              {/* Progress bar */}
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${r.bg}`}
                  style={{
                    width: isPassed ? "100%" : isActive ? `${fillPct}%` : "0%",
                    opacity: !isPassed && !isActive ? 0 : 1,
                  }}
                />
              </div>

              {/* Range numbers */}
              <span className={`text-[10px] w-12 shrink-0 font-medium ${
                isActive ? "text-gray-600 font-black" : "text-gray-300"
              }`}>
                {r.min}–{r.max}
              </span>

              {/* Active pulse dot */}
              {isActive
                ? <span className={`w-2 h-2 rounded-full shrink-0 ${r.bg} ring-2 ring-offset-1 ring-current animate-pulse`} style={{ color: r.arc }} />
                : <span className="w-2 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Donut score circle ────────────────────────────────────────────────────────
function ScoreCircle({ score, changeThisMonth }) {
  const label        = getLabel(score);
  const range        = getRange(score);
  const circumference = 2 * Math.PI * 54;
  const offset       = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center pt-6">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background track */}
          <circle cx="60" cy="60" r="54" fill="none"
            stroke="#EEF2FF" strokeWidth="10" />
          {/* Score arc — color changes with tier */}
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={range.arc}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease, stroke 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-gray-900">{score}%</span>
          <span className={`text-sm font-bold mt-0.5 ${label.color}`}>{label.text}</span>
        </div>
      </div>

      {/* Change + Next level */}
      <div className="flex items-center gap-8 mt-4 mb-4">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">CHANGE</p>
          <p className={`text-lg font-black flex items-center gap-0.5 justify-center ${
            (changeThisMonth ?? 12) >= 0 ? "text-green-600" : "text-red-500"
          }`}>
            <HiTrendingUp className="text-base" />
            {(changeThisMonth ?? 12) >= 0 ? "+" : ""}{changeThisMonth ?? 12} pts
          </p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">NEXT LEVEL</p>
          <p className="text-lg font-black text-gray-900">
            {score >= 95 ? "Max ✓" : `${range.max + 1}+`}
          </p>
        </div>
      </div>

      {/* Range bar — shows all tiers with current highlighted */}
      <div className="w-full border-t border-gray-100 pt-4">
        <ScoreRangeBar score={score} />
      </div>
    </div>
  );
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xl">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="text-white text-sm">{payload[0].value} Score</p>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ title, value, sub, impact, icon, iconBg, iconColor }) {
  const impactColors = {
    "High Impact":   "text-green-600",
    "Medium Impact": "text-amber-600",
    "Low Impact":    "text-blue-600",
    "Bonus":         "text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
          <span className={`text-base ${iconColor}`}>{icon}</span>
        </div>
        {impact && (
          <span className={`text-[10px] font-black ${impactColors[impact] || "text-gray-400"}`}>
            {impact}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900 mb-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ── Identity verification banner ──────────────────────────────────────────────
function IdentityBanner({ verified }) {
  return (
    <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${
      verified ? "bg-blue-600" : "bg-amber-500"
    }`}>
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/10" />

      <div className="relative z-10">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <HiShieldCheck className="text-white text-xl" />
        </div>
        <h4 className="font-black text-base mb-1">
          {verified ? "Identity Fully Verified" : "Verify Your Identity"}
        </h4>
        <p className="text-white/80 text-xs leading-relaxed">
          {verified
            ? "Your KYC status is active. Landlords can trust your background check."
            : "Complete KYC to unlock higher trust score and better property access."}
        </p>
        {!verified && (
          <button className="mt-4 bg-white text-amber-600 text-xs font-black px-4 py-2 rounded-xl hover:bg-amber-50 transition">
            Verify Now →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Improvement tip card ──────────────────────────────────────────────────────
function TipCard({ icon, title, desc, cta, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
        <span className={`text-xl ${iconColor}`}>{icon}</span>
      </div>
      <h4 className="font-black text-gray-900 text-sm mb-2">{title}</h4>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">{desc}</p>
      <button className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
        {cta} →
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TrustScore({ token: propToken }) {
  const token = propToken || getToken();

  const [score,          setScore]          = useState(null);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [breakdown,      setBreakdown]      = useState(null);
  const [recentHistory,  setRecentHistory]  = useState([]);
  const [isVerified,     setIsVerified]     = useState(false);
  const [lastUpdated,    setLastUpdated]    = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [range,          setRange]          = useState("6M");

  // ── Fetch from GET /api/trust-score ────────────────────────────────────────
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(apiUrl("/trust-score"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load trust score");

      if (data.success) {
        const d = data.data;
        setScore(d.score ?? 100);
        setMonthlyHistory(d.monthlyHistory || []);
        setBreakdown(d.breakdown || null);
        setRecentHistory(d.history || []);
        setIsVerified(d.isVerified || d.profile?.isVerified || false);
        // Last updated = most recent log entry
        if (d.history?.length > 0) {
          setLastUpdated(new Date(d.history[0].createdAt).toLocaleDateString("en-RW", {
            day: "numeric", month: "short", year: "numeric",
          }));
        }
      }
    } catch (e) {
      console.warn("[TrustScore] API error:", e.message);
      setError(e.message);
      // Keep defaults — new tenant with no activity shows 100%
      setScore(100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  // ── Derived display values ────────────────────────────────────────────────
  const displayScore     = Math.min(Math.max(score ?? 100, 0), 100);
  const changeThisMonth  = breakdown?.changeThisMonth ?? 0;

  // Chart — use real monthly history, fall back to flat 100 line for new tenants
  const chartData = monthlyHistory.length > 0
    ? monthlyHistory
    : Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          month: d.toLocaleDateString("en-RW", { month: "short" }),
          score: displayScore,
        };
      });

  // ── Metric cards — real values from breakdown ─────────────────────────────
  const onTimeCount   = recentHistory.filter(l => l.reason === "on_time_payment").length;
  const lateCount     = recentHistory.filter(l =>
    l.reason === "late_payment" || l.reason === "missed_payment"
  ).length;
  const disputeCount  = recentHistory.filter(l =>
    l.reason === "dispute_filed_against" || l.reason === "dispute_lost"
  ).length;
  const totalPayments = onTimeCount + lateCount;
  const onTimeRate    = totalPayments > 0
    ? `${Math.round((onTimeCount / totalPayments) * 100)}%`
    : "100%";
  const onTimeSub     = totalPayments > 0
    ? `${onTimeCount} of ${totalPayments} payments on time`
    : "No payments recorded yet";

  // Last late payment date
  const lastLate = recentHistory.find(l =>
    l.reason === "late_payment" || l.reason === "missed_payment"
  );
  const lateSub = lastLate
    ? `Last incident: ${new Date(lastLate.createdAt).toLocaleDateString("en-RW", { month: "short", year: "numeric" })}`
    : "No late payments — great!";

  const disputeSub = disputeCount === 0
    ? "No active disputes recorded"
    : `${disputeCount} dispute${disputeCount > 1 ? "s" : ""} on record`;

  const avgAgreement = breakdown?.avgAgreement ?? (
    recentHistory.some(l => l.reason === "lease_signed") ? "Active" : "None yet"
  );
  const avgSub = recentHistory.some(l => l.reason === "lease_completed")
    ? "Long-term reliable tenant"
    : recentHistory.some(l => l.reason === "lease_signed")
    ? "Lease currently active"
    : "No completed leases yet";

  const metrics = [
    {
      title:     "On-time Payments",
      value:     onTimeRate,
      sub:       onTimeSub,
      impact:    "High Impact",
      icon:      <HiCheckCircle />,
      iconBg:    "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title:     "Late Payments",
      value:     String(lateCount),
      sub:       lateSub,
      impact:    "Medium Impact",
      icon:      <HiExclamationCircle />,
      iconBg:    "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title:     "Dispute History",
      value:     String(disputeCount),
      sub:       disputeSub,
      impact:    "Low Impact",
      icon:      <HiX />,
      iconBg:    "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title:     "Avg. Agreement",
      value:     avgAgreement,
      sub:       avgSub,
      impact:    "Bonus",
      icon:      <HiDocumentText />,
      iconBg:    "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  // ── Tips — dynamic based on actual weaknesses ────────────────────────────
  const tips = [
    {
      icon:      <HiLightningBolt />,
      iconBg:    "bg-blue-50",
      iconColor: "text-blue-600",
      title:     "Set up Auto-Pay",
      desc:      lateCount > 0
        ? `You have ${lateCount} late payment${lateCount > 1 ? "s" : ""}. Auto-pay prevents this from happening again and can recover up to +2 pts per month.`
        : "Consistent on-time payments boost your score +2 pts each month. Auto-pay keeps your streak safe.",
      cta: "Enable Auto-Pay",
    },
    {
      icon:      <HiDocumentText />,
      iconBg:    "bg-orange-50",
      iconColor: "text-orange-500",
      title:     "Review Rental History",
      desc:      "Ensure all your past rental agreements are properly closed. An open agreement from a previous landlord might be dragging you down.",
      cta:       "Check History",
    },
    {
      icon:      <HiUserAdd />,
      iconBg:    "bg-green-50",
      iconColor: "text-green-600",
      title:     isVerified ? "Maintain Your KYC" : "Verify Your Identity",
      desc:      isVerified
        ? "Your identity is verified (+10 pts already applied). Keep your documents up to date to maintain landlord trust."
        : "Complete KYC verification to earn +10 pts instantly and unlock access to premium properties.",
      cta:       isVerified ? "View KYC Status" : "Verify Now",
    },
  ];

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading your trust score...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wide
              ${isVerified
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-amber-50 border-amber-200 text-amber-700"}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isVerified ? "bg-green-500" : "bg-amber-500"}`} />
              {isVerified ? "Verified Tenant" : "Unverified"}
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-400">Last updated: {lastUpdated}</span>
            )}
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Trust Score Insights</h1>
          <p className="text-gray-500 text-sm">Your detailed financial reputation report for landlords.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
            <HiDownload className="text-base" /> Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition">
            <HiShare className="text-base" /> Share Score
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
          <HiExclamationCircle className="shrink-0" />
          Could not load live data — showing your last known score.
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-gray-200">
            <ScoreCircle
              score={displayScore}
              changeThisMonth={changeThisMonth}
            />
          </div>
          <IdentityBanner verified={isVerified} />
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Chart card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">Score History</h3>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {["3M", "6M", "1Y"].map(r => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      range === r
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={range === "3M" ? chartData.slice(-3) : range === "1Y" ? chartData : chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month"
                  tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }}
                  axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="score"
                  stroke="#2563EB" strokeWidth={3}
                  fill="url(#scoreGrad)"
                  dot={{ fill: "#2563EB", strokeWidth: 2, r: 5, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#2563EB", stroke: "#fff", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 4 metric cards */}
          <div className="grid grid-cols-2 gap-5">
            {metrics.map((m, i) => (
              <MetricCard key={i} {...m} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Score Events ── */}
      {recentHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4">Recent Score Events</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {recentHistory.slice(0, 8).map((log, i) => (
                <div key={log.id || i}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                  {/* Delta badge */}
                  <div className={`w-16 text-center text-sm font-black px-2 py-1 rounded-lg shrink-0 ${
                    log.delta > 0 ? "bg-green-50 text-green-700"
                    : log.delta < 0 ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                    {log.delta > 0 ? `+${log.delta}` : log.delta === 0 ? "—" : log.delta}
                  </div>

                  {/* Reason */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {log.reason.replace(/_/g, " ")}
                    </p>
                    {log.note && (
                      <p className="text-xs text-gray-400 truncate">{log.note}</p>
                    )}
                  </div>

                  {/* Snapshot */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900">{log.snapshotAfter}%</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString("en-RW", {
                        day: "numeric", month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── How to Improve ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
            <HiLightningBolt className="text-blue-600 text-sm" />
          </div>
          <h2 className="text-xl font-black text-gray-900">How to Improve</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tips.map((t, i) => (
            <TipCard key={i} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
}