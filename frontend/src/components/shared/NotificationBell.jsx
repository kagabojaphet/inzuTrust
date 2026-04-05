// src/components/shared/NotificationBell.jsx
// Reusable notification bell for all dashboards: landlord, tenant, agent, admin
import { useState, useEffect, useRef, useCallback } from "react";
import {
  HiBell, HiX, HiCheckCircle, HiCheck,
  HiExclamation, HiInformationCircle, HiCreditCard,
  HiDocumentText, HiChat, HiCog, HiShieldCheck, HiOfficeBuilding,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}` });

// ── Icon + color map by notification type ─────────────────────────────────────
const TYPE_META = {
  lease_signed:        { icon: HiDocumentText,    color: "text-green-600",  bg: "bg-green-50"  },
  lease_pending:       { icon: HiDocumentText,    color: "text-amber-600",  bg: "bg-amber-50"  },
  lease_application:   { icon: HiDocumentText,    color: "text-blue-600",   bg: "bg-blue-50"   },
  payment_received:    { icon: HiCreditCard,      color: "text-green-600",  bg: "bg-green-50"  },
  payment_due:         { icon: HiCreditCard,      color: "text-amber-600",  bg: "bg-amber-50"  },
  payment_late:        { icon: HiCreditCard,      color: "text-red-600",    bg: "bg-red-50"    },
  dispute_opened:      { icon: HiExclamation,     color: "text-red-600",    bg: "bg-red-50"    },
  dispute_updated:     { icon: HiExclamation,     color: "text-amber-600",  bg: "bg-amber-50"  },
  dispute_resolved:    { icon: HiCheckCircle,     color: "text-green-600",  bg: "bg-green-50"  },
  maintenance_new:     { icon: HiCog,             color: "text-blue-600",   bg: "bg-blue-50"   },
  maintenance_update:  { icon: HiCog,             color: "text-amber-600",  bg: "bg-amber-50"  },
  maintenance_resolved:{ icon: HiCheckCircle,     color: "text-green-600",  bg: "bg-green-50"  },
  maintenance_assigned:{ icon: HiCog,             color: "text-indigo-600", bg: "bg-indigo-50" },
  agent_assigned:      { icon: HiShieldCheck,     color: "text-indigo-600", bg: "bg-indigo-50" },
  agent_created:       { icon: HiShieldCheck,     color: "text-blue-600",   bg: "bg-blue-50"   },
  kyc_approved:        { icon: HiCheckCircle,     color: "text-green-600",  bg: "bg-green-50"  },
  kyc_rejected:        { icon: HiExclamation,     color: "text-red-600",    bg: "bg-red-50"    },
  trust_score_changed: { icon: HiShieldCheck,     color: "text-blue-600",   bg: "bg-blue-50"   },
  message_received:    { icon: HiChat,            color: "text-indigo-600", bg: "bg-indigo-50" },
  property_verified:   { icon: HiOfficeBuilding,  color: "text-green-600",  bg: "bg-green-50"  },
  property_rejected:   { icon: HiOfficeBuilding,  color: "text-red-600",    bg: "bg-red-50"    },
  viewing_confirmed:   { icon: HiCheckCircle,     color: "text-green-600",  bg: "bg-green-50"  },
  viewing_cancelled:   { icon: HiX,               color: "text-red-600",    bg: "bg-red-50"    },
  general:             { icon: HiInformationCircle, color: "text-gray-600", bg: "bg-gray-100"  },
};

const getMeta = type => TYPE_META[type] || TYPE_META.general;

const timeAgo = d => {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return "Just now";
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800)return `${Math.floor(s/86400)}d ago`;
  return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short" });
};

export default function NotificationBell({ token, onNavigate }) {
  const [open,         setOpen]         = useState(false);
  const [notifications,setNotifications]= useState([]);
  const [unread,       setUnread]       = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [markingAll,   setMarkingAll]   = useState(false);
  const panelRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/notifications/unread-count`, { headers: hdrs(token) });
      const d = await r.json();
      if (d.success) setUnread(d.count || 0);
    } catch {}
  }, [token]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/notifications?limit=50`, { headers: hdrs(token) });
      const d = await r.json();
      if (d.success) setNotifications(d.data || []);
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const t = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(t);
  }, [fetchUnreadCount]);

  // Load notifications when panel opens
  useEffect(() => { if (open) fetchAll(); }, [open, fetchAll]);

  // Click outside to close
  useEffect(() => {
    const handler = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: "PUT", headers: hdrs(token) });
      setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
      setUnread(u => Math.max(0, u - 1));
    } catch {}
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await fetch(`${API}/notifications/read-all`, { method: "PUT", headers: hdrs(token) });
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnread(0);
    } catch {}
    finally { setMarkingAll(false); }
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/notifications/${id}`, { method: "DELETE", headers: hdrs(token) });
      setNotifications(n => n.filter(x => x.id !== id));
      setUnread(u => {
        const item = notifications.find(x => x.id === id);
        return item && !item.isRead ? Math.max(0, u - 1) : u;
      });
    } catch {}
  };

  const handleClick = (notif) => {
    if (!notif.isRead) markRead(notif.id);
    // Navigate to relevant page if callback provided
    if (onNavigate && notif.referenceType) {
      const map = {
        MaintenanceRequest: "maintenance", Agreement: "agreements",
        Payment: "payments", Dispute: "disputes", Message: "messages",
        Property: "properties", AgentProperty: "agents",
      };
      const page = map[notif.referenceType];
      if (page) { onNavigate(page); setOpen(false); }
    }
  };

  const unreadList = notifications.filter(n => !n.isRead);
  const readList   = notifications.filter(n =>  n.isRead);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl transition">
        <HiBell className="text-xl"/>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[17px] h-[17px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[520px]">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-black text-gray-900 text-sm">Notifications</h3>
              {unread > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{unread} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAll} disabled={markingAll}
                  className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 rounded-xl transition disabled:opacity-60">
                  <HiCheck/> {markingAll ? "Marking..." : "Mark all read"}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <HiX className="text-sm"/>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({length:5}).map((_,i)=>(
                  <div key={i} className="flex gap-3">
                    <Skeleton circle width={36} height={36} className="shrink-0"/>
                    <div className="flex-1">
                      <Skeleton width="70%" height={12} borderRadius={4}/>
                      <Skeleton width="90%" height={10} borderRadius={4} className="mt-1.5"/>
                      <Skeleton width="30%" height={9} borderRadius={4} className="mt-1"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <HiBell className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-500 font-semibold text-sm">You're all caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
              </div>
            ) : (
              <>
                {/* Unread section */}
                {unreadList.length > 0 && (
                  <div>
                    <p className="px-5 pt-3 pb-1 text-[9px] font-black text-gray-400 uppercase tracking-wider">New</p>
                    {unreadList.map(n => <NotifItem key={n.id} notif={n} onClick={handleClick} onDelete={deleteNotif}/>)}
                  </div>
                )}
                {/* Read section */}
                {readList.length > 0 && (
                  <div>
                    <p className="px-5 pt-3 pb-1 text-[9px] font-black text-gray-400 uppercase tracking-wider">Earlier</p>
                    {readList.map(n => <NotifItem key={n.id} notif={n} onClick={handleClick} onDelete={deleteNotif}/>)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 shrink-0">
              <p className="text-[10px] text-gray-400 text-center">{notifications.length} notification{notifications.length !== 1 ? "s" : ""} total</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifItem({ notif, onClick, onDelete }) {
  const { icon: Icon, color, bg } = getMeta(notif.type);
  return (
    <div onClick={() => onClick(notif)}
      className={`group flex gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition relative ${!notif.isRead ? "bg-blue-50/40" : ""}`}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`text-sm ${color}`}/>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p className={`text-xs leading-snug ${notif.isRead ? "font-semibold text-gray-700" : "font-black text-gray-900"}`}>
          {notif.title}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
      {/* Unread dot */}
      {!notif.isRead && (
        <span className="absolute top-4 right-9 w-2 h-2 bg-blue-500 rounded-full shrink-0"/>
      )}
      {/* Delete button */}
      <button onClick={e => onDelete(notif.id, e)}
        className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 rounded transition">
        <HiX className="text-xs"/>
      </button>
    </div>
  );
}