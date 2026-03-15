import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  Users, 
  CreditCard, 
  Lock, 
  FileText 
} from "lucide-react";
import { API_BASE } from "../../config";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_STATS = {
  totalVolume: 1280000000,
  escrowBalance: 450200000,
  totalUsers: 12450,
  landlords: 2100,
  tenants: 10300,
  activeAgreements: 3120,
  volumeGrowth: 12.4,
  escrowGrowth: 5.2,
  agreementGrowth: 8.1,
};

const MOCK_REVENUE = [
  { week: "WEEK 1", w1: 180, w2: 120, w3: 160, w4: 90 },
  { week: "WEEK 2", w1: 220, w2: 180, w3: 200, w4: 140 },
  { week: "WEEK 3", w1: 320, w2: 260, w3: 300, w4: 210 },
  { week: "WEEK 4", w1: 280, w2: 220, w3: 260, w4: 190 },
];

const MOCK_ACQUISITION = [
  { month: "JAN", tenants: 320, landlords: 80 },
  { month: "FEB", tenants: 410, landlords: 120 },
  { month: "MAR", tenants: 280, landlords: 60 },
  { month: "APR", tenants: 520, landlords: 180 },
  { month: "MAY", tenants: 480, landlords: 160 },
  { month: "JUN", tenants: 620, landlords: 200 },
];

const MOCK_KYC = [
  { id: 1, name: "Aline Uwimana", type: "Landlord", date: "Oct 24, 2023", status: "Pending Review" },
  { id: 2, name: "David Nkurunziza", type: "Tenant", date: "Oct 23, 2023", status: "Pending Review" },
  { id: 3, name: "Grace Mukamana", type: "Landlord", date: "Oct 22, 2023", status: "Under Review" },
  { id: 4, name: "Eric Habimana", type: "Tenant", date: "Oct 21, 2023", status: "Pending Review" },
];

const MOCK_DISPUTES = { open: 14, resolved: 128 };

