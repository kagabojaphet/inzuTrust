import React, { useState, useRef } from "react";
import {
  HiPlus, HiFilter, HiCheckCircle, HiClock, HiExclamation,
  HiDocumentText, HiUpload, HiPaperAirplane, HiX, HiDownload,
  HiShieldCheck, HiInformationCircle, HiPhotograph, HiChevronRight
} from "react-icons/hi";
import { API_BASE } from "../../config";

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_DISPUTES = [
  {
    id: "DIS-2024-001", title: "Security Deposit Refund",
    property: "Kigali Heights Apt 4B", category: "Property Damage",
    claimAmount: 500000, status: "Review", stage: 1,
    filed: "Oct 24, 2023", deadline: "Oct 28, 2023",
    description: "The tenant claims that the landlord has withheld 100% of the security deposit (500,000 RWF) citing damages to the parquet flooring and kitchen cabinetry. The tenant asserts that the damages were pre-existing and documented during the move-in inspection. The landlord has not provided receipts for repairs.",
    messages: [
      { from: "Landlord", time: "Oct 25, 09:12 AM", text: "I have uploaded the photos of the kitchen damage. It was clearly not there during the inspection.", avatar: "L" },
      { from: "You (Tenant)", time: "Oct 25, 09:45 AM", text: "Please refer to page 4 of the move-in inspection PDF. The scratch is documented.", avatar: "T", self: true },
    ],
    evidence: [
      { name: "Move-in_Inspecti...", size: "2.4 MB", by: "Tenant",   type: "pdf" },
      { name: "Living_Room_Floo...", size: "4.1 MB", by: "Tenant",   type: "img" },
      { name: "Kitchen_Cabinet_...", size: "3.8 MB", by: "Landlord", type: "img" },
    ],
  },
  {
    id: "DIS-2024-042", title: "Maintenance Neglect",
    property: "Vision City, Block 3", category: "Maintenance", 
    claimAmount: 120000, status: "Mediation", stage: 2,
    filed: "Oct 10, 2023", deadline: "Oct 30, 2023",
    description: "Landlord has failed to repair the broken water heater for 6 weeks despite multiple requests.",
    messages: [
      { from: "Mediator", time: "Oct 22, 10:00 AM", text: "Both parties are requested to submit final settlement proposals.", avatar: "M" },
    ],
    evidence: [
      { name: "WhatsApp_Chat...", size: "1.1 MB", by: "Tenant", type: "img" },
    ],
  },
  {
    id: "DIS-2023-899", title: "Early Termination Fee",
    property: "Nyarutarama Villa 12", category: "Lease Terms",
    claimAmount: 800000, status: "Resolved", stage: 3,
    filed: "Sep 01, 2023", deadline: "Oct 05, 2023",
    description: "Dispute regarding early termination penalty. Resolved in tenant's favour.",
    messages: [],
    evidence: [],
  },
];

const STAGES = ["Filed", "Evidence Review", "Mediation", "Resolution"];

