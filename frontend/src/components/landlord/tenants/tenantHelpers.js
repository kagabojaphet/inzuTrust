// src/components/landlord/tenants/tenantHelpers.js
import { API_BASE } from "../../../config";

export const hdrs = (tk) => ({
  Authorization: `Bearer ${tk}`,
  "Content-Type": "application/json",
});

export const formatRWF = (n) => {
  if (!n) return "—";
  return new Intl.NumberFormat("rw-RW").format(n) + " RWF";
};

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const RISK = {
  Low:    { bar: "bg-green-500",  badge: "text-green-700 bg-green-50 border-green-200",  width: "35%" },
  Medium: { bar: "bg-amber-400",  badge: "text-amber-700 bg-amber-50 border-amber-200",  width: "65%" },
  High:   { bar: "bg-red-500",    badge: "text-red-700 bg-red-50 border-red-200",        width: "92%" },
};

// Derive risk from trust score
export const getRisk = (score) => {
  if (!score) return "Medium";
  if (score >= 80) return "Low";
  if (score >= 55) return "Medium";
  return "High";
};

export const STATUS_BADGE = {
  active:    "bg-green-50 text-green-700 border border-green-200",
  pending:   "bg-amber-50 text-amber-700 border border-amber-200",
  inactive:  "bg-gray-100 text-gray-500 border border-gray-200",
  signed:    "bg-blue-50 text-blue-700 border border-blue-200",
};

// ── Fetch all tenants for this landlord (via active agreements) ───────────────
export const fetchTenants = async (token, { page = 1, limit = 10, search = "" } = {}) => {
  const params = new URLSearchParams({ page, limit, ...(search && { search }) });
  const res    = await fetch(`${API_BASE}/agreements?${params}`, { headers: hdrs(token) });
  const data   = await res.json();
  if (!data.success) throw new Error(data.message);

  // Extract unique tenants from agreements that are signed/active
  const tenantMap = new Map();
  (data.data || []).forEach(agr => {
    if (!agr.tenant) return;
    const t = agr.tenant;
    if (!tenantMap.has(t.id)) {
      tenantMap.set(t.id, {
        id:          t.id,
        firstName:   t.firstName,
        lastName:    t.lastName,
        email:       t.email,
        phone:       t.phone,
        isVerified:  t.isVerified,
        trustScore:  t.tenantProfile?.trustScore ?? null,
        property:    agr.property?.title || "—",
        propertyId:  agr.property?.id,
        rentAmount:  agr.rentAmount,
        status:      agr.status,
        startDate:   agr.startDate,
        endDate:     agr.endDate,
        agreementId: agr.id,
      });
    }
  });

  return {
    tenants:    [...tenantMap.values()],
    total:      data.pagination?.total || tenantMap.size,
    totalPages: data.pagination?.totalPages || 1,
  };
};