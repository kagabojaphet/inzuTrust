// src/components/shared/messages/RightPanel.jsx
import React, { useState, useEffect } from "react";
import {
  HiChevronLeft, HiChevronRight, HiClock,
  HiInformationCircle, HiFlag, HiVideoCamera,
  HiPhone, HiCalendar, HiCheckCircle, HiX,
  HiExclamationCircle, HiLocationMarker,
} from "react-icons/hi";
import { API_BASE_URL } from "./messageHelpers";

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

const buildScheduledAt = (year, month, day, slot) => {
  const [time, meridiem] = slot.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return new Date(year, month, day, h, m).toISOString();
};

function MiniCalendar({ selectedDay, selectedMonth, selectedYear, onSelect, onMonthChange }) {
  const firstDayOfWeek = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7; 
  const daysInMonth    = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const today          = new Date();

  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleDateString("en-RW", {
    month: "long", year: "numeric",
  });

  const cells = [...Array(firstDayOfWeek).fill(null),
                 ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isPast = (d) => {
    const cellDate = new Date(selectedYear, selectedMonth, d);
    cellDate.setHours(23, 59, 59, 999);
    return cellDate < today;
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

function MeetingCard({ meeting, currentUserId, token, onRefresh, onJoin }) {
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isOrganizer   = meeting.organizerId === currentUserId;
  const isPending     = meeting.status === "pending";
  const isConfirmed   = meeting.status === "confirmed";
  const isVirtual     = meeting.meetingType !== "in_person";
  const style         = STATUS_STYLE[meeting.status] || STATUS_STYLE.pending;

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-RW", { weekday: "short", month: "short", day: "numeric" });
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
        body:    JSON.stringify({ reason: "Cancelled by user" }),
      });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setCancelling(false); }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{meeting.title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(meeting.scheduledAt)} · {fmtTime(meeting.scheduledAt)}</p>
        </div>
        <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 ${style.badge}`}>
          <span className={`w-1 h-1 rounded-full ${style.dot}`} />
          {meeting.status.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-500">
        {isVirtual
          ? <><HiVideoCamera className="text-blue-500" /> Virtual · {meeting.durationMinutes}min</>
          : <><HiLocationMarker className="text-green-500" /> {meeting.location || "In-person"}</>}
      </div>
      <div className="flex gap-1.5">
        {!isOrganizer && isPending && (
          <button onClick={handleConfirm} disabled={confirming} className="flex-1 py-1.5 bg-green-600 text-white text-[10px] font-black rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1">
            {confirming ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiCheckCircle /> Confirm</>}
          </button>
        )}
        {isVirtual && isConfirmed && meeting.roomName && (
          <button onClick={() => onJoin(meeting.roomName)} className="flex-1 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1">
            <HiVideoCamera /> Join Now
          </button>
        )}
        {(isPending || isConfirmed) && (
          <button onClick={handleCancel} disabled={cancelling} className="px-2 py-1.5 border border-red-200 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-50 transition">
            {cancelling ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> : <HiX />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function RightPanel({ contact, token, currentUserId, onJoinCall }) {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(null);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0].value);
  const [showTypes, setShowTypes] = useState(false);
  const [notes, setNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [loadingMtg, setLoadingMtg] = useState(false);

  const selectedTypeMeta = MEETING_TYPES.find(t => t.value === meetingType) || MEETING_TYPES[0];

  const loadMeetings = async () => {
    if (!contact || !token) return;
    setLoadingMtg(true);
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const filtered = (data.data || []).filter(m => m.organizerId === contact.id || m.participantId === contact.id);
        setMeetings(filtered);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingMtg(false); }
  };

  useEffect(() => { loadMeetings(); }, [contact?.id, token]);

  const handleMonthChange = (delta) => {
    const d = new Date(calYear, calMonth + delta);
    setCalMonth(d.getMonth());
    setCalYear(d.getFullYear());
    setSelectedDay(null);
  };

  const handleSchedule = async () => {
    if (!selectedDay || !contact) return;
    setErrorMsg(""); setSuccessMsg(""); setScheduling(true);
    try {
      const scheduledAt = buildScheduledAt(calYear, calMonth, selectedDay, selectedSlot);
      const res = await fetch(`${API_BASE_URL}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ participantId: contact.id, meetingType, scheduledAt, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to schedule");
      setSuccessMsg(`✅ Meeting scheduled with ${contact.firstName}`);
      setSelectedDay(null);
      setNotes("");
      loadMeetings();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) { setErrorMsg(err.message); }
    finally { setScheduling(false); }
  };

  const handleJoin = (roomName) => {
    const url = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false`;
    window.open(url, "_blank");
    onJoinCall?.();
  };

  return (
    <div className="w-64 flex flex-col overflow-y-auto bg-white shrink-0 border-l border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-sm font-black text-gray-900 mb-3">Book a Call</h4>
        {successMsg && <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-[11px] text-green-700">{successMsg}</div>}
        {errorMsg && <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-[11px] text-red-700 flex items-center gap-1.5"><HiExclamationCircle /> {errorMsg}</div>}
        
        <MiniCalendar selectedDay={selectedDay} selectedMonth={calMonth} selectedYear={calYear} onSelect={setSelectedDay} onMonthChange={handleMonthChange} />

        <div className="mb-3">
          <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">Available Slots</p>
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_SLOTS.map(slot => (
              <button key={slot} onClick={() => setSelectedSlot(slot)} className={`text-xs font-bold py-1.5 rounded-lg border transition ${selectedSlot === slot ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600"}`}>
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 relative">
          <p className="text-[10px] font-black text-gray-400 mb-1.5 uppercase">Meeting Type</p>
          <button onClick={() => setShowTypes(!showTypes)} className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium bg-white">
            <span className="flex items-center gap-1.5"><span>{selectedTypeMeta.icon}</span><span className="truncate">{selectedTypeMeta.label}</span></span>
            <HiChevronRight className={`transition-transform ${showTypes ? "rotate-90" : ""}`} />
          </button>
          {showTypes && (
            <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
              {MEETING_TYPES.map(t => (
                <button key={t.value} onClick={() => { setMeetingType(t.value); setShowTypes(false); }} className={`w-full text-left px-3 py-2.5 text-xs ${meetingType === t.value ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50"}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />

        <button onClick={handleSchedule} disabled={!selectedDay || scheduling} className="w-full bg-blue-600 text-white text-xs font-black py-2.5 rounded-xl disabled:opacity-50 transition">
          {scheduling ? "Scheduling..." : !selectedDay ? "Select a date" : "Confirm Booking"}
        </button>
      </div>

      <div className="p-4">
        <h4 className="text-sm font-black text-gray-900 mb-3">Upcoming</h4>
        {loadingMtg ? <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" /> : (
          <div className="space-y-2">
            {meetings.length === 0 ? <p className="text-[10px] text-gray-400 text-center py-4">No meetings found.</p> : 
              meetings.map(m => <MeetingCard key={m.id} meeting={m} currentUserId={currentUserId} token={token} onRefresh={loadMeetings} onJoin={handleJoin} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}