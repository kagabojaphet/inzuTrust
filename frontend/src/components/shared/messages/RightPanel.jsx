// src/components/shared/messages/RightPanel.jsx
import React, { useState } from "react";
import {
  HiChevronLeft, HiChevronRight, HiClock,
  HiInformationCircle, HiFlag, HiExternalLink, HiDotsVertical,
} from "react-icons/hi";

const TIME_SLOTS   = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM"];
const MEETING_TYPES = [
  "Virtual Intro Call (15m)",
  "In-person Viewing (30m)",
  "Phone Call (10m)",
];

// ── Mini calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDay, onSelect }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const firstDay   = new Date(month.year, month.month, 1).getDay(); // 0=Sun
  const daysInMonth= new Date(month.year, month.month + 1, 0).getDate();
  const startOffset= (firstDay + 6) % 7; // shift so Monday = 0

  const monthLabel = new Date(month.year, month.month).toLocaleDateString("en-RW", {
    month: "long", year: "numeric",
  });

  const cells = [...Array(startOffset).fill(null),
                 ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() &&
    month.month === today.getMonth() &&
    month.year  === today.getFullYear();

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-700">{monthLabel}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setMonth(m => {
              const d = new Date(m.year, m.month - 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiChevronLeft className="text-sm" />
          </button>
          <button
            onClick={() => setMonth(m => {
              const d = new Date(m.year, m.month + 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-400 font-bold py-0.5">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <button key={i}
            disabled={!d}
            onClick={() => d && onSelect(d)}
            className={`text-center text-[11px] py-1 rounded-lg font-medium transition
              ${!d ? "invisible" : ""}
              ${d === selectedDay && !isToday(d) ? "bg-blue-600 text-white" : ""}
              ${isToday(d) && d !== selectedDay ? "bg-blue-100 text-blue-700 font-black" : ""}
              ${d && d !== selectedDay && !isToday(d) ? "text-gray-600 hover:bg-gray-100" : ""}`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RightPanel({ contact, onScheduleCall }) {
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [meetingType,  setMeetingType]  = useState(MEETING_TYPES[0]);
  const [showTypes,    setShowTypes]    = useState(false);

  const handleSchedule = () => {
    if (!selectedDay || !selectedSlot) return;
    onScheduleCall?.({ day: selectedDay, slot: selectedSlot, type: meetingType });
  };

  return (
    <div className="w-60 flex flex-col overflow-y-auto bg-white shrink-0">

      {/* ── Book a Call ── */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black text-gray-900">Book a Call</h4>
          <button className="text-gray-400 hover:text-gray-600">
            <HiDotsVertical className="text-sm" />
          </button>
        </div>

        <MiniCalendar selectedDay={selectedDay} onSelect={setSelectedDay} />

        {/* Time slots */}
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
            AVAILABLE SLOTS
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_SLOTS.map(slot => (
              <button key={slot} onClick={() => setSelectedSlot(slot)}
                className={`text-xs font-bold py-2 rounded-lg border transition ${
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
          <button
            onClick={() => setShowTypes(!showTypes)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium hover:border-gray-300 transition"
          >
            <span className="truncate">{meetingType}</span>
            <HiChevronRight className={`text-gray-400 shrink-0 transition-transform ${showTypes ? "rotate-90" : ""}`} />
          </button>
          {showTypes && (
            <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
              {MEETING_TYPES.map(t => (
                <button key={t} onClick={() => { setMeetingType(t); setShowTypes(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSchedule}
          disabled={!selectedDay}
          className="w-full bg-blue-600 text-white text-xs font-black py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          Schedule Call
        </button>
      </div>

      {/* ── Property Context ── */}
      {contact && (
        <div className="p-4">
          <h4 className="text-sm font-black text-gray-900 mb-3">Property Context</h4>

          {/* Placeholder — would be fetched from active agreement */}
          <div className="bg-gray-100 rounded-xl h-20 flex items-center justify-center mb-3">
            <p className="text-xs text-gray-400 font-medium">No active property</p>
          </div>

          <p className="font-bold text-gray-900 text-sm mb-0.5">
            {contact.firstName} {contact.lastName}
          </p>
          <p className="text-[11px] text-gray-400 mb-3 capitalize">{contact.role}</p>

          {/* Quick actions */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
              QUICK ACTIONS
            </p>
            <div className="space-y-1.5">
              {[
                { label: "View Lease History", Icon: HiClock          },
                { label: "Maintenance Logs",   Icon: HiInformationCircle },
              ].map(({ label, Icon }) => (
                <button key={label}
                  className="w-full flex items-center justify-between py-2 text-xs text-gray-700 font-medium hover:text-blue-600 transition border-b border-gray-100 last:border-0">
                  {label}
                  <Icon className="text-gray-400 text-sm" />
                </button>
              ))}
              <button className="w-full flex items-center justify-between py-2 text-xs text-red-500 font-bold hover:text-red-600 transition">
                Flag Conversation
                <HiFlag className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}