const statusStyle = {
  Review:    { badge: "bg-blue-50 text-blue-700 border border-blue-200",    dot: "bg-blue-500"   },
  Mediation: { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200", dot: "bg-yellow-500" },
  Resolved:  { badge: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500"  },
  Pending:   { badge: "bg-gray-100 text-gray-600",                          dot: "bg-gray-400"   },
};

const formatRWF = n => `${Number(n).toLocaleString()} RWF`;

// ── File New Dispute modal ─────────────────────────────────────────────────────
function NewDisputeModal({ onClose, onSubmit, userRole }) {
  const [form, setForm] = useState({
    title:"", category:"Property Damage", property:"", claimAmount:"", description:"",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const up = (k,v) => setForm(p => ({...p,[k]:v}));
  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

  const handleSubmit = async () => {
    if(!form.title||!form.property||!form.description){return;}
    setLoading(true);
    setTimeout(()=>{ onSubmit({...form, claimAmount:Number(form.claimAmount), files}); setLoading(false); onClose(); },800);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">File New Dispute</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><HiX className="text-xl"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Dispute Title *</label>
            <input value={form.title} onChange={e=>up("title",e.target.value)} placeholder="e.g. Security Deposit Refund" className={inp}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={e=>up("category",e.target.value)} className={inp}>
                {["Property Damage","Maintenance","Lease Terms","Payment","Other"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Claim Amount (RWF)</label>
              <input type="number" value={form.claimAmount} onChange={e=>up("claimAmount",e.target.value)} placeholder="500000" className={inp}/>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Property *</label>
            <input value={form.property} onChange={e=>up("property",e.target.value)} placeholder="e.g. Kigali Heights Apt 4B" className={inp}/>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e=>up("description",e.target.value)} rows={4} placeholder="Describe the dispute in detail..." className={`${inp} resize-none`}/>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Evidence Files</label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition">
              <input type="file" multiple className="hidden" onChange={e=>setFiles(Array.from(e.target.files))}/>
              <HiUpload className="text-gray-400 text-2xl mb-1"/>
              <p className="text-xs text-gray-500">{files.length>0?`${files.length} file(s) selected`:"Drag files or click to upload"}</p>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Filing...</>:"File Dispute"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ stage }) {
  return (
    <div className="flex items-center justify-between mb-6 relative">
      <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 z-0"/>
      <div className="absolute top-5 left-0 h-[2px] bg-blue-500 z-0 transition-all duration-500"
        style={{ width: `${(stage/3)*100}%` }}/>
      {STAGES.map((s,i)=>{
        const done = stage > i;
        const active = stage === i;
        return (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              done   ? "bg-blue-500 border-blue-500" :
              active ? "bg-white border-blue-500 ring-4 ring-blue-50" :
                       "bg-white border-gray-200"
            }`}>
              {done
                ? <HiCheckCircle className="text-white text-lg"/>
                : active
                  ? <div className="w-3 h-3 rounded-full bg-blue-500"/>
                  : <div className="w-3 h-3 rounded-full bg-gray-300"/>
              }
            </div>
            <span className={`text-xs font-bold ${done||active?"text-blue-600":"text-gray-400"}`}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main DisputeCenter ─────────────────────────────────────────────────────────
export default function DisputeCenter({ token, userRole = "tenant" }) {
  const [disputes,  setDisputes]  = useState(MOCK_DISPUTES);
  const [selected,  setSelected]  = useState(MOCK_DISPUTES[0]);
  const [filter,    setFilter]    = useState("All");
  const [search,    setSearch]    = useState("");
  const [showNew,   setShowNew]   = useState(false);
  const [message,   setMessage]   = useState("");
  const fileRef = useRef(null);

  const filtered = disputes.filter(d => {
    const matchF = filter === "All" || d.status === filter || (filter==="Action Req."&&d.status==="Review");
    const matchS = d.title.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  const handleNewDispute = (data) => {
    const newD = {
      ...data, id:`DIS-2024-${Math.floor(100+Math.random()*900)}`,
      status:"Pending", stage:0, filed:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),
      deadline:"", messages:[], evidence:[],
    };
    setDisputes(prev=>[newD,...prev]);
    setSelected(newD);
  };

  const handleSendMessage = () => {
    if(!message.trim()) return;
    const newMsg = {
      from: userRole === "tenant" ? "You (Tenant)" : userRole === "landlord" ? "You (Landlord)" : "You (Admin)",
      time: new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
      text: message, avatar:"Y", self:true,
    };
    setSelected(prev=>({...prev, messages:[...prev.messages, newMsg]}));
    setDisputes(prev=>prev.map(d=>d.id===selected.id?{...d,messages:[...d.messages,newMsg]}:d));
    setMessage("");
  };

  const s = selected ? (statusStyle[selected.status]||statusStyle.Pending) : null;

  return (
    <>
      {showNew && <NewDisputeModal onClose={()=>setShowNew(false)} onSubmit={handleNewDispute} userRole={userRole}/>}
      <div className="flex h-[calc(100vh-140px)] min-h-[600px] bg-[#f8f9fc] rounded-2xl overflow-hidden border border-gray-200">

        {/* ── Left sidebar ── */}
        <div className="w-64 bg-[#0f172a] flex flex-col shrink-0">
          {/* Header */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">ACTIVE DISPUTES</p>
              <button className="text-white/40 hover:text-white transition"><HiFilter className="text-sm"/></button>
            </div>
            {/* Search */}
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search disputes..."
              className="w-full bg-white/10 text-white text-xs placeholder:text-white/30 rounded-xl px-3 py-2 outline-none focus:bg-white/15 transition"/>
            {/* Filter tabs */}
            <div className="flex gap-1.5 mt-3">
              {["All","Action Req.","Pending"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${filter===f?"bg-blue-600 text-white":"text-white/40 hover:text-white/70"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Dispute list */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filtered.map(d=>{
              const ds = statusStyle[d.status]||statusStyle.Pending;
              const isActive = selected?.id === d.id;
              return (
                <div key={d.id} onClick={()=>setSelected(d)} className={`px-4 py-3.5 cursor-pointer transition ${isActive?"bg-white/10":"hover:bg-white/5"}`}>
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <p className="text-[10px] text-white/40 font-mono">#{d.id}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${ds.badge}`}>{d.status}</span>
                  </div>
                  <p className={`text-sm font-bold leading-tight mb-0.5 ${isActive?"text-white":"text-white/80"}`}>{d.title}</p>
                  <p className="text-[10px] text-white/40">{d.property}</p>
                  <p className="text-[9px] text-white/25 mt-1">Updated 2h ago</p>
                </div>
              );
            })}
          </div>

          {/* File new dispute */}
          <div className="p-4 border-t border-white/10">
            <button onClick={()=>setShowNew(true)}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-bold transition">
              <HiPlus/> File New Dispute
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        {selected && (
          <div className="flex-1 flex overflow-hidden">

            {/* Center: dispute detail */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top bar */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-xl font-black text-gray-900">{selected.title}</h2>
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${s.badge}`}>
                        {selected.status==="Review"?"REVIEW IN PROGRESS":selected.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><HiShieldCheck className="text-gray-400"/> ID: #{selected.id}</span>
                      <span className="flex items-center gap-1"><HiDocumentText className="text-gray-400"/> {selected.property}</span>
                      <span className="flex items-center gap-1"><HiClock className="text-gray-400"/> Filed {selected.filed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition">
                      <HiDownload/> Export PDF
                    </button>
                    {selected.status !== "Resolved" && (
                      <button className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition">
                        <HiPaperAirplane/> Submit Response
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Progress bar */}
                <div className="bg-white rounded-2xl border border-gray-200 px-6 pt-5 pb-4">
                  <ProgressBar stage={selected.stage}/>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-sm text-blue-700">
                    <HiInformationCircle className="text-blue-500 shrink-0 mt-0.5"/>
                    <div>
                      <p className="font-bold">Current Stage: {STAGES[selected.stage]}</p>
                      {selected.deadline && <p className="text-xs text-blue-600 mt-0.5">Both parties have until {selected.deadline} to submit supporting documents. InzuTrust mediators will review files within 48 hours.</p>}
                    </div>
                  </div>
                </div>

                {/* Dispute details */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-black text-gray-900 text-sm flex items-center gap-2 mb-3"><HiDocumentText className="text-gray-400"/> Dispute Details</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{selected.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">CLAIM AMOUNT</p>
                      <p className="text-lg font-black text-gray-900">{formatRWF(selected.claimAmount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">DISPUTE CATEGORY</p>
                      <p className="text-lg font-black text-gray-900">{selected.category}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence Vault */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-900 text-sm flex items-center gap-2"><HiDocumentText className="text-gray-400"/> Evidence Vault</h3>
                    <label className="flex items-center gap-1.5 text-blue-600 text-xs font-bold cursor-pointer hover:underline">
                      <input type="file" className="hidden" multiple onChange={e=>{
                        const newFiles = Array.from(e.target.files).map(f=>({name:f.name.substring(0,18)+"...",size:`${(f.size/1024/1024).toFixed(1)} MB`,by:userRole==="tenant"?"Tenant":"Landlord",type:"img"}));
                        setSelected(prev=>({...prev,evidence:[...prev.evidence,...newFiles]}));
                      }}/>
                      <HiUpload/> Upload New
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.evidence.map((f,i)=>(
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition cursor-pointer">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${f.type==="pdf"?"bg-red-100":"bg-blue-100"}`}>
                          {f.type==="pdf"?<HiDocumentText className="text-red-500"/>:<HiPhotograph className="text-blue-500"/>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{f.name}</p>
                          <p className="text-[10px] text-gray-400">{f.size} · Uploaded by {f.by}</p>
                        </div>
                      </div>
                    ))}
                    {/* Drop zone */}
                    <label className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition">
                      <input type="file" className="hidden"/>
                      <HiUpload className="text-gray-400 text-xl mb-1"/>
                      <p className="text-[10px] text-gray-400 text-center">Drag files or click to upload</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Communication log ── */}
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-black text-gray-900">Communication Log</p>
                <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                  {selected.status==="Resolved"?"Read-Only":"Active"}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selected.messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400">No messages yet.</p>
                  </div>
                )}
                {selected.messages.map((m,i)=>(
                  <div key={i} className={`flex gap-2.5 ${m.self?"flex-row-reverse":""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${m.self?"bg-blue-600 text-white":"bg-gray-200 text-gray-600"}`}>
                      {m.avatar}
                    </div>
                    <div className={`max-w-[80%] ${m.self?"items-end":""} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-[10px] font-bold text-gray-500 ${m.self?"order-last":""}`}>{m.from}</p>
                        <p className="text-[9px] text-gray-400">{m.time}</p>
                      </div>
                      <div className={`text-xs rounded-2xl px-3 py-2 leading-relaxed ${m.self?"bg-blue-600 text-white rounded-tr-sm":"bg-gray-100 text-gray-800 rounded-tl-sm"}`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))}
                {/* System notice */}
                {selected.status==="Review" && (
                  <div className="text-center">
                    <span className="text-[9px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">System: Case status updated to 'Review'</span>
                  </div>
                )}
              </div>

              {/* Message input */}
              {selected.status !== "Resolved" ? (
                <div className="p-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
                    <input value={message} onChange={e=>setMessage(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"/>
                    <button onClick={handleSendMessage} className="text-blue-500 hover:text-blue-700 transition">
                      <HiPaperAirplane className="text-sm"/>
                    </button>
                  </div>
                  {selected.status==="Review"&&<p className="text-[9px] text-gray-400 text-center mt-1.5">Messaging is currently paused during Review phase.</p>}
                </div>
              ) : (
                <div className="p-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 text-center">This dispute has been resolved.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}