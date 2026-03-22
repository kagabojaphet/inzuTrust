// src/components/tenant/agreements/AgreementCard.jsx
import React from "react";
import {
  HiDocumentText, HiCheckCircle, HiClock, HiExclamation,
  HiEye, HiPencilAlt, HiShieldCheck, HiDownload, HiLocationMarker
} from "react-icons/hi";
import {
  formatRWF, fmtDate, mapStatus,
  isPendingStatus, isSignedStatus,
  normaliseAgreement, STATUS_STYLE,
} from "./agreementHelpers";

export default function AgreementCard({ agreement: a, onSign }) {
  const displayStatus              = mapStatus(a.status);
  const { badge }                  = STATUS_STYLE[displayStatus] || STATUS_STYLE["Pending Signature"];
  const isPending                  = isPendingStatus(a.status);
  const isSigned                   = isSignedStatus(a.status);
  const { propertyTitle, propertyDistrict, landlordName, docLabel } =
    normaliseAgreement(a);

  const StatusIcon =
    displayStatus === "Signed"  ? <HiCheckCircle className="text-green-500"/> :
    displayStatus === "Expired" ? <HiExclamation className="text-red-500"/>   :
    <HiClock className="text-yellow-500"/>;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition ${
      isPending ? "border-blue-200 shadow-sm shadow-blue-50" : "border-gray-200"
    }`}>
      <div className="p-5">

        {/* ── Top row ── */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPending ? "bg-blue-50" : "bg-gray-50"
            }`}>
              <HiDocumentText className={`text-xl ${isPending ? "text-blue-600" : "text-gray-400"}`}/>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{propertyTitle}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
                {propertyDistrict && (
                  <><HiLocationMarker className="shrink-0"/>{propertyDistrict} · </>
                )}
                Landlord: {landlordName} ·{" "}
                <span className="font-mono">#{docLabel}</span>
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0 ${badge}`}>
            {StatusIcon} {displayStatus}
          </span>
        </div>

        {/* ── Detail grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Monthly Rent", value: formatRWF(a.rentAmount) },
            { label: "Start Date",   value: fmtDate(a.startDate)   },
            { label: "End Date",     value: fmtDate(a.endDate)     },
            { label: "Duration",     value: `${a.leaseDuration} months` },
          ].map((d, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{d.label}</p>
              <p className="text-sm font-bold text-gray-900">{d.value}</p>
            </div>
          ))}
        </div>

        {/* ── Signature status ── */}
        <div className="flex items-center gap-5 mb-4">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${
            a.landlordSigned ? "text-green-600" : "text-gray-400"
          }`}>
            <HiCheckCircle className={a.landlordSigned ? "text-green-500" : "text-gray-300"}/>
            Landlord signed
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${
            a.tenantSigned ? "text-green-600" : "text-yellow-600"
          }`}>
            <HiCheckCircle className={a.tenantSigned ? "text-green-500" : "text-yellow-400"}/>
            {a.tenantSigned ? "You signed" : "Awaiting your signature"}
          </div>
        </div>

        {/* ── Additional terms ── */}
        {a.additionalTerms && (
          <div className="mb-4 text-xs bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-600">
            <span className="font-bold">Additional Terms: </span>{a.additionalTerms}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button
            onClick={() => onSign(a)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              isPending
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {isPending ? <><HiPencilAlt/> Sign Agreement</> : <><HiEye/> View Agreement</>}
          </button>

          {isSigned && (
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
              <HiDownload/> Download
            </button>
          )}
        </div>
      </div>

      {/* ── InzuTrust guarantee strip ── */}
      {isSigned && (
        <div className="bg-green-50 border-t border-green-100 px-5 py-3 flex items-center gap-2">
          <HiShieldCheck className="text-green-500 shrink-0"/>
          <p className="text-xs text-green-700 font-semibold">
            InzuTrust Guarantee: This lease is secured and payment reporting is active.
          </p>
        </div>
      )}
    </div>
  );
}