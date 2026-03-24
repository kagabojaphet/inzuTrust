// src/components/shared/messages/ChatArea.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  HiPaperAirplane, HiPlus, HiEmojiHappy,
  HiVideoCamera, HiPhone, HiInformationCircle,
  HiCheck, HiCheckCircle, HiTranslate, HiCalendar,
  HiDocumentText, HiCreditCard, HiFlag,
} from "react-icons/hi";
import { ROLE_META, MSG_TYPE_META, fmtTime, fmtDateLabel, getInitials, apiPost, API_BASE_URL, isOnline } from "./messageHelpers";
import EmojiPicker from "./EmojiPicker";
import CallModal   from "./CallModal";

// ── Avatar helper ─────────────────────────────────────────────────────────────
function MiniAvatar({ user }) {
  const initials = getInitials(user?.firstName, user?.lastName);
  const colors   = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
                    "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700"];
  const color    = colors[(user?.firstName?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center font-black text-[10px] shrink-0`}>
      {initials}
    </div>
  );
}

// ── Date separator ────────────────────────────────────────────────────────────
function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── Reference card (lease_draft / payment_request) ────────────────────────────
function ReferenceCard({ msg }) {
  const meta = MSG_TYPE_META[msg.type] || {};
  if (!meta.icon) return null;

  const colorMap = {
    blue:  { bg: "bg-blue-50",  border: "border-blue-200",  icon: "bg-blue-100 text-blue-600",  text: "text-blue-700"  },
    amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "bg-amber-100 text-amber-600",text: "text-amber-700" },
  };
  const c = colorMap[meta.color] || colorMap.blue;

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-3 max-w-xs`}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7 h-7 ${c.icon} rounded-lg flex items-center justify-center text-sm`}>
          {msg.type === "lease_draft"     && <HiDocumentText />}
          {msg.type === "payment_request" && <HiCreditCard />}
        </div>
        <div>
          <p className={`font-bold text-xs ${c.text}`}>{meta.label}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{msg.text}</p>
        </div>
      </div>
    </div>
  );
}

// ── Read receipt ticks ────────────────────────────────────────────────────────
function ReadReceipt({ isRead }) {
  if (isRead) {
    // Double blue ticks — read
    return (
      <span className="flex items-center shrink-0" title="Read">
        <HiCheck className="text-blue-400 text-xs -mr-1.5" />
        <HiCheck className="text-blue-400 text-xs" />
      </span>
    );
  }
  // Single grey tick — sent but not read
  return <HiCheck className="text-gray-300 text-xs shrink-0" title="Sent" />;
}

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg, contact, currentUserId }) {
  const isMe   = msg.senderId === currentUserId;
  const hasRef = msg.type && msg.type !== "text" && msg.type !== "system";

  // Debug — remove after confirming blue/white is correct
  // console.log("[Bubble] senderId:", msg.senderId, "| currentUserId:", currentUserId, "| isMe:", isMe);

  // System notice — centered pill
  if (msg.type === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar — only for the other person, on the LEFT */}
      {!isMe && (
        <div className="relative shrink-0">
          <MiniAvatar user={contact} />
          {isOnline(contact?.lastSeenAt) && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
          )}
        </div>
      )}

      {/* Bubble + meta */}
      <div className={`max-w-[72%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {hasRef ? (
          <ReferenceCard msg={msg} />
        ) : (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
            isMe
              ? "bg-blue-600 text-white rounded-br-sm"          // MY messages: blue, bottom-right flush
              : "bg-white text-gray-900 rounded-bl-sm border border-gray-200 shadow-sm" // THEIR messages: white, bottom-left flush
          }`}>
            {msg.text}
          </div>
        )}

        {/* Time + read receipt */}
        <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-gray-400">{fmtTime(msg.createdAt)}</span>
          {/* Read receipt only on MY sent messages */}
          {isMe && <ReadReceipt isRead={msg.isRead} />}
        </div>
      </div>
    </div>
  );
}

// ── New contact modal ─────────────────────────────────────────────────────────
function NewChatModal({ availableContacts, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const filtered  = availableContacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-900">New Conversation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
        </div>
        <div className="p-4">
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search people..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 mb-3"
          />
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No contacts found</p>
            ) : (
              filtered.map(c => {
                const role = ROLE_META[c.role] || ROLE_META.tenant;
                return (
                  <button key={c.id} onClick={() => { onSelect(c); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                      {getInitials(c.firstName, c.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.firstName} {c.lastName}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${role.badge}`}>
                        {role.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ChatArea({
  contact, messages, loadingThread,
  token, currentUserId,
  onMessageSent, onCallClick, onInfoClick,
  availableContacts, showNewChat, onCloseNewChat, onNewChatSelect,
}) {
  const [input,      setInput]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [activeCall, setActiveCall] = useState(null); // null | "video" | "audio"
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, contact?.id]);

  const handleSend = async () => {
    if (!input.trim() || !contact || sending) return;
    setSending(true);
    try {
      const data = await apiPost(
        `${API_BASE_URL}/messages`,
        { receiverId: contact.id, text: input.trim(), type: "text" },
        token
      );
      if (data.success) {
        onMessageSent(data.data);
        setInput("");
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleQuickChip = async (type, label) => {
    if (!contact) return;
    const text = type === "lease_draft"
      ? "Please check your Agreements tab to review and sign your lease."
      : type === "payment_request"
      ? "Your rent payment is due. Please complete payment via MTN MoMo or Airtel Money."
      : "I would like to report an issue with this property.";

    const data = await apiPost(
      `${API_BASE_URL}/messages`,
      { receiverId: contact.id, text, type },
      token
    );
    if (data.success) onMessageSent(data.data);
  };

  // ── Insert emoji at cursor position ────────────────────────────────────────
  const handleEmojiSelect = (emoji) => {
    const el    = inputRef.current;
    if (!el) {
      setInput(prev => prev + emoji);
      return;
    }
    const start = el.selectionStart ?? input.length;
    const end   = el.selectionEnd   ?? input.length;
    const newVal = input.slice(0, start) + emoji + input.slice(end);
    setInput(newVal);
    // Restore cursor after the inserted emoji
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };
  const grouped = [];
  let lastLabel  = null;
  messages.forEach(msg => {
    const label = fmtDateLabel(msg.createdAt);
    if (label !== lastLabel) {
      grouped.push({ type: "separator", label });
      lastLabel = label;
    }
    grouped.push({ type: "message", msg });
  });

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/30 border-r border-gray-200">
        <div className="text-center">
          <div className="text-5xl mb-3">💬</div>
          <p className="font-semibold text-gray-400 text-sm">Select a conversation</p>
          <p className="text-xs text-gray-300 mt-1">or start a new one</p>
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_META[contact.role] || ROLE_META.tenant;

  return (
    <>
      {showNewChat && (
        <NewChatModal
          availableContacts={availableContacts}
          onSelect={onNewChatSelect}
          onClose={onCloseNewChat}
        />
      )}

      {/* ── Call modal ── */}
      {activeCall && contact && (
        <CallModal
          contact={contact}
          callType={activeCall}
          currentUserId={currentUserId}
          onClose={() => setActiveCall(null)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">

        {/* Chat header */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar with online dot */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                {getInitials(contact.firstName, contact.lastName)}
              </div>
              {isOnline(contact.lastSeenAt) && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 text-sm">{contact.firstName} {contact.lastName}</p>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${roleMeta.badge}`}>
                  {roleMeta.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isOnline(contact.lastSeenAt) && (
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                )}
                <p className="text-xs text-gray-400">
                  {isOnline(contact.lastSeenAt) ? "Online" : contact.email}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <button
              onClick={() => setActiveCall("video")}
              className="hover:text-gray-700 transition"
              title="Video call"
            >
              <HiVideoCamera className="text-lg" />
            </button>
            <button
              onClick={() => setActiveCall("audio")}
              className="hover:text-gray-700 transition"
              title="Audio call"
            >
              <HiPhone className="text-lg" />
            </button>
            <button onClick={onInfoClick} className="hover:text-gray-700 transition" title="Info">
              <HiInformationCircle className="text-lg" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/30">
          {loadingThread ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-semibold text-gray-300">No messages yet</p>
              <p className="text-xs text-gray-300 mt-1">Send the first message below</p>
            </div>
          ) : (
            grouped.map((item, i) =>
              item.type === "separator" ? (
                <DateSeparator key={`sep-${i}`} label={item.label} />
              ) : (
                <MessageBubble
                  key={item.msg.id}
                  msg={item.msg}
                  contact={contact}
                  currentUserId={currentUserId}
                />
              )
            )
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick chips */}
        <div className="px-5 py-2 border-t border-gray-100 flex items-center gap-2 flex-wrap bg-white shrink-0">
          {[
            { type: "lease_draft",     icon: <HiDocumentText className="text-xs" />, label: "Send Lease Draft"   },
            { type: "payment_request", icon: <HiCreditCard   className="text-xs" />, label: "Request Payment"   },
            { type: "text",            icon: <HiFlag         className="text-xs" />, label: "Report Issue"      },
          ].map((chip, i) => (
            <button key={i}
              onClick={() => handleQuickChip(chip.type, chip.label)}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition font-medium">
              {chip.icon} {chip.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
          <div className="relative flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">

            {/* Emoji picker — renders above the input bar */}
            {showEmoji && (
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmoji(false)}
              />
            )}

            <button className="text-gray-400 hover:text-gray-600 transition shrink-0">
              <HiPlus className="text-lg" />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 py-1"
            />
            <button
              onClick={() => setShowEmoji(prev => !prev)}
              className={`transition shrink-0 ${showEmoji ? "text-blue-500" : "text-gray-400 hover:text-gray-600"}`}
              title="Emoji"
            >
              <HiEmojiHappy className="text-lg" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                input.trim() && !sending
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {sending
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <HiPaperAirplane className="rotate-90 text-sm" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}