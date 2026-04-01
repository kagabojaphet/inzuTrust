// src/components/shared/Messages.jsx
import React, { useState, useEffect, useRef } from "react";
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
        console.log(`[Messages] available contacts loaded: ${data.data?.length}`);
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
    // Reload contacts fresh every time modal opens
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
  };

  const handleNewChatSelect = (contact) => {
    setActiveContact(contact);
    setMessages([]);
    setShowNewChat(false);
    // Add to conversations list if not already there
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
    // Reload conversations to ensure sidebar is up to date
    loadConversations();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex" style={{ height: "680px" }}>

      {/* New Chat Modal — rendered at this level so it works even with no active contact */}
      {showNewChat && (
        <NewChatModal
          contacts={availableContacts}
          loading={loadingContacts}
          onSelect={handleNewChatSelect}
          onClose={() => setShowNewChat(false)}
        />
      )}

      <ContactList
        conversations={conversations}
        loading={loadingConvs}
        search={search}
        setSearch={setSearch}
        activeContactId={activeContact?.id}
        onSelect={handleSelectContact}
        onNewChat={handleOpenNewChat}
      />

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
        showNewChat={false}           // ← modal is now handled at Messages level
        onCloseNewChat={() => {}}
        onNewChatSelect={handleNewChatSelect}
      />

      <RightPanel
        contact={activeContact}
        token={token}
        currentUserId={currentUserId}
        onJoinCall={() => {}}
      />
    </div>
  );
}