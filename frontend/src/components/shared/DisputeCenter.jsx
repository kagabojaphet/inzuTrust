// src/components/shared/DisputeCenter.jsx
import React, { useState, useEffect } from "react";
import { HiShieldCheck } from "react-icons/hi";
import { API_BASE } from "../../config";

import DisputeSidebar    from "./dispute/DisputeSidebar";
import DisputeDetail     from "./dispute/DisputeDetail";
import CommunicationLog  from "./dispute/CommunicationLog";
import NewDisputeModal   from "./dispute/NewDisputeModal";

export default function DisputeCenter({ token, userRole = "tenant" }) {
  const [disputes,  setDisputes]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("All");
  const [search,    setSearch]    = useState("");
  const [showNew,   setShowNew]   = useState(false);
  const [message,   setMessage]   = useState("");
  const [sending,   setSending]   = useState(false);
  const [msgError,  setMsgError]  = useState("");

  // ── Fetch all ───────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/disputes/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setDisputes(list);
        if (list.length > 0 && !selected) setSelected(list[0]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Fetch one (refresh messages + evidence) ─────────────────────────────────
  const loadOne = async id => {
    try {
      const res  = await fetch(`${API_BASE}/disputes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDisputes(prev => prev.map(d => d.id === id ? data.data : d));
        setSelected(data.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { load(); }, [token]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!message.trim() || !selected) return;
    setSending(true); setMsgError("");
    try {
      const res  = await fetch(`${API_BASE}/disputes/${selected.id}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ text: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setMessage("");
      await loadOne(selected.id);
    } catch (err) { setMsgError(err.message); }
    finally { setSending(false); }
  };

  // ── After filing new dispute ─────────────────────────────────────────────────
  const handleCreated = newDispute => {
    setDisputes(prev => [newDispute, ...prev]);
    setSelected(newDispute);
    setTimeout(() => loadOne(newDispute.id), 500);
  };

  return (
    <>
      {showNew && (
        <NewDisputeModal
          token={token}
          userRole={userRole}
          onClose={() => setShowNew(false)}
          onCreated={handleCreated}
        />
      )}

      <div className="flex h-[calc(100vh-140px)] min-h-[600px] bg-[#f8f9fc] rounded-2xl overflow-hidden border border-gray-200">

        {/* Left sidebar */}
        <DisputeSidebar
          disputes={disputes}
          selected={selected}
          loading={loading}
          search={search}     setSearch={setSearch}
          filter={filter}     setFilter={setFilter}
          onSelect={d => { setSelected(d); loadOne(d.id); }}
          onRefresh={load}
          onNew={() => setShowNew(true)}
        />

        {/* Main content */}
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HiShieldCheck className="text-5xl text-gray-200 mx-auto mb-3"/>
              <p className="text-gray-500 font-semibold">
                {loading ? "Loading disputes..." : "Select a dispute or file a new one"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <DisputeDetail dispute={selected} token={token} onEvidenceUploaded={() => loadOne(selected.id)}/>
            <CommunicationLog
              dispute={selected}
              userRole={userRole}
              message={message}   setMessage={setMessage}
              onSend={handleSend}
              sending={sending}
              msgError={msgError}
            />
          </div>
        )}
      </div>
    </>
  );
}