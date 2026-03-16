import React, { useState } from "react";
import { HiCheckCircle, HiBell, HiTrash, HiCheck } from "react-icons/hi";

const initialNotifications = [
  { id: 1,  type: "payment",     icon: "💳", title: "November rent due in 17 days",               body: "Your next payment of RWF 250,000 is due on November 1st, 2026.",     time: "2 hours ago",   read: false },
  { id: 2,  type: "maintenance", icon: "🔧", title: "Maintenance request update",                  body: "Your plumbing request has been scheduled. Technician visits Oct 14.", time: "5 hours ago",   read: false },
  { id: 3,  type: "message",     icon: "💬", title: "New message from Property Manager",           body: "Your maintenance request has been scheduled.",                       time: "5 hours ago",   read: false },
  { id: 4,  type: "trust",       icon: "⭐", title: "Trust Score increased to 85!",               body: "Great job! Your score went up +15 points this month.",               time: "Yesterday",     read: true  },
  { id: 5,  type: "payment",     icon: "✅", title: "October rent payment confirmed",              body: "RWF 250,000 successfully received and recorded.",                    time: "Oct 01, 2026",  read: true  },
  { id: 6,  type: "message",     icon: "💬", title: "InzuTrust Support: payment feedback",         body: "How was your last payment experience? Reply to let us know.",        time: "Oct 01, 2026",  read: true  },
  { id: 7,  type: "system",      icon: "📋", title: "Lease reminder: 8 months remaining",         body: "Your lease expires in 8 months. Consider renewal discussions early.", time: "Sep 28, 2026", read: true  },
  { id: 8,  type: "trust",       icon: "🏅", title: "Badge earned: 6-Month Streak!",              body: "You've paid rent on time for 6 consecutive months. Amazing work!",   time: "Sep 15, 2026",  read: true  },
];

const typeColors = {
  payment:     "bg-green-50 border-green-200",
  maintenance: "bg-orange-50 border-orange-200",
  message:     "bg-blue-50 border-blue-200",
  trust:       "bg-purple-50 border-purple-200",
  system:      "bg-gray-50 border-gray-200",
};
const typeLabels = { payment: "Payment", maintenance: "Maintenance", message: "Message", trust: "Trust", system: "System" };
const typeBadgeColors = {
  payment:     "bg-green-100 text-green-700",
  maintenance: "bg-orange-100 text-orange-700",
  message:     "bg-blue-100 text-blue-700",
  trust:       "bg-purple-100 text-purple-700",
  system:      "bg-gray-100 text-gray-600",
};

export default function Notifications() {
  const [notifs, setNotifs] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const remove = (id) => setNotifs(n => n.filter(x => x.id !== id));
  const clearAll = () => setNotifs([]);

  const unreadCount = notifs.filter(n => !n.read).length;
  const filtered = filter === "all" ? notifs : filter === "unread" ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <HiBell className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
              <HiCheck /> Mark all read
            </button>
          )}
          <button onClick={clearAll}
            className="border border-red-200 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition flex items-center gap-2">
            <HiTrash /> Clear all
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[["all","All"],["unread","Unread"],["payment","Payment"],["maintenance","Maintenance"],["message","Message"],["trust","Trust"],["system","System"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === val ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            {lbl}
            {val === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <span className="text-5xl block mb-3">🔔</span>
            <p className="font-semibold">No notifications here</p>
          </div>
        )}
        {filtered.map(n => (
          <div key={n.id}
            className={`relative flex items-start gap-4 p-5 rounded-2xl border transition group ${typeColors[n.type]} ${!n.read ? "shadow-sm" : "opacity-75"}`}>
            {!n.read && (
              <div className="absolute top-5 right-12 w-2 h-2 bg-blue-600 rounded-full" />
            )}
            <div className="text-2xl shrink-0 mt-0.5">{n.icon}</div>
            <div className="flex-1 min-w-0" onClick={() => markRead(n.id)} style={{ cursor: n.read ? "default" : "pointer" }}>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBadgeColors[n.type]}`}>
                  {typeLabels[n.type]}
                </span>
                <span className="text-xs text-gray-400">{n.time}</span>
              </div>
              <p className={`font-bold text-gray-900 text-sm mb-0.5 ${!n.read ? "" : "font-semibold"}`}>{n.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
            </div>
            <button onClick={() => remove(n.id)}
              className="text-gray-300 hover:text-red-400 transition shrink-0 opacity-0 group-hover:opacity-100">
              <HiTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}