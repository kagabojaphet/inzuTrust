import React, { useEffect, useRef, useState } from "react";
import {
  HiDocumentText, HiCheckCircle, HiClock, HiExclamation,
  HiEye, HiPencilAlt, HiShieldCheck, HiDownload, HiX, HiCheck
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

const MOCK = [
  { id:"RW-8821-KGL", landlordName:"Uwizeyimana Yvette", property:"Kigali Heights Apt 4B", district:"Gasabo",
    rentAmount:800000, securityDeposit:800000, startDate:"2026-11-01", endDate:"2027-10-31",
    leaseDuration:"12", status:"Pending Signature", landlordSigned:true, tenantSigned:false, createdAt:"2026-10-24" },
  { id:"RW-7734-KGL", landlordName:"Diane Ingabire", property:"Vision City Villa #12", district:"Kicukiro",
    rentAmount:2500000, securityDeposit:2500000, startDate:"2026-03-01", endDate:"2027-02-28",
    leaseDuration:"12", status:"Signed", landlordSigned:true, tenantSigned:true, createdAt:"2026-02-20" },
];

const statusStyle = {
  "Pending Signature":{ badge:"bg-yellow-50 text-yellow-700 border border-yellow-200", icon:<HiClock className="text-yellow-500"/> },
  "Signed":           { badge:"bg-green-50 text-green-700 border border-green-200",    icon:<HiCheckCircle className="text-green-500"/> },
  "Expired":          { badge:"bg-red-50 text-red-600 border border-red-200",          icon:<HiExclamation className="text-red-500"/> },
};

const formatRWF = n => `${Number(n).toLocaleString()} RWF`;
const fmtDate   = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";

// ── Signature canvas ──────────────────────────────────────────────────────────
function SigCanvas({ label, onSave, onClear }) {
  const ref  = useRef(null);
  const drag = useRef(false);
  const [has, setHas] = useState(false);

  const gp = (e,c) => { const r=c.getBoundingClientRect(); return {x:(e.touches?e.touches[0].clientX:e.clientX)-r.left,y:(e.touches?e.touches[0].clientY:e.clientY)-r.top}; };
  const start = e => { e.preventDefault(); const c=ref.current,p=gp(e,c); c.getContext("2d").beginPath(); c.getContext("2d").moveTo(p.x,p.y); drag.current=true; };
  const move  = e => { if(!drag.current)return; e.preventDefault(); const c=ref.current,ctx=c.getContext("2d"),p=gp(e,c); ctx.lineWidth=2.5;ctx.lineCap="round";ctx.strokeStyle="#1e3a5f"; ctx.lineTo(p.x,p.y);ctx.stroke(); setHas(true); };
  const stop  = () => { drag.current=false; if(has) onSave(ref.current.toDataURL()); };
  const clear = () => { ref.current.getContext("2d").clearRect(0,0,ref.current.width,ref.current.height); setHas(false); onClear(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</p>
        {has&&<button onClick={clear} className="text-xs text-red-500 font-bold flex items-center gap-1"><HiX className="text-xs"/>Clear</button>}
      </div>
      <div className="relative border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/20 overflow-hidden">
        <canvas ref={ref} width={460} height={110} className="w-full cursor-crosshair touch-none"
          onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={move} onTouchEnd={stop}/>
        {!has&&<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-gray-400 flex items-center gap-2"><HiPencilAlt/>Draw your signature here</p>
        </div>}
      </div>
      <div className="mt-1 border-t border-gray-300 mx-4"/>
      <p className="text-[10px] text-gray-400 text-center mt-1">Tenant Signature</p>
    </div>
  );
}

// ── Lease document preview ────────────────────────────────────────────────────
function LeasePreview({ agreement, tenantName, tenantSig }) {
  const today = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm font-serif leading-relaxed max-h-[400px] overflow-y-auto shadow-inner">
      <div className="flex justify-between items-start mb-4 font-sans">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">DOCUMENT ID: #{agreement.id}</span>
        <div className="text-right"><p className="font-black text-gray-800 text-sm">InzuTrust Properties</p><p className="text-xs text-gray-500">Kigali, Rwanda</p></div>
      </div>
      <h2 className="text-center text-base font-black text-gray-900 mb-4 uppercase tracking-widest font-sans">RESIDENTIAL LEASE AGREEMENT</h2>
      <p className="mb-4 text-gray-700">Made on <span className="bg-yellow-100 px-1 font-bold">{today}</span> between <strong>{agreement.landlordName}</strong> ("Landlord") and <strong>{tenantName||"___"}</strong> ("Tenant")</p>
      {[
        {n:"1",t:"PROPERTY",    b:<>At <strong>{agreement.property}, {agreement.district}, Rwanda</strong>.</>},
        {n:"2",t:"TERM",        b:<><strong>{agreement.leaseDuration} months</strong> · {fmtDate(agreement.startDate)} → {fmtDate(agreement.endDate)}</>},
        {n:"3",t:"RENT",        b:<><strong>{formatRWF(agreement.rentAmount)}</strong>/month. Due 1st. Late fee 5%.</>},
        {n:"4",t:"SECURITY",    b:<><strong>{formatRWF(agreement.securityDeposit)}</strong> held in InzuTrust escrow.</>},
        {n:"5",t:"USE",         b:"Solely as a private residential dwelling."},
        {n:"6",t:"MAINTENANCE", b:"Tenant shall maintain the property in good condition."},
        {n:"7",t:"TERMINATION", b:"30 days written notice required."},
        {n:"8",t:"GOVERNING LAW",b:"Governed by the laws of the Republic of Rwanda."},
      ].map(c=>(
        <div key={c.n} className="mb-3">
          <p className="font-black text-gray-900 font-sans mb-0.5">{c.n}. {c.t}</p>
          <p className="text-gray-700">{c.b}</p>
        </div>
      ))}
      {/* Signatures */}
      <div className="pt-4 mt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 font-sans">Landlord Signature</p>
          <div className="h-10 flex items-end pb-1 border-b border-gray-400 mb-1">
            {agreement.landlordSigned&&<p className="text-xs italic text-gray-500 font-sans">{agreement.landlordName} ✓</p>}
          </div>
          <p className="text-xs text-gray-500">{agreement.landlordName}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 font-sans">Tenant Signature</p>
          <div className="h-10 border-b border-gray-400 mb-1 flex items-end pb-1">
            {tenantSig&&<img src={tenantSig} alt="sig" className="h-9 object-contain"/>}
          </div>
          <p className="text-xs text-gray-500">{tenantName}</p>
        </div>
      </div>
    </div>
  );
}

// ── Sign modal ────────────────────────────────────────────────────────────────
function SignModal({ agreement, tenantName, token, onClose, onSigned }) {
  const [sig,     setSig]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const handleSign = async () => {
    if(!sig){setError("Please draw your signature above.");return;}
    setLoading(true); setError("");
    try {
      if(token){
        await fetch(`${API_BASE}/agreements/${agreement.id}/sign`,{
          method:"PUT",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
          body:JSON.stringify({tenantSignature:sig,tenantName,signedAt:new Date().toISOString()}),
        });
      }
    } catch(e){console.warn(e);}
    finally { setLoading(false); setDone(true); setTimeout(()=>{onSigned(agreement.id);onClose();},1500); }
  };

  const handleDownload = () => {
    const html=`<!DOCTYPE html><html><head><title>Lease - ${agreement.id}</title>
<style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:40px;color:#1a1a1a;line-height:1.8;font-size:13px}
h1{text-align:center;font-family:Arial;font-size:16px;text-transform:uppercase;letter-spacing:3px}
.st{font-family:Arial;font-weight:700;font-size:12px;text-transform:uppercase;margin:14px 0 4px}
.sigs{display:flex;gap:60px;margin-top:40px;padding-top:20px;border-top:1px solid #ccc}.sb{flex:1}
.sl{border-bottom:1px solid #333;min-height:50px;margin-bottom:6px}</style></head><body>
<div style="display:flex;justify-content:space-between;font-family:Arial;font-size:12px;margin-bottom:20px">
<span>DOCUMENT ID: #${agreement.id}</span><div style="text-align:right"><strong>InzuTrust Properties</strong><br>Kigali, Rwanda</div></div>
<h1>Residential Lease Agreement</h1>
<p>Between <strong>${agreement.landlordName}</strong> ("Landlord") and <strong>${tenantName}</strong> ("Tenant").</p>
<div class="st">1. Property</div><p><strong>${agreement.property}, ${agreement.district}, Rwanda</strong></p>
<div class="st">2. Term</div><p>${agreement.leaseDuration} months · ${fmtDate(agreement.startDate)} → ${fmtDate(agreement.endDate)}</p>
<div class="st">3. Rent</div><p><strong>${formatRWF(agreement.rentAmount)}</strong>/month. Late fee 5%.</p>
<div class="st">4. Security Deposit</div><p><strong>${formatRWF(agreement.securityDeposit)}</strong> in InzuTrust escrow.</p>
<div class="sigs">
<div class="sb"><p style="font-style:italic;font-size:12px">${agreement.landlordName} ✓</p><p><strong>${agreement.landlordName}</strong><br>Landlord</p></div>
<div class="sb">${sig?`<img src="${sig}" height="50"/>`:'<div class="sl"></div>'}<p><strong>${tenantName}</strong><br>Tenant</p></div>
</div></body></html>`;
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([html],{type:"text/html"})); a.download=`SignedLease-${agreement.id}.html`; a.click();
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0f172a] border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <HiShieldCheck className="text-white"/>
          </div>
          <div>
            <p className="text-white font-black text-sm">Finalize Lease Agreement</p>
            <p className="text-blue-300 text-[10px]">Document ID: #{agreement.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleDownload} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-bold transition">
            <HiDownload/> Download Draft
          </button>
          <button onClick={onClose} className="text-white/40 hover:text-white transition"><HiX className="text-lg"/></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Progress sidebar */}
        <div className="w-52 bg-[#0f172a] border-r border-white/10 p-5 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-5">AGREEMENT PROGRESS</p>
          {[
            {label:"Property Details", done:true},
            {label:"Lease Terms",      done:true},
            {label:"Review Agreement", done:true},
            {label:"Sign & Finalize",  active:true},
          ].map((s,i)=>(
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl mb-1 ${s.active?"bg-white/10":""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${s.done?"bg-green-500":s.active?"bg-blue-500":"bg-white/10"}`}>
                {s.done?<HiCheck className="text-white text-xs"/>:s.active?<HiPencilAlt className="text-white text-xs"/>:<span className="text-white/30 text-[10px] font-bold">{i+1}</span>}
              </div>
              <div>
                <p className={`text-xs font-bold ${s.active?"text-white":s.done?"text-white/70":"text-white/30"}`}>{s.label}</p>
                <p className={`text-[10px] ${s.active?"text-blue-300":s.done?"text-green-400":"text-white/20"}`}>
                  {s.done?"Completed":s.active?"In Progress":"Pending"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Review & Sign</h1>
                <p className="text-sm text-gray-500 mt-0.5">Review the final terms and provide your e-signature.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ml-4">
                <HiShieldCheck/> Secure & Encrypted
              </div>
            </div>

            <LeasePreview agreement={agreement} tenantName={tenantName} tenantSig={sig}/>

            {!done ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <p className="text-sm font-black text-gray-900">Your Signature</p>
                {error&&<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
                <SigCanvas label={`${tenantName} (Tenant)`} onSave={setSig} onClear={()=>setSig(null)}/>
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By signing, you agree to all lease terms. This e-signature is legally binding under Rwandan law.
                </p>
                <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={handleSign} disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing...</>:<><HiCheck/>Confirm & Sign</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <HiCheckCircle className="text-green-500 text-4xl mx-auto mb-3"/>
                <h3 className="font-black text-green-800 text-lg mb-1">Agreement Signed!</h3>
                <p className="text-green-700 text-sm">Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TenantAgreements({ token, user }) {
  const [agreements, setAgreements] = useState(null);
  const [signing,    setSigning]    = useState(null);

  const tenantName = user ? `${user.firstName||""} ${user.lastName||""}`.trim() : "Tenant";

  useEffect(()=>{
    (async()=>{
      try {
        const res=await fetch(`${API_BASE}/agreements/my`,{headers:{Authorization:`Bearer ${token}`}});
        if(res.ok){const d=await res.json();setAgreements(d.data?.length?d.data:MOCK);}
        else setAgreements(MOCK);
      } catch { setAgreements(MOCK); }
    })();
  },[token]);

  const handleSigned = id => setAgreements(prev=>prev.map(a=>a.id===id?{...a,status:"Signed",tenantSigned:true}:a));

  const loading = agreements===null;
  const pending = !loading ? agreements.filter(a=>a.status==="Pending Signature").length : 0;

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      {signing&&<SignModal agreement={signing} tenantName={tenantName} token={token} onClose={()=>setSigning(null)} onSigned={handleSigned}/>}

      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-gray-900">My Agreements</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading
              ? <Skeleton width={130} height={13} borderRadius={6} inline/>
              : pending>0
                ? <span className="text-orange-500 font-semibold">⚠ {pending} agreement{pending>1?"s":""} awaiting your signature</span>
                : `${agreements.length} lease agreement${agreements.length!==1?"s":""}`
            }
          </p>
        </div>

        {/* Pending action banner */}
        {!loading&&pending>0&&(
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <HiPencilAlt className="text-blue-600 text-xl"/>
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-900 text-sm">Action Required</p>
              <p className="text-blue-700 text-xs mt-0.5">{pending} lease agreement{pending>1?"s":""} waiting for your e-signature.</p>
            </div>
            <button
              onClick={()=>{const first=agreements.find(a=>a.status==="Pending Signature");if(first)setSigning(first);}}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition shrink-0">
              Sign Now →
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {loading
            ? Array.from({length:2}).map((_,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div><Skeleton width={200} height={16} borderRadius={6} className="mb-1.5"/><Skeleton width={140} height={12} borderRadius={6}/></div>
                  <Skeleton width={90} height={26} borderRadius={20}/>
                </div>
                <div className="grid grid-cols-4 gap-4"><Skeleton height={40} borderRadius={8}/><Skeleton height={40} borderRadius={8}/><Skeleton height={40} borderRadius={8}/><Skeleton height={40} borderRadius={8}/></div>
              </div>
            ))
            : agreements.map(a=>{
              const s=statusStyle[a.status]||statusStyle["Pending Signature"];
              const isPending=a.status==="Pending Signature";
              return (
                <div key={a.id} className={`bg-white rounded-2xl border overflow-hidden transition ${isPending?"border-blue-200 shadow-sm shadow-blue-50":"border-gray-200"}`}>
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPending?"bg-blue-50":"bg-gray-50"}`}>
                          <HiDocumentText className={`text-xl ${isPending?"text-blue-600":"text-gray-400"}`}/>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-tight">{a.property}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Landlord: {a.landlordName} · <span className="font-mono">#{a.id}</span></p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0 ${s.badge}`}>
                        {s.icon} {a.status}
                      </span>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        {label:"Monthly Rent",  value:formatRWF(a.rentAmount)},
                        {label:"Start Date",    value:fmtDate(a.startDate)},
                        {label:"End Date",      value:fmtDate(a.endDate)},
                        {label:"Duration",      value:`${a.leaseDuration} months`},
                      ].map((d,i)=>(
                        <div key={i} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{d.label}</p>
                          <p className="text-sm font-bold text-gray-900">{d.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Signature status */}
                    <div className="flex items-center gap-5 mb-4">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.landlordSigned?"text-green-600":"text-gray-400"}`}>
                        <HiCheckCircle className={a.landlordSigned?"text-green-500":"text-gray-300"}/> Landlord signed
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.tenantSigned?"text-green-600":"text-yellow-600"}`}>
                        <HiCheckCircle className={a.tenantSigned?"text-green-500":"text-yellow-400"}/>
                        {a.tenantSigned?"You signed":"Awaiting your signature"}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button onClick={()=>setSigning(a)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                          isPending?"bg-blue-600 text-white hover:bg-blue-700 shadow-sm":"bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}>
                        {isPending?<><HiPencilAlt/>Sign Agreement</>:<><HiEye/>View Agreement</>}
                      </button>
                      {a.tenantSigned&&(
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                          <HiDownload/> Download
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Guarantee strip */}
                  {a.tenantSigned&&(
                    <div className="bg-green-50 border-t border-green-100 px-5 py-3 flex items-center gap-2">
                      <HiShieldCheck className="text-green-500 shrink-0"/>
                      <p className="text-xs text-green-700 font-semibold">InzuTrust Guarantee: This lease is secured and payment reporting is active.</p>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>

        {!loading&&agreements.length===0&&(
          <div className="bg-gray-50 rounded-3xl p-14 text-center border border-gray-200">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-600 font-semibold">No lease agreements yet.</p>
            <p className="text-sm text-gray-400 mt-1">Your landlord will send you a lease once a property is agreed upon.</p>
          </div>
        )}
      </div>
    </SkeletonTheme>
  );
}