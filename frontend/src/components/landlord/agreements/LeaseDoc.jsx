// src/components/landlord/agreements/LeaseDoc.jsx
import React from "react";
import { formatRWF } from "./agreementHelpers";

export default function LeaseDoc({ d, docId, showSigs }) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const clauses = [
    { n:"1", t:"PROPERTY",         b: <> Property at <strong>{d.propertyAddress || "___"}, {d.district || "Kigali"}, Rwanda</strong> for private residence.</> },
    { n:"2", t:"TERM",             b: <> Duration: <strong>{d.leaseDuration || "12"} months</strong>, from <strong>{d.startDate || "___"}</strong> to <strong>{d.endDate || "___"}</strong>.</> },
    { n:"3", t:"RENT",             b: <> Monthly: <strong>{formatRWF(d.rentAmount || 0)}</strong>. Due 1st. Late fee 5%.</> },
    { n:"4", t:"SECURITY DEPOSIT", b: <> <strong>{formatRWF(d.securityDeposit || d.rentAmount || 0)}</strong> held in InzuTrust escrow.</> },
    { n:"5", t:"USE OF PREMISES",  b: "Solely as a private residential dwelling. No subletting without written consent." },
    { n:"6", t:"MAINTENANCE",      b: "Tenant shall maintain the property in good condition." },
    { n:"7", t:"TERMINATION",      b: "30 days written notice required. Early termination subject to InzuTrust policy." },
    { n:"8", t:"GOVERNING LAW",    b: "Governed by the laws of the Republic of Rwanda." },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm font-serif leading-relaxed max-h-[460px] overflow-y-auto shadow-inner">

      {/* Header */}
      <div className="flex justify-between items-start mb-5 font-sans">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          DOCUMENT ID: #{docId}
        </span>
        <div className="text-right">
          <p className="font-black text-gray-800 text-sm">InzuTrust Properties</p>
          <p className="text-xs text-gray-500">Kigali, Rwanda</p>
        </div>
      </div>

      <h2 className="text-center text-base font-black text-gray-900 mb-5 uppercase tracking-widest font-sans">
        RESIDENTIAL LEASE AGREEMENT
      </h2>

      <p className="mb-4 text-gray-700">
        This Agreement is made on{" "}
        <span className="bg-yellow-100 px-1 font-bold">{today}</span> between{" "}
        <strong>{d.landlordName || "___"}</strong> ("Landlord") and{" "}
        <strong>{d.tenantName   || "___"}</strong> ("Tenant")
      </p>

      {/* Clauses */}
      {clauses.map(c => (
        <div key={c.n} className="mb-3">
          <p className="font-black text-gray-900 font-sans mb-0.5">{c.n}. {c.t}</p>
          <p className="text-gray-700">{c.b}</p>
        </div>
      ))}

      {d.additionalTerms && (
        <div className="mb-3">
          <p className="font-black text-gray-900 font-sans mb-0.5">9. ADDITIONAL TERMS</p>
          <p className="text-gray-700">{d.additionalTerms}</p>
        </div>
      )}

      {/* Signatures */}
      {showSigs && (
        <div className="pt-4 mt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
          {[
            { name: d.landlordName, role: "Landlord", sig: d.landlordSignature },
            { name: d.tenantName,   role: "Tenant",   sig: null                },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 font-sans">
                {s.role} Signature
              </p>
              {s.sig
                ? <img src={s.sig} alt={s.role} className="h-10 object-contain mb-1"/>
                : <div className="h-10 border-b border-gray-400 mb-1 flex items-end pb-1">
                    {i === 1 && <span className="text-[10px] text-gray-400 italic">Pending tenant signature</span>}
                  </div>
              }
              <p className="text-xs text-gray-500">{s.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}