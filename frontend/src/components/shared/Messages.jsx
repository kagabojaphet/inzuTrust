// src/components/shared/Messages.jsx
// Main messages page — used across Tenant, Landlord, and Admin dashboards
// Props: token (string), userRole ("tenant"|"landlord"|"admin")
// currentUserId is read directly from AuthContext — no need to pass it as prop
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, API_BASE_URL } from "./messages/messageHelpers";
import ContactList from "./messages/ContactList";
import ChatArea    from "./messages/ChatArea";
import RightPanel  from "./messages/RightPanel";

const POLL_INTERVAL = 8000; // refresh thread every 8s

export default function Messages({ token: propToken, userRole = "tenant" }) {
  // ── Get auth from context — this is the reliable source ──────────────────
  const { user, token: ctxToken } = useAuth();

  // Use context token first, fall back to prop token
  const token = ctxToken || propToken || localStorage.getItem("inzu_token") || "";

  // currentUserId — the logged-in user's ID used to determine blue/white bubbles
  const currentUserId = user?.id || null;

  const [conversations,     setConversations]     = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [activeContact,     setActiveContact]     = useState(null);
  const [messages,          setMessages]          = useState([]);
  const [loadingConvs,      setLoadingConvs]      = useState(true);
  const [loadingThread,     setLoadingThread]     = useState(false);
  const [search,            setSearch]            = useState("");
  const [showNewChat,       setShowNewChat]       = useState(false);

  const pollRef = useRef(null);

  // Debug — remove after confirming it works
  useEffect(() => {
    console.log("[Messages] currentUserId:", currentUserId);
    console.log("[Messages] token present:", !!token);
  }, [currentUserId, token]);

  // ── Load conversations list ───────────────────────────────────────────────
  const loadConversations = async () => {
    if (!token) return;
    try {
      const data = await apiGet(`${API_BASE_URL}/messages/conversations`, token);
      if (data.success) setConversations(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingConvs(false); }
  };

  // ── Load available contacts (for new chat modal) ──────────────────────────
  const loadAvailableContacts = async () => {
    if (!token) return;
    try {
      const data = await apiGet(`${API_BASE_URL}/messages/contacts/available`, token);
      if (data.success) setAvailableContacts(data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadConversations();
    loadAvailableContacts();
  }, [token]);

  // ── Load thread when contact changes ─────────────────────────────────────
  const loadThread = async (contactId, showLoader = true) => {
    if (!contactId || !token) return;
    if (showLoader) setLoadingThread(true);
    try {
      const data = await apiGet(`${API_BASE_URL}/messages/${contactId}`, token);
      if (data.success) {
        setMessages(data.data || []);
        setConversations(prev =>
          prev.map(c =>
            c.contact.id === contactId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (err) { console.error(err); }
    finally { if (showLoader) setLoadingThread(false); }
  };

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeContact) { setMessages([]); return; }

    loadThread(activeContact.id);

    pollRef.current = setInterval(() => {
      loadThread(activeContact.id, false);
    }, POLL_INTERVAL);

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
    setConversations(prev => prev.map(c =>
      c.contact.id === activeContact?.id
        ? { ...c, lastMessage: newMsg, updatedAt: newMsg.createdAt }
        : c
    ));
  };

  const handleScheduleCall = async ({ day, slot, type }) => {
    if (!activeContact || !token) return;
    const text = `📅 Scheduling a ${type} on day ${day} at ${slot}. Please confirm if this works for you.`;
    try {
      const res  = await fetch(`${API_BASE_URL}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ receiverId: activeContact.id, text, type: "text" }),
      });
      const data = await res.json();
      if (data.success) handleMessageSent(data.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex"
      style={{ height: "680px" }}
    >
      <ContactList
        conversations={conversations}
        loading={loadingConvs}
        search={search}
        setSearch={setSearch}
        activeContactId={activeContact?.id}
        onSelect={handleSelectContact}
        onNewChat={() => setShowNewChat(true)}
      />

      <ChatArea
        contact={activeContact}
        messages={messages}
        loadingThread={loadingThread}
        token={token}
        currentUserId={currentUserId}   // ← from useAuth(), always reliable
        onMessageSent={handleMessageSent}
        onCallClick={(type) => console.log("call:", type)}
        onInfoClick={() => {}}
        availableContacts={availableContacts}
        showNewChat={showNewChat}
        onCloseNewChat={() => setShowNewChat(false)}
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