import React, { useState, useRef, useEffect } from "react";
import {
  HiPaperAirplane, HiPhotograph, HiPaperClip, HiSearch,
  HiDotsVertical, HiVideoCamera, HiPhone, HiInformationCircle,
  HiPlus, HiEmojiHappy, HiPencilAlt, HiChevronLeft, HiChevronRight,
  HiClock, HiCalendar, HiCheck, HiCheckCircle, HiExternalLink,
  HiFlag, HiTranslate
} from "react-icons/hi";

const contacts = [
  {
    id: 1,
    name: "Jean Carene",
    role: "TENANT",
    roleColor: "bg-green-100 text-green-700",
    sub: "Kigali Heights 4B",
    initials: "JC",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Can we schedule a quick call about t...",
    time: "10:24 AM",
    unread: 1,
    online: true,
    chatTitle: "Lease Renewal - Kigali Heights Apt 4B",
    chatSub: "With Jean Carene • Online",
    messages: [
      { id: 1, from: "them", text: "Hello, I've been reviewing the new lease agreement for Kigali Heights. I would like to discuss the renewal terms for next year. Can we schedule a quick call?", time: "10:24 AM", date: "TODAY", translated: true },
      { id: 2, from: "me",   text: "Mwaramutse Jean! I'd be happy to discuss. I have some availability tomorrow morning. Does that work for you?", time: "10:26 AM", date: "TODAY", read: true },
      { id: 3, type: "proposal", title: "Proposal: Inspection Call", subtitle: "Proposed by you for Oct 24, 2023", time: "10:27 AM", date: "TODAY" },
      { id: 4, from: "them", text: "Amakuru! Tomorrow morning is perfect. 10:00 AM works for me. I'll also have the maintenance documents ready.", time: "10:30 AM", date: "TODAY", translated: true },
    ],
  },
  {
    id: 2,
    name: "Musa Keza",
    role: "LANDLORD",
    roleColor: "bg-blue-100 text-blue-700",
    sub: "Office Park A",
    initials: "MK",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "The payment was received. Murakoze!",
    time: "Yesterday",
    unread: 0,
    online: false,
    chatTitle: "Rent Payment - Office Park A",
    chatSub: "With Musa Keza • Offline",
    messages: [
      { id: 1, from: "them", text: "Hi, just confirming I received the October rent payment. Murakoze!", time: "3:00 PM", date: "Yesterday" },
      { id: 2, from: "me",   text: "Great, thank you for confirming!", time: "3:15 PM", date: "Yesterday", read: true },
    ],
  },
  {
    id: 3,
    name: "Bertin R.",
    role: "AGENT",
    roleColor: "bg-purple-100 text-purple-700",
    sub: "",
    initials: "BR",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    lastMessage: "I'll send the inspection report by EOD.",
    time: "Tue",
    unread: 0,
    online: false,
    chatTitle: "Property Inspection - Bertin R.",
    chatSub: "With Bertin R. • Offline",
    messages: [
      { id: 1, from: "them", text: "Hello! I completed the property inspection earlier today.", time: "2:00 PM", date: "Tue" },
      { id: 2, from: "them", text: "I'll send the inspection report by EOD.", time: "2:05 PM", date: "Tue" },
    ],
  },
];

const calendarDays = [
  { label: "M", dates: [21, 28] },
  { label: "T", dates: [22, 29] },
  { label: "W", dates: [23, 30] },
  { label: "T", dates: [24, 31] },
  { label: "F", dates: [25] },
  { label: "S", dates: [26] },
  { label: "S", dates: [27] },
];

const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM"];
const meetingTypes = ["Virtual Intro Call (15m)", "In-person Viewing (30m)", "Phone Call (10m)"];

