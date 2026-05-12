// src/components/shared/messages/messageHelpers.js
import { API_BASE } from "../../../config";

export const API_BASE_URL = (() => {
  const base = API_BASE
    || (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
    || "https://inzutrust-api.onrender.com/api";
  return base.replace(/\/$/, "");
})();

export const isOnline = (lastSeenAt) =>
  !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < 3 * 60 * 1000;

export const getInitials = (firstName = "", lastName = "") =>
  `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase() || "??";

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export const fmtDateLabel = (d) => {
  if (!d) return "";
  const date      = new Date(d);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString())     return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday:"long", month:"short", day:"numeric" });
};

// ── Role display metadata — all 4 roles ───────────────────────────────────────
export const ROLE_META = {
  tenant:   { label:"Tenant",   badge:"bg-blue-50 text-blue-700"     },
  landlord: { label:"Landlord", badge:"bg-indigo-50 text-indigo-700" },
  agent:    { label:"Agent",    badge:"bg-teal-50 text-teal-700"     },
  admin:    { label:"Admin",    badge:"bg-slate-100 text-slate-700"  },
};

export const MSG_TYPE_META = {
  lease_draft:     { label:"Lease Draft",     color:"blue",  icon:true },
  payment_request: { label:"Payment Request", color:"amber", icon:true },
  proposal:        { label:"Proposal",        color:"blue",  icon:true },
};

export const apiGet = async (url, token) => {
  const res = await fetch(url, {
    headers: { Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

export const apiPost = async (url, body, token) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};