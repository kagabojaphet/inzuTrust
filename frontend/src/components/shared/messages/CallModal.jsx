// src/components/shared/messages/CallModal.jsx
// Video / Audio call modal powered by Daily.co
// Free tier: unlimited 1-on-1 calls, no signup needed for basic rooms
import React, { useState, useEffect, useRef } from "react";
import {
  HiPhone, HiVideoCamera, HiMicrophone, HiVolumeUp,
  HiX, HiExclamationCircle,
} from "react-icons/hi";
import { getInitials } from "./messageHelpers";

// ── Daily.co room URL creator ─────────────────────────────────────────────────
// Calls your backend which creates the room via Daily.co REST API
// If VITE_DAILY_API_KEY is set — you can also call Daily directly from backend
const createDailyRoom = async (token, roomName) => {
  try {
    const res  = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/calls/room`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ roomName }),
      }
    );
    const data = await res.json();
    return data.success ? data.url : null;
  } catch {
    // Fallback: construct room URL directly using your inzutrust subdomain
    return `https://inzutrust.daily.co/${roomName}`;
  }
};

// ── Ringing animation ─────────────────────────────────────────────────────────
function RingingScreen({ contact, callType, onAccept, onDecline }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Avatar */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black animate-pulse">
          {getInitials(contact.firstName, contact.lastName)}
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-30" />
      </div>

      <div className="text-center">
        <p className="text-white font-black text-xl">{contact.firstName} {contact.lastName}</p>
        <p className="text-gray-400 text-sm mt-1 capitalize">
          {callType === "video" ? "📹 Video Call" : "📞 Audio Call"} · Calling...
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-8">
        <button
          onClick={onDecline}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition active:scale-95 shadow-lg"
          title="Decline"
        >
          <HiPhone className="text-white text-2xl rotate-[135deg]" />
        </button>
        <button
          onClick={onAccept}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition active:scale-95 shadow-lg"
          title="Accept"
        >
          {callType === "video"
            ? <HiVideoCamera className="text-white text-2xl" />
            : <HiPhone className="text-white text-2xl" />}
        </button>
      </div>
    </div>
  );
}

// ── Call controls bar ─────────────────────────────────────────────────────────
function CallControls({ muted, cameraOff, onMute, onCamera, onHangUp, callType }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-5
      bg-gradient-to-t from-black/70 to-transparent">
      {/* Mute */}
      <button
        onClick={onMute}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95
          ${muted ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
        title={muted ? "Unmute" : "Mute"}
      >
        <HiMicrophone className="text-xl" />
      </button>

      {/* Camera — only for video calls */}
      {callType === "video" && (
        <button
          onClick={onCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95
            ${cameraOff ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
          title={cameraOff ? "Turn on camera" : "Turn off camera"}
        >
          <HiVideoCamera className="text-xl" />
        </button>
      )}

      {/* Hang up */}
      <button
        onClick={onHangUp}
        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition active:scale-95 shadow-lg"
        title="End call"
      >
        <HiPhone className="text-white text-2xl rotate-[135deg]" />
      </button>
    </div>
  );
}

// ── Main CallModal ────────────────────────────────────────────────────────────
export default function CallModal({ contact, callType = "video", token, onClose }) {
  const [phase,     setPhase]     = useState("ringing"); // ringing | connecting | active | ended | error
  const [roomUrl,   setRoomUrl]   = useState(null);
  const [muted,     setMuted]     = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [duration,  setDuration]  = useState(0);
  const iframeRef = useRef(null);
  const timerRef  = useRef(null);

  // ── Generate a deterministic room name from sorted user IDs ──────────────
  const roomName = `inzu-${[contact.id].sort().join("-")}`;

  // ── Accept call → create room + load iframe ───────────────────────────────
  const handleAccept = async () => {
    setPhase("connecting");
    const url = await createDailyRoom(token, roomName);
    if (!url) { setPhase("error"); return; }

    // Append audio-only param if it's a phone/audio call
    const finalUrl = callType === "audio"
      ? `${url}?startVideoOff=true`
      : url;

    setRoomUrl(finalUrl);
    setPhase("active");

    // Start call timer
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const handleHangUp = () => {
    clearInterval(timerRef.current);
    setPhase("ended");
    setTimeout(onClose, 1500);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Format timer ──────────────────────────────────────────────────────────
  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: "520px" }}>

        {/* Close button — always visible */}
        {phase !== "active" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition"
          >
            <HiX className="text-sm" />
          </button>
        )}

        {/* ── RINGING ── */}
        {phase === "ringing" && (
          <RingingScreen
            contact={contact}
            callType={callType}
            onAccept={handleAccept}
            onDecline={onClose}
          />
        )}

        {/* ── CONNECTING ── */}
        {phase === "connecting" && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900 gap-4">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-semibold">Connecting...</p>
          </div>
        )}

        {/* ── ACTIVE — Daily.co iframe ── */}
        {phase === "active" && roomUrl && (
          <div className="relative h-full bg-gray-900">
            {/* Call timer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10
              bg-black/50 text-white text-xs font-mono px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatDuration(duration)}
            </div>

            {/* Daily.co room embedded */}
            <iframe
              ref={iframeRef}
              src={roomUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-0"
              title="Call"
            />

            {/* Controls overlay */}
            <CallControls
              muted={muted}
              cameraOff={cameraOff}
              callType={callType}
              onMute={() => setMuted(m => !m)}
              onCamera={() => setCameraOff(c => !c)}
              onHangUp={handleHangUp}
            />
          </div>
        )}

        {/* ── ENDED ── */}
        {phase === "ended" && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900 gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
              <HiPhone className="text-gray-400 text-2xl rotate-[135deg]" />
            </div>
            <p className="text-white font-semibold">Call ended</p>
            <p className="text-gray-400 text-sm">{formatDuration(duration)}</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {phase === "error" && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900 gap-4">
            <HiExclamationCircle className="text-red-400 text-4xl" />
            <p className="text-white font-semibold">Couldn't create room</p>
            <p className="text-gray-400 text-sm text-center px-8">
              Make sure your backend has Daily.co configured.<br />
              See setup instructions below.
            </p>
            <button onClick={onClose}
              className="mt-2 px-5 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20 transition">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}