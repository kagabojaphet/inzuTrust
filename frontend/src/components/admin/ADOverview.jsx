// src/components/admin/ADOverview.jsx
import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  AlertCircle, CheckCircle2, ChevronRight, Eye,
  Users, CreditCard, Lock, FileText, Triangle,
} from "lucide-react";
import { API_BASE } from "../../config";

// ── Helpers ───────────────────────────────────────────────────────────────────
const authHdr = tk => ({ Authorization: `Bearer ${tk}` });

const formatB = n => {
  const num = Number(n || 0);
  if (num >= 1e9) return `RWF ${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `RWF ${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `RWF ${(num / 1e3).toFixed(0)}k`;
  return `RWF ${num.toLocaleString()}`;
};

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function buildAcquisition(users = []) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const yr  = d.getFullYear();
    const mo  = d.getMonth();
    const inM = users.filter(u => {
      const c = new Date(u.createdAt);
      return c.getFullYear() === yr && c.getMonth() === mo;
    });
    return {
      month:     MONTH_SHORT[mo].toUpperCase(),
      tenants:   inM.filter(u => u.role === "tenant").length,
      landlords: inM.filter(u => u.role === "landlord").length,
      agents:    inM.filter(u => u.role === "agent").length,
    };
  });
}

function buildWeekly(payments = []) {
  const now    = new Date();
  const result = [
    { week:"WEEK 1", revenue:0 },
    { week:"WEEK 2", revenue:0 },
    { week:"WEEK 3", revenue:0 },
    { week:"WEEK 4", revenue:0 },
  ];
  payments.forEach(p => {
    if (!["released","paid"].includes(p.status)) return;
    const d = new Date(p.paidAt || p.createdAt);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      const idx = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
      result[idx].revenue += Number(p.amount || 0);
    }
  });
  return result;
}

// Derive priority from dispute stage / category
function getPriority(d) {
  if (d.stage >= 2 || d.category === "fraud")        return "HIGH PRIORITY";
  if (d.stage === 1 || d.claimAmount > 500000)       return "MEDIUM";
  return "LOW";
}
const PRIORITY_STYLE = {
  "HIGH PRIORITY": "bg-red-50 text-red-600 border border-red-200",
  "MEDIUM":        "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "LOW":           "bg-gray-50 text-gray-500 border border-gray-200",
};
const DISPUTE_STATUS_STYLE = {
  open:          "bg-red-50 text-red-600 border border-red-200",
  under_review:  "bg-blue-50 text-blue-700 border border-blue-200",
  mediation:     "bg-purple-50 text-purple-700 border border-purple-200",
  resolved:      "bg-green-50 text-green-700 border border-green-200",
  closed:        "bg-gray-50 text-gray-500 border border-gray-200",
};

const KYC_STYLE = {
  "Pending Review": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Under Review":   "bg-blue-50 text-blue-700 border border-blue-200",
  "Approved":       "bg-green-50 text-green-700 border border-green-200",
  "Rejected":       "bg-red-50 text-red-600 border border-red-200",
};

