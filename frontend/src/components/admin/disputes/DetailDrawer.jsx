// src/components/admin/disputes/DetailDrawer.jsx
// Right-side drawer — fetches full dispute data, renders 3 tabs + footer actions
import React, { useState, useEffect } from "react";
import {
  HiX, HiArrowRight, HiScale,
  HiDocumentText, HiChat, HiPhotograph,
} from "react-icons/hi";
import { API_BASE } from "../../../config";
import { StatusBadge }   from "./DisputeAtoms";
import { STAGE_LABELS }  from "./disputeAdminHelpers";
import DrawerDetails  from "./DrawerDetails";
import DrawerMessages from "./DrawerMessages";
import DrawerEvidence from "./DrawerEvidence";
import ResolveModal   from "./ResolveModal";

export default function DetailDrawer({ disputeId, token, onClose, onAdvanced, onResolved }) {
  const [dispute,     setDispute]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [advancing,   setAdvancing]   = useState(false);
  const [tab,         setTab]         = useState("details");
  const [showResolve, setShowResolve] = useState(false);
  const [fetchError,  setFetchError]  = useState("");

  // ── Fetch full dispute (messages + evidence included) ──────────────────────
  const fetchFull = async () => {
    setLoading(true); setFetchError("");
    try {
      const res  = await fetch(`${API_BASE}/disputes/${disputeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load dispute");
      setDispute(data.data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFull(); }, [disputeId]);

  // ── Advance stage ──────────────────────────────────────────────────────────
  const handleAdvance = async () => {
    if (!dispute || !window.confirm(`Advance "${dispute.docId}" to next stage?`)) return;
    setAdvancing(true);
    try {
      const res  = await fetch(`${API_BASE}/disputes/${dispute.id}/stage`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onAdvanced(data.data);
      await fetchFull();
    } catch (err) {
      alert(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  // ── Append new message locally ─────────────────────────────────────────────
  const handleMessageSent = (newMsg) => {
    setDispute(prev => ({ ...prev, messages: [...(prev.messages || []), newMsg] }));
  };

  const isActive   = dispute && dispute.status !== "closed" && dispute.status !== "resolved";
  const msgCount   = dispute?.messages?.length  || 0;
  const evCount    = dispute?.evidence?.length   || 0;
  const nextStage  = Math.min((dispute?.stage ?? 0) + 1, 3);

  const tabs = [
    { id: "details",  label: "Details",                  icon: HiDocumentText },
    { id: "messages", label: `Messages (${msgCount})`,   icon: HiChat         },
    { id: "evidence", label: `Evidence (${evCount})`,    icon: HiPhotograph   },
  ];

  return (
    <>
      {showResolve && dispute && (
        <ResolveModal
          dispute={dispute}
          token={token}
          onClose={() => setShowResolve(false)}
          onResolved={(updated) => { onResolved(updated); onClose(); }}
        />
      )}

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[560px] bg-white z-40 flex flex-col shadow-2xl border-l border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading dispute...</p>
            </div>
          ) : dispute ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-blue-600 text-sm">{dispute.docId}</span>
                <StatusBadge status={dispute.status} />
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate max-w-[380px]">
                {dispute.title}
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-500">{fetchError}</p>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition shrink-0"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Loading / error states */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : !dispute ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm px-6 text-center">
            {fetchError}
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-2 shrink-0">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all
                    ${tab === id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  <Icon className="text-sm" /> {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {tab === "details"  && <DrawerDetails  dispute={dispute} />}
              {tab === "messages" && (
                <DrawerMessages
                  dispute={dispute}
                  token={token}
                  isActive={isActive}
                  onMessageSent={handleMessageSent}
                />
              )}
              {tab === "evidence" && <DrawerEvidence evidence={dispute.evidence} />}
            </div>

            {/* Footer action */}
            {isActive && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                {dispute.stage < 3 ? (
                  <button onClick={handleAdvance} disabled={advancing}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                    {advancing
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><HiArrowRight /> Advance to "{STAGE_LABELS[nextStage]}"</>}
                  </button>
                ) : (
                  <button onClick={() => setShowResolve(true)}
                    className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <HiScale /> Resolve & Close Dispute
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}