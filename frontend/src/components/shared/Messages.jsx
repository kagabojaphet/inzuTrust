// src/components/shared/Messages.jsx
import React, { useState, useEffect, useRef } from "react";
import { HiArrowLeft, HiCalendar } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { apiGet, API_BASE_URL, getInitials, ROLE_META } from "./messages/messageHelpers";
import ContactList from "./messages/ContactList";
import ChatArea    from "./messages/ChatArea";
import RightPanel  from "./messages/RightPanel";

const POLL_INTERVAL = 8000;

// ── New Chat Modal — lives at Messages level so it works with no active contact
function NewChatModal({ contacts, loading, onSelect, onClose }) {
  const [q, setQ] = useState("");

  const filtered = contacts.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-900">New Conversation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        <div className="p-4">
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 mb-3"
          />

          <div className="space-y-1 max-h-72 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-400">Loading contacts...</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                {q ? "No contacts match your search" : "No contacts available"}
              </p>
            ) : (
              filtered.map(c => {
                const role = ROLE_META[c.role] || ROLE_META.tenant;
                const init = getInitials(c.firstName, c.lastName);
                return (
                  <button
                    key={c.id}
                    onClick={() => { onSelect(c); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                      {init}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {c.firstName} {c.lastName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${role.badge}`}>
                          {role.label}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate">{c.email}</span>
                      </div>
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

// ── Main Messages component ───────────────────────────────────────────────────
export default function Messages({ token: propToken, userRole = "tenant" }) {
  const { user, token: ctxToken } = useAuth();

  const token         = ctxToken || propToken || localStorage.getItem("inzu_token") || "";
  const currentUserId = user?.id || null;

  const [conversations,     setConversations]     = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loadingContacts,   setLoadingContacts]   = useState(false);
  const [activeContact,     setActiveContact]     = useState(null);
  const [messages,          setMessages]          = useState([]);
  const [loadingConvs,      setLoadingConvs]      = useState(true);
  const [loadingThread,     setLoadingThread]     = useState(false);
  const [search,            setSearch]            = useState("");
  const [showNewChat,       setShowNewChat]       = useState(false);

  // ── Mobile panel state: "list" | "chat" | "right" ────────────────────────
  const [mobilePanel, setMobilePanel] = useState("list");

  const pollRef = useRef(null);

  // ── Load conversations ────────────────────────────────────────────────────
  const loadConversations = async () => {
    if (!token) return;
    try {
      const data = await apiGet(`${API_BASE_URL}/messages/conversations`, token);
      if (data.success) setConversations(data.data || []);
    } catch (err) {
      console.error("[Messages] conversations error:", err.message);
    } finally {
      setLoadingConvs(false);
    }
  };

  // ── Load available contacts for new chat modal ────────────────────────────
  const loadAvailableContacts = async () => {
    if (!token) return;
    setLoadingContacts(true);
    try {
      const data = await apiGet(`${API_BASE_URL}/messages/contacts/available`, token);
      if (data.success) {
        setAvailableContacts(data.data || []);
      }
    } catch (err) {
      console.error("[Messages] contacts error:", err.message);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadConversations();
    loadAvailableContacts();
  }, [token]);

  // ── Open new chat modal ───────────────────────────────────────────────────
  const handleOpenNewChat = () => {
    loadAvailableContacts();
    setShowNewChat(true);
  };

  // ── Load thread ───────────────────────────────────────────────────────────
  const loadThread = async (contactId, showLoader = true) => {
    if (!contactId || !token) return;
    if (showLoader) setLoadingThread(true);
    try {
      const data = await apiGet(`${API_BASE_URL}/messages/${contactId}`, token);
      if (data.success) {
        setMessages(data.data || []);
        setConversations(prev =>
          prev.map(c => c.contact.id === contactId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (err) {
      console.error("[Messages] thread error:", err.message);
    } finally {
      if (showLoader) setLoadingThread(false);
    }
  };

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeContact) { setMessages([]); return; }

    loadThread(activeContact.id);
    pollRef.current = setInterval(() => loadThread(activeContact.id, false), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [activeContact?.id]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    setMessages([]);
    // On mobile: selecting a contact takes you to chat panel
    setMobilePanel("chat");
  };

  const handleNewChatSelect = (contact) => {
    setActiveContact(contact);
    setMessages([]);
    setShowNewChat(false);
    setMobilePanel("chat");
    const exists = conversations.some(c => c.contact.id === contact.id);
    if (!exists) {
      setConversations(prev => [
        { contact, lastMessage: null, unreadCount: 0, updatedAt: new Date() },
        ...prev,
      ]);
    }
  };

  const handleMessageSent = (newMsg) => {
    setMessages(prev => [...prev, newMsg]);
    setConversations(prev =>
      prev.map(c =>
        c.contact.id === activeContact?.id
          ? { ...c, lastMessage: newMsg, updatedAt: newMsg.createdAt }
          : c
      )
    );
    loadConversations();
  };

  // ── Inject a back button into ChatArea on mobile via wrapper ─────────────
  // We wrap ChatArea in a div that controls visibility per panel on mobile.

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: "680px" }}>

      {showNewChat && (
        <NewChatModal
          contacts={availableContacts}
          loading={loadingContacts}
          onSelect={handleNewChatSelect}
          onClose={() => setShowNewChat(false)}
        />
      )}

      {/*
        Desktop: flex row — all 3 panels visible side by side (unchanged)
        Mobile:  only one panel visible at a time, controlled by mobilePanel state
      */}
      <div className="flex h-full">

        {/* ── LEFT: Contact list ── */}
        {/*
          Desktop: always visible (w-64 shrink-0)
          Mobile:  visible only when mobilePanel === "list"
        */}
        <div className={`
          border-r border-gray-200 flex flex-col bg-white shrink-0
          w-full md:w-64
          ${mobilePanel === "list" ? "flex" : "hidden"} md:flex
        `}>
          <ContactList
            conversations={conversations}
            loading={loadingConvs}
            search={search}
            setSearch={setSearch}
            activeContactId={activeContact?.id}
            onSelect={handleSelectContact}
            onNewChat={handleOpenNewChat}
          />
        </div>

        {/* ── MIDDLE: Chat area ── */}
        {/*
          Desktop: flex-1 (always visible)
          Mobile:  visible only when mobilePanel === "chat"
        */}
        <div className={`
          flex-1 flex flex-col min-w-0
          ${mobilePanel === "chat" ? "flex" : "hidden"} md:flex
        `}>
          {/* Mobile back button — sits above ChatArea, only on mobile */}
          {activeContact && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white md:hidden shrink-0">
              <button
                onClick={() => setMobilePanel("list")}
                className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
              >
                <HiArrowLeft className="text-base"/> Back
              </button>
              {/* Book a Call shortcut — opens right panel on mobile */}
              <button
                onClick={() => setMobilePanel("right")}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-1.5 rounded-xl transition"
              >
                <HiCalendar className="text-sm"/> Book Call
              </button>
            </div>
          )}

          <ChatArea
            contact={activeContact}
            messages={messages}
            loadingThread={loadingThread}
            token={token}
            currentUserId={currentUserId}
            onMessageSent={handleMessageSent}
            onCallClick={(type) => console.log("call:", type)}
            onInfoClick={() => {}}
            availableContacts={availableContacts}
            showNewChat={false}
            onCloseNewChat={() => {}}
            onNewChatSelect={handleNewChatSelect}
          />
        </div>

        {/* ── RIGHT: RightPanel (Book a Call) ── */}
        {/*
          Desktop: always visible (w-64 shrink-0)
          Mobile:  visible only when mobilePanel === "right"
        */}
        <div className={`
          border-l border-gray-100 bg-white shrink-0
          w-full md:w-64
          ${mobilePanel === "right" ? "flex flex-col" : "hidden"} md:flex md:flex-col
        `}>
          {/* Mobile back button for right panel */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 md:hidden shrink-0">
            <button
              onClick={() => setMobilePanel("chat")}
              className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
            >
              <HiArrowLeft className="text-base"/> Back to Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <RightPanel
              contact={activeContact}
              token={token}
              currentUserId={currentUserId}
              onJoinCall={() => {}}
            />
          </div>
        </div>

      </div>
    </div>
  );
}