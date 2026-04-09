// src/components/tenant/agreements/SignModal.jsx
import React, { useState } from "react";
import { HiShieldCheck, HiDownload, HiX, HiCheck, HiCheckCircle, HiPencilAlt } from "react-icons/hi";
import { API_BASE } from "../../../config";
import SignatureCanvas from "./SignatureCanvas";
import LeasePreview   from "./LeasePreview";
import { formatRWF, fmtDate, normaliseAgreement } from "./agreementHelpers";

const STEPS = [
  { label:"Property Details" },
  { label:"Lease Terms"      },
  { label:"Review Agreement" },
  { label:"Sign & Finalize"  },
];

export default function SignModal({ agreement, tenantName, token, onClose, onSigned }) {
  const [sig,     setSig]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const { propertyTitle, propertyDistrict, landlordName, docLabel } =
    normaliseAgreement(agreement);

  const handleSign = async () => {
    if (!sig) { setError("Please draw your signature above."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/agreements/${agreement.id}/sign`, {
        method:  "PUT",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
        body:    JSON.stringify({ tenantSignature: sig, tenantName, signedAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signing failed");
      setDone(true);
      setTimeout(() => { onSigned(agreement.id); onClose(); }, 1500);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── Download: generate HTML matching the template ──────────────────────────
  const handleDownload = () => {
    const signDate = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric" });
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>InzuTrust Lease Agreement - #${docLabel}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1a1a1a;background:#f5f7fa;padding:30px}
  .page{background:white;max-width:760px;margin:0 auto;border:1px solid #ddd;border-radius:4px;overflow:hidden}
  .inner{padding:32px 40px 0}
  .logo-wrap{text-align:center;margin-bottom:6px}
  .logo-name{font-size:22px;font-weight:900;color:#1a56db;letter-spacing:.5px;display:block;margin-top:4px}
  .divider-blue{border:none;border-top:2px solid #1a56db;margin:10px 0 20px}
  .divider-gray{border:none;border-top:1px solid #ddd;margin:0 0 20px}
  h1{text-align:center;color:#1a56db;font-size:20px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
  .made-on{text-align:center;color:#888;font-size:11px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:12px}
  .made-on span{flex:1;height:1px;background:#ddd;display:inline-block;max-width:120px}
  .section-title{font-size:13px;font-weight:900;text-transform:uppercase;margin-bottom:6px}
  .sec-header{background:linear-gradient(90deg,#1a56db 0,#1a56db 180px,#e8eef8 180px);border-radius:4px;padding:6px 14px;margin-bottom:12px}
  .sec-header span{color:white;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:1px}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;padding-left:8px;margin-bottom:16px}
  .label-text{color:#555}
  .sig-grid{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:20px;padding:20px 0 24px}
  .sig-block{text-align:center}
  .sig-line{min-height:54px;border-bottom:2px solid #333;margin-bottom:6px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px}
  .sig-name{font-weight:900;font-size:12px;margin-bottom:2px}
  .sig-role{color:#888;font-size:11px}
  .footer{background:#1a56db;padding:12px 40px;text-align:center;color:white;font-size:11px;font-weight:600;letter-spacing:.5px}
  .stamp{text-align:center;padding-bottom:12px}
  .terms-item{margin:2px 0;line-height:1.9}
  p{line-height:1.9}
  .mb{margin-bottom:18px}
  .details-pad{padding-left:8px;line-height:1.9}
  @media print{body{background:white;padding:0}.page{border:none;border-radius:0;box-shadow:none}}
</style></head>
<body><div class="page"><div class="inner">

<div class="logo-wrap">
  <svg width="48" height="44" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 4L4 22H10V44H22V32H30V44H42V22H48L26 4Z" fill="#1a56db"/>
    <rect x="20" y="32" width="12" height="12" rx="1" fill="white"/>
  </svg>
  <span class="logo-name">InzuTrust</span>
</div>

<hr class="divider-blue"/>
<h1>RESIDENTIAL LEASE AGREEMENT</h1>
<div class="made-on"><span></span>THIS AGREEMENT IS MADE ON: <strong>${signDate}</strong><span></span></div>
<hr class="divider-gray"/>

<div class="mb">
  <p class="section-title">PARTIES</p>
  <hr style="border:none;border-top:1px solid #ccc;margin-bottom:10px">
  <p style="color:#555;margin-bottom:12px">This Lease Agreement is entered into between:</p>
  <div class="sec-header"><span>LANDLORD:</span></div>
  <div class="two-col">
    <div>
      <p style="font-weight:900;font-size:13px;margin-bottom:4px">${landlordName}</p>
      <p class="label-text">ID No: ${agreement.landlordNationalId || "—"}</p>
      <p class="label-text">Phone: ${agreement.landlord?.phone || "—"}</p>
    </div>
    <div>
      <p style="font-weight:900;font-size:13px;margin-bottom:4px">${tenantName}</p>
      <p class="label-text">ID No: ${agreement.tenantNationalId || "—"}</p>
      <p class="label-text">Phone: ${agreement.tenant?.phone || "—"}</p>
    </div>
  </div>
</div>

<div class="mb">
  <div class="sec-header"><span>PROPERTY DETAILS</span></div>
  <div class="details-pad">
    <p><span class="label-text">Rental Property: </span><strong>${[propertyTitle, propertyDistrict, "Rwanda"].filter(Boolean).join(", ")}</strong></p>
    <p><span class="label-text">Type of Property: </span><strong style="text-transform:capitalize">${agreement.property?.type || "House"}</strong>.</p>
    <p><span class="label-text">Lease Term: </span>&nbsp;&nbsp;Start Date: <strong>${fmtDate(agreement.startDate)}</strong>&nbsp;&nbsp;&nbsp;&nbsp;End Date: <strong>${fmtDate(agreement.endDate)}</strong></p>
  </div>
</div>

<div class="mb">
  <div class="sec-header"><span>RENT &amp; DEPOSIT</span></div>
  <div class="details-pad">
    <p><span class="label-text">Monthly Rent: </span><strong>${formatRWF(agreement.rentAmount)}</strong></p>
    <p><span class="label-text">Security Deposit: </span><strong>${formatRWF(agreement.securityDeposit || agreement.rentAmount)}</strong></p>
    <p><span class="label-text">Payment Due Date: </span><strong>${agreement.paymentDueDay || "5th"} of each month</strong></p>
  </div>
</div>

<div class="mb">
  <div class="sec-header"><span>TERMS &amp; CONDITIONS</span></div>
  <div class="details-pad">
    <p class="terms-item">- <span class="label-text">Utilities:</span> Tenant is responsible for water and electricity bills.</p>
    <p class="terms-item">- <strong>Maintenance:</strong> Landlord will handle major repairs.</p>
    <p class="terms-item">- No subletting allowed without landlord's consent.</p>
    <p class="terms-item">- <strong>Notice Period:</strong> 30 days notice required for termination.</p>
    ${agreement.additionalTerms ? `<p class="terms-item">- <strong>Additional Terms:</strong> ${agreement.additionalTerms}</p>` : ""}
  </div>
</div>

<div class="sig-grid">
  <div class="sig-block">
    <div class="sig-line">
      ${sig ? `<img src="${sig}" style="max-height:50px;max-width:100%" alt="sig"/>` :
        (agreement.landlordSigned ? `<span style="font-style:italic;font-size:11px;color:#555">${landlordName} ✓</span>` : "")}
    </div>
    <p class="sig-name">${landlordName}</p>
    <p class="sig-role">Landlord</p>
  </div>
  <div class="stamp">
    <svg width="88" height="88" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="42" fill="none" stroke="#1a56db" stroke-width="2.5"/>
      <circle cx="45" cy="45" r="36" fill="none" stroke="#1a56db" stroke-width="1"/>
      <path d="M45 22L29 35H33V54H41V46H49V54H57V35H61L45 22Z" fill="#1a56db"/>
      <rect x="41" y="46" width="8" height="8" rx="0.5" fill="white"/>
      <path id="ta" d="M 10,45 A 35,35 0 0,1 80,45" fill="none"/>
      <text font-size="7.5" font-weight="bold" font-family="Arial" fill="#1a56db" letter-spacing="2"><textPath href="#ta" startOffset="12%">INZUTRUST</textPath></text>
      <path id="ba" d="M 13,48 A 32,32 0 0,0 77,48" fill="none"/>
      <text font-size="5.5" font-family="Arial" fill="#1a56db" letter-spacing="1"><textPath href="#ba" startOffset="5%">TRUSTED PROPERTY SOLUTIONS</textPath></text>
    </svg>
  </div>
  <div class="sig-block">
    <div class="sig-line">
      ${sig ? `<img src="${sig}" style="max-height:50px;max-width:100%" alt="sig"/>` :
        (agreement.tenantSignature ? `<img src="${agreement.tenantSignature}" style="max-height:50px;max-width:100%" alt="sig"/>` : "")}
    </div>
    <p class="sig-name">${tenantName}</p>
    <p class="sig-role">Tenant</p>
  </div>
</div>

</div>
<div class="footer">www.inzutrust.com | Email: info@inzutrust.com</div>
</div></body></html>`;

    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob([html], { type:"text/html" }));
    el.download = `InzuTrust-Lease-${docLabel}.html`;
    el.click();
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <HiShieldCheck className="text-white"/>
          </div>
          <div>
            <p className="text-gray-900 font-black text-sm">Finalize Lease Agreement</p>
            <p className="text-blue-500 text-[10px]">Document ID: #{docLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-xs font-bold transition">
            <HiDownload/> Download
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <HiX className="text-lg"/>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Progress sidebar */}
        <div className="w-56 bg-white border-r border-gray-200 p-5 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-5">PROGRESS</p>
          {STEPS.map((s, i) => {
            const isDone   = i < 3;
            const isActive = i === 3;
            return (
              <div key={i} className={`flex items-start gap-3 px-3 py-3 rounded-xl mb-1 ${isActive?"bg-blue-50 border border-blue-100":""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isDone?"bg-green-500":isActive?"bg-blue-500":"bg-gray-200"}`}>
                  {isDone   ? <HiCheck     className="text-white text-xs"/> :
                   isActive ? <HiPencilAlt className="text-white text-xs"/> :
                   <span className="text-gray-400 text-[10px] font-bold">{i+1}</span>}
                </div>
                <div>
                  <p className={`text-xs font-black leading-tight ${isActive?"text-blue-700":isDone?"text-gray-700":"text-gray-400"}`}>{s.label}</p>
                  <p className={`text-[10px] mt-0.5 font-medium ${isActive?"text-blue-500":isDone?"text-green-500":"text-gray-300"}`}>
                    {isDone?"Completed":isActive?"In Progress":"Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-6 max-h-[680px]">
          <div className="max-w-2xl mx-auto space-y-5">

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black text-gray-900">Review & Sign</h1>
                <p className="text-sm text-gray-500 mt-0.5">Review the agreement and provide your e-signature.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ml-4">
                <HiShieldCheck/> Secure
              </div>
            </div>

            {/* Lease document */}
            <div className="overflow-hidden rounded-xl shadow-md">
              <LeasePreview agreement={agreement} tenantName={tenantName} tenantSig={sig}/>
            </div>

            {/* Signature pad or success */}
            {!done ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <p className="text-sm font-black text-gray-900">Your Signature</p>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>
                )}
                <SignatureCanvas label={`${tenantName} (Tenant)`} onSave={setSig} onClear={() => setSig(null)}/>
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By signing, you agree to all lease terms. This e-signature is legally binding under Rwandan law.
                </p>
                <div className="flex gap-3">
                  <button onClick={onClose}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleSign} disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Signing...</>
                      : <><HiCheck/> Confirm & Sign</>}
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