// src/components/landlord/agreements/agreementHelpers.js

export const formatRWF = n => `${Number(n || 0).toLocaleString()} RWF`;

export const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const inp =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

export const DISTRICTS = [
  "Gasabo", "Nyarugenge", "Kicukiro", "Bugesera", "Gatsibo",
  "Kayonza", "Kirehe", "Ngoma", "Rwamagana",
];

export const DURATIONS = ["1", "3", "6", "9", "12", "18", "24"];

export const STEPS = [
  { id: 1, label: "Property Details",  sub: "Property & parties"    },
  { id: 2, label: "Lease Terms",       sub: "Duration & financials" },
  { id: 3, label: "Review Agreement",  sub: "Preview document"      },
  { id: 4, label: "Sign & Finalize",   sub: "Landlord e-signature"  },
];

// Map real API status → display label for the table
export const mapDisplayStatus = raw => {
  if (raw === "signed")            return "Active";
  if (raw === "pending_signature") return "Pending";
  if (raw === "expired")           return "Expired";
  if (raw === "terminated")        return "Expired";
  return "Pending";
};

export const STATUS_STYLE = {
  Active:   { badge: "bg-green-50 text-green-700 border border-green-200"   },
  Pending:  { badge: "bg-blue-50 text-blue-700 border border-blue-200"      },
  Expiring: { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200"},
  Expired:  { badge: "bg-red-50 text-red-600 border border-red-200"         },
};

// Normalise a row from the real API for the table
export const normaliseRow = a => ({
  tenantName:     a.tenant
    ? `${a.tenant.firstName || ""} ${a.tenant.lastName || ""}`.trim()
    : (a.tenantName || "Unknown"),
  propertyTitle:  a.property?.title || a.property || "—",
  startDisplay:   fmtDate(a.startDate || a.start),
  endDisplay:     fmtDate(a.endDate   || a.end),
  rent:           a.rentAmount || a.rent || 0,
  displayStatus:  mapDisplayStatus(a.status),
});