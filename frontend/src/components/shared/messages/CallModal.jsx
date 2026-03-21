// src/components/shared/messages/CallModal.jsx
// Video / Audio call powered by Jitsi Meet (meet.jit.si)
// ✅ 100% free — no account, no API key, no credit card, ever
// ✅ Works perfectly on localhost and production
import React, { useState, useEffect, useRef } from "react";
import { HiPhone, HiVideoCamera, HiX } from "react-icons/hi";
import { getInitials } from "./messageHelpers";

// ── Deterministic room name from both user IDs ────────────────────────────────
// Sorted so both users always join the SAME room regardless of who calls first
const getRoomName = (myId, contactId) => {
  const sorted = [myId || "a", contactId || "b"].sort().join("");
  return `inzutrust-${sorted.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40)}`;
};

// ── Ringing animation ─────────────────────────────────────────────────────────
function RingingScreen({ contact, callType, onAccept, onDecline }) {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % 3), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6"
      style={{ background: "linear-gradient(160deg,#1e293b 0%,#0f172a 100%)" }}>

      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center">
        {[80, 108, 136].map((size, i) => (
          <div key={i} className="absolute rounded-full border-2 border-blue-400/25 animate-ping"
            style={{ width: size, height: size, animationDelay: `${i * 0.25}s`, animationDuration: "1.6s" }} />
        ))}
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-black z-10 shadow-2xl">
          {getInitials(contact.firstName, contact.lastName)}
        </div>
      </div>

      <div className="text-center">
        <p className="text-white font-black text-xl">{contact.firstName} {contact.lastName}</p>
        <p className="text-blue-300 text-sm mt-1 flex items-center justify-center gap-1.5">
          {callType === "video" ? "📹 Video Call" : "📞 Audio Call"} · Calling
          {[0,1,2].map(i => (
            <span key={i} className={`w-1 h-1 rounded-full bg-blue-300 transition-all duration-300 ${dot === i ? "opacity-100" : "opacity-20"}`} />
          ))}
        </p>
      </div>

      <div className="flex items-center gap-12 mt-2">
        <div className="flex flex-col items-center gap-2">
          <button onClick={onDecline}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition active:scale-90 shadow-lg">
            <HiPhone className="text-white text-2xl rotate-[135deg]" />
          </button>
          <span className="text-gray-400 text-xs">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={onAccept}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition active:scale-90 shadow-lg">
            {callType === "video" ? <HiVideoCamera className="text-white text-2xl" /> : <HiPhone className="text-white text-2xl" />}
          </button>
          <span className="text-gray-400 text-xs">Accept</span>
        </div>
      </div>
    </div>
  );
}

// ── Call timer formatter ──────────────────────────────────────────────────────
const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

// ── Main CallModal ────────────────────────────────────────────────────────────
export default function CallModal({ contact, callType = "video", currentUserId, onClose }) {
  const [phase,    setPhase]    = useState("ringing"); // ringing | active | ended
  const [roomUrl,  setRoomUrl]  = useState(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  const roomName = getRoomName(currentUserId, contact.id);

  const handleAccept = () => {
    // Build Jitsi URL with config flags in the hash
    const flags = [
      "config.prejoinPageEnabled=false",              // skip pre-join waiting room
      "config.disableDeepLinking=true",               // no "open in app" prompt
      "config.hideConferenceSubject=true",
      "config.startWithAudioMuted=false",
      `config.startWithVideoMuted=${callType === "audio"}`, // audio-only call = no camera
      // Minimal toolbar: mic, camera, hang up, fullscreen
      `config.toolbarButtons=["microphone","camera","hangup","fullscreen"]`,
    ].join("&");

    setRoomUrl(`https://meet.jit.si/${roomName}#${flags}`);
    setPhase("active");
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const handleHangUp = () => {
    clearInterval(timerRef.current);
    setPhase("ended");
    setTimeout(onClose, 2000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ height: 540 }}>

        {/* Close button — hide during active call (use Jitsi's own hang-up) */}
        {phase !== "active" && (
          <button onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition">
            <HiX className="text-sm" />
          </button>
        )}

        {/* ── RINGING ── */}
        {phase === "ringing" && (
          <RingingScreen contact={contact} callType={callType} onAccept={handleAccept} onDecline={onClose} />
        )}

        {/* ── ACTIVE — Jitsi Meet iframe ── */}
        {phase === "active" && roomUrl && (
          <div className="relative h-full bg-gray-900">
            {/* Timer overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-mono px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {fmt(duration)}
            </div>

            {/* Jitsi handles camera, mic, UI — no extra setup needed */}
            <iframe
              src={roomUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              className="w-full h-full border-0"
              title={`${callType} call with ${contact.firstName}`}
            />

            {/* Our end-call button */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
              <button onClick={handleHangUp}
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition active:scale-90 shadow-lg" title="End call">
                <HiPhone className="text-white text-xl rotate-[135deg]" />
              </button>
            </div>
          </div>
        )}

        {/* ── ENDED ── */}
        {phase === "ended" && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900 gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
              <HiPhone className="text-gray-400 text-2xl rotate-[135deg]" />
            </div>
            <p className="text-white font-semibold">Call ended</p>
            <p className="text-gray-400 text-sm">{fmt(duration)}</p>
          </div>
        )}
      </div>
    </div>
  );
}