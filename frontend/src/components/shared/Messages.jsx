import React, { useState, useRef, useEffect } from "react";
import {
  HiSearch, HiPhone, HiVideoCamera, HiInformationCircle,
  HiTranslate, HiCalendar, HiPaperAirplane, HiPaperClip,
  HiEmojiHappy, HiExclamation, HiClock, HiCheckCircle,
  HiPencilAlt, HiX, HiChevronLeft, HiChevronRight,
  HiExternalLink, HiDocumentText, HiCog, HiFlag,
  HiPlus, HiMicrophone
} from "react-icons/hi";
import { API_BASE } from "../../config";

// ── Mock contacts ─────────────────────────────────────────────────────────────
const getMockContacts = (role) => {
  if (role === "tenant") return [
    { id:1, name:"Jean Carene",  role:"LANDLORD", property:"Kigali Heights 4B", avatar:"JC", online:true,  lastMsg:"Can we schedule a quick call about t...", time:"10:24 AM",  unread:2 },
    { id:2, name:"Musa Keza",    role:"LANDLORD", property:"Office Park A",      avatar:"MK", online:false, lastMsg:"The payment was received. Murakoze!",  time:"Yesterday", unread:0 },
    { id:3, name:"Bertin R.",    role:"AGENT",     property:null,                avatar:"BR", online:false, lastMsg:"I'll send the inspection report by EOD.", time:"Tue",     unread:0 },
    { id:4, name:"Admin Support",role:"ADMIN",     property:null,                avatar:"AS", online:true,  lastMsg:"Your dispute has been updated.",        time:"Mon",       unread:1 },
  ];
  if (role === "landlord") return [
    { id:1, name:"Jean Carene",  role:"TENANT",   property:"Kigali Heights 4B", avatar:"JC", online:true,  lastMsg:"Hello, I've been reviewing the lease...", time:"10:24 AM", unread:3 },
    { id:2, name:"Aline Uwimana",role:"TENANT",   property:"Vision City Villa", avatar:"AU", online:false, lastMsg:"When is the repair scheduled?",           time:"Yesterday",unread:0 },
    { id:3, name:"Admin Support",role:"ADMIN",    property:null,                avatar:"AS", online:true,  lastMsg:"New dispute filed on your property.",     time:"Mon",      unread:1 },
  ];
  return [
    { id:1, name:"Jean Carene",  role:"TENANT",   property:"Kigali Heights 4B", avatar:"JC", online:true,  lastMsg:"Hello, I've been reviewing...",  time:"10:24 AM", unread:2 },
    { id:2, name:"Musa Keza",    role:"LANDLORD", property:"Office Park A",     avatar:"MK", online:false, lastMsg:"The payment was received.",       time:"Yesterday",unread:0 },
  ];
};

const getMockMessages = (contactId) => [
  { id:1, from:"them", text:"Hello, I've been reviewing the new lease agreement for Kigali Heights. I would like to discuss the renewal terms for next year. Can we schedule a quick call?", time:"10:24 AM", translated:false },
  { id:2, from:"me",   text:"Mwaramutse Jean! I'd be happy to discuss, I have some availability tomorrow morning. Does that work for you?", time:"10:28 AM", translated:false },
  { id:3, type:"proposal", title:"Proposal: Inspection Call", sub:"Proposed by you for Oct 24, 2023", time:"10:29 AM" },
  { id:4, from:"them", text:"Amakuru! Tomorrow morning is perfect. 10:00 AM works for me. I'll also have the maintenance documents ready.", time:"10:30 AM", translated:false },
];

const roleBadge = {
  TENANT:   "bg-blue-50 text-blue-700",
  LANDLORD: "bg-purple-50 text-purple-700",
  AGENT:    "bg-orange-50 text-orange-700",
  ADMIN:    "bg-red-50 text-red-600",
};

