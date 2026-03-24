// src/components/shared/messages/messageHelpers.js

export const API_BASE_URL = (typeof window !== "undefined" && window.__API_BASE__)
  || import.meta?.env?.VITE_API_URL
  || "http://localhost:5000/api";

// ── Role styling ──────────────────────────────────────────────────────────────
export const ROLE_META = {
  tenant:   { badge: "bg-green-100 text-green-700",  label: "TENANT"   },
  landlord: { badge: "bg-blue-100 text-blue-700",    label: "LANDLORD" },
  admin:    { badge: "bg-red-100 text-red-700",      label: "ADMIN"    },
  agent:    { badge: "bg-purple-100 text-purple-700",label: "AGENT"    },
};

// ── Message type labels ───────────────────────────────────────────────────────
export const MSG_TYPE_META = {
  lease_draft:     { icon: "📄", label: "Lease Draft",      color: "blue"   },
  payment_request: { icon: "💳", label: "Payment Request",  color: "amber"  },
  proposal:        { icon: "📅", label: "Proposal",         color: "purple" },
  system:          { icon: "🔔", label: "System Notice",    color: "gray"   },
  text:            { icon: null, label: null,               color: null     },
};

// ── Formatters ────────────────────────────────────────────────────────────────
export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export const fmtDateLabel = (d) => {
  if (!d) return "";
  const date  = new Date(d);
  const today = new Date();
  const diff  = Math.floor((today - date) / 86400000);
  if (diff === 0) return "TODAY";
  if (diff === 1) return "YESTERDAY";
  return date.toLocaleDateString("en-RW", { weekday: "long", month: "short", day: "numeric" });
};

export const getInitials = (firstName = "", lastName = "") =>
  `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

// ── Online presence ───────────────────────────────────────────────────────────
// A user is "online" if their lastSeenAt was within the last 3 minutes
export const isOnline = (lastSeenAt) => {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 3 * 60 * 1000;
};

// ── API helpers ───────────────────────────────────────────────────────────────
export const apiGet = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

export const apiPost = (url, body, token) =>
  fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  }).then(r => r.json());