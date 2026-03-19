// src/components/tenant/agreements/LeasePreview.jsx
import React from "react";
import { formatRWF, fmtDate, normaliseAgreement } from "./agreementHelpers";

export default function LeasePreview({ agreement, tenantName, tenantSig }) {
  const { propertyTitle, propertyDistrict, landlordName, docLabel } =
    normaliseAgreement(agreement);

  const clauses = [
    { n:"1", t:"PROPERTY",      b: <> At <strong>{propertyTitle}, {propertyDistrict}, Rwanda</strong>.</> },
    { n:"2", t:"TERM",          b: <><strong>{agreement.leaseDuration} months</strong> · {fmtDate(agreement.startDate)} → {fmtDate(agreement.endDate)}</> },
    { n:"3", t:"RENT",          b: <><strong>{formatRWF(agreement.rentAmount)}</strong>/month. Due 1st. Late fee 5%.</> },
    { n:"4", t:"SECURITY",      b: <><strong>{formatRWF(agreement.securityDeposit || agreement.rentAmount)}</strong> held in InzuTrust escrow.</> },
    { n:"5", t:"USE",           b: "Solely as a private residential dwelling." },
    { n:"6", t:"MAINTENANCE",   b: "Tenant shall maintain the property in good condition." },
    { n:"7", t:"TERMINATION",   b: "30 days written notice required." },
    { n:"8", t:"GOVERNING LAW", b: "Governed by the laws of the Republic of Rwanda." },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm font-serif leading-relaxed max-h-[400px] overflow-y-auto shadow-inner">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 font-sans">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          DOCUMENT ID: #{docLabel}
        </span>
        <div className="text-right">
          <p className="font-black text-gray-800 text-sm">InzuTrust Properties</p>
          <p className="text-xs text-gray-500">Kigali, Rwanda</p>
        </div>
      </div>

      <h2 className="text-center text-base font-black text-gray-900 mb-4 uppercase tracking-widest font-sans">
        RESIDENTIAL LEASE AGREEMENT
      </h2>

      <p className="mb-4 text-gray-700">
        Made between <strong>{landlordName}</strong> ("Landlord") and{" "}
        <strong>{tenantName || "___"}</strong> ("Tenant")
      </p>

      {/* Clauses */}
      {clauses.map(c => (
        <div key={c.n} className="mb-3">
          <p className="font-black text-gray-900 font-sans mb-0.5">{c.n}. {c.t}</p>
          <p className="text-gray-700">{c.b}</p>
        </div>
      ))}

      {agreement.additionalTerms && (
        <div className="mb-3">
          <p className="font-black text-gray-900 font-sans mb-0.5">9. ADDITIONAL TERMS</p>
          <p className="text-gray-700">{agreement.additionalTerms}</p>
        </div>
      )}

      {/* Signatures */}
      <div className="pt-4 mt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
        {/* Landlord */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 font-sans">
            Landlord Signature
          </p>
          <div className="h-10 flex items-end pb-1 border-b border-gray-400 mb-1">
            {agreement.landlordSigned && (
              <p className="text-xs italic text-gray-500 font-sans">{landlordName} ✓</p>
            )}
          </div>
          <p className="text-xs text-gray-500">{landlordName}</p>
        </div>

        {/* Tenant */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 font-sans">
            Tenant Signature
          </p>
          <div className="h-10 border-b border-gray-400 mb-1 flex items-end pb-1">
            {tenantSig ? (
              <img src={tenantSig} alt="tenant-sig" className="h-9 object-contain"/>
            ) : agreement.tenantSignature ? (
              <img src={agreement.tenantSignature} alt="tenant-sig" className="h-9 object-contain"/>
            ) : null}
          </div>
          <p className="text-xs text-gray-500">{tenantName}</p>
        </div>
      </div>
    </div>
  );
}