const formatB = (n) => {
  if (n >= 1e9) return `RWF ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `RWF ${(n / 1e6).toFixed(1)}M`;
  return `RWF ${n.toLocaleString()}`;
};

const kycStatusStyle = {
  "Pending Review": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Under Review": "bg-blue-50 text-blue-700 border border-blue-200",
  "Approved": "bg-green-50 text-green-700 border border-green-200",
  "Rejected": "bg-red-50 text-red-600 border border-red-200",
};

export default function ADOverview({ token, setActive }) {
  const [stats, setStats] = useState(MOCK_STATS);
  const [revenue, setRevenue] = useState(MOCK_REVENUE);
  const [acquisition, setAcquisition] = useState(MOCK_ACQUISITION);
  const [kyc, setKyc] = useState(MOCK_KYC);
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [revPeriod, setRevPeriod] = useState("Last 30 Days");
  const [lastUpdate, setLastUpdate] = useState("2 mins ago");

  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const [sRes, kRes] = await Promise.all([
          fetch(`${API_BASE}/admin/dashboard/stats`, { headers: hdrs }),
          fetch(`${API_BASE}/admin/kyc/queue`, { headers: hdrs }),
        ]);
        if (sRes.ok) {
          const d = await sRes.json();
          if (d.data?.stats) setStats(s => ({ ...s, ...d.data.stats }));
          if (d.data?.revenue) setRevenue(d.data.revenue);
          if (d.data?.acquisition) setAcquisition(d.data.acquisition);
          if (d.data?.disputes) setDisputes(d.data.disputes);
          setLastUpdate("just now");
        }
        if (kRes.ok) {
          const d = await kRes.json();
          if (d.data?.length) setKyc(d.data.slice(0, 5));
        }
      } catch {}
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-6 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Real-time insights for InzuTrust operations.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            SYSTEM LIVE
          </span>
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Last update: {lastUpdate}</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Platform Volume", val: formatB(stats.totalVolume), growth: `+${stats.volumeGrowth}%`, icon: <CreditCard size={20}/>, bg: "text-blue-600 bg-blue-50" },
          { label: "Active Escrow Balance", val: formatB(stats.escrowBalance), growth: `+${stats.escrowGrowth}%`, icon: <Lock size={20}/>, bg: "text-emerald-600 bg-emerald-50" },
          { label: "Platform Users", custom: (
              <div className="flex items-end gap-3 mt-1">
                <div>
                  <p className="text-lg font-black text-gray-900">{(stats.landlords / 1000).toFixed(1)}k</p>
                  <p className="text-[9px] font-bold uppercase text-gray-400">Landlords</p>
                </div>
                <div className="w-[1px] h-6 bg-gray-100" />
                <div>
                  <p className="text-lg font-black text-gray-900">{(stats.tenants / 1000).toFixed(1)}k</p>
                  <p className="text-[9px] font-bold uppercase text-gray-400">Tenants</p>
                </div>
              </div>
            ), 
            growth: `${(stats.totalUsers / 1000).toFixed(1)}k Total`, icon: <Users size={20}/>, bg: "text-slate-600 bg-slate-100" },
          { label: "Active Agreements", val: stats.activeAgreements.toLocaleString(), growth: `+${stats.agreementGrowth}%`, icon: <FileText size={20}/>, bg: "text-blue-600 bg-blue-50" },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 transition-colors hover:border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
                {c.icon}
              </div>
              <span className={`text-[10px] font-bold ${i === 2 ? 'text-gray-400' : 'text-emerald-600'}`}>{c.growth}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{c.label}</p>
            {c.custom ? c.custom : <p className="text-xl font-black text-gray-900">{c.val}</p>}
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-gray-900">Revenue & Transaction Trends</h3>
            <select value={revPeriod} onChange={e => setRevPeriod(e.target.value)}
              className="text-[10px] font-bold border border-gray-200 bg-transparent rounded-lg px-2 py-1 text-gray-500">
              {["Last 30 Days", "Last 90 Days", "This Year"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenue} barGap={6}>
              <CartesianGrid vertical={false} stroke="#F8FAFC" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700}} />
              <Tooltip 
                cursor={{fill: '#F8FAFC'}} 
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="w3" fill="#2563EB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="w2" fill="#93C5FD" radius={[2, 2, 0, 0]} />
              <Bar dataKey="w1" fill="#DBEAFE" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-gray-900">User Acquisition</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#2563EB]" />
                <span className="text-[9px] font-bold text-gray-400 uppercase">Tenants</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#10B981]" />
                <span className="text-[9px] font-bold text-gray-400 uppercase">Landlords</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={acquisition}>
              <CartesianGrid vertical={false} stroke="#F8FAFC" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700}} />
              <Tooltip 
                cursor={{fill: '#F8FAFC'}}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="tenants" stackId="a" fill="#2563EB" barSize={24} />
              <Bar dataKey="landlords" stackId="a" fill="#10B981" radius={[2, 2, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── KYC & Disputes ── */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-900">KYC Queue</h3>
            <button onClick={() => setActive("users")} className="text-blue-600 text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
              VIEW ALL <ChevronRight size={14}/>
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3">Applicant</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kyc.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-gray-900">{k.name}</td>
                  <td className="px-6 py-4 text-[11px] text-gray-500 font-medium">{k.type}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${kycStatusStyle[k.status]}`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 p-1.5 rounded-md border border-gray-100 hover:bg-white transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-gray-900">Disputes</h3>
            <button onClick={() => setActive("disputes")} className="text-blue-600 text-[11px] font-bold flex items-center gap-1">VIEW ALL <ChevronRight size={14}/></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 border border-gray-100 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertCircle size={24}/></div>
              <div>
                <p className="text-xl font-black text-gray-900">{disputes.open}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Open</p>
              </div>
            </div>
            <div className="p-5 border border-gray-100 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle2 size={24}/></div>
              <div>
                <p className="text-xl font-black text-gray-900">{disputes.resolved}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Resolved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}