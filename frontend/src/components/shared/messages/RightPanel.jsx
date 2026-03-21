// src/components/shared/messages/RightPanel.jsx
// Book a Call — real scheduling with POST /api/meetings
// Upcoming Meetings — lists confirmed/pending meetings with the active contact
import React, { useState, useEffect } from "react";
import {
  HiChevronLeft, HiChevronRight, HiClock,
  HiInformationCircle, HiFlag, HiVideoCamera,
  HiPhone, HiCalendar, HiCheckCircle, HiX,
  HiExclamationCircle, HiLocationMarker,
} from "react-icons/hi";
import { API_BASE_URL } from "./messageHelpers";

// ── Constants ─────────────────────────────────────────────────────────────────
const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

const MEETING_TYPES = [
  { value: "virtual_intro", label: "Virtual Intro Call (15m)", icon: "📹", duration: 15 },
  { value: "in_person",     label: "In-person Viewing (30m)", icon: "🏠", duration: 30 },
  { value: "phone_call",    label: "Phone Call (10m)",        icon: "📞", duration: 10 },
];

const STATUS_STYLE = {
  pending:   { badge: "bg-amber-50 text-amber-700 border border-amber-200",  dot: "bg-amber-500"  },
  confirmed: { badge: "bg-green-50 text-green-700 border border-green-200",  dot: "bg-green-500"  },
  cancelled: { badge: "bg-red-50 text-red-700 border border-red-200",        dot: "bg-red-500"    },
  completed: { badge: "bg-gray-100 text-gray-500 border border-gray-200",    dot: "bg-gray-400"   },
};

