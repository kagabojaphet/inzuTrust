// src/components/shared/messages/ContactList.jsx
import React from "react";
import { HiSearch, HiPencilAlt } from "react-icons/hi";
import { ROLE_META, fmtTime, getInitials, isOnline } from "./messageHelpers";

// ── Avatar with online dot ────────────────────────────────────────────────────
function ContactAvatar({ contact, size = "w-10 h-10" }) {
  const initials = getInitials(contact.firstName, contact.lastName);
  const colors   = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
                    "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700"];
  const color    = colors[(contact.firstName?.charCodeAt(0) || 0) % colors.length];

  // Online if lastSeenAt was within the last 3 minutes
  const online = isOnline(contact.lastSeenAt);

  return (
    <div className="relative shrink-0">
      <div className={`${size} rounded-full ${color} flex items-center justify-center font-black text-sm`}>
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

// ── Single contact row ────────────────────────────────────────────────────────
function ContactRow({ conv, isActive, onClick }) {
  const { contact, lastMessage, unreadCount } = conv;
  const roleMeta = ROLE_META[contact.role] || ROLE_META.tenant;
  const preview  = lastMessage?.text
    ? lastMessage.text.length > 36
      ? lastMessage.text.slice(0, 36) + "..."
      : lastMessage.text
    : "Start a conversation";

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-50 transition
        ${isActive
          ? "bg-blue-50 border-l-[3px] border-l-blue-600"
          : "hover:bg-gray-50 border-l-[3px] border-l-transparent"}`}
    >
      <ContactAvatar contact={contact} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-gray-900 text-sm truncate">{contact.firstName} {contact.lastName}</span>
          <span className="text-[10px] text-gray-400 shrink-0 ml-1">
            {lastMessage ? fmtTime(lastMessage.createdAt) : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${roleMeta.badge}`}>
            {roleMeta.label}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 truncate">{preview}</p>
      </div>

      {unreadCount > 0 && (
        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-1">
          <span className="text-white text-[9px] font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ContactList({
  conversations, loading, search, setSearch,
  activeContactId, onSelect, onNewChat,
}) {
  const filtered = conversations.filter(c => {
    const name = `${c.contact.firstName} ${c.contact.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="w-64 border-r border-gray-200 flex flex-col shrink-0 bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-black text-gray-900">Messages</h3>
        <button
          onClick={onNewChat}
          className="text-gray-400 hover:text-blue-600 transition"
          title="New conversation"
        >
          <HiPencilAlt className="text-lg" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-gray-400 font-semibold">No conversations yet</p>
            <p className="text-[10px] text-gray-300 mt-1">Click the pencil icon to start one</p>
          </div>
        ) : (
          filtered.map(conv => (
            <ContactRow
              key={conv.contact.id}
              conv={conv}
              isActive={activeContactId === conv.contact.id}
              onClick={() => onSelect(conv.contact)}
            />
          ))
        )}
      </div>
    </div>
  );
}