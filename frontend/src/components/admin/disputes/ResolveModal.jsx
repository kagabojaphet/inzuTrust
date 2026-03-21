// src/components/admin/disputes/ResolveModal.jsx
// Admin final resolution form — decision + statement + trust score impact
import React, { useState } from "react";
import { HiX, HiExclamationCircle, HiCheckCircle, HiScale } from "react-icons/hi";
import { API_BASE } from "../../../config";
import { formatRWF } from "./disputeAdminHelpers";

export default function ResolveModal({ dispute, token, onClose, onResolved }) {
  const [resolution,   setResolution]   = useState("");
  const [favoredParty, setFavoredParty] = useState("reporter");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const handleResolve = async () => {
    if (!resolution.trim()) return setError("Resolution text is required.");
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/disputes/${dispute.id}/resolve`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ resolution: resolution.trim(), favoredParty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resolve");
      onResolved(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <HiScale className="text-green-600 text-lg" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Resolve Dispute</h3>
              <p className="text-xs text-gray-400 font-mono">{dispute.docId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <HiX className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="shrink-0" /> {error}
            </div>
          )}

          {/* Parties summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            {[
              { label: "Reporter",   party: dispute.reporter   },
              { label: "Respondent", party: dispute.respondent },
            ].map(({ label, party }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-800">
                  {party ? `${party.firstName} ${party.lastName}` : "—"}
                  {party && (
                    <span className="ml-1 text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold uppercase">
                      {party.role}
                    </span>
                  )}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-gray-500">Claim Amount</span>
              <span className="font-bold text-gray-900">{formatRWF(dispute.claimAmount)}</span>
            </div>
          </div>

          {/* Decision */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Decision — In Favor Of
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "reporter",   label: "Reporter",   cls: "border-blue-500 bg-blue-50 text-blue-700"       },
                { value: "respondent", label: "Respondent", cls: "border-purple-500 bg-purple-50 text-purple-700" },
                { value: "neutral",    label: "Neutral",    cls: "border-gray-400 bg-gray-100 text-gray-700"      },
              ].map(({ value, label, cls }) => (
                <button key={value} onClick={() => setFavoredParty(value)}
                  className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                    ${favoredParty === value ? cls : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution text */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Resolution Statement *
            </label>
            <textarea
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              rows={5}
              placeholder="After reviewing evidence submitted by both parties, the InzuTrust mediation panel finds..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
            />
            <p className="text-[10px] text-gray-400 mt-1">{resolution.length} characters</p>
          </div>

          {/* Trust score impact */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <p className="font-black text-blue-800 mb-1">Trust Score Impact</p>
            {favoredParty === "reporter"   && <p>Reporter <span className="font-bold text-green-600">+5 pts</span> · Respondent <span className="font-bold text-red-600">−15 pts</span></p>}
            {favoredParty === "respondent" && <p>Reporter <span className="font-bold text-red-600">−10 pts</span> · Respondent no change</p>}
            {favoredParty === "neutral"    && <p>No trust score changes for either party.</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleResolve} disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resolving...</>
                : <><HiCheckCircle className="text-lg" /> Resolve & Close</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}