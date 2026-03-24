// src/components/tenant/Overview.jsx
import React, { useState, useEffect } from "react";
import {
  HiChevronRight, HiOutlineDownload, HiOutlineFilter,
  HiCalendar, HiClock, HiOutlineDocumentText, HiMail,
  HiCreditCard, HiCheckCircle, HiInformationCircle, HiShieldCheck,
  HiFolderOpen, HiExclamationCircle, HiRefresh, HiDocumentText,
  HiLightningBolt
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtRWF  = n  => n != null ? `RWF ${Number(n).toLocaleString()}` : "—";
const fmtDate = d  => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const hdrs    = tk => ({ Authorization: `Bearer ${tk}` });

// ── Score circle (inline — no recharts needed) ────────────────────────────────
function ScoreCircle({ score }) {
  const pct          = Math.min(Math.max(score || 0, 0), 100);
  const circumference = 2 * Math.PI * 54;
  const offset       = circumference - (pct / 100) * circumference;
  const color        = pct >= 85 ? "#10B981" : pct >= 60 ? "#2563EB" : pct >= 40 ? "#F59E0B" : "#EF4444";
  const label        = pct >= 95 ? "Outstanding" : pct >= 85 ? "Excellent" : pct >= 75 ? "Very Good"
                     : pct >= 60 ? "Good" : pct >= 45 ? "Fair" : pct >= 30 ? "Poor" : "Critical";

  return (
    <div className="relative w-44 h-44 mx-auto mb-4">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#EEF2FF" strokeWidth="10"/>
        <circle cx="60" cy="60" r="54" fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-gray-900">{pct}%</span>
        <span className="text-sm font-bold mt-0.5" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

// ── Skeleton pieces ───────────────────────────────────────────────────────────
function CardSkeleton({ h = 200 }) {
  return <div className="bg-white rounded-2xl border border-gray-200 p-8"><Skeleton height={h} borderRadius={12}/></div>;
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center border-b border-gray-50">
      <div className="col-span-2"><Skeleton height={12} borderRadius={6}/></div>
      <div className="col-span-5 flex items-center gap-3">
        <Skeleton circle width={28} height={28}/>
        <Skeleton width={120} height={12} borderRadius={6}/>
      </div>
      <div className="col-span-2"><Skeleton width={80} height={12} borderRadius={6}/></div>
      <div className="col-span-2"><Skeleton width={90} height={12} borderRadius={6}/></div>
      <div className="col-span-1 flex justify-end"><Skeleton width={50} height={22} borderRadius={20}/></div>
    </div>
  );
}

// ── Main Overview ─────────────────────────────────────────────────────────────
export default function Overview({ setActiveTab, token }) {
  const [score,        setScore]        = useState(null);
  const [scoreBreak,   setScoreBreak]   = useState(null);
  const [agreement,    setAgreement]    = useState(null);   // active signed agreement
  const [applications, setApplications] = useState([]);
  const [messages,     setMessages]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [scoreRes, agreementsRes, appsRes] = await Promise.all([
        fetch(`${API_BASE}/trust-score`,          { headers: hdrs(token) }),
        fetch(`${API_BASE}/agreements/my`,         { headers: hdrs(token) }),
        fetch(`${API_BASE}/lease-applications/my`, { headers: hdrs(token) }),
      ]);

      // ── Trust score ──
      if (scoreRes.ok) {
        const d = await scoreRes.json();
        if (d.success) {
          setScore(d.data.score ?? 100);
          setScoreBreak(d.data.breakdown || null);
        }
      }

      // ── Agreements — pick the active signed one ──
      if (agreementsRes.ok) {
        const d = await agreementsRes.json();
        const list = d.data || [];
        const active = list.find(a => a.status === "signed")
          || list.find(a => a.status === "pending_signature")
          || list[0] || null;
        setAgreement(active);
      }

      // ── Applications ──
      if (appsRes.ok) {
        const d = await appsRes.json();
        setApplications((d.data || []).slice(0, 3));
      }

    } catch (err) {
      setError("Could not load all data — some sections may show defaults.");
      console.error("[Overview]", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) load(); }, [token]);

  // ── Derived values ────────────────────────────────────────────────────────
  const displayScore     = Math.min(Math.max(score ?? 100, 0), 100);
  const changeThisMonth  = scoreBreak?.changeThisMonth ?? 0;

  // Lease info from active agreement
  const rentAmount       = agreement?.rentAmount || 0;
  const securityDeposit  = agreement?.securityDeposit || 0;
  const landlordName     = agreement?.landlordName || agreement?.landlord
    ? `${agreement?.landlord?.firstName || ""} ${agreement?.landlord?.lastName || ""}`.trim()
    : "Your Landlord";

  // Months remaining in lease
  const leaseMonthsLeft = (() => {
    if (!agreement?.endDate) return null;
    const end  = new Date(agreement.endDate);
    const now  = new Date();
    const diff = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, diff);
  })();
  const leaseDuration   = agreement?.leaseDuration || 12;
  const leaseProgress   = leaseMonthsLeft != null ? ((leaseDuration - leaseMonthsLeft) / leaseDuration) * 100 : 0;

  // Payment status
  const isPaid          = agreement?.status === "signed";
  const nextDue         = agreement?.endDate
    ? (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1, 1);
        return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
      })()
    : "—";

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">

      {/* Error banner */}
      {error && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
          <HiExclamationCircle className="shrink-0"/> {error}
          <button onClick={load} className="ml-auto flex items-center gap-1 text-xs font-bold hover:underline">
            <HiRefresh/> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* ── Trust Score card ── */}
        {loading ? <CardSkeleton h={340}/> : (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col items-start text-left">
            <div className="flex justify-between w-full mb-5">
              <h3 className="text-lg font-bold text-gray-900">Trust Score</h3>
              <button onClick={() => setActiveTab("trust")} title="View details">
                <HiInformationCircle className="text-gray-400 text-xl cursor-pointer hover:text-blue-500 transition"/>
              </button>
            </div>

            <ScoreCircle score={displayScore}/>

            <div className={`bg-green-50 px-5 py-1.5 rounded-full text-sm font-bold mb-3 self-center ${
              changeThisMonth >= 0 ? "text-green-700" : "text-red-600 bg-red-50"
            }`}>
              <HiLightningBolt className="inline mr-1"/>
              {changeThisMonth >= 0 ? "+" : ""}{changeThisMonth} pts this month
            </div>

            <p className="text-sm text-gray-500 leading-relaxed text-center w-full">
              {displayScore >= 85
                ? "Great job! Consistent on-time payments are boosting your score."
                : displayScore >= 60
                  ? "Good standing. Keep paying on time to improve further."
                  : "Focus on timely payments to recover your score."}
            </p>

            <button onClick={() => setActiveTab("trust")}
              className="mt-4 w-full text-blue-600 text-xs font-bold flex items-center justify-center gap-1 hover:underline">
              View Full Insights <HiChevronRight/>
            </button>
          </div>
        )}

        {/* ── Right column ── */}
        <div className="md:col-span-2 space-y-6">

          {/* Rent status */}
          {loading ? <CardSkeleton h={180}/> : (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3.5 h-3.5 rounded-full ${isPaid ? "bg-green-500" : "bg-yellow-400"}`}/>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                  {agreement ? `Current Status: ${isPaid ? "PAID" : "PENDING SIGNATURE"}` : "No Active Lease"}
                </span>
              </div>

              {agreement ? (
                <>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {isPaid
                      ? `${new Date().toLocaleDateString("en-GB", { month: "long" })} Rent Cleared`
                      : "Lease Pending Signature"}
                  </h2>
                  <p className="text-gray-500 text-base mb-6 leading-relaxed">
                    {isPaid
                      ? `Your rent is fully paid. Your next payment cycle begins on ${nextDue}.`
                      : "Your landlord has sent you a lease agreement. Please review and sign it."}
                  </p>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">NEXT DUE</p>
                      <p className="text-xl font-extrabold text-gray-900">{nextDue}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">MONTHLY RENT</p>
                      <p className="text-xl font-extrabold text-gray-900">{fmtRWF(rentAmount)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">No Active Lease</h2>
                  <p className="text-gray-500 text-base mb-6">
                    Browse available properties and apply to get started.
                  </p>
                </>
              )}

              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab("payments")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-700 transition flex items-center gap-2">
                  <HiCreditCard/> {agreement ? "Pay Advance" : "Browse Properties"}
                </button>
                {agreement && !isPaid && (
                  <button onClick={() => setActiveTab("agreements")}
                    className="border border-blue-300 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition flex items-center gap-2">
                    <HiDocumentText/> Sign Agreement
                  </button>
                )}
                <button onClick={() => setActiveTab("payments")}
                  className="border border-gray-200 px-6 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
                  <HiClock/> View History
                </button>
              </div>
            </div>
          )}

          {/* Lease remaining + Security deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading ? (
              <><CardSkeleton h={100}/><CardSkeleton h={100}/></>
            ) : (
              <>
                {/* Lease remaining */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">Lease Remaining</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      agreement?.status === "signed" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {agreement?.status === "signed" ? "Active" : agreement ? "Pending" : "None"}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-3">
                    {leaseMonthsLeft != null ? `${leaseMonthsLeft} Months` : "—"}
                  </p>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${leaseProgress}%` }}/>
                  </div>
                  {agreement?.endDate && (
                    <p className="text-[10px] text-gray-400 mt-1.5">Ends {fmtDate(agreement.endDate)}</p>
                  )}
                </div>

                {/* Security deposit */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <HiShieldCheck className="text-orange-500 text-2xl"/>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">Security Deposit Held</p>
                    <p className="text-2xl font-black text-gray-900">{fmtRWF(securityDeposit || 0)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Refundable at end of lease</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent applications / transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900">Recent Applications</h3>
            <button onClick={load} className="text-gray-400 hover:text-blue-600 transition">
              <HiRefresh className="text-lg"/>
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
            <div className="col-span-4">Property</div>
            <div className="col-span-2">Rent</div>
            <div className="col-span-2">Move-in</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Applied</div>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i}/>)
            ) : applications.length === 0 ? (
              <div className="text-center py-14">
                <HiDocumentText className="text-4xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-500 font-semibold text-sm">No applications yet</p>
                <button onClick={() => setActiveTab("browse")}
                  className="mt-3 text-blue-600 text-sm font-bold hover:underline">
                  Browse Properties →
                </button>
              </div>
            ) : (
              applications.map((app, i) => {
                const prop = app.property;
                const STATUS_STYLE = {
                  pending:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
                  accepted: "bg-green-50 text-green-700 border border-green-200",
                  rejected: "bg-red-50 text-red-600 border border-red-200",
                  draft:    "bg-gray-100 text-gray-500",
                };
                return (
                  <div key={app.id || i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition">
                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{prop?.title || "Property"}</p>
                      <p className="text-[10px] text-gray-400 truncate">{prop?.district}</p>
                    </div>
                    <div className="col-span-2 text-sm font-bold text-blue-600">
                      {fmtRWF(prop?.rentAmount)}
                    </div>
                    <div className="col-span-2 text-xs text-gray-500">
                      {fmtDate(app.moveInDate)}
                    </div>
                    <div className="col-span-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[app.status] || STATUS_STYLE.draft}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-[10px] text-gray-400">
                      {fmtDate(app.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-5 border-t border-gray-100">
            <button onClick={() => setActiveTab("applications")}
              className="text-blue-600 font-bold flex items-center gap-1.5 text-sm hover:underline">
              View All Applications <HiChevronRight/>
            </button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">

          {/* My Documents — from agreements */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HiFolderOpen className="text-gray-400"/> My Documents
            </h4>
            {loading ? (
              <div className="space-y-3">
                <Skeleton height={56} borderRadius={12}/>
                <Skeleton height={56} borderRadius={12}/>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <HiOutlineDocumentText className="text-red-500"/>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {agreement ? `Lease #${agreement.docId || "—"}` : "Lease Agreement"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {agreement ? `Status: ${agreement.status}` : "No active lease"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("agreements")}
                    className="text-blue-600 hover:text-blue-800 transition">
                    <HiChevronRight/>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <HiOutlineDocumentText className="text-blue-500"/>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Payment Receipts</p>
                      <p className="text-[10px] text-gray-400">View in Payments tab</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("payments")}
                    className="text-blue-600 hover:text-blue-800 transition">
                    <HiChevronRight/>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <HiMail className="text-gray-400"/> Recent Messages
              </h4>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Live</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton height={44} borderRadius={10}/>
                <Skeleton height={44} borderRadius={10}/>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm shrink-0">
                    {agreement?.landlordName?.[0] || "L"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{landlordName || "Landlord"}</p>
                    <p className="text-xs text-gray-500 truncate">Tap to open your conversation</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">IS</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">InzuTrust Support</p>
                    <p className="text-xs text-gray-500 truncate">Need help? We're here.</p>
                  </div>
                </div>
              </div>
            )}
            <button onClick={() => setActiveTab("messages")}
              className="w-full mt-4 text-blue-600 font-bold flex items-center justify-center gap-1.5 text-sm hover:underline">
              Open Messenger <HiChevronRight/>
            </button>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <HiCreditCard className="text-gray-400"/> Payment Methods
              </h4>
              <button onClick={() => setActiveTab("payments")}
                className="text-blue-600 text-xs font-bold hover:underline">EDIT</button>
            </div>
            {loading ? <Skeleton height={60} borderRadius={12}/> : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-yellow-600 font-black text-sm">MoMo</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">MTN Mobile Money</p>
                    <p className="text-xs text-gray-400">Primary method</p>
                  </div>
                </div>
                <HiCheckCircle className="text-green-500 text-xl shrink-0"/>
              </div>
            )}
          </div>
        </div>
      </div>

    </SkeletonTheme>
  );
}