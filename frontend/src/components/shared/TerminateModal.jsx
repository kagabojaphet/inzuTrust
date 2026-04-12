// src/components/shared/TerminateModal.jsx
// Used by both Tenant and Landlord to request/respond to termination
// Props: agreement, token, userRole ("tenant"|"landlord"), onClose, onDone
import { useState } from "react";
import { HiX, HiExclamationCircle, HiCheck, HiClock } from "react-icons/hi";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization:`Bearer ${tk}`, "Content-Type":"application/json" });
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";

export default function TerminateModal({ agreement, token, userRole, onClose, onDone }) {
  const [mode,     setMode]     = useState("request"); // "request" | "respond"
  const [reason,   setReason]   = useState("");
  const [propDate, setPropDate] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Parse existing termination request if any
  const termReq = (() => {
    try { return JSON.parse(agreement.terminationRequest || "{}"); } catch { return {}; }
  })();

  const hasPending   = agreement.status === "termination_requested";
  const iRequested   = termReq.requestedBy && termReq.requestedByRole === userRole;
  const canRespond   = hasPending && !iRequested;

  // ── Submit termination request ─────────────────────────────────────────
  const handleRequest = async () => {
    if (!reason.trim()) { setError("Please provide a reason."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/agreements/${agreement.id}/terminate`, {
        method:"PUT", headers: hdrs(token),
        body: JSON.stringify({ reason, proposedDate: propDate || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onDone?.();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── Respond to other party's termination request ───────────────────────
  const handleRespond = async (accept) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/agreements/${agreement.id}/termination/respond`, {
        method:"PUT", headers: hdrs(token),
        body: JSON.stringify({ accept, counterReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onDone?.();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <HiExclamationCircle className="text-red-500 text-lg"/>
            </div>
            <div>
              <h3 className="font-black text-gray-900">Lease Termination</h3>
              <p className="text-xs text-gray-400">Agreement #{agreement.docId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="shrink-0"/> {error}
            </div>
          )}

          {/* ── Show pending request info ─────────────────────────────────── */}
          {hasPending && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <HiClock/> Termination Request Pending
              </p>
              <p className="text-sm text-orange-800">
                <span className="font-bold capitalize">{termReq.requestedByRole}</span> requested termination
              </p>
              {termReq.reason && <p className="text-sm text-orange-700">Reason: {termReq.reason}</p>}
              {termReq.proposedDate && <p className="text-xs text-orange-500">Proposed date: {fmtDate(termReq.proposedDate)}</p>}
              {termReq.disputed && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs font-bold text-red-600">⚠️ Disputed — Pending admin review</p>
                  {termReq.counterReason && <p className="text-xs text-red-500 mt-0.5">Counter: {termReq.counterReason}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Respond to the OTHER party's request ─────────────────────── */}
          {canRespond && !termReq.disputed && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-semibold">Do you agree to terminate this agreement?</p>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Your response (optional — required if disputing)
                </label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder="Add a note or reason for disputing..."
                  className={`${inp} resize-none`}/>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleRespond(false)} disabled={loading}
                  className="flex-1 py-3 border-2 border-red-500 bg-red-50 text-red-700 rounded-xl text-sm font-black hover:bg-red-100 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  <HiX/> Dispute
                </button>
                <button onClick={() => handleRespond(true)} disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : <HiCheck/>}
                  Accept & Terminate
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                Accepting will immediately terminate the lease. Disputing escalates to admin review.
              </p>
            </div>
          )}

          {/* ── Request new termination (if no pending request) ───────────── */}
          {!hasPending && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-black text-amber-800 mb-1">How it works</p>
                <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                  <li>You submit a termination request with a reason</li>
                  <li>The other party can accept (immediate) or dispute</li>
                  <li>If disputed, admin reviews and makes final decision</li>
                </ol>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Reason for Termination *
                </label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder="e.g. Property no longer meets agreed conditions, relocating due to work..."
                  className={`${inp} resize-none`}/>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Proposed Termination Date (optional)
                </label>
                <input type="date" value={propDate} onChange={e => setPropDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} className={inp}/>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleRequest} disabled={loading || !reason.trim()}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : <HiExclamationCircle/>}
                  Submit Request
                </button>
              </div>
            </div>
          )}

          {/* ── Already requested by me, waiting ─────────────────────────── */}
          {iRequested && !termReq.disputed && (
            <div className="text-center py-4">
              <HiClock className="text-3xl text-amber-400 mx-auto mb-2"/>
              <p className="text-sm font-bold text-gray-700">Awaiting Response</p>
              <p className="text-xs text-gray-400 mt-1">The other party has been notified and must respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}