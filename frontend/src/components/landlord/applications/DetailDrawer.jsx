// src/components/landlord/applications/DetailDrawer.jsx
import { HiX, HiCheckCircle, HiXCircle, HiClock, HiDocumentText, HiLocationMarker, HiPhotograph } from "react-icons/hi";

const STATUS_CONFIG = {
  draft:    { label:"Draft",    badge:"bg-gray-100 text-gray-600 border-gray-200",         Icon:HiDocumentText },
  pending:  { label:"Pending",  badge:"bg-yellow-50 text-yellow-700 border-yellow-200",    Icon:HiClock        },
  accepted: { label:"Accepted", badge:"bg-green-50 text-green-700 border-green-200",       Icon:HiCheckCircle  },
  rejected: { label:"Rejected", badge:"bg-red-50 text-red-700 border-red-200",             Icon:HiXCircle      },
};

const fmtDate = d => d
  ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const fmtRWF = n => n ? `RWF ${Number(n).toLocaleString()}` : "—";

export default function DetailDrawer({ application: app, onClose, onRespond }) {
  const tenant = app.tenant;
  const prop   = app.property;
  const cfg    = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const { Icon } = cfg;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="absolute inset-0" onClick={onClose}/>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-black text-gray-900 text-lg">Application Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><HiX className="text-xl"/></button>
        </div>

        <div className="p-6 space-y-5 flex-1">

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border ${cfg.badge}`}>
            <Icon className="text-xs"/> {cfg.label}
          </span>

          {/* Property card */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <div className="h-32 bg-gray-200 overflow-hidden">
              {prop?.mainImage
                ? <img src={prop.mainImage} alt={prop.title} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-4xl"/></div>
              }
            </div>
            <div className="p-4">
              <p className="font-black text-gray-900">{prop?.title}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <HiLocationMarker/>{prop?.district}{prop?.sector ? `, ${prop.sector}` : ""}
              </p>
              <p className="text-sm font-black text-blue-600 mt-1">{fmtRWF(prop?.rentAmount)}/mo</p>
            </div>
          </div>

          {/* Tenant */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tenant</p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                {tenant?.firstName?.[0]}{tenant?.lastName?.[0]}
              </div>
              <div>
                <p className="font-black text-gray-900">{tenant?.firstName} {tenant?.lastName}</p>
                <p className="text-xs text-gray-400">{tenant?.email}</p>
                {tenant?.phone && <p className="text-xs text-gray-400">{tenant.phone}</p>}
              </div>
            </div>
          </div>

          {/* Lease details */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Lease Details</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-100">
              {[
                { label:"Move-in Date", value:fmtDate(app.moveInDate) },
                { label:"Duration",     value:`${app.duration} months`  },
                { label:"Applied",      value:fmtDate(app.createdAt)    },
                { label:"Responded",    value:fmtDate(app.respondedAt)  },
              ].map((r,i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-400">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant message */}
          {app.message && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tenant Message</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                {app.message}
              </div>
            </div>
          )}

          {/* Landlord note */}
          {app.landlordNote && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Your Note</p>
              <div className={`rounded-xl p-4 text-sm leading-relaxed border ${
                app.status === "accepted"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-orange-50 border-orange-200 text-orange-800"
              }`}>
                {app.landlordNote}
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          {app.status === "pending" ? (
            <button onClick={() => { onClose(); onRespond(app); }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition">
              Review & Respond
            </button>
          ) : app.status === "accepted" ? (
            <div className="flex items-center gap-2 text-sm text-green-700 font-bold bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <HiCheckCircle/> Accepted — create lease from Agreements tab
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}