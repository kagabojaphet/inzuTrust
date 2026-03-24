// src/components/shared/dispute/disputeHelpers.js

export const STAGES = ["Filed", "Evidence Review", "Mediation", "Resolution"];

export const CATEGORIES = [
  { value: "payment",        label: "Payment / Deposit"  },
  { value: "property_damage",label: "Property Damage"    },
  { value: "maintenance",    label: "Maintenance"        },
  { value: "lease_terms",    label: "Lease Terms"        },
  { value: "noise",          label: "Noise / Nuisance"   },
  { value: "fraud",          label: "Fraud"              },
  { value: "other",          label: "Other"              },
];

export const STATUS_STYLE = {
  Open:      { badge: "bg-gray-100 text-gray-600 border border-gray-200",            dot: "bg-gray-400"   },
  Review:    { badge: "bg-blue-50 text-blue-700 border border-blue-200",             dot: "bg-blue-500"   },
  Mediation: { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",       dot: "bg-yellow-500" },
  Resolved:  { badge: "bg-green-50 text-green-700 border border-green-200",          dot: "bg-green-500"  },
  Closed:    { badge: "bg-gray-100 text-gray-500 border border-gray-200",            dot: "bg-gray-400"   },
};

export const mapStatus = raw => {
  if (raw === "open")         return "Open";
  if (raw === "under_review") return "Review";
  if (raw === "mediation")    return "Mediation";
  if (raw === "resolved")     return "Resolved";
  if (raw === "closed")       return "Closed";
  return "Open";
};

export const formatRWF = n => n ? `${Number(n).toLocaleString()} RWF` : "—";
export const fmtDate   = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
export const fmtTime   = d => d ? new Date(d).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" }) : "";