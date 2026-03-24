// src/components/admin/disputes/disputeAdminHelpers.js

export const STAGE_LABELS = ["Filed", "Evidence Review", "Mediation", "Resolution"];

export const STATUS_META = {
  open:         { label: "Open",         badge: "bg-blue-50 text-blue-700 border border-blue-200",       dot: "bg-blue-500"   },
  under_review: { label: "Under Review", badge: "bg-amber-50 text-amber-700 border border-amber-200",    dot: "bg-amber-500"  },
  mediation:    { label: "Mediation",    badge: "bg-purple-50 text-purple-700 border border-purple-200", dot: "bg-purple-500" },
  resolved:     { label: "Resolved",     badge: "bg-green-50 text-green-700 border border-green-200",    dot: "bg-green-500"  },
  closed:       { label: "Closed",       badge: "bg-gray-100 text-gray-500 border border-gray-200",      dot: "bg-gray-400"   },
};

export const CATEGORY_LABELS = {
  property_damage: "Property Damage",
  maintenance:     "Maintenance",
  lease_terms:     "Lease Terms",
  payment:         "Payment / Deposit",
  noise:           "Noise",
  fraud:           "Fraud",
  other:           "Other",
};

export const formatRWF = (n) =>
  n ? `RWF ${Number(n).toLocaleString()}` : "—";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export const PAGE_SIZE = 8;