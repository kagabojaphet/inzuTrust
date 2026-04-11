// src/components/landlord/applications/AppRow.jsx
import { HiCheckCircle, HiXCircle, HiClock, HiDocumentText, HiLocationMarker, HiPhotograph, HiCalendar, HiEye } from "react-icons/hi";

export const STATUS_CONFIG = {
  draft:    { label:"Draft",    badge:"bg-gray-100 text-gray-500 border-gray-200",       Icon:HiDocumentText },
  pending:  { label:"Pending",  badge:"bg-yellow-50 text-yellow-700 border-yellow-200",  Icon:HiClock        },
  accepted: { label:"Accepted", badge:"bg-green-50 text-green-700 border-green-200",     Icon:HiCheckCircle  },
  rejected: { label:"Rejected", badge:"bg-red-50 text-red-600 border-red-200",           Icon:HiXCircle      },
};

const fmtDate = d => d
  ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const fmtRWF = n => n ? `RWF ${Number(n).toLocaleString()}` : "—";

export default function AppRow({ app, onView, onRespond }) {
  const { label, badge, Icon } = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const tenant = app.tenant;
  const prop   = app.property;

  return (
    <div className="grid grid-cols-[2fr_2fr_1.4fr_1fr_1.2fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition border-b border-gray-50 last:border-0">

      {/* Tenant */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-black text-blue-600 shrink-0">
          {tenant?.firstName?.[0]}{tenant?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{tenant?.firstName} {tenant?.lastName}</p>
          <p className="text-[10px] text-gray-400 truncate">{tenant?.email}</p>
        </div>
      </div>

      {/* Property */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          {prop?.mainImage
            ? <img src={prop.mainImage} alt="" className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-sm"/></div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{prop?.title || "—"}</p>
          <p className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate">
            <HiLocationMarker className="shrink-0"/> {prop?.district || "—"}
          </p>
        </div>
      </div>

      {/* Move-in */}
      <div>
        <p className="text-xs text-gray-700 flex items-center gap-1">
          <HiCalendar className="text-gray-400 shrink-0"/> {fmtDate(app.moveInDate)}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{app.duration} months</p>
      </div>

      {/* Rent — FIX: reads from prop.rentAmount */}
      <div>
        <p className="text-xs font-bold text-blue-600">
          {fmtRWF(prop?.rentAmount)}
        </p>
      </div>

      {/* Status */}
      <div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${badge}`}>
          <Icon className="text-[10px]"/> {label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 justify-end">
        <button onClick={() => onView(app)} title="View details"
          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition">
          <HiEye className="text-sm"/>
        </button>
        {app.status === "pending" && (
          <button onClick={() => onRespond(app)} title="Respond"
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <HiCheckCircle className="text-sm"/>
          </button>
        )}
      </div>
    </div>
  );
}