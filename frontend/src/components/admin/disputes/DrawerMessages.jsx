// src/components/admin/disputes/DrawerMessages.jsx
// Messages tab inside the detail drawer
import React, { useEffect, useRef, useState } from "react";
import { HiChat, HiPaperAirplane } from "react-icons/hi";
import { API_BASE } from "../../../config";
import { fmtTime } from "./disputeAdminHelpers";

export default function DrawerMessages({ dispute, token, isActive, onMessageSent }) {
  const [msg,     setMsg]     = useState("");
  const [sending, setSending] = useState(false);
  const msgEnd = useRef(null);

  const messages = dispute.messages || [];

  useEffect(() => {
    setTimeout(() => msgEnd.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages.length]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      const res  = await fetch(`${API_BASE}/disputes/${dispute.id}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ text: msg.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        onMessageSent(data.data);
        setMsg("");
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HiChat className="text-4xl text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 mt-1">Parties have not exchanged messages</p>
          </div>
        ) : (
          messages.map(m =>
            m.isSystem ? (
              <div key={m.id} className="flex justify-center py-1">
                <span className="inline-block bg-gray-100 text-gray-500 text-[10px] px-3 py-1.5 rounded-full font-medium max-w-sm text-center leading-relaxed">
                  {m.text}
                </span>
              </div>
            ) : (
              <div key={m.id} className="flex gap-2.5">
                {/* Avatar with role color */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0
                  ${m.sender?.role === "admin"    ? "bg-red-100 text-red-700"
                  : m.sender?.role === "landlord" ? "bg-purple-100 text-purple-700"
                  :                                 "bg-blue-100 text-blue-700"}`}>
                  {m.sender?.firstName?.[0]}{m.sender?.lastName?.[0]}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-gray-700">
                      {m.sender?.firstName} {m.sender?.lastName}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase
                      ${m.sender?.role === "admin"    ? "bg-red-50 text-red-600"
                      : m.sender?.role === "landlord" ? "bg-purple-50 text-purple-600"
                      :                                 "bg-blue-50 text-blue-600"}`}>
                      {m.sender?.role}
                    </span>
                    <span className="text-[9px] text-gray-300 ml-auto">{fmtTime(m.createdAt)}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl rounded-tl-sm px-3 py-2.5 text-xs text-gray-700 leading-relaxed border border-gray-100">
                    {m.text}
                  </div>
                </div>
              </div>
            )
          )
        )}
        <div ref={msgEnd} />
      </div>

      {/* Admin reply input */}
      {isActive && (
        <div className="sticky bottom-0 px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type admin note visible to all parties..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleSend}
              disabled={sending || !msg.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 shrink-0"
            >
              {sending
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <HiPaperAirplane className="text-sm -rotate-45" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
            Admin messages are visible to all parties
          </p>
        </div>
      )}
    </div>
  );
}