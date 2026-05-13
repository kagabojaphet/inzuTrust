// src/components/shared/DisputeCenter.jsx

import React, { useState, useEffect } from "react";
import {
  HiShieldCheck,
  HiMenuAlt2,
  HiChatAlt2,
  HiClipboardList,
} from "react-icons/hi";

import { API_BASE } from "../../config";

import DisputeSidebar from "./dispute/DisputeSidebar";
import DisputeDetail from "./dispute/DisputeDetail";
import CommunicationLog from "./dispute/CommunicationLog";
import NewDisputeModal from "./dispute/NewDisputeModal";

export default function DisputeCenter({
  token,
  userRole = "tenant",
}) {
  const [disputes, setDisputes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showNew, setShowNew] = useState(false);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msgError, setMsgError] = useState("");

  // MOBILE PANELS
  const [mobilePanel, setMobilePanel] = useState("sidebar");

  // ─────────────────────────────────────────────────────────────
  // FETCH ALL
  // ─────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/disputes/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const list = data.data || [];

        setDisputes(list);

        if (list.length > 0 && !selected) {
          setSelected(list[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FETCH SINGLE
  // ─────────────────────────────────────────────────────────────
  const loadOne = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/disputes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setDisputes((prev) =>
          prev.map((d) => (d.id === id ? data.data : d))
        );

        setSelected(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  // ─────────────────────────────────────────────────────────────
  // SEND MESSAGE
  // ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!message.trim() || !selected) return;

    setSending(true);
    setMsgError("");

    try {
      const res = await fetch(
        `${API_BASE}/disputes/${selected.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: message.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send");
      }

      setMessage("");

      await loadOne(selected.id);
    } catch (err) {
      setMsgError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // CREATED
  // ─────────────────────────────────────────────────────────────
  const handleCreated = (newDispute) => {
    setDisputes((prev) => [newDispute, ...prev]);

    setSelected(newDispute);

    setMobilePanel("details");

    setTimeout(() => {
      loadOne(newDispute.id);
    }, 500);
  };

  // ─────────────────────────────────────────────────────────────
  // SELECT DISPUTE
  // ─────────────────────────────────────────────────────────────
  const handleSelectDispute = async (d) => {
    setSelected(d);

    await loadOne(d.id);

    setMobilePanel("details");
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

      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] min-h-[600px] bg-[#f8f9fc] rounded-2xl overflow-hidden border border-gray-200">

        {/* MOBILE TOP NAV */}
        <div className="lg:hidden border-b border-gray-200 bg-white px-3 py-2 flex items-center justify-between">
          <button
            onClick={() => setMobilePanel("sidebar")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
              mobilePanel === "sidebar"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <HiMenuAlt2 className="text-base" />
            Disputes
          </button>

          <button
            onClick={() => setMobilePanel("details")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
              mobilePanel === "details"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <HiClipboardList className="text-base" />
            Details
          </button>

          <button
            onClick={() => setMobilePanel("messages")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
              mobilePanel === "messages"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <HiChatAlt2 className="text-base" />
            Messages
          </button>
        </div>

        {/* SIDEBAR */}
        <div
          className={`
            ${
              mobilePanel === "sidebar"
                ? "flex"
                : "hidden"
            }
            lg:flex
            w-full
            lg:w-auto
            min-h-[500px]
          `}
        >
          <DisputeSidebar
            disputes={disputes}
            selected={selected}
            loading={loading}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            onSelect={handleSelectDispute}
            onRefresh={load}
            onNew={() => setShowNew(true)}
          />
        </div>

        {/* EMPTY STATE */}
        {!selected ? (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center">
              <HiShieldCheck className="text-5xl text-gray-200 mx-auto mb-3" />

              <p className="text-gray-500 font-semibold">
                {loading
                  ? "Loading disputes..."
                  : "Select a dispute or file a new one"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* DETAILS */}
            <div
              className={`
                ${
                  mobilePanel === "details"
                    ? "flex"
                    : "hidden"
                }
                lg:flex
                flex-1
                overflow-hidden
                min-h-[500px]
              `}
            >
              <DisputeDetail
                dispute={selected}
                token={token}
                onEvidenceUploaded={() =>
                  loadOne(selected.id)
                }
              />
            </div>

            {/* MESSAGES */}
            <div
              className={`
                ${
                  mobilePanel === "messages"
                    ? "flex"
                    : "hidden"
                }
                lg:flex
                w-full
                lg:w-auto
                min-h-[500px]
              `}
            >
              <CommunicationLog
                dispute={selected}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
                onSend={handleSend}
                sending={sending}
                msgError={msgError}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}