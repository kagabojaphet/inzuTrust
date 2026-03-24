// src/components/shared/dispute/CommunicationLog.jsx
import React, { useRef, useEffect } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { mapStatus, fmtTime } from "./disputeHelpers";

export default function CommunicationLog({
  dispute: sel, userRole,
  message, setMessage,
  onSend, sending, msgError,
}) {
  const endRef = useRef(null);
  const status = mapStatus(sel.status);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sel.messages]);

  const isClosed = status === "Resolved" || status === "Closed";

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-black text-gray-900">Communication Log</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
          isClosed ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
        }`}>
          {isClosed ? "Read-Only" : "Active"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(sel.messages || []).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          (sel.messages || []).map((m, i) => {
            if (m.isSystem) {
              return (
                <div key={i} className="text-center">
                  <span className="text-[9px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    System: {m.text}
                  </span>
                </div>
              );
            }

            const selfMsg  = m.sender?.role === userRole;
            const initials = m.sender
              ? `${m.sender.firstName?.[0] || ""}${m.sender.lastName?.[0] || ""}`.toUpperCase()
              : "?";
            const name     = m.sender
              ? `${m.sender.firstName} ${m.sender.lastName}`
              : "Unknown";

            return (
              <div key={i} className={`flex gap-2.5 ${selfMsg ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  selfMsg ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {initials}
                </div>
                <div className={`max-w-[80%] flex flex-col ${selfMsg ? "items-end" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-[10px] font-bold text-gray-500 ${selfMsg ? "order-last" : ""}`}>
                      {selfMsg ? `You (${userRole})` : name}
                    </p>
                    <p className="text-[9px] text-gray-400">{fmtTime(m.createdAt)}</p>
                  </div>
                  <div className={`text-xs rounded-2xl px-3 py-2 leading-relaxed ${
                    selfMsg
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      {!isClosed ? (
        <div className="p-3 border-t border-gray-100">
          {msgError && <p className="text-[10px] text-red-500 mb-1.5">{msgError}</p>}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
            />
            <button
              onClick={onSend}
              disabled={sending || !message.trim()}
              className="text-blue-500 hover:text-blue-700 transition disabled:opacity-40"
            >
              {sending
                ? <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"/>
                : <HiPaperAirplane className="text-sm"/>
              }
            </button>
          </div>
          {status === "Review" && (
            <p className="text-[9px] text-gray-400 text-center mt-1.5">
              Messaging is currently paused during Review phase.
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">This dispute has been resolved.</p>
        </div>
      )}
    </div>
  );
}