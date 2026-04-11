// src/components/landlord/applications/RespondModal.jsx
import { useState } from "react";
import { HiX, HiCheckCircle, HiXCircle, HiExclamationCircle } from "react-icons/hi";

const fmtDate = d => d
  ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RespondModal({ application, token, onClose, onDone }) {
  const [status,      setStatus]      = useState("accepted");
  const [note,        setNote]        = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const tenant = application.tenant;
  const prop   = application.property;

  const handleSubmit = async () => {
    if (status === "rejected" && !note.trim()) {
      setError("Please provide a reason for rejection."); return;
    }
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/lease-applications/${application.id}/respond`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ status, landlordNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to respond");
      onDone(data.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900">Review Application</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {tenant?.firstName} {tenant?.lastName} → {prop?.title}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><HiX className="text-xl"/></button>
        </div>

        {/* Summary */}
        <div className="px-6 pt-5">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm mb-5">
            {[
              { label:"Tenant",    value:`${tenant?.firstName} ${tenant?.lastName}` },
              { label:"Email",     value:tenant?.email },
              { label:"Move-in",   value:fmtDate(application.moveInDate) },
              { label:"Duration",  value:`${application.duration} months` },
            ].map((r,i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-400">{r.label}</span>
                <span className="font-bold text-gray-800">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="shrink-0"/> {error}
            </div>
          )}

          {/* Decision */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Decision *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val:"accepted", label:"Accept",  Icon:HiCheckCircle, activeClass:"border-green-500 bg-green-50 text-green-700", hoverClass:"hover:border-green-300" },
                { val:"rejected", label:"Reject",  Icon:HiXCircle,     activeClass:"border-red-500 bg-red-50 text-red-700",       hoverClass:"hover:border-red-300"   },
              ].map(({ val, label, Icon, activeClass, hoverClass }) => (
                <button key={val} onClick={() => setStatus(val)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border-2 transition ${
                    status === val ? activeClass : `border-gray-200 text-gray-500 ${hoverClass}`
                  }`}>
                  <Icon/> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Note to Tenant {status === "accepted" ? "(recommended)" : "(required)"}
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder={status === "accepted"
                ? "Welcome! Your application looks great. I'll send the lease agreement within 24 hours."
                : "Thank you for applying. Unfortunately we cannot proceed because..."}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none bg-gray-50 focus:bg-white transition"/>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className={`flex-1 py-3 rounded-xl text-sm font-black text-white transition disabled:opacity-60 flex items-center justify-center gap-2 ${
                status === "accepted" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</>
                : status === "accepted" ? "Accept Application" : "Reject Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}