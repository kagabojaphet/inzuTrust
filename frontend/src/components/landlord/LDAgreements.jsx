import React, { useEffect, useState } from "react";
import {
  HiPlus, HiDocumentText, HiCheckCircle,
  HiClock, HiExclamation, HiEye, HiPencilAlt,
  HiDownload, HiShieldCheck, HiArrowRight, HiArrowLeft,
  HiCheck, HiX
} from "react-icons/hi";
import { useRef } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const MOCK = [
  { id:1, tenant:"Bosco Mutabazi",  property:"Kigali Heights Apt 4B", start:"Jan 01, 2026", end:"Dec 31, 2026", rent:1200000, status:"Active",   docId:"RW-8821-KGL" },
  { id:2, tenant:"Claire Uwera",    property:"Vision City Villa #12",  start:"Mar 01, 2026", end:"Feb 28, 2027", rent:2500000, status:"Active",   docId:"RW-7734-KGL" },
  { id:3, tenant:"Arangwa Jean",    property:"Kimironko Studio 2A",    start:"Jul 01, 2025", end:"Jun 30, 2026", rent:450000,  status:"Expiring", docId:"RW-6612-KGL" },
  { id:4, tenant:"David Nzeyimana", property:"Rebero Heights Unit 5",  start:"Nov 01, 2024", end:"Oct 31, 2025", rent:800000,  status:"Expired",  docId:"RW-5990-KGL" },
  { id:5, tenant:"Diane Ingabire",  property:"Nyarutarama Penthouse",  start:"Oct 01, 2026", end:"Sep 30, 2027", rent:3500000, status:"Pending",  docId:"RW-4481-KGL" },
];

const statusStyle = {
  Active:   { badge:"bg-green-50 text-green-700 border border-green-200",   icon:<HiCheckCircle className="text-green-600"/>  },
  Expiring: { badge:"bg-yellow-50 text-yellow-700 border border-yellow-200", icon:<HiClock className="text-yellow-600"/>       },
  Expired:  { badge:"bg-red-50 text-red-600 border border-red-200",          icon:<HiExclamation className="text-red-500"/>    },
  Pending:  { badge:"bg-blue-50 text-blue-700 border border-blue-200",       icon:<HiClock className="text-blue-500"/>         },
};

const STEPS = [
  { id:1, label:"Property Details",  sub:"Property & parties"    },
  { id:2, label:"Lease Terms",       sub:"Duration & financials" },
  { id:3, label:"Review Agreement",  sub:"Preview document"      },
  { id:4, label:"Sign & Finalize",   sub:"E-signature"           },
];

const formatRWF = n => `${Number(n).toLocaleString()} RWF`;
const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

