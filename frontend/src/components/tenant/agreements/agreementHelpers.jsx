// src/components/tenant/agreements/agreementHelpers.js

export const formatRWF = n => `${Number(n || 0).toLocaleString()} RWF`;

export const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

// Map real API status → display label
export const mapStatus = raw => {
  if (!raw)                         return "Pending Signature";
  if (raw === "signed")             return "Signed";
  if (raw === "pending_signature")  return "Pending Signature";
  if (raw === "expired")            return "Expired";
  if (raw === "terminated")         return "Expired";
  if (raw === "draft")              return "Pending Signature";
  return raw;
};

export const isPendingStatus = status =>
  status === "pending_signature" || status === "draft";

export const isSignedStatus = status => status === "signed";

// Extract display fields from real API shape
export const normaliseAgreement = a => ({
  propertyTitle:    a.property?.title    || a.propertyAddress || "—",
  propertyDistrict: a.property?.district || a.district        || "",
  landlordName:     a.landlord
    ? `${a.landlord.firstName} ${a.landlord.lastName}`
    : (a.landlordName || "Landlord"),
  docLabel: a.docId || a.id?.slice(0, 8),
});

export const STATUS_STYLE = {
  "Pending Signature": {
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon:  "clock",
  },
  "Signed": {
    badge: "bg-green-50 text-green-700 border border-green-200",
    icon:  "check",
  },
  "Expired": {
    badge: "bg-red-50 text-red-600 border border-red-200",
    icon:  "exclamation",
  },
};