export default function Messages() {
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [input, setInput] = useState("");
  const [allContacts, setAllContacts] = useState(contacts);
  const [search, setSearch] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM");
  const [meetingType, setMeetingType] = useState(meetingTypes[0]);
  const [showMeetingTypes, setShowMeetingTypes] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContact]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input, time: "Now", date: "TODAY", read: false };
    const updated = allContacts.map(c =>
      c.id === activeContact.id
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: input, time: "Now" }
        : c
    );
    setAllContacts(updated);
    setActiveContact(updated.find(c => c.id === activeContact.id));
    setInput("");
  };

  const filteredContacts = allContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex" style={{ height: "680px" }}>

      {/* ── Col 1: Contacts Sidebar ── */}
      <div className="w-64 border-r border-gray-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900">Messages</h3>
          <button className="text-gray-400 hover:text-blue-600 transition">
            <HiPencilAlt className="text-lg" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveContact(allContacts.find(x => x.id === c.id))}
              className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-50 transition ${
                activeContact.id === c.id ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                {c.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-semibold text-gray-900 text-sm truncate">{c.name}</span>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-1">{c.time}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${c.roleColor}`}>{c.role}</span>
                  {c.sub && <span className="text-[10px] text-gray-400 truncate">{c.sub}</span>}
                </div>
                <p className="text-[11px] text-gray-400 truncate">{c.lastMessage}</p>
              </div>

              {c.unread > 0 && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <span className="text-white text-[9px] font-bold">{c.unread}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Col 2: Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        {/* Chat header */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={allContacts.find(c => c.id === activeContact.id)?.avatar}
                alt={activeContact.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              {activeContact.online && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{activeContact.chatTitle}</p>
              <p className="text-xs text-gray-400">{activeContact.chatSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <button className="hover:text-gray-700 transition"><HiVideoCamera className="text-lg" /></button>
            <button className="hover:text-gray-700 transition"><HiPhone className="text-lg" /></button>
            <button className="hover:text-gray-700 transition"><HiInformationCircle className="text-lg" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/30">
          {activeContact.messages.map((msg, i) => {
            const isMe = msg.from === "me";
            const showDate = i === 0 || activeContact.messages[i - 1]?.date !== msg.date;

            if (msg.type === "proposal") {
              return (
                <div key={msg.id || i}>
                  {showDate && (
                    <div className="text-center my-3">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                        {msg.date}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-center">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 w-80 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <HiCalendar className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{msg.title}</p>
                          <p className="text-xs text-gray-400">{msg.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition">
                          Accept Proposal
                        </button>
                        <button className="flex-1 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id || i}>
                {showDate && (
                  <div className="text-center my-3">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                      {msg.date}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                  {!isMe && (
                    <img
                      src={allContacts.find(c => c.id === activeContact.id)?.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  )}
                  <div className={`max-w-sm flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-900 rounded-bl-sm border border-gray-200 shadow-sm"
                    }`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      {msg.translated && (
                        <button className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline">
                          <HiTranslate className="text-xs" /> Translate to Kinyarwanda
                        </button>
                      )}
                      {!msg.translated && (
                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                      )}
                      {msg.translated && (
                        <span className="text-[10px] text-gray-400 ml-1">{msg.time}</span>
                      )}
                      {isMe && msg.read && <HiCheckCircle className="text-blue-400 text-xs" />}
                      {isMe && !msg.read && <HiCheck className="text-gray-300 text-xs" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick action chips */}
        <div className="px-5 py-2 border-t border-gray-100 flex items-center gap-2 flex-wrap bg-white">
          {[
            { icon: "📄", label: "Send Lease Draft" },
            { icon: "💳", label: "Request Payment" },
            { icon: "🚩", label: "Report Issue" },
          ].map((chip, i) => (
            <button key={i}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition font-medium">
              <span>{chip.icon}</span> {chip.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
            <button className="text-gray-400 hover:text-gray-600 transition shrink-0"><HiPlus className="text-lg" /></button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 py-1"
            />
            <button className="text-gray-400 hover:text-gray-600 transition shrink-0"><HiEmojiHappy className="text-lg" /></button>
            <button
              onClick={handleSend}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                input.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400"
              }`}
            >
              <HiPaperAirplane className="rotate-90 text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Col 3: Right Panel ── */}
      <div className="w-60 flex flex-col overflow-y-auto bg-white">

        {/* Book a Call */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-gray-900">Book a Call</h4>
            <button className="text-gray-400 hover:text-gray-600"><HiDotsVertical className="text-sm" /></button>
          </div>

          {/* Mini Calendar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700">October 2023</span>
              <div className="flex gap-1">
                <button className="text-gray-400 hover:text-gray-600"><HiChevronLeft className="text-sm" /></button>
                <button className="text-gray-400 hover:text-gray-600"><HiChevronRight className="text-sm" /></button>
              </div>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-gray-400 font-bold py-0.5">{d}</div>
              ))}
            </div>
            {/* Week 1 */}
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {[21,22,23,24,25,26,27].map(d => (
                <button key={d}
                  className={`text-center text-[11px] py-1 rounded-lg font-medium transition ${
                    d === 23 ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  {d}
                </button>
              ))}
            </div>
            {/* Week 2 */}
            <div className="grid grid-cols-7 gap-0.5">
              {[28,29,30,31,"","",""].map((d, i) => (
                <button key={i}
                  className={`text-center text-[11px] py-1 rounded-lg font-medium transition ${
                    d ? "text-gray-600 hover:bg-gray-100" : ""
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Available Slots */}
          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">AVAILABLE SLOTS</p>
            <div className="grid grid-cols-2 gap-1.5">
              {timeSlots.map(slot => (
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
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">MEETING TYPE</p>
            <button
              onClick={() => setShowMeetingTypes(!showMeetingTypes)}
              className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium hover:border-gray-300 transition"
            >
              <span className="truncate">{meetingType}</span>
              <HiChevronRight className={`text-gray-400 shrink-0 transition-transform ${showMeetingTypes ? "rotate-90" : ""}`} />
            </button>
            {showMeetingTypes && (
              <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                {meetingTypes.map(t => (
                  <button key={t} onClick={() => { setMeetingType(t); setShowMeetingTypes(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="w-full bg-blue-600 text-white text-xs font-black py-2.5 rounded-xl hover:bg-blue-700 transition">
            Schedule Call
          </button>
        </div>

        {/* Property Context */}
        <div className="p-4">
          <h4 className="text-sm font-black text-gray-900 mb-3">Property Context</h4>

          {/* Property image + badge */}
          <div className="relative rounded-xl overflow-hidden mb-3">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80"
              alt="Kigali Heights"
              className="w-full h-24 object-cover"
            />
            <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              Rented
            </div>
          </div>

          <p className="font-bold text-gray-900 text-sm mb-0.5">Kigali Heights, Apt 4B</p>
          <p className="text-[11px] text-gray-400 mb-3">KG 7 Ave, Kigali, Rwanda</p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">Monthly Rent</p>
              <p className="text-sm font-black text-blue-600">850,000 RWF</p>
            </div>
            <button className="text-gray-400 hover:text-blue-600 transition">
              <HiExternalLink className="text-base" />
            </button>
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">QUICK ACTIONS</p>
            <div className="space-y-1.5">
              {[
                { label: "View Lease History", icon: <HiClock className="text-gray-400 text-sm" /> },
                { label: "Maintenance Logs",   icon: <HiInformationCircle className="text-gray-400 text-sm" /> },
              ].map((action, i) => (
                <button key={i}
                  className="w-full flex items-center justify-between py-2 text-xs text-gray-700 font-medium hover:text-blue-600 transition border-b border-gray-100 last:border-0">
                  {action.label}
                  {action.icon}
                </button>
              ))}
              <button className="w-full flex items-center justify-between py-2 text-xs text-red-500 font-bold hover:text-red-600 transition">
                Flag Conversation
                <HiFlag className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}