// src/components/landlord/agents/agentHelpers.js
import { API_BASE } from "../../../config";

export const hdrs = (tk) => ({
  Authorization: `Bearer ${tk}`,
  "Content-Type": "application/json",
});

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const isOnline = (d) => d && Date.now() - new Date(d) < 3 * 60 * 1000;

export const PERM_LABELS = {
  canEditDetails:       { label: "Edit Details",    color: "blue"   },
  canManageTenants:     { label: "Manage Tenants",  color: "indigo" },
  canViewPayments:      { label: "View Payments",   color: "green"  },
  canHandleMaintenance: { label: "Maintenance",     color: "amber"  },
};

export const PERM_COLORS = {
  blue:   "bg-blue-50 text-blue-700 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  green:  "bg-green-50 text-green-700 border-green-200",
  amber:  "bg-amber-50 text-amber-700 border-amber-200",
};

// ── API calls ─────────────────────────────────────────────────────────────────
export const fetchAgents = async (token) => {
  const res  = await fetch(`${API_BASE}/agents`, { headers: hdrs(token) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data || [];
};

export const fetchProperties = async (token) => {
  const res  = await fetch(`${API_BASE}/properties/my/list`, { headers: hdrs(token) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data || [];
};

export const fetchAgentDetail = async (token, agentId) => {
  const res  = await fetch(`${API_BASE}/agents/${agentId}`, { headers: hdrs(token) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const apiCreateAgent = async (token, form) => {
  const res  = await fetch(`${API_BASE}/agents/create`, {
    method: "POST", headers: hdrs(token), body: JSON.stringify(form),
  });
  return res.json();
};

export const apiAssign = async (token, payload) => {
  const res  = await fetch(`${API_BASE}/agents/assign`, {
    method: "POST", headers: hdrs(token), body: JSON.stringify(payload),
  });
  return res.json();
};

export const apiRevoke = async (token, agentId, propertyId) => {
  const res  = await fetch(`${API_BASE}/agents/revoke`, {
    method: "DELETE", headers: hdrs(token), body: JSON.stringify({ agentId, propertyId }),
  });
  return res.json();
};