// ── Parse "09:00 AM" slot + selected date → ISO string ───────────────────────
const buildScheduledAt = (year, month, day, slot) => {
  const [time, meridiem] = slot.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return new Date(year, month, day, h, m).toISOString();
};

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDay, selectedMonth, selectedYear, onSelect, onMonthChange }) {
  const firstDayOfWeek = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth    = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const today          = new Date();

  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleDateString("en-RW", {
    month: "long", year: "numeric",
  });

  const cells = [...Array(firstDayOfWeek).fill(null),
                 ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isPast = (d) => {
    const cellDate = new Date(selectedYear, selectedMonth, d);
    cellDate.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return cellDate < t;
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-700">{monthLabel}</span>
        <div className="flex gap-1">
          <button onClick={() => onMonthChange(-1)} className="text-gray-400 hover:text-gray-600 p-0.5 rounded">
            <HiChevronLeft className="text-sm" />
          </button>
          <button onClick={() => onMonthChange(1)} className="text-gray-400 hover:text-gray-600 p-0.5 rounded">
            <HiChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-400 font-bold py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const past     = isPast(d);
          const isToday  = d === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
          const selected = d === selectedDay;
          return (
            <button key={i} disabled={past} onClick={() => onSelect(d)}
              className={`text-center text-[11px] py-1.5 rounded-lg font-medium transition
                ${past     ? "text-gray-300 cursor-not-allowed" : ""}
                ${selected && !past ? "bg-blue-600 text-white" : ""}
                ${isToday  && !selected ? "bg-blue-100 text-blue-700 font-black" : ""}
                ${!selected && !isToday && !past ? "text-gray-600 hover:bg-gray-100" : ""}`}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Upcoming meeting card ─────────────────────────────────────────────────────
function MeetingCard({ meeting, currentUserId, token, onRefresh, onJoin }) {
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isOrganizer   = meeting.organizerId   === currentUserId;
  const isPending     = meeting.status === "pending";
  const isConfirmed   = meeting.status === "confirmed";
  const isVirtual     = meeting.meetingType !== "in_person";
  const style         = STATUS_STYLE[meeting.status] || STATUS_STYLE.pending;

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-RW", {
    weekday: "short", month: "short", day: "numeric",
  });
  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await fetch(`${API_BASE_URL}/meetings/${meeting.id}/confirm`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setConfirming(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this meeting?")) return;
    setCancelling(true);
    try {
      await fetch(`${API_BASE_URL}/meetings/${meeting.id}/cancel`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ reason: "Cancelled by request" }),
      });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setCancelling(false); }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{meeting.title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {fmtDate(meeting.scheduledAt)} · {fmtTime(meeting.scheduledAt)}
          </p>
        </div>
        <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 ${style.badge}`}>
          <span className={`w-1 h-1 rounded-full ${style.dot}`} />
          {meeting.status.toUpperCase()}
        </span>
      </div>

      {/* Location/type */}
      <div className="flex items-center gap-1 text-[10px] text-gray-500">
        {isVirtual
          ? <><HiVideoCamera className="text-blue-500" /> Virtual · {meeting.durationMinutes}min</>
          : <><HiLocationMarker className="text-green-500" /> {meeting.location || "In-person"}</>}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        {/* Participant can confirm pending meetings */}
        {!isOrganizer && isPending && (
          <button onClick={handleConfirm} disabled={confirming}
            className="flex-1 py-1.5 bg-green-600 text-white text-[10px] font-black rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1">
            {confirming
              ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><HiCheckCircle /> Confirm</>}
          </button>
        )}

        {/* Join button for virtual confirmed meetings */}
        {isVirtual && isConfirmed && meeting.roomName && (
          <button onClick={() => onJoin(meeting.roomName)}
            className="flex-1 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1">
            <HiVideoCamera /> Join Now
          </button>
        )}

        {/* Cancel — available to both parties */}
        {(isPending || isConfirmed) && (
          <button onClick={handleCancel} disabled={cancelling}
            className="px-2 py-1.5 border border-red-200 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-50 transition">
            {cancelling
              ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
              : <HiX />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main RightPanel ───────────────────────────────────────────────────────────
export default function RightPanel({ contact, token, currentUserId, onJoinCall }) {
  const today = new Date();

  const [selectedDay,   setSelectedDay]   = useState(null);
  const [calMonth,      setCalMonth]      = useState(today.getMonth());
  const [calYear,       setCalYear]       = useState(today.getFullYear());
  const [selectedSlot,  setSelectedSlot]  = useState(TIME_SLOTS[1]);
  const [meetingType,   setMeetingType]   = useState(MEETING_TYPES[0].value);
  const [showTypes,     setShowTypes]     = useState(false);
  const [notes,         setNotes]         = useState("");
  const [scheduling,    setScheduling]    = useState(false);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [errorMsg,      setErrorMsg]      = useState("");
  const [meetings,      setMeetings]      = useState([]);
  const [loadingMtg,    setLoadingMtg]    = useState(false);

  const selectedTypeMeta = MEETING_TYPES.find(t => t.value === meetingType) || MEETING_TYPES[0];

  // ── Load meetings with active contact ───────────────────────────────────────
  const loadMeetings = async () => {
    if (!contact || !token) return;
    setLoadingMtg(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Filter to only meetings with this contact
        const filtered = (data.data || []).filter(m =>
          m.organizerId === contact.id || m.participantId === contact.id
        );
        setMeetings(filtered);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingMtg(false); }
  };

  useEffect(() => { loadMeetings(); }, [contact?.id, token]);

  // ── Month navigation ────────────────────────────────────────────────────────
  const handleMonthChange = (delta) => {
    const d = new Date(calYear, calMonth + delta);
    setCalMonth(d.getMonth());
    setCalYear(d.getFullYear());
    setSelectedDay(null);
  };

  // ── Schedule call ───────────────────────────────────────────────────────────
  const handleSchedule = async () => {
    if (!selectedDay || !contact) return;
    setErrorMsg(""); setSuccessMsg(""); setScheduling(true);

    try {
      const scheduledAt = buildScheduledAt(calYear, calMonth, selectedDay, selectedSlot);

      const res  = await fetch(`${API_BASE_URL}/meetings`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          participantId: contact.id,
          meetingType,
          scheduledAt,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to schedule");

      setSuccessMsg(`✅ ${selectedTypeMeta.label} scheduled! ${contact.firstName} has been notified.`);
      setSelectedDay(null);
      setNotes("");
      await loadMeetings();

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setScheduling(false);
    }
  };

  // ── Join a virtual meeting ──────────────────────────────────────────────────
  const handleJoin = (roomName) => {
    // Open Jitsi in a new tab (same room logic as CallModal)
    const url = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`;
    window.open(url, "_blank");
    onJoinCall?.();
  };

  return (
    <div className="w-64 flex flex-col overflow-y-auto bg-white shrink-0 border-l border-gray-100">

      {/* ── Book a Call ── */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black text-gray-900">Book a Call</h4>
          {contact && (
            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[100px]">
              with {contact.firstName}
            </p>
          )}
        </div>

        {/* Success / Error */}
        {successMsg && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-[11px] text-green-700 font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-[11px] text-red-700 flex items-center gap-1.5">
            <HiExclamationCircle className="shrink-0" /> {errorMsg}
          </div>
        )}

        <MiniCalendar
          selectedDay={selectedDay}
          selectedMonth={calMonth}
          selectedYear={calYear}
          onSelect={setSelectedDay}
          onMonthChange={handleMonthChange}
        />

        {/* Time slots */}
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
            AVAILABLE SLOTS
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_SLOTS.map(slot => (
              <button key={slot} onClick={() => setSelectedSlot(slot)}
                className={`text-xs font-bold py-1.5 rounded-lg border transition ${
                  selectedSlot === slot
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }`}>
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Meeting type */}
        <div className="mb-3 relative">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
            MEETING TYPE
          </p>
          <button onClick={() => setShowTypes(!showTypes)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-medium hover:border-gray-300 transition bg-white">
            <span className="flex items-center gap-1.5">
              <span>{selectedTypeMeta.icon}</span>
              <span className="truncate">{selectedTypeMeta.label}</span>
            </span>
            <HiChevronRight className={`text-gray-400 shrink-0 transition-transform ${showTypes ? "rotate-90" : ""}`} />
          </button>
          {showTypes && (
            <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
              {MEETING_TYPES.map(t => (
                <button key={t.value}
                  onClick={() => { setMeetingType(t.value); setShowTypes(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition
                    ${meetingType === t.value ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
            NOTES (optional)
          </p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Add agenda or special instructions..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300" />
        </div>

        <button
          onClick={handleSchedule}
          disabled={!selectedDay || !contact || scheduling}
          className="w-full bg-blue-600 text-white text-xs font-black py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {scheduling
            ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scheduling...</>
            : !selectedDay
              ? "Pick a date first"
              : `Schedule ${selectedTypeMeta.icon} ${selectedTypeMeta.label}`}
        </button>
      </div>

      {/* ── Upcoming Meetings ── */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black text-gray-900">Upcoming Meetings</h4>
          <button onClick={loadMeetings} className="text-gray-400 hover:text-blue-600 transition" title="Refresh">
            <HiCalendar className="text-sm" />
          </button>
        </div>

        {loadingMtg ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-6">
            <HiCalendar className="text-2xl text-gray-200 mx-auto mb-2" />
            <p className="text-[11px] text-gray-400 font-semibold">No meetings yet</p>
            <p className="text-[10px] text-gray-300 mt-0.5">Schedule one above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.map(m => (
              <MeetingCard
                key={m.id}
                meeting={m}
                currentUserId={currentUserId}
                token={token}
                onRefresh={loadMeetings}
                onJoin={handleJoin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}