// src/components/tenant/agreements/SignModal.jsx
import React, { useState } from "react";
import {
  HiShieldCheck, HiDownload, HiX,
  HiCheck, HiCheckCircle, HiPencilAlt
} from "react-icons/hi";
import { API_BASE } from "../../../config";
import SignatureCanvas from "./SignatureCanvas";
import LeasePreview    from "./LeasePreview";
import { formatRWF, fmtDate, normaliseAgreement } from "./agreementHelpers";

const STEPS = [
  { label: "Property Details" },
  { label: "Lease Terms"      },
  { label: "Review Agreement" },
  { label: "Sign & Finalize"  },
];

export default function SignModal({ agreement, tenantName, token, onClose, onSigned }) {
  const [sig,     setSig]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const { propertyTitle, propertyDistrict, landlordName, docLabel } =
    normaliseAgreement(agreement);

  // ── Sign ───────────────────────────────────────────────────────────────────
  const handleSign = async () => {
    if (!sig) { setError("Please draw your signature above."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/agreements/${agreement.id}/sign`, {
        method:  "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantSignature: sig,
          tenantName,
          signedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signing failed");
      setDone(true);
      setTimeout(() => { onSigned(agreement.id); onClose(); }, 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = () => {
    const html = `<!DOCTYPE html><html><head><title>Lease - ${docLabel}</title>
<style>
  body { font-family:Georgia,serif; max-width:760px; margin:40px auto; padding:40px; color:#1a1a1a; line-height:1.8; font-size:13px }
  h1   { text-align:center; font-family:Arial; font-size:16px; text-transform:uppercase; letter-spacing:3px }
  .st  { font-family:Arial; font-weight:700; font-size:12px; text-transform:uppercase; margin:14px 0 4px }
  .sigs{ display:flex; gap:60px; margin-top:40px; padding-top:20px; border-top:1px solid #ccc }
  .sb  { flex:1 }
  .sl  { border-bottom:1px solid #333; min-height:50px; margin-bottom:6px }
</style></head><body>
<div style="display:flex;justify-content:space-between;font-family:Arial;font-size:12px;margin-bottom:20px">
  <span>DOCUMENT ID: #${docLabel}</span>
  <div style="text-align:right"><strong>InzuTrust Properties</strong><br>Kigali, Rwanda</div>
</div>
<h1>Residential Lease Agreement</h1>
<p>Between <strong>${landlordName}</strong> ("Landlord") and <strong>${tenantName}</strong> ("Tenant").</p>
<div class="st">1. Property</div><p><strong>${propertyTitle}, ${propertyDistrict}, Rwanda</strong></p>
<div class="st">2. Term</div><p>${agreement.leaseDuration} months · ${fmtDate(agreement.startDate)} → ${fmtDate(agreement.endDate)}</p>
<div class="st">3. Rent</div><p><strong>${formatRWF(agreement.rentAmount)}</strong>/month. Late fee 5%.</p>
<div class="st">4. Security Deposit</div><p><strong>${formatRWF(agreement.securityDeposit || agreement.rentAmount)}</strong> in InzuTrust escrow.</p>
${agreement.additionalTerms ? `<div class="st">9. Additional Terms</div><p>${agreement.additionalTerms}</p>` : ""}
<div class="sigs">
  <div class="sb">
    <p style="font-style:italic;font-size:12px">${landlordName} ✓</p>
    <p><strong>${landlordName}</strong><br>Landlord</p>
  </div>
  <div class="sb">
    ${sig ? `<img src="${sig}" height="50"/>` : '<div class="sl"></div>'}
    <p><strong>${tenantName}</strong><br>Tenant</p>
  </div>
</div></body></html>`;

    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `SignedLease-${docLabel}.html`;
    a.click();
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

      {/* ── Top bar ── */}
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
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-xs font-bold transition"
          >
            <HiDownload/> Download Draft
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <HiX className="text-lg"/>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left progress sidebar ── */}
        <div className="w-64 bg-white border-r border-gray-200 p-6 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-5">
            AGREEMENT PROGRESS
          </p>
          {STEPS.map((s, i) => {
            const isDone   = i < 3;
            const isActive = i === 3;
            return (
              <div key={i} className={`flex items-start gap-3 px-3 py-3 rounded-xl mb-1 transition-all ${
                isActive ? "bg-blue-50 border border-blue-100" : ""
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isDone ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-200"
                }`}>
                  {isDone   ? <HiCheck      className="text-white text-xs"/> :
                   isActive ? <HiPencilAlt  className="text-white text-xs"/> :
                   <span className="text-gray-400 text-[10px] font-bold">{i + 1}</span>}
                </div>
                <div>
                  <p className={`text-xs font-black leading-tight ${
                    isActive ? "text-blue-700" : isDone ? "text-gray-700" : "text-gray-400"
                  }`}>
                    {s.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 font-medium ${
                    isActive ? "text-blue-500" : isDone ? "text-green-500" : "text-gray-300"
                  }`}>
                    {isDone ? "Completed" : isActive ? "In Progress" : "Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-8 max-h-[700px] border-l border-gray-200">
          <div className="max-w-2xl mx-auto space-y-5">

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Review & Sign</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Review the final terms and provide your e-signature.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ml-4">
                <HiShieldCheck/> Secure & Encrypted
              </div>
            </div>

            {/* Lease document preview */}
            <LeasePreview agreement={agreement} tenantName={tenantName} tenantSig={sig}/>

            {/* Signature area or success */}
            {!done ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <p className="text-sm font-black text-gray-900">Your Signature</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                    {error}
                  </div>
                )}

                <SignatureCanvas
                  label={`${tenantName} (Tenant)`}
                  onSave={setSig}
                  onClear={() => setSig(null)}
                />

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By signing, you agree to all lease terms. This e-signature is legally binding under Rwandan law.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Signing...</>
                    ) : (
                      <><HiCheck/> Confirm & Sign</>
                    )}
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