// src/components/tenant/TenantAgreements.jsx
import { useState, useEffect, useCallback } from "react";
import {
  HiRefresh, HiDocumentText, HiCheckCircle, HiClock,
  HiExclamationCircle, HiDownload, HiEye, HiX,
  HiArrowRight, HiShieldCheck, HiLocationMarker,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SignModal      from "./agreements/Signmodal";
import TerminateModal from "../shared/TerminateModal";
import { isPendingStatus, isSignedStatus, normaliseAgreement, formatRWF, fmtDate } from "./agreements/agreementHelpers";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}` });

// ── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  signed:                { label:"Signed",        color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0", dot:"#22c55e" },
  pending_signature:     { label:"Awaiting Sign", color:"#d97706", bg:"#fffbeb", border:"#fde68a", dot:"#f59e0b" },
  draft:                 { label:"Draft",         color:"#6b7280", bg:"#f9fafb", border:"#e5e7eb", dot:"#9ca3af" },
  termination_requested: { label:"Terminating",   color:"#dc2626", bg:"#fef2f2", border:"#fecaca", dot:"#ef4444" },
  terminated:            { label:"Terminated",    color:"#7f1d1d", bg:"#fef2f2", border:"#fca5a5", dot:"#dc2626" },
  expired:               { label:"Expired",       color:"#92400e", bg:"#fff7ed", border:"#fed7aa", dot:"#f97316" },
};
const getStatus = raw => STATUS[raw] || STATUS.draft;

// ── Download helper (generates the HTML lease document) ───────────────────────
function downloadAgreement(agreement) {
  const { propertyTitle, propertyDistrict, landlordName, docLabel } = normaliseAgreement(agreement);
  const signDate = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric" });
  const fullAddr = [propertyTitle, propertyDistrict, "Rwanda"].filter(Boolean).join(", ");

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>InzuTrust Lease #${docLabel}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1a1a1a;background:#f5f7fa;padding:30px}
  .page{background:white;max-width:760px;margin:0 auto;border:1px solid #ddd;border-radius:4px;overflow:hidden}
  .inner{padding:32px 40px 0}
  .logo-wrap{text-align:center;margin-bottom:6px}
  .logo-name{font-size:22px;font-weight:900;color:#1a56db;display:block;margin-top:4px}
  .divider-blue{border:none;border-top:2px solid #1a56db;margin:10px 0 20px}
  .divider-gray{border:none;border-top:1px solid #ddd;margin:0 0 20px}
  h1{text-align:center;color:#1a56db;font-size:20px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
  .made-on{text-align:center;color:#888;font-size:11px;margin-bottom:20px}
  .sec-header{background:linear-gradient(90deg,#1a56db 0,#1a56db 180px,#e8eef8 180px);border-radius:4px;padding:6px 14px;margin-bottom:12px}
  .sec-header span{color:white;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:1px}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;padding-left:8px;margin-bottom:16px}
  .sig-grid{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:20px;padding:20px 0 24px}
  .sig-block{text-align:center}
  .sig-line{min-height:54px;border-bottom:2px solid #333;margin-bottom:6px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px}
  .footer{background:#1a56db;padding:12px 40px;text-align:center;color:white;font-size:11px;font-weight:600}
  .mb{margin-bottom:18px} .dp{padding-left:8px;line-height:1.9} p{line-height:1.9}
  .section-title{font-size:13px;font-weight:900;text-transform:uppercase;margin-bottom:6px}
  @media print{body{background:white;padding:0}.page{border:none}}
</style></head>
<body><div class="page"><div class="inner">
<div class="logo-wrap">
  <svg width="48" height="44" viewBox="0 0 52 48" fill="none"><path d="M26 4L4 22H10V44H22V32H30V44H42V22H48L26 4Z" fill="#1a56db"/><rect x="20" y="32" width="12" height="12" rx="1" fill="white"/></svg>
  <span class="logo-name">InzuTrust</span>
</div>
<hr class="divider-blue"/>
<h1>RESIDENTIAL LEASE AGREEMENT</h1>
<div class="made-on">THIS AGREEMENT IS MADE ON: <strong>${signDate}</strong></div>
<hr class="divider-gray"/>
<div class="mb">
  <p class="section-title">PARTIES</p>
  <hr style="border:none;border-top:1px solid #ccc;margin-bottom:10px">
  <p style="color:#555;margin-bottom:12px">This Lease Agreement is entered into between:</p>
  <div class="sec-header"><span>LANDLORD:</span></div>
  <div class="two-col">
    <div>
      <p style="font-weight:900;margin-bottom:4px">${landlordName}</p>
      <p style="color:#555">Phone: ${agreement.landlord?.phone || "—"}</p>
    </div>
    <div>
      <p style="font-weight:900;margin-bottom:4px">${agreement.tenantName || "Tenant"}</p>
      <p style="color:#555">Phone: ${agreement.tenant?.phone || "—"}</p>
    </div>
  </div>
</div>
<div class="mb">
  <div class="sec-header"><span>PROPERTY DETAILS</span></div>
  <div class="dp">
    <p><span style="color:#555">Rental Property: </span><strong>${fullAddr}</strong></p>
    <p><span style="color:#555">Type: </span><strong>${agreement.property?.type || "House"}</strong></p>
    <p><span style="color:#555">Lease Term: </span>Start: <strong>${fmtDate(agreement.startDate)}</strong> &nbsp; End: <strong>${fmtDate(agreement.endDate)}</strong></p>
  </div>
</div>
<div class="mb">
  <div class="sec-header"><span>RENT &amp; DEPOSIT</span></div>
  <div class="dp">
    <p><span style="color:#555">Monthly Rent: </span><strong>${formatRWF(agreement.rentAmount)}</strong></p>
    <p><span style="color:#555">Security Deposit: </span><strong>${formatRWF(agreement.securityDeposit || agreement.rentAmount)}</strong></p>
    <p><span style="color:#555">Payment Due: </span><strong>${agreement.paymentDueDay || "5th"} of each month</strong></p>
  </div>
</div>
<div class="mb">
  <div class="sec-header"><span>TERMS &amp; CONDITIONS</span></div>
  <div class="dp">
    <p>- <span style="color:#555">Utilities:</span> Tenant is responsible for water and electricity bills.</p>
    <p>- <strong>Maintenance:</strong> Landlord will handle major repairs.</p>
    <p>- No subletting allowed without landlord's consent.</p>
    <p>- <strong>Notice Period:</strong> 30 days notice required for termination.</p>
    ${agreement.additionalTerms ? `<p>- <strong>Additional Terms:</strong> ${agreement.additionalTerms}</p>` : ""}
  </div>
</div>
<div class="sig-grid">
  <div class="sig-block">
    <div class="sig-line">
      ${agreement.landlordSignature
        ? `<img src="${agreement.landlordSignature}" style="max-height:50px" alt="sig"/>`
        : agreement.landlordSigned ? `<span style="font-style:italic;color:#555">${landlordName} ✓</span>` : ""}
    </div>
    <p style="font-weight:900;font-size:12px">${landlordName}</p>
    <p style="color:#888;font-size:11px">Landlord</p>
  </div>
  <div style="text-align:center;padding-bottom:12px">
    <svg width="88" height="88" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="42" fill="none" stroke="#1a56db" stroke-width="2.5"/>
      <circle cx="45" cy="45" r="36" fill="none" stroke="#1a56db" stroke-width="1"/>
      <path d="M45 22L29 35H33V54H41V46H49V54H57V35H61L45 22Z" fill="#1a56db"/>
      <rect x="41" y="46" width="8" height="8" rx="0.5" fill="white"/>
    </svg>
  </div>
  <div class="sig-block">
    <div class="sig-line">
      ${agreement.tenantSignature
        ? `<img src="${agreement.tenantSignature}" style="max-height:50px" alt="sig"/>`
        : ""}
    </div>
    <p style="font-weight:900;font-size:12px">${agreement.tenantName || "Tenant"}</p>
    <p style="color:#888;font-size:11px">Tenant</p>
  </div>
</div>
</div>
<div class="footer">www.inzutrust.com | Email: info@inzutrust.com</div>
</div></body></html>`;

  const el = document.createElement("a");
  el.href = URL.createObjectURL(new Blob([html], { type:"text/html" }));
  el.download = `InzuTrust-Lease-${docLabel}.html`;
  el.click();
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "20" }}>
        <Icon className="text-sm" style={{ color }}/>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 leading-none">{label}</p>
        <p className="text-xl font-black text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Agreement card ────────────────────────────────────────────────────────────