// Calendar helpers
const getDaysInMonth = (y,m) => new Date(y,m+1,0).getDate();
const DAYS = ["M","T","W","T","F","S","S"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const TIME_SLOTS = ["09:00 AM","10:00 AM","11:30 AM","02:00 PM"];
const MEETING_TYPES = ["Virtual Intro Call (15m)","Phone Call (30m)","In Person (1hr)","Video Call (30m)"];

// ── Call modal ────────────────────────────────────────────────────────────────
function CallModal({ contact, type, onClose }) {
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(()=>{
    const t = setInterval(()=>setSeconds(s=>s+1),1000);
    return ()=>clearInterval(t);
  },[]);

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#1e293b] rounded-3xl p-8 w-72 text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
          {contact.avatar}
        </div>
        <h3 className="text-white font-black text-lg mb-1">{contact.name}</h3>
        <p className="text-white/50 text-sm mb-2">{type === "video" ? "Video Call" : "Voice Call"}</p>
        <p className="text-green-400 font-mono text-base mb-8">{fmt(seconds)}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={()=>setMuted(m=>!m)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${muted?"bg-red-500":"bg-white/20"}`}>
            <HiMicrophone className="text-white text-xl"/>
          </button>
          {type==="video" && (
            <button className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <HiVideoCamera className="text-white text-xl"/>
            </button>
          )}
          <button onClick={onClose}
            className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition">
            <HiPhone className="text-white text-xl rotate-[135deg]"/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Messages component ───────────────────────────────────────────────────
export default function Messages({ token, userRole = "tenant", user }) {
  const [contacts,    setContacts]    = useState(getMockContacts(userRole));
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [messages,    setMessages]    = useState(getMockMessages(1));
  const [input,       setInput]       = useState("");
  const [callType,    setCallType]    = useState(null);
  const [calYear,     setCalYear]     = useState(2023);
  const [calMonth,    setCalMonth]    = useState(9); // Oct
  const [selDate,     setSelDate]     = useState(23);
  const [selSlot,     setSelSlot]     = useState("10:00 AM");
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [scheduledMsg,setScheduledMsg]= useState("");
  const messagesEndRef = useRef(null);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages(prev=>[...prev,{id:Date.now(),from:"me",text:input,time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),translated:false}]);
    setInput("");
  };

  const handleTranslate = (id) => {
    setMessages(prev=>prev.map(m=>m.id===id?{...m,translated:!m.translated}:m));
  };

  const handleScheduleCall = () => {
    const text = `📅 Call scheduled: ${MONTHS[calMonth]} ${selDate} at ${selSlot} — ${meetingType}`;
    setMessages(prev=>[...prev,{id:Date.now(),from:"me",text,time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),translated:false}]);
    setScheduledMsg(`Call scheduled for ${MONTHS[calMonth]} ${selDate} at ${selSlot}`);
    setTimeout(()=>setScheduledMsg(""),4000);
  };

  // Calendar render
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const calDays     = [];
  for(let i=0;i<offset;i++) calDays.push(null);
  for(let i=1;i<=daysInMonth;i++) calDays.push(i);

  const prevMonth = ()=>{ if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1); };
  const nextMonth = ()=>{ if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1); };

  const property = {
    title:"Kigali Heights, Apt 4B", address:"KG 7 Ave, Kigali, Rwanda",
    rent:850000, image:"https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&q=80"
  };

  return (
    <>
      {callType && <CallModal contact={activeContact} type={callType} onClose={()=>setCallType(null)}/>}

      <div className="flex h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl overflow-hidden border border-gray-200">

        {/* ── Col 1: Contacts ── */}
        <div className="w-64 border-r border-gray-100 flex flex-col shrink-0">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-gray-900">Messages</h2>
              <button className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <HiPencilAlt className="text-sm"/>
              </button>
            </div>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
              <input placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition"/>
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {contacts.map(c=>(
              <div key={c.id} onClick={()=>{ setActiveContact(c); setMessages(getMockMessages(c.id)); }}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition hover:bg-gray-50 ${activeContact?.id===c.id?"bg-blue-50":""}`}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-black">
                    {c.avatar}
                  </div>
                  {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400 shrink-0 ml-1">{c.time}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${roleBadge[c.role]}`}>{c.role}</span>
                    {c.property && <span className="text-[9px] text-gray-400 truncate">{c.property}</span>}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0">
                    {c.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Col 2: Chat ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeContact ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-black">{activeContact.avatar}</div>
                    {activeContact.online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"/>}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {activeContact.property ? `Lease Renewal - ${activeContact.property}` : `Chat with ${activeContact.name}`}
                    </p>
                    <p className="text-[11px] text-gray-400">With {activeContact.name} · {activeContact.online?"Online":"Offline"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setCallType("video")}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition">
                    <HiVideoCamera className="text-lg"/>
                  </button>
                  <button onClick={()=>setCallType("audio")}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition">
                    <HiPhone className="text-lg"/>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition">
                    <HiInformationCircle className="text-lg"/>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/30">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <span className="text-[10px] text-gray-400 bg-white border border-gray-100 px-3 py-1 rounded-full">TODAY</span>
                </div>

                {messages.map(m=>{
                  if(m.type==="proposal") return (
                    <div key={m.id} className="flex justify-center">
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-xs shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <HiCalendar className="text-blue-500"/>
                          <p className="text-sm font-black text-gray-900">{m.title}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{m.sub}</p>
                        <div className="flex gap-2">
                          <button className="flex-1 py-1.5 border border-blue-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition">Accept Proposal</button>
                          <button className="flex-1 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition">Reschedule</button>
                        </div>
                      </div>
                    </div>
                  );

                  const isMe = m.from === "me";
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe?"items-end":""}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMe?"bg-blue-600 text-white rounded-tr-sm":"bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"}`}>
                        {m.text}
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${isMe?"flex-row-reverse":""}`}>
                        <p className="text-[10px] text-gray-400">{m.time}</p>
                        {!isMe && (
                          <button onClick={()=>handleTranslate(m.id)}
                            className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline">
                            <HiTranslate className="text-xs"/>
                            {m.translated?"Show original":"Translate to Kinyarwanda"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef}/>
              </div>

              {/* Quick action chips */}
              <div className="flex gap-2 px-5 py-2 bg-white border-t border-gray-100 overflow-x-auto">
                {[
                  {label:"Send Lease Draft",icon:HiDocumentText},
                  {label:"Request Payment", icon:HiCheckCircle},
                  {label:"Report Issue",    icon:HiExclamation},
                ].map((q,i)=>(
                  <button key={i} onClick={()=>setInput(q.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-600 transition shrink-0">
                    <q.icon className="text-xs"/> {q.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-5 py-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2.5">
                  <button className="text-gray-400 hover:text-blue-500 transition shrink-0"><HiPlus className="text-xl"/></button>
                  <input value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"/>
                  <button className="text-gray-400 hover:text-blue-500 transition shrink-0"><HiEmojiHappy className="text-xl"/></button>
                  <button onClick={handleSend}
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shrink-0">
                    <HiPaperAirplane className="text-sm"/>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Select a conversation</p>
            </div>
          )}
        </div>

        {/* ── Col 3: Book a Call + Property Context ── */}
        <div className="w-64 border-l border-gray-100 flex flex-col shrink-0 overflow-y-auto">

          {/* Book a Call */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-gray-900">Book a Call</h3>
              <button className="text-gray-400 hover:text-gray-600"><HiInformationCircle className="text-sm"/></button>
            </div>

            {/* Success toast */}
            {scheduledMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-2 rounded-xl mb-3 flex items-center gap-2">
                <HiCheckCircle className="shrink-0"/> {scheduledMsg}
              </div>
            )}

            {/* Calendar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-gray-900">{MONTHS[calMonth]} {calYear}</p>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"><HiChevronLeft className="text-xs"/></button>
                  <button onClick={nextMonth} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"><HiChevronRight className="text-xs"/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS.map((d,i)=><p key={i} className="text-center text-[9px] font-black text-gray-400">{d}</p>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calDays.map((d,i)=>(
                  <button key={i} onClick={()=>d&&setSelDate(d)} disabled={!d}
                    className={`h-6 w-full rounded text-[10px] font-semibold transition ${
                      d===selDate ? "bg-blue-600 text-white" :
                      d ? "hover:bg-gray-100 text-gray-700" : "opacity-0 pointer-events-none"
                    }`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">AVAILABLE SLOTS</p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {TIME_SLOTS.map(slot=>(
                <button key={slot} onClick={()=>setSelSlot(slot)}
                  className={`py-1.5 rounded-xl text-[11px] font-bold transition ${selSlot===slot?"bg-blue-600 text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {slot}
                </button>
              ))}
            </div>

            {/* Meeting type */}
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">MEETING TYPE</p>
            <select value={meetingType} onChange={e=>setMeetingType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 mb-3">
              {MEETING_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>

            <button onClick={handleScheduleCall}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-xs font-black hover:bg-blue-700 transition">
              Schedule Call
            </button>
          </div>

          {/* Property Context */}
          {activeContact?.property && (
            <div className="p-4">
              <h3 className="text-sm font-black text-gray-900 mb-3">Property Context</h3>
              <div className="rounded-xl overflow-hidden border border-gray-100 mb-3">
                <div className="relative">
                  <img src={property.image} alt="property" className="w-full h-24 object-cover"/>
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">Rented</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-gray-900 mb-0.5">{property.title}</p>
                  <p className="text-[10px] text-gray-400 mb-2">{property.address}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">Monthly Rent</p>
                      <p className="text-sm font-black text-blue-600">{property.rent.toLocaleString()} RWF</p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700 transition">
                      <HiExternalLink/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">QUICK ACTIONS</p>
              <div className="space-y-1">
                {[
                  {label:"View Lease History",   icon:HiClock},
                  {label:"Maintenance Logs",     icon:HiCog},
                  {label:"Flag Conversation",    icon:HiFlag, red:true},
                ].map((a,i)=>(
                  <button key={i}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition hover:bg-gray-50 ${a.red?"text-red-500":"text-gray-700"}`}>
                    <a.icon className={`text-sm ${a.red?"text-red-400":"text-gray-400"}`}/> {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}