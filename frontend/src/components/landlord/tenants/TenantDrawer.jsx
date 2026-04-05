// src/components/landlord/tenants/TenantDrawer.jsx
import React from "react";
import {
  HiX, HiMail, HiPhone, HiOfficeBuilding,
  HiCheckCircle, HiClock, HiCalendar, HiCreditCard,
} from "react-icons/hi";
import { formatRWF, fmtDate, getRisk, RISK, STATUS_BADGE } from "./tenantHelpers";

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex flex-col py-3 border-b border-gray-50 last:border-0">
      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        {icon && <span className="text-blue-500 shrink-0">{icon}</span>}
        <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
      </div>
    </div>
  );
}

export default function TenantDrawer({ tenant: t, onClose }) {
  if (!t) return null;

  const risk   = getRisk(t.trustScore);
  const riskMeta = RISK[risk];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
      <div className="bg-white w-80 h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <h3 className="text-base font-black text-gray-900">Tenant Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition p-1">
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-6 py-6 text-center border-b border-gray-50">
          <img
            src={`https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=dbeafe&color=2563eb&bold=true&size=64`}
            className="w-16 h-16 rounded-full mx-auto mb-3 shadow-sm"
            alt={t.firstName}
          />
          <h4 className="font-black text-gray-900 text-lg">{t.firstName} {t.lastName}</h4>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            {t.isVerified
              ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <HiCheckCircle className="text-xs" /> KYC Verified
                </span>
              : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <HiClock className="text-xs" /> Pending KYC
                </span>
            }
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskMeta.badge}`}>
              {risk} Risk
            </span>
          </div>
        </div>

        {/* Trust score bar */}
        {t.trustScore !== null && t.trustScore !== undefined && (
          <div className="px-6 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Trust Score</span>
              <span className="text-sm font-black text-blue-600">{t.trustScore} / 100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${t.trustScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Details */}
        <div className="px-6 flex-1">
          <InfoRow icon={<HiMail />}         label="Email"       value={t.email} />
          <InfoRow icon={<HiPhone />}         label="Phone"       value={t.phone} />
          <InfoRow icon={<HiOfficeBuilding />} label="Property"    value={t.property} />
          <InfoRow icon={<HiCreditCard />}    label="Monthly Rent" value={formatRWF(t.rentAmount)} />
          <InfoRow icon={<HiCalendar />}      label="Lease Start"  value={fmtDate(t.startDate)} />
          <InfoRow icon={<HiCalendar />}      label="Lease End"    value={fmtDate(t.endDate)} />
          <InfoRow
            label="Agreement Status"
            value={
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                STATUS_BADGE[t.status?.toLowerCase()] || STATUS_BADGE.active
              }`}>
                {t.status || "Active"}
              </span>
            }
          />
        </div>

        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}