// src/components/admin/disputes/DisputeTable.jsx
// Stat cards + search/filter bar + table + pagination
import React from "react";
import {
  HiEye, HiCheckCircle, HiClock, HiSearch, HiRefresh,
  HiChevronDown, HiShieldCheck, HiChevronLeft, HiChevronRight, HiScale,
} from "react-icons/hi";
import { StatusBadge, StageBar } from "./DisputeAtoms";
import {
  CATEGORY_LABELS, STAGE_LABELS,
  formatRWF, fmtDate, PAGE_SIZE,
} from "./disputeAdminHelpers";

// ── 4 top stat cards ──────────────────────────────────────────────────────────
function StatCards({ counts }) {
  const cards = [
    { label: "Total Cases",  value: counts.all,          color: "bg-blue-600",   Icon: HiScale       },
    { label: "Open",         value: counts.open,         color: "bg-amber-500",  Icon: HiClock       },
    { label: "Under Review", value: counts.under_review, color: "bg-purple-600", Icon: HiShieldCheck },
    { label: "Resolved",     value: counts.resolved,     color: "bg-green-600",  Icon: HiCheckCircle },
  ];
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, color, Icon }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
          <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
            <Icon className="text-white text-lg" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Search + category + status tabs bar ───────────────────────────────────────
function FiltersBar({ search, setSearch, category, setCategory, status, setStatus, counts, onReset }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); onReset(); }}
            placeholder="Search by ID, title, or party name..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); onReset(); }}
            className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mt-3 border-t border-gray-100 pt-3">
        {[
          { value: "all",          label: "All",          count: counts.all          },
          { value: "open",         label: "Open",         count: counts.open         },
          { value: "under_review", label: "Under Review", count: counts.under_review },
          { value: "mediation",    label: "Mediation",    count: counts.mediation    },
          { value: "resolved",     label: "Resolved",     count: counts.resolved     },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); onReset(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${status === tab.value ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black
              ${status === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Table rows ────────────────────────────────────────────────────────────────
function DisputeRow({ d, onView }) {
  return (
    <tr className="hover:bg-gray-50/60 transition-all">
      <td className="px-5 py-4">
        <p className="font-mono font-bold text-blue-600 text-sm">{d.docId}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">{d.title}</p>
      </td>
      <td className="px-5 py-4 text-xs space-y-0.5">
        <p className="font-semibold text-gray-700">
          {d.reporter?.firstName} {d.reporter?.lastName}
          <span className="ml-1 text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded uppercase font-bold">
            {d.reporter?.role}
          </span>
        </p>
        <p className="text-gray-400">
          vs {d.respondent ? `${d.respondent.firstName} ${d.respondent.lastName}` : "—"}
          {d.respondent && (
            <span className="ml-1 text-[9px] text-purple-600 bg-purple-50 px-1 py-0.5 rounded uppercase font-bold">
              {d.respondent.role}
            </span>
          )}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium">
          {CATEGORY_LABELS[d.category] || d.category}
        </span>
      </td>
      <td className="px-5 py-4 text-sm font-bold text-gray-800">{formatRWF(d.claimAmount)}</td>
      <td className="px-5 py-4">
        <StageBar stage={d.stage} />
        <p className="text-[9px] text-gray-400 mt-1">{STAGE_LABELS[d.stage]}</p>
      </td>
      <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
      <td className="px-5 py-4 text-xs text-gray-500">{fmtDate(d.createdAt)}</td>
      <td className="px-5 py-4 text-right">
        <button
          onClick={() => onView(d.id)}
          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 ml-auto"
        >
          <HiEye /> View
        </button>
      </td>
    </tr>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, setPage, total, totalPages }) {
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
      <p className="text-xs text-gray-500">
        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} disputes
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
        >
          <HiChevronLeft className="text-sm" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1
            : page <= 3 ? i + 1
            : page >= totalPages - 2 ? totalPages - 4 + i
            : page - 2 + i;
          return (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition
                ${page === p ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
              {p}
            </button>
          );
        })}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
        >
          <HiChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DisputeTable({
  disputes, loading,
  search, setSearch,
  status, setStatus,
  category, setCategory,
  page, setPage,
  onRefresh, onView,
}) {
  const filtered = disputes.filter(d => {
    const q = search.toLowerCase();
    return (
      (!q ||
        d.docId?.toLowerCase().includes(q) ||
        d.title?.toLowerCase().includes(q) ||
        d.reporter?.firstName?.toLowerCase().includes(q) ||
        d.reporter?.lastName?.toLowerCase().includes(q) ||
        d.respondent?.firstName?.toLowerCase().includes(q) ||
        d.respondent?.lastName?.toLowerCase().includes(q)) &&
      (category === "all" || d.category === category)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all:          disputes.length,
    open:         disputes.filter(d => d.status === "open").length,
    under_review: disputes.filter(d => d.status === "under_review").length,
    mediation:    disputes.filter(d => d.status === "mediation").length,
    resolved:     disputes.filter(d => d.status === "resolved" || d.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      <StatCards counts={counts} />

      <FiltersBar
        search={search}       setSearch={setSearch}
        category={category}   setCategory={setCategory}
        status={status}       setStatus={setStatus}
        counts={counts}
        onReset={() => setPage(1)}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">Loading disputes...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <HiScale className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">No disputes found</p>
            <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Parties</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Claim</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Filed</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(d => (
                  <DisputeRow key={d.id} d={d} onView={onView} />
                ))}
              </tbody>
            </table>
            <Pagination page={page} setPage={setPage} total={filtered.length} totalPages={totalPages} />
          </>
        )}
      </div>
    </div>
  );
}