function AgreementItem({ agreement: a, onSign, onTerminate, userId }) {
  const st       = getStatus(a.status);
  const isPending = isPendingStatus(a.status);
  const isSigned  = isSignedStatus(a.status);
  const isIssue   = ["termination_requested","terminated"].includes(a.status);

  let termReq = null;
  try { termReq = a.terminationRequest ? JSON.parse(a.terminationRequest) : null; } catch {}
  const termDisputed   = termReq?.disputed;
  const termIMadeIt    = termReq?.requestedBy === userId;
  const termCanRespond = a.status === "termination_requested" && !termIMadeIt && !termDisputed;

  const { propertyTitle, propertyDistrict, landlordName, docLabel } = normaliseAgreement(a);

  return (
    <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-200 border ${
      isIssue ? "border-red-200" : isPending ? "border-blue-300" : "border-gray-200"
    }`}>
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100 overflow-hidden">
              {a.property?.mainImage
                ? <img src={a.property.mainImage} alt="" className="w-full h-full object-cover"/>
                : <HiDocumentText className="text-gray-300 text-xl"/>
              }
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-gray-900 text-base leading-tight truncate">{propertyTitle}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {propertyDistrict && (
                  <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                    <HiLocationMarker className="text-xs"/> {propertyDistrict}
                  </span>
                )}
                <span className="text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">Landlord: <span className="text-gray-600 font-medium">{landlordName}</span></span>
                <span className="text-gray-300">·</span>
                <span className="font-mono text-[10px] text-gray-400">#{docLabel}</span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border shrink-0"
            style={{ color:st.color, background:st.bg, borderColor:st.border }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:st.dot }}/>
            {st.label}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label:"Monthly Rent", value:formatRWF(a.rentAmount), accent:true },
            { label:"Start Date",   value:fmtDate(a.startDate) },
            { label:"End Date",     value:fmtDate(a.endDate) },
            { label:"Duration",     value:`${a.leaseDuration || "—"} months` },
          ].map((d,i) => (
            <div key={i} className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{d.label}</p>
              <p className={`text-sm font-black leading-tight ${d.accent ? "text-blue-700" : "text-gray-900"}`}>{d.value}</p>
            </div>
          ))}
        </div>

        {/* Signatures */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.landlordSigned?"text-green-600":"text-gray-400"}`}>
            <HiCheckCircle className={a.landlordSigned?"text-green-500":"text-gray-300"}/>
            {a.landlordSigned ? "Landlord signed" : "Awaiting landlord"}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.tenantSigned?"text-green-600":"text-amber-600"}`}>
            <HiCheckCircle className={a.tenantSigned?"text-green-500":"text-amber-400"}/>
            {a.tenantSigned ? "You signed" : "Awaiting your signature"}
          </div>
        </div>

        {/* Additional terms */}
        {a.additionalTerms && (
          <div className="mb-3 text-xs bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-gray-600 leading-relaxed">
            <span className="font-black text-blue-700">Terms: </span>{a.additionalTerms}
          </div>
        )}

        {/* Termination alert */}
        {a.status === "termination_requested" && termReq && (
          <div className={`mb-3 rounded-xl px-4 py-3 border ${
            termDisputed ? "bg-purple-50 border-purple-200" :
            termIMadeIt  ? "bg-amber-50 border-amber-200"   :
                           "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-start gap-2">
              {termDisputed
                ? <HiExclamationCircle className="text-purple-500 shrink-0 mt-0.5 text-sm"/>
                : termIMadeIt
                  ? <HiClock className="text-amber-500 shrink-0 mt-0.5 text-sm"/>
                  : <HiExclamationCircle className="text-red-500 shrink-0 mt-0.5 text-sm"/>
              }
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black ${
                  termDisputed?"text-purple-700":termIMadeIt?"text-amber-700":"text-red-700"
                }`}>
                  {termDisputed ? "Disputed — Admin reviewing"
                    : termIMadeIt ? "Your termination request is pending"
                    : `Termination request from ${termReq.requestedByRole}`}
                </p>
                {termReq.reason && (
                  <p className="text-[11px] text-gray-600 mt-0.5">Reason: {termReq.reason}</p>
                )}
                {termCanRespond && (
                  <button onClick={() => onTerminate(a)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-black text-red-600 hover:text-red-800 transition">
                    Respond to Request <HiArrowRight className="text-xs"/>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terminated */}
        {a.status === "terminated" && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <HiX className="text-red-500 shrink-0"/>
            <p className="text-xs font-black text-red-700">This lease has been terminated</p>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {/* Sign button (pending + not yet signed by tenant) */}
          {isPending && !a.tenantSigned && (
            <button onClick={() => onSign(a)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-sm shadow-blue-200">
              Sign Agreement <HiArrowRight className="text-sm"/>
            </button>
          )}

          {/* View — opens SignModal in view mode (has its own close button) */}
          <button onClick={() => onSign(a)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
            <HiEye className="text-sm"/> View
          </button>

          {/* Download — works by generating HTML directly, no modal needed */}
          {isSigned && (
            <button
              onClick={() => downloadAgreement(a)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
              <HiDownload className="text-sm"/> Download
            </button>
          )}

          {/* Request termination — active signed leases only */}
          {isSigned && !isIssue && (
            <button onClick={() => onTerminate(a)}
              className="ml-auto text-[11px] font-bold text-gray-400 hover:text-red-500 transition underline underline-offset-2">
              Request Termination
            </button>
          )}
        </div>

        {/* InzuTrust guarantee strip */}
        {isSigned && !isIssue && (
          <div className="mt-4 -mx-5 -mb-5 px-5 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
            <HiShieldCheck className="text-green-500 shrink-0 text-sm"/>
            <p className="text-[11px] text-green-700 font-semibold">
              InzuTrust Guarantee: This lease is secured and payment reporting is active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton width={44} height={44} borderRadius={12}/>
        <div className="flex-1"><Skeleton width={160} height={16}/><Skeleton width={220} height={11} className="mt-1.5"/></div>
        <Skeleton width={88} height={28} borderRadius={99}/>
      </div>
      <div className="grid grid-cols-4 gap-2">{Array.from({length:4}).map((_,i) => <Skeleton key={i} height={56} borderRadius={12}/>)}</div>
      <div className="flex gap-3"><Skeleton width={130} height={40} borderRadius={12}/><Skeleton width={90} height={40} borderRadius={12}/></div>
    </div>
  );
}

export default function TenantAgreements({ token, user }) {
  const [agreements,  setAgreements]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [signing,     setSigning]     = useState(null);
  const [terminating, setTerminating] = useState(null);
  const [filter,      setFilter]      = useState("all");

  const fetchAgreements = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/agreements/my`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) setAgreements(data.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAgreements(); }, [fetchAgreements]);

  const handleSigned = (id) => {
    setAgreements(prev => prev.map(a => a.id === id ? {...a, tenantSigned:true, status:"signed"} : a));
    setSigning(null);
  };

  const tenantName = user ? `${user.firstName||""} ${user.lastName||""}`.trim() : "Tenant";
  const userId     = user?.id || null;

  const counts = {
    all:     agreements.length,
    active:  agreements.filter(a => a.status === "signed").length,
    pending: agreements.filter(a => isPendingStatus(a.status)).length,
    issues:  agreements.filter(a => ["termination_requested","terminated"].includes(a.status)).length,
  };

  const filtered = agreements.filter(a => {
    if (filter === "all")     return true;
    if (filter === "active")  return a.status === "signed";
    if (filter === "pending") return isPendingStatus(a.status);
    if (filter === "issues")  return ["termination_requested","terminated"].includes(a.status);
    return true;
  });

  return (
    <div className="space-y-6">

      {/* ── Sign / View modal ── */}
      {signing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-4 relative">
            {/* ── CLOSE BUTTON — always visible top-right of modal wrapper ── */}
            <button
              onClick={() => setSigning(null)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow-md transition">
              <HiX className="text-lg"/>
            </button>
            <SignModal
              agreement={signing}
              tenantName={tenantName}
              token={token}
              onClose={() => setSigning(null)}
              onSigned={handleSigned}
            />
          </div>
        </div>
      )}

      {/* Terminate modal */}
      {terminating && (
        <TerminateModal
          agreement={terminating}
          token={token}
          userId={userId}
          userRole="tenant"
          onClose={() => setTerminating(null)}
          onDone={() => { setTerminating(null); fetchAgreements(); }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Agreements</h1>
          <p className="text-sm text-gray-400 mt-0.5">Lease agreements and rental contracts</p>
        </div>
        <button onClick={fetchAgreements}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-bold hover:bg-gray-50 transition">
          <HiRefresh className={`text-sm ${loading?"animate-spin":""}`}/> Refresh
        </button>
      </div>

      {/* Stats */}
      {!loading && agreements.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Total",   value:counts.all,     icon:HiDocumentText,      color:"#2563eb" },
            { label:"Active",  value:counts.active,  icon:HiShieldCheck,       color:"#16a34a" },
            { label:"Pending", value:counts.pending, icon:HiClock,             color:"#d97706" },
            { label:"Issues",  value:counts.issues,  icon:HiExclamationCircle, color:"#dc2626" },
          ].map((s,i) => <StatCard key={i} {...s}/>)}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key:"all",     label:"All"     },
          { key:"active",  label:"Active"  },
          { key:"pending", label:"Pending" },
          { key:"issues",  label:"Issues"  },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === f.key ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ${
                filter === f.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>{counts[f.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">{Array.from({length:2}).map((_,i) => <SkeletonCard key={i}/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <HiDocumentText className="text-3xl text-gray-300"/>
          </div>
          <p className="font-black text-gray-700 text-lg">
            {filter === "all" ? "No lease agreements yet" : `No ${filter} agreements`}
          </p>
          <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            {filter === "all"
              ? "Your landlord will send you a lease to review and sign."
              : "Agreements with this status will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => (
            <AgreementItem key={a.id} agreement={a} onSign={setSigning} onTerminate={setTerminating} userId={userId}/>
          ))}
        </div>
      )}

      {!loading && agreements.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing <span className="font-bold text-gray-700">{filtered.length}</span> of{" "}
          <span className="font-bold text-gray-700">{agreements.length}</span> agreements
        </p>
      )}
    </div>
  );
}