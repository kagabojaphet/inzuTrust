// ── ADDisputes ────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { 
  HiCheckCircle, HiExclamation, HiFilter, HiPlus, 
  HiOutlineChatAlt2, HiOutlineDocumentText, HiOutlineClock,
  HiOutlineShieldCheck, HiOutlineScale, HiCurrencyDollar
} from "react-icons/hi";
import { API_BASE } from "../../config";

const MOCK_DISPUTES = [
  { 
    id: "DS-9042", 
    title: "Security Deposit Refund", 
    tenant: "Marcus Thorne", 
    landlord: "Sarah Jenkins", 
    amount: "1,250.00",
    priority: "HIGH PRIORITY",
    status: "Evidence Collection",
    initiated: "2 days ago",
    timeline: [
      { label: "Case Filed", time: "Oct 12, 09:15 AM", done: true },
      { label: "Preliminary Review", time: "Oct 12, 02:30 PM", done: true },
      { label: "Evidence Collection", time: "Waiting for Tenant Photos", done: false },
    ]
  },
  { 
    id: "DS-8912", 
    title: "Emergency Maintenance", 
    tenant: "Jessica Wong", 
    landlord: "RealProp Mgmt", 
    status: "Mediation Scheduled",
    priority: "MEDIUM PRIORITY",
    initiated: "5 days ago",
    timeline: [
      { label: "Case Filed", time: "Oct 09, 11:20 AM", done: true },
      { label: "Mediation Scheduled", time: "Pending Date Confirmation", done: false },
    ]
  }
];

export function ADDisputes({ token }) {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [activeTab, setActiveTab] = useState("All Active Cases");
  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/disputes`, { headers: hdrs });
        if (res.ok) { const d = await res.json(); if (d.data?.length) setDisputes(d.data); }
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Figma Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dispute Resolution Center</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Mediating conflicts between landlords and tenants with transparency.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <HiFilter className="text-slate-400" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100">
            <HiPlus /> New Case
          </button>
        </div>
      </div>

      {/* Figma Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Active Cases', val: '142', sub: '+4%', icon: HiOutlineScale, color: 'text-emerald-500' },
          { label: 'High Priority', val: '18', sub: '+2', icon: HiExclamation, color: 'text-red-500' },
          { label: 'Avg. Resolution Time', val: '4.2', sub: 'days', icon: HiOutlineClock, color: 'text-slate-400' },
          { label: 'Pending Evidence', val: '35', sub: 'Action Needed', icon: HiOutlineDocumentText, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-900 leading-none">{stat.val}</span>
              <span className={`text-xs font-bold mb-1 ${stat.color}`}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-8">
        {["All Active Cases", "Deposit Issues", "Maintenance", "Late Rent"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Dispute Case Cards */}
      <div className="space-y-4">
        {disputes.map((caseItem) => (
          <div key={caseItem.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col lg:flex-row gap-8">
            {/* Left Info: Parties & Category */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded">#{caseItem.id}</span>
                <span className={`text-[10px] font-black tracking-tighter ${caseItem.priority.includes('HIGH') ? 'text-red-500' : 'text-amber-500'}`}>
                  ! {caseItem.priority}
                </span>
                <span className="text-slate-300 text-[10px] font-bold ml-auto">Initiated {caseItem.initiated}</span>
              </div>

              <div className="flex items-center justify-between max-w-sm">
                <div className="text-center">
                  <p className="text-sm font-black text-slate-900">{caseItem.landlord}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Landlord</p>
                </div>
                <div className="text-blue-600 font-black text-lg italic px-4">VS</div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-900">{caseItem.tenant}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tenant</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  {caseItem.title.includes('Deposit') ? <HiCurrencyDollar size={20}/> : <HiOutlineShieldCheck size={20}/>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Category</p>
                  <p className="text-sm font-black text-slate-900">{caseItem.title}</p>
                  {caseItem.amount && <p className="text-xs text-slate-500 font-medium">Disputed Amount: ${caseItem.amount}</p>}
                </div>
              </div>
            </div>

            {/* Middle: Timeline */}
            <div className="flex-1 border-l border-slate-100 pl-8 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Case Timeline</p>
              <div className="space-y-6">
                {caseItem.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== caseItem.timeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-100" />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.done ? "bg-emerald-500 text-white" : "border-2 border-blue-500 bg-white"
                    }`}>
                      {step.done && <HiCheckCircle size={14} />}
                    </div>
                    <div>
                      <p className={`text-xs font-black ${step.done ? 'text-slate-900' : 'text-blue-600'}`}>{step.label}</p>
                      <p className="text-[10px] font-bold text-slate-400">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col gap-2 justify-center shrink-0 w-full lg:w-48">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition">
                <HiOutlineChatAlt2 size={16}/> Mediate
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl text-xs font-bold hover:bg-slate-100 transition">
                <HiOutlineDocumentText size={16}/> Evidence
              </button>
              <button className="w-full py-2.5 bg-white text-slate-400 border border-slate-100 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-500 transition">
                Close Case
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400">Showing 1-10 of 142 disputes</p>
        <div className="flex gap-1">
          {[1, 2, 3].map(n => (
            <button key={n} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              n === 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ADDisputes;