// ── Skeleton bone ─────────────────────────────────────────────────────────────
function Bone({ w = "100%", h = 16, r = 8, className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-100 ${className}`}
      style={{ width: w, height: h, borderRadius: r }}/>
  );
}

// ── Dispute row card ──────────────────────────────────────────────────────────
function DisputeCard({ d, onView }) {
  const priority = getPriority(d);
  const reporter = d.reporter ? `${d.reporter.firstName||""} ${d.reporter.lastName||""}`.trim() : "Unknown";
  const docId    = d.docId || `#DISP-${String(d.id||"").slice(0,6).toUpperCase()}`;
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-50 last:border-0 flex-wrap">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
          <Triangle size={12} className="text-red-500"/>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-gray-900 truncate max-w-[200px]">{d.title || "Dispute"}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            By <span className="font-semibold text-gray-600">{reporter}</span>
            {d.category && <> · <span className="capitalize">{d.category.replace("_"," ")}</span></>}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="font-mono text-[9px] font-bold text-gray-400">{docId}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${PRIORITY_STYLE[priority]}`}>
              {priority}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[9px] font-bold px-2 py-1 rounded-md capitalize ${DISPUTE_STATUS_STYLE[d.status] || DISPUTE_STATUS_STYLE.open}`}>
          {(d.status||"open").replace("_"," ")}
        </span>
        <button onClick={() => onView(d)}
          className="text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition whitespace-nowrap">
          Review →
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ADOverview({ token, setActive }) {
  const [loading,       setLoading]       = useState(true);
  const [stats,         setStats]         = useState(null);
  const [weeklyData,    setWeeklyData]    = useState([]);
  const [acqData,       setAcqData]       = useState([]);
  const [kycUsers,      setKycUsers]      = useState([]);
  const [disputes,      setDisputes]      = useState({ open:0, resolved:0, list:[] });
  const [lastUpdate,    setLastUpdate]    = useState("loading…");
  const [revPeriod,     setRevPeriod]     = useState("Last 30 Days");

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const H = authHdr(token);

    const [dashJson, usersJson, paymentsJson, disputesJson, agreementsJson] =
      await Promise.all([
        safeFetch(`${API_BASE}/admin/dashboard/stats`,  { headers: H }),
        safeFetch(`${API_BASE}/admin/users?limit=500`,  { headers: H }),
        safeFetch(`${API_BASE}/payments/admin/all`,     { headers: H }),
        safeFetch(`${API_BASE}/disputes/admin/all`,     { headers: H }),
        safeFetch(`${API_BASE}/agreements/all`,         { headers: H }),
      ]);

    const users      = usersJson?.data      || [];
    const payments   = paymentsJson?.data   || [];
    const disputeArr = disputesJson?.data   || [];
    const agreements = agreementsJson?.data || [];
    const dash       = dashJson?.data?.stats || {};

    // ── Stats ─────────────────────────────────────────────────────────────────
    const landlords        = users.filter(u => u.role === "landlord").length || dash.landlords        || 0;
    const tenants          = users.filter(u => u.role === "tenant").length   || dash.tenants          || 0;
    const agents           = users.filter(u => u.role === "agent").length    || 0;
    const totalUsers       = users.length                                    || dash.totalUsers       || 0;
    const activeAgreements = agreements.filter(a => a.status === "signed").length
                             || dash.activeAgreements || 0;
    const totalVolume  = payments
      .filter(p => ["released","paid"].includes(p.status))
      .reduce((s, p) => s + Number(p.amount || 0), 0) || Number(dash.totalVolume || 0);
    const escrowBalance = payments
      .filter(p => ["escrow","pending"].includes(p.status))
      .reduce((s, p) => s + Number(p.amount || 0), 0) || Number(dash.escrowBalance || 0);

    setStats({ landlords, tenants, agents, totalUsers, activeAgreements, totalVolume, escrowBalance });

    // ── Disputes ──────────────────────────────────────────────────────────────
    const openList     = disputeArr.filter(d => ["open","under_review","mediation"].includes(d.status));
    const resolvedList = disputeArr.filter(d => d.status === "resolved");
    setDisputes({
      open:     openList.length     || dash.openDisputes     || 0,
      resolved: resolvedList.length || dash.resolvedDisputes || 0,
      list:     disputeArr
        .sort((a, b) => {
          // Sort: open/high-priority first
          const stageB = b.stage || 0;
          const stageA = a.stage || 0;
          return stageB - stageA || new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 4),
    });

    // ── Charts ────────────────────────────────────────────────────────────────
    setWeeklyData(buildWeekly(payments));
    setAcqData(buildAcquisition(users));

    // ── KYC queue ─────────────────────────────────────────────────────────────
    const unverified = users
      .filter(u => !u.isVerified && ["tenant","landlord","agent"].includes(u.role))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(u => ({
        id:     u.id,
        name:   `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
        type:   u.role.charAt(0).toUpperCase() + u.role.slice(1),
        date:   new Date(u.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),
        status: "Pending Review",
      }));
    setKycUsers(unverified);

    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] space-y-6 text-left">

      {/* ── Page Header ── */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Real-time insights for InzuTrust operations.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
            SYSTEM LIVE
          </span>
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
            Last update: {lastUpdate}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 text-blue-600 bg-blue-50 rounded-lg flex items-center justify-center">
              <CreditCard size={20}/>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Live</span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Platform Volume</p>
          {loading ? <Bone w={120} h={24}/> : <p className="text-xl font-black text-gray-900">{formatB(stats?.totalVolume)}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 text-emerald-600 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Lock size={20}/>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Escrow</span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Active Escrow Balance</p>
          {loading ? <Bone w={120} h={24}/> : <p className="text-xl font-black text-gray-900">{formatB(stats?.escrowBalance)}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 text-slate-600 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users size={20}/>
            </div>
            {loading
              ? <Bone w={60} h={14}/>
              : <span className="text-[10px] font-bold text-gray-400">{((stats?.totalUsers||0)/1000).toFixed(1)}k Total</span>
            }
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Platform Users</p>
          {loading ? (
            <div className="flex items-end gap-3 mt-1">
              <Bone w={36} h={20}/><Bone w={1} h={24}/><Bone w={36} h={20}/><Bone w={1} h={24}/><Bone w={36} h={20}/>
            </div>
          ) : (
            <div className="flex items-end gap-2 mt-1 flex-wrap">
              <div>
                <p className="text-lg font-black text-gray-900">{(stats?.landlords||0).toLocaleString()}</p>
                <p className="text-[9px] font-bold uppercase text-gray-400">Landlords</p>
              </div>
              <div className="w-[1px] h-6 bg-gray-100 shrink-0"/>
              <div>
                <p className="text-lg font-black text-gray-900">{(stats?.tenants||0).toLocaleString()}</p>
                <p className="text-[9px] font-bold uppercase text-gray-400">Tenants</p>
              </div>
              <div className="w-[1px] h-6 bg-gray-100 shrink-0"/>
              <div>
                <p className="text-lg font-black text-gray-900">{(stats?.agents||0).toLocaleString()}</p>
                <p className="text-[9px] font-bold uppercase text-gray-400">Agents</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 text-blue-600 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText size={20}/>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Active</span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Active Agreements</p>
          {loading ? <Bone w={80} h={24}/> : <p className="text-xl font-black text-gray-900">{(stats?.activeAgreements||0).toLocaleString()}</p>}
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
            <h3 className="text-sm font-black text-gray-900">Revenue &amp; Transaction Trends</h3>
            <select value={revPeriod} onChange={e => setRevPeriod(e.target.value)}
              className="text-[10px] font-bold border border-gray-200 bg-transparent rounded-lg px-2 py-1 text-gray-500 outline-none">
              {["Last 30 Days","Last 90 Days","This Year"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          {loading ? <Bone h={240} r={12}/> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData} barGap={6}>
                <CartesianGrid vertical={false} stroke="#F8FAFC"/>
                <XAxis dataKey="week" axisLine={false} tickLine={false}
                  tick={{ fontSize:9, fill:"#CBD5E1", fontWeight:700 }}/>
                <Tooltip cursor={{ fill:"#F8FAFC" }}
                  contentStyle={{ borderRadius:"8px", border:"1px solid #E2E8F0", fontSize:"10px", fontWeight:"bold" }}
                  formatter={v => [formatB(v), "Revenue"]}/>
                <Bar dataKey="revenue" fill="#2563EB" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Acquisition */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
            <h3 className="text-sm font-black text-gray-900">User Acquisition</h3>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { key:"tenants",   color:"#2563EB", label:"Tenants"   },
                { key:"landlords", color:"#10B981", label:"Landlords" },
                { key:"agents",    color:"#F59E0B", label:"Agents"    },
              ].map(l => (
                <div key={l.key} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background:l.color }}/>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          {loading ? <Bone h={240} r={12}/> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={acqData}>
                <CartesianGrid vertical={false} stroke="#F8FAFC"/>
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fontSize:9, fill:"#CBD5E1", fontWeight:700 }}/>
                <Tooltip cursor={{ fill:"#F8FAFC" }}
                  contentStyle={{ borderRadius:"8px", border:"1px solid #E2E8F0", fontSize:"10px", fontWeight:"bold" }}/>
                <Bar dataKey="tenants"   stackId="a" fill="#2563EB" barSize={24}/>
                <Bar dataKey="landlords" stackId="a" fill="#10B981" barSize={24}/>
                <Bar dataKey="agents"    stackId="a" fill="#F59E0B" radius={[2,2,0,0]} barSize={24}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── KYC Queue & Disputes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* KYC Queue */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-900">KYC Verification Queue</h3>
            <button onClick={() => setActive("users")}
              className="text-blue-600 text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
              VIEW ALL <ChevronRight size={14}/>
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {Array.from({length:3}).map((_,i) => (
                <div key={i} className="flex items-center gap-3">
                  <Bone w={28} h={28} r={99}/>
                  <Bone w={120} h={13}/><Bone w={60} h={13}/><Bone w={90} h={22} r={6}/>
                </div>
              ))}
            </div>
          ) : kycUsers.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2"/>
              <p className="text-sm text-gray-400 font-semibold">All users verified</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-3">Applicant</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Submission Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {kycUsers.map(k => (
                    <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black flex items-center justify-center shrink-0">
                            {k.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-900 whitespace-nowrap">{k.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[11px] text-gray-500 font-medium">{k.type}</td>
                      <td className="px-5 py-4 text-[11px] text-gray-400 whitespace-nowrap">{k.date}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${KYC_STYLE[k.status] || KYC_STYLE["Pending Review"]}`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setActive("users")}
                          className="text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition whitespace-nowrap">
                          Review KYC
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Disputes — stats + list ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-900">Dispute Resolution</h3>
            <button onClick={() => setActive("disputes")}
              className="text-blue-600 text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
              VIEW ALL <ChevronRight size={14}/>
            </button>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-4 p-5 border-b border-gray-50">
            {loading ? (
              <><Bone h={72} r={12}/><Bone h={72} r={12}/></>
            ) : (
              <>
                <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0">
                    <AlertCircle size={22}/>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{disputes.open}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Open Disputes</p>
                  </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg shrink-0">
                    <CheckCircle2 size={22}/>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{disputes.resolved}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Resolved</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dispute list */}
          <div className="px-5 pb-2 pt-1">
            {loading ? (
              <div className="space-y-4 py-3">
                {Array.from({length:3}).map((_,i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3 flex-1">
                      <Bone w={32} h={32} r={99}/>
                      <div className="flex-1">
                        <Bone w={160} h={13}/>
                        <Bone w={100} h={10} className="mt-1.5"/>
                        <div className="flex gap-2 mt-1.5"><Bone w={60} h={18} r={6}/><Bone w={80} h={18} r={6}/></div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Bone w={60} h={26} r={8}/>
                      <Bone w={70} h={26} r={8}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : disputes.list.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2"/>
                <p className="text-sm text-gray-400 font-semibold">No disputes yet</p>
              </div>
            ) : (
              disputes.list.map(d => (
                <DisputeCard key={d.id} d={d} onView={() => setActive("disputes")}/>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}