// src/components/landlord/agreements/AgreementRow.jsx
import React from "react";
import { HiDocumentText, HiCheckCircle, HiClock, HiExclamation, HiEye, HiPencilAlt } from "react-icons/hi";
import { formatRWF, normaliseRow, STATUS_STYLE } from "./agreementHelpers";

const STATUS_ICONS = {
  Active:   <HiCheckCircle className="text-green-600"/>,
  Pending:  <HiClock       className="text-blue-500"/>,
  Expiring: <HiClock       className="text-yellow-600"/>,
  Expired:  <HiExclamation className="text-red-500"/>,
};

export default function AgreementRow({ agreement: a, onRenew }) {
  const { tenantName, propertyTitle, startDisplay, endDisplay, rent, displayStatus } =
    normaliseRow(a);
  const { badge } = STATUS_STYLE[displayStatus] || STATUS_STYLE.Pending;
  const statusIcon = STATUS_ICONS[displayStatus] || STATUS_ICONS.Pending;

  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
      {/* Tenant */}
      <div className="col-span-3 flex items-center gap-2.5">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tenantName)}&background=dbeafe&color=1d4ed8&bold=true&size=28`}
          alt={tenantName}
          className="w-7 h-7 rounded-full shrink-0"
        />
        <span className="text-sm font-semibold text-gray-900 truncate">{tenantName}</span>
      </div>

      {/* Property */}
      <div className="col-span-3 flex items-center gap-2">
        <HiDocumentText className="text-gray-400 shrink-0"/>
        <span className="text-sm text-gray-600 truncate">{propertyTitle}</span>
      </div>

      {/* Period */}
      <div className="col-span-2 text-xs text-gray-500">
        <p>{startDisplay}</p>
        <p className="text-gray-400">{endDisplay}</p>
      </div>

      {/* Rent */}
      <div className="col-span-1 text-sm font-bold text-blue-600">
        {formatRWF(rent)}
      </div>

      {/* Status */}
      <div className="col-span-2">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${badge}`}>
          {statusIcon} {displayStatus}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end gap-1.5">
        <button
          title="View"
          className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
        >
          <HiEye className="text-sm"/>
        </button>
        <button
          title="Create new lease for this property"
          onClick={() => onRenew({
            propertyId: a.propertyId || a.property?.id,
            tenantId:   a.tenantId,
            title:      propertyTitle,
            rentAmount: rent,
            district:   a.property?.district,
            sector:     a.property?.sector,
          })}
          className="w-7 h-7 flex items-center justify-center bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition"
        >
          <HiPencilAlt className="text-sm"/>
        </button>
      </div>
    </div>
  );
}