// ─────────────────────────────────────────────────────────────────────────────
// Signature canvas
// ─────────────────────────────────────────────────────────────────────────────
function SigCanvas({ label, onSave, onClear }) {
  const ref  = useRef(null);
  const drag = useRef(false);
  const [has, setHas] = useState(false);

  const gp = (e, c) => {
    const r = c.getBoundingClientRect();
    return { x:(e.touches?e.touches[0].clientX:e.clientX)-r.left, y:(e.touches?e.touches[0].clientY:e.clientY)-r.top };
  };
  const start = e => { e.preventDefault(); const c=ref.current,p=gp(e,c); c.getContext("2d").beginPath(); c.getContext("2d").moveTo(p.x,p.y); drag.current=true; };
  const move  = e => { if(!drag.current)return; e.preventDefault(); const c=ref.current,ctx=c.getContext("2d"),p=gp(e,c); ctx.lineWidth=2.5;ctx.lineCap="round";ctx.strokeStyle="#1e3a5f"; ctx.lineTo(p.x,p.y);ctx.stroke(); setHas(true); };
  const stop  = () => { drag.current=false; if(has) onSave(ref.current.toDataURL()); };
  const clear = () => { ref.current.getContext("2d").clearRect(0,0,ref.current.width,ref.current.height); setHas(false); onClear(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</p>
        {has && <button onClick={clear} className="text-xs text-red-500 font-bold flex items-center gap-1"><HiX className="text-xs"/>Clear</button>}
      </div>
      <div className="relative border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/20 overflow-hidden">
        <canvas ref={ref} width={440} height={100} className="w-full cursor-crosshair touch-none"
          onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={move} onTouchEnd={stop}/>
        {!has && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-gray-400 flex items-center gap-2"><HiPencilAlt/>Draw your signature</p>
        </div>}
      </div>
      <div className="mt-1 border-t border-gray-300 mx-4"/><p className="text-[10px] text-gray-400 text-center mt-1">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lease document preview
// ─────────────────────────────────────────────────────────────────────────────
function LeaseDoc({ d, docId, showSigs }) {
  const today = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm font-serif leading-relaxed max-h-[460px] overflow-y-auto shadow-inner">
      <div className="flex justify-between items-start mb-5 font-sans">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">DOCUMENT ID: #{docId}</span>
        <div className="text-right"><p className="font-black text-gray-800 text-sm">InzuTrust Properties</p><p className="text-xs text-gray-500">Kigali, Rwanda</p></div>
      </div>
      <h2 className="text-center text-base font-black text-gray-900 mb-5 uppercase tracking-widest font-sans">RESIDENTIAL LEASE AGREEMENT</h2>
      <p className="mb-4 text-gray-700">This Agreement is made on <span className="bg-yellow-100 px-1 font-bold">{today}</span> between <strong>{d.landlordName||"___"}</strong> ("Landlord") and <strong>{d.tenantName||"___"}</strong> ("Tenant")</p>
      {[
        {n:"1",t:"PROPERTY",      b:<>Property at <strong>{d.propertyAddress||"___"}, {d.district||"Kigali"}, Rwanda</strong> for private residence.</>},
        {n:"2",t:"TERM",          b:<>Duration: <strong>{d.leaseDuration||"12"} months</strong>, from <strong>{d.startDate||"___"}</strong> to <strong>{d.endDate||"___"}</strong>.</>},
        {n:"3",t:"RENT",          b:<>Monthly: <strong>{formatRWF(d.rentAmount||0)}</strong>. Due 1st. Late fee 5%.</>},
        {n:"4",t:"SECURITY DEPOSIT", b:<><strong>{formatRWF(d.securityDeposit||d.rentAmount||0)}</strong> held in InzuTrust escrow.</>},
        {n:"5",t:"USE OF PREMISES",  b:"Solely as a private residential dwelling. No subletting without written consent."},
        {n:"6",t:"MAINTENANCE",      b:"Tenant shall maintain the property in good condition."},
        {n:"7",t:"TERMINATION",      b:"30 days written notice required. Early termination subject to InzuTrust policy."},
        {n:"8",t:"GOVERNING LAW",    b:"Governed by the laws of the Republic of Rwanda."},
      ].map(c=>(
        <div key={c.n} className="mb-3">
          <p className="font-black text-gray-900 font-sans mb-0.5">{c.n}. {c.t}</p>
          <p className="text-gray-700">{c.b}</p>
        </div>
      ))}
      {d.additionalTerms && <div className="mb-3"><p className="font-black text-gray-900 font-sans mb-0.5">9. ADDITIONAL TERMS</p><p className="text-gray-700">{d.additionalTerms}</p></div>}
      {showSigs && (
        <div className="pt-4 mt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
          {[{name:d.landlordName,role:"Landlord",sig:d.landlordSignature},{name:d.tenantName,role:"Tenant",sig:d.tenantSignature}].map((s,i)=>(
            <div key={i}>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 font-sans">{s.role} Signature</p>
              {s.sig ? <img src={s.sig} alt={s.role} className="h-10 object-contain mb-1"/> : <div className="h-10 border-b border-gray-400 mb-1"/>}
              <p className="text-xs text-gray-500">{s.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline 4-step lease creation flow
// ─────────────────────────────────────────────────────────────────────────────
function CreateLease({ token, user, prefill, onClose, onCreated }) {
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);
  const docId = useRef(`RW-${Math.floor(1000+Math.random()*9000)}-KGL`).current;

  const [data, setData] = useState({
    landlordName:      user ? `${user.firstName||""} ${user.lastName||""}`.trim() : "",
    tenantName:        "",
    tenantEmail:       "",
    propertyAddress:   prefill?.address || prefill?.title || "",
    district:          prefill?.district || "Gasabo",
    sector:            prefill?.sector   || "",
    rentAmount:        prefill?.rentAmount || "",
    securityDeposit:   "",
    leaseDuration:     "12",
    startDate:         "",
    endDate:           "",
    additionalTerms:   "",
    landlordSignature: null,
    tenantSignature:   null,
  });

  useEffect(()=>{
    if(data.startDate && data.leaseDuration){
      const d=new Date(data.startDate); d.setMonth(d.getMonth()+parseInt(data.leaseDuration));
      setData(p=>({...p, endDate:d.toISOString().split("T")[0]}));
    }
  },[data.startDate,data.leaseDuration]);

  const up = (k,v) => { setError(""); setData(p=>({...p,[k]:v})); };

  const F = ({label,req,children}) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">{label}{req?" *":""}</label>
      {children}
    </div>
  );

  const validate = () => {
    if(step===1){
      if(!data.landlordName.trim()) return "Landlord name is required.";
      if(!data.tenantName.trim())   return "Tenant name is required.";
      if(!data.tenantEmail||!/\S+@\S+\.\S+/.test(data.tenantEmail)) return "Valid tenant email required.";
      if(!data.propertyAddress.trim()) return "Property address is required.";
    }
    if(step===2){ if(!data.rentAmount) return "Monthly rent is required."; if(!data.startDate) return "Start date is required."; }
    if(step===4){ if(!data.landlordSignature) return "Landlord signature required."; if(!data.tenantSignature) return "Tenant signature required."; }
    return null;
  };

  const handleNext = async () => {
    const err = validate(); if(err){setError(err);return;}
    if(step<4){setStep(s=>s+1);return;}
    setLoading(true);
    try {
      if(token){
        await fetch(`${API_BASE}/agreements`,{
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
          body:JSON.stringify({...data,docId,status:"signed",signedAt:new Date().toISOString()}),
        });
      }
    } catch(e){console.warn(e);}
    finally{setLoading(false);setDone(true);}
  };

  const handleDownload = () => {
    const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    const html=`<!DOCTYPE html><html><head><title>Lease - ${docId}</title>
<style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:40px;color:#1a1a1a;line-height:1.8;font-size:13px}
h1{text-align:center;text-transform:uppercase;letter-spacing:3px;font-size:16px;font-family:Arial}
.st{font-family:Arial;font-weight:700;font-size:12px;text-transform:uppercase;margin:16px 0 4px}
.sigs{display:flex;gap:60px;margin-top:40px;padding-top:20px;border-top:1px solid #ccc}.sb{flex:1}
.sl{border-bottom:1px solid #333;min-height:50px;margin-bottom:6px}</style></head><body>
<div style="display:flex;justify-content:space-between;margin-bottom:20px;font-family:Arial;font-size:12px">
<span>DOCUMENT ID: #${docId}</span><div style="text-align:right"><strong>InzuTrust Properties</strong><br>Kigali, Rwanda</div></div>
<h1>Residential Lease Agreement</h1>
<p>Made on <strong>${today}</strong> between <strong>${data.landlordName}</strong> and <strong>${data.tenantName}</strong>.</p>
<div class="st">1. Property</div><p><strong>${data.propertyAddress}, ${data.district}, Rwanda</strong></p>
<div class="st">2. Term</div><p>${data.leaseDuration} months · ${data.startDate} → ${data.endDate}</p>
<div class="st">3. Rent</div><p><strong>${formatRWF(data.rentAmount)}</strong>/month. Due 1st. Late fee 5%.</p>
<div class="st">4. Security Deposit</div><p><strong>${formatRWF(data.securityDeposit||data.rentAmount)}</strong> held in InzuTrust escrow.</p>
<div class="st">5. Use</div><p>Private residential dwelling only.</p>
<div class="st">6. Maintenance</div><p>Tenant maintains property in good condition.</p>
<div class="st">7. Termination</div><p>30 days notice required.</p>
<div class="st">8. Governing Law</div><p>Republic of Rwanda.</p>
${data.additionalTerms?`<div class="st">9. Additional Terms</div><p>${data.additionalTerms}</p>`:""}
<div class="sigs">
<div class="sb">${data.landlordSignature?`<img src="${data.landlordSignature}" height="50"/>`:'<div class="sl"></div>'}<p><strong>${data.landlordName}</strong><br>Landlord</p></div>
<div class="sb">${data.tenantSignature?`<img src="${data.tenantSignature}" height="50"/>`:'<div class="sl"></div>'}<p><strong>${data.tenantName}</strong><br>Tenant</p></div>
</div></body></html>`;
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([html],{type:"text/html"})); a.download=`Lease-${docId}.html`; a.click();
  };

  if(done) return (
    <div className="flex flex-col items-center justify-center py-16 space-y-5">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <HiCheckCircle className="text-green-500 text-5xl"/>
      </div>
      <h2 className="text-2xl font-black text-gray-900">Agreement Signed!</h2>
      <p className="text-gray-500 text-sm text-center">Document <span className="font-mono font-bold">#{docId}</span> has been created and signed.</p>
      <div className="flex gap-3">
        <button onClick={handleDownload} className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
          <HiDownload/> Download
        </button>
        <button onClick={()=>{onCreated();onClose();}} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition">
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 min-h-[560px]">
      {/* Sidebar progress */}
      <div className="w-48 bg-[#0f172a] rounded-2xl p-5 shrink-0 flex flex-col">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <HiShieldCheck className="text-white text-sm"/>
          </div>
          <div>
            <p className="text-white font-black text-xs leading-none">InzuTrust</p>
            <p className="text-blue-300 text-[9px] mt-0.5">E-Signature</p>
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">PROGRESS</p>
        <div className="space-y-1 flex-1">
          {STEPS.map(s=>{
            const isDone=step>s.id, isActive=step===s.id;
            return (
              <div key={s.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${isActive?"bg-white/10":""}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold ${isDone?"bg-green-500":isActive?"bg-blue-500":"bg-white/10"}`}>
                  {isDone?<HiCheck className="text-white text-[10px]"/>:isActive?<HiPencilAlt className="text-white text-[10px]"/>:<span className="text-white/40">{s.id}</span>}
                </div>
                <div>
                  <p className={`text-[11px] font-bold leading-tight ${isActive?"text-white":isDone?"text-white/70":"text-white/30"}`}>{s.label}</p>
                  <p className={`text-[9px] mt-0.5 ${isActive?"text-blue-300":isDone?"text-green-400":"text-white/20"}`}>
                    {isDone?"Completed":isActive?"In Progress":s.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-4 border-t border-white/10 text-[9px] text-white/30 text-center">
          Secure & Encrypted
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 flex flex-col">
        {/* Step heading */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              {step===4?"Review & Sign":STEPS[step-1].label}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {step===1&&"Enter the property and party details."}
              {step===2&&"Set the lease duration, rent and deposit."}
              {step===3&&"Review the generated agreement carefully."}
              {step===4&&"Provide e-signatures to execute the agreement."}
            </p>
          </div>
          {step===4&&<div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0"><HiShieldCheck/>Secure</div>}
        </div>

        {error&&<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">⚠️ {error}</div>}

        {/* Step 1 */}
        {step===1&&(
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <F label="Landlord Full Name" req><input value={data.landlordName} onChange={e=>up("landlordName",e.target.value)} placeholder="e.g. Uwizeyimana Yvette" className={inp}/></F>
              <F label="Tenant Full Name" req><input value={data.tenantName} onChange={e=>up("tenantName",e.target.value)} placeholder="e.g. IRADUKUNDA Japhet" className={inp}/></F>
            </div>
            <F label="Tenant Email" req><input type="email" value={data.tenantEmail} onChange={e=>up("tenantEmail",e.target.value)} placeholder="tenant@example.com" className={inp}/></F>
            <div className="grid grid-cols-2 gap-4">
              <F label="Property Address / Name" req><input value={data.propertyAddress} onChange={e=>up("propertyAddress",e.target.value)} placeholder="e.g. Unit 4B, Kigali Heights" className={inp}/></F>
              <F label="District"><select value={data.district} onChange={e=>up("district",e.target.value)} className={inp}>
                {["Gasabo","Nyarugenge","Kicukiro","Bugesera","Gatsibo","Kayonza","Kirehe","Ngoma","Rwamagana"].map(d=><option key={d}>{d}</option>)}
              </select></F>
            </div>
            <F label="Sector"><input value={data.sector} onChange={e=>up("sector",e.target.value)} placeholder="e.g. Kacyiru" className={inp}/></F>
          </div>
        )}

        {/* Step 2 */}
        {step===2&&(
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <F label="Monthly Rent (RWF)" req><input type="number" value={data.rentAmount} onChange={e=>up("rentAmount",e.target.value)} placeholder="800000" min="0" className={inp}/></F>
              <F label="Security Deposit (RWF)"><input type="number" value={data.securityDeposit} onChange={e=>up("securityDeposit",e.target.value)} placeholder="Same as rent" min="0" className={inp}/></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Start Date" req><input type="date" value={data.startDate} onChange={e=>up("startDate",e.target.value)} className={inp}/></F>
              <F label="Duration"><select value={data.leaseDuration} onChange={e=>up("leaseDuration",e.target.value)} className={inp}>
                {["1","3","6","9","12","18","24"].map(m=><option key={m} value={m}>{m} month{m!=="1"?"s":""}</option>)}
              </select></F>
            </div>
            {data.endDate&&<div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-blue-700 font-semibold">
              📅 Ends: <strong>{new Date(data.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</strong>
            </div>}
            <F label="Additional Terms (Optional)"><textarea value={data.additionalTerms} onChange={e=>up("additionalTerms",e.target.value)} rows={3} placeholder="Any special conditions..." className={`${inp} resize-none`}/></F>
          </div>
        )}

        {/* Step 3 */}
        {step===3&&(
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">#{docId}</span>
              <button onClick={handleDownload} className="flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:underline"><HiDownload/>Draft</button>
            </div>
            <LeaseDoc d={data} docId={docId} showSigs={false}/>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">⚠️ Review all details carefully. Once signed, this is legally binding.</div>
          </div>
        )}

        {/* Step 4 */}
        {step===4&&(
          <div className="space-y-4 flex-1">
            <LeaseDoc d={data} docId={docId} showSigs={true}/>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <p className="text-sm font-black text-gray-900">Electronic Signatures</p>
              <div className="grid grid-cols-2 gap-5">
                <SigCanvas label={`${data.landlordName||"Landlord"} (Landlord)`} onSave={sig=>up("landlordSignature",sig)} onClear={()=>up("landlordSignature",null)}/>
                <SigCanvas label={`${data.tenantName||"Tenant"} (Tenant)`} onSave={sig=>up("tenantSignature",sig)} onClear={()=>up("tenantSignature",null)}/>
              </div>
              <p className="text-xs text-gray-400 text-center">By signing, both parties agree to the lease terms. This e-signature is legally binding under Rwandan law.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
          <button onClick={()=>{setError("");setStep(s=>Math.max(1,s-1));}} disabled={step===1}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-30">
            <HiArrowLeft/>Back
          </button>
          <div className="flex items-center gap-2">
            {STEPS.map(s=><div key={s.id} className={`h-2 rounded-full transition-all ${step===s.id?"bg-blue-600 w-5":step>s.id?"bg-green-500 w-2":"bg-gray-300 w-2"}`}/>)}
          </div>
          <button onClick={handleNext} disabled={loading}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-black transition disabled:opacity-60 shadow-md ${step===4?"bg-green-600 text-white hover:bg-green-700":"bg-blue-600 text-white hover:bg-blue-700"}`}>
            {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Finalizing...</>
            :step===4?<><HiCheck/>Confirm & Sign</>:<>Continue<HiArrowRight/></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Row skeleton
// ─────────────────────────────────────────────────────────────────────────────
function RowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-gray-50">
      <div className="col-span-3 flex items-center gap-2"><Skeleton circle width={28} height={28}/><Skeleton width={110} height={13} borderRadius={6}/></div>
      <div className="col-span-3"><Skeleton width={130} height={13} borderRadius={6}/></div>
      <div className="col-span-2"><Skeleton width={70} height={11} borderRadius={6}/><Skeleton width={70} height={11} borderRadius={6} className="mt-1"/></div>
      <div className="col-span-1"><Skeleton width={60} height={13} borderRadius={6}/></div>
      <div className="col-span-2"><Skeleton width={80} height={22} borderRadius={20}/></div>
      <div className="col-span-1 flex justify-end gap-1.5"><Skeleton circle width={28} height={28}/><Skeleton circle width={28} height={28}/></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function LDAgreements({ token, user }) {
  const [agreements, setAgreements] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [prefill,    setPrefill]    = useState(null);
  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(()=>{
    (async()=>{
      try {
        const res=await fetch(`${API_BASE}/agreements`,{headers:hdrs});
        if(res.ok){const d=await res.json();setAgreements(d.data?.length?d.data:MOCK);}
        else setAgreements(MOCK);
      } catch { setAgreements(MOCK); }
    })();
  },[token]);

  const loading = agreements===null;

  const stats = !loading ? [
    {label:"Active",   count:agreements.filter(a=>a.status==="Active").length,   color:"text-green-600"},
    {label:"Expiring", count:agreements.filter(a=>a.status==="Expiring").length, color:"text-yellow-600"},
    {label:"Pending",  count:agreements.filter(a=>a.status==="Pending").length,  color:"text-blue-600"},
    {label:"Expired",  count:agreements.filter(a=>a.status==="Expired").length,  color:"text-red-500"},
  ] : [];

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Agreements</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? <Skeleton width={120} height={13} borderRadius={6} inline/>
                : `${agreements.length} lease agreement${agreements.length!==1?"s":""}`}
            </p>
          </div>
          <button onClick={()=>{setPrefill(null);setShowCreate(true);}}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm">
            <HiPlus/> New Lease
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading
            ? [0,1,2,3].map(i=><div key={i} className="bg-white rounded-2xl border border-gray-200 p-4"><Skeleton width={60} height={11} borderRadius={4} className="mb-2"/><Skeleton width={40} height={28} borderRadius={6}/></div>)
            : stats.map((s,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 font-semibold mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
              </div>
            ))
          }
        </div>

        {/* Inline create panel */}
        {showCreate && (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <HiDocumentText className="text-blue-600 text-lg"/>
                <p className="font-black text-gray-900">Create New Lease Agreement</p>
              </div>
              <button onClick={()=>setShowCreate(false)} className="text-gray-400 hover:text-gray-700 transition"><HiX className="text-xl"/></button>
            </div>
            <div className="p-6">
              <CreateLease
                token={token}
                user={user}
                prefill={prefill}
                onClose={()=>setShowCreate(false)}
                onCreated={()=>{
                  fetch(`${API_BASE}/agreements`,{headers:hdrs})
                    .then(r=>r.ok?r.json():null)
                    .then(d=>d?.data?.length&&setAgreements(d.data))
                    .catch(()=>{});
                }}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
            <div className="col-span-3">TENANT</div>
            <div className="col-span-3">PROPERTY</div>
            <div className="col-span-2">PERIOD</div>
            <div className="col-span-1">RENT</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-1 text-right">ACTIONS</div>
          </div>
          <div className="divide-y divide-gray-50">
            {loading
              ? Array.from({length:4}).map((_,i)=><RowSkeleton key={i}/>)
              : agreements.map(a=>{
                  const s=statusStyle[a.status]||statusStyle.Active;
                  return (
                    <div key={a.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
                      <div className="col-span-3 flex items-center gap-2.5">
                        <img src={`https://ui-avatars.com/api/?name=${a.tenant}&background=dbeafe&color=1d4ed8&bold=true&size=28`} className="w-7 h-7 rounded-full shrink-0" alt={a.tenant}/>
                        <span className="text-sm font-semibold text-gray-900 truncate">{a.tenant}</span>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <HiDocumentText className="text-gray-400 shrink-0"/>
                        <span className="text-sm text-gray-600 truncate">{a.property}</span>
                      </div>
                      <div className="col-span-2 text-xs text-gray-500"><p>{a.start}</p><p className="text-gray-400">{a.end}</p></div>
                      <div className="col-span-1 text-sm font-bold text-blue-600">{formatRWF(a.rent)}</div>
                      <div className="col-span-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${s.badge}`}>
                          {s.icon} {a.status}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1.5">
                        <button title="View" className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><HiEye className="text-sm"/></button>
                        <button title="New lease for this property"
                          onClick={()=>{setPrefill({title:a.property,rentAmount:a.rent});setShowCreate(true);}}
                          className="w-7 h-7 flex items-center justify-center bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition"><HiPencilAlt className="text-sm"/></button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* Empty */}
        {!loading&&agreements.length===0&&(
          <div className="bg-gray-50 rounded-3xl p-14 text-center border border-gray-200">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-600 font-semibold">No agreements yet.</p>
            <button onClick={()=>setShowCreate(true)} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">Create First Lease</button>
          </div>
        )}

      </div>
    </SkeletonTheme>
  );
}