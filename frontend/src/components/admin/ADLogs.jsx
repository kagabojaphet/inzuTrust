// src/components/admin/ADLogs.jsx — System Logs & Audit Trail
import React, { useState, useEffect, useCallback } from "react";
import {
  HiSearch, HiRefresh, HiDownload, HiEye,
  HiShieldCheck, HiCheckCircle, HiX,
} from "react-icons/hi";
import { API_BASE } from "../../config";

const hdrs = tk => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });

const fmtTimestamp = d => {
  if (!d) return { date: "—", time: "—" };
  const dt = new Date(d);
  return {
    date: dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  };
};

const SEV = {
  INFO:     { badge: "bg-blue-50 text-blue-700 border border-blue-200",          dot: "bg-blue-500"   },
  SUCCESS:  { badge: "bg-green-50 text-green-700 border border-green-200",       dot: "bg-green-500"  },
  WARNING:  { badge: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400"  },
  ERROR:    { badge: "bg-red-50 text-red-600 border border-red-200",             dot: "bg-red-500"    },
  CRITICAL: { badge: "bg-red-100 text-red-800 border border-red-300 font-black", dot: "bg-red-700"    },
};

const ROLE_COLOR = {
  admin:    "bg-slate-100 text-slate-700",
  landlord: "bg-indigo-50 text-indigo-700",
  tenant:   "bg-blue-50 text-blue-700",
  system:   "bg-gray-100 text-gray-500",
};

function LogDrawer({ log: l, onClose }) {
  const ss = SEV[l.severity] || SEV.INFO;
  const ts = fmtTimestamp(l.createdAt);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-black text-gray-900">Log Entry Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400">
            <HiX className="text-lg" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${ss.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />{l.severity}
          </span>
          <div className="bg-gray-50 rounded-2xl p-5 divide-y divide-gray-100">
            {[
              { label: "Action",    value: l.action },
              { label: "Target",    value: l.target || "—" },
              { label: "Actor",     value: l.actorName || "System" },
              { label: "Role",      value: l.actorRole || "system" },
              { label: "Timestamp", value: `${ts.date} ${ts.time}` },
              { label: "Source IP", value: l.sourceIp || "—" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between py-2.5 text-sm">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{r.label}</span>
                <span className="font-semibold text-gray-800 truncate max-w-[60%] text-right">{r.value}</span>
              </div>
            ))}
          </div>
          {l.metadata && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Metadata</p>
              <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
                {JSON.stringify(l.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 gap-3 px-5 py-4 items-center animate-pulse">
      <div className="col-span-2 space-y-1.5">
        <div className="h-2.5 bg-gray-200 rounded w-20" />
        <div className="h-2 bg-gray-100 rounded w-14" />
      </div>
      <div className="col-span-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-2.5 bg-gray-200 rounded w-24" />
          <div className="h-2 bg-gray-100 rounded w-14" />
        </div>
      </div>
      <div className="col-span-3 space-y-1.5">
        <div className="h-2.5 bg-gray-200 rounded w-32" />
        <div className="h-2 bg-gray-100 rounded w-20" />
      </div>
      <div className="col-span-2"><div className="h-2.5 bg-gray-200 rounded w-24" /></div>
      <div className="col-span-1"><div className="h-5 bg-gray-200 rounded-full w-16" /></div>
      <div className="col-span-1 flex justify-end"><div className="w-7 h-7 rounded-lg bg-gray-200" /></div>
    </div>
  );
}

export default function ADLogs({ token }) {
  const [logs,       setLogs]       = useState([]);
  const [totalLogs,  setTotalLogs]  = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [debSearch,  setDebSearch]  = useState("");
  const [severity,   setSeverity]   = useState("all");
  const [dateRange,  setDateRange]  = useState("24h");
  const [page,       setPage]       = useState(1);
  const [viewing,    setViewing]    = useState(null);
  const [sevCounts,  setSevCounts]  = useState({ INFO: 0, SUCCESS: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 });

  const LIMIT = 50;

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debSearch, severity, dateRange]);

  const fetchLogs = useCallback(async () => {
    if (!token) {
      setError("No auth token provided to ADLogs component.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT, dateRange });
      if (debSearch)          params.set("search",   debSearch);
      if (severity !== "all") params.set("severity", severity);

      const url = `${API_BASE}/admin/logs?${params}`;
      console.log("[ADLogs] GET", url);

      const res  = await fetch(url, { headers: hdrs(token) });
      const data = await res.json();

      console.log("[ADLogs] status:", res.status, "| rows:", data.data?.length, "| total:", data.pagination?.total);

      if (!res.ok) {
        setError(`Server error ${res.status}: ${data.message || "unknown error"}`);
        return;
      }

      if (data.success) {
        const rows = data.data || [];
        setLogs(rows);

        // ── Read pagination safely — no operator precedence issues ──────────
        const total = (data.pagination != null ? data.pagination.total : null)
                   ?? data.total
                   ?? 0;
        const pages = (data.pagination != null ? data.pagination.totalPages : null)
                   ?? data.totalPages
                   ?? 1;
        setTotalLogs(total);
        setTotalPages(pages);

        // Use backend summary if present, otherwise count from current rows
        if (data.summary && typeof data.summary === "object") {
          setSevCounts({ INFO: 0, SUCCESS: 0, WARNING: 0, ERROR: 0, CRITICAL: 0, ...data.summary });
        } else {
          const counts = { INFO: 0, SUCCESS: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
          rows.forEach(l => { if (l.severity in counts) counts[l.severity]++; });
          setSevCounts(counts);
        }
      } else {
        setError(data.message || "API returned success: false");
      }
    } catch (e) {
      console.error("[ADLogs] fetch error:", e);
      setError(`Network error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [token, page, debSearch, severity, dateRange]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportCSV = () => {
    const rows = [
      ["Timestamp","Actor","Role","Action","Target","Source IP","Severity"],
      ...logs.map(l => {
        const ts = fmtTimestamp(l.createdAt);
        return [`${ts.date} ${ts.time}`, l.actorName||"System", l.actorRole||"system",
                l.action, l.target||"—", l.sourceIp||"—", l.severity];
      }),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const pageNums = () => {
    const t = totalPages;
    if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", t];
    if (page >= t - 2) return [1, "...", t-2, t-1, t];
    return [1, "...", page-1, page, page+1, "...", t];
  };

  const clearFilters = () => { setSeverity("all"); setSearch(""); setDateRange("24h"); };
  const hasFilters   = severity !== "all" || !!search || dateRange !== "24h";

  return (
    <div className="space-y-6">
      {viewing && <LogDrawer log={viewing} onClose={() => setViewing(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">System Logs & Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring of security-sensitive operations across the InzuTrust ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
            <HiDownload /> Export CSV
          </button>
          <button onClick={fetchLogs}
            className="p-2.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition">
            <HiRefresh className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Search Logs</label>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="User, IP, action, or keyword..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Severity Level</label>
            <div className="relative">
              <select value={severity} onChange={e => setSeverity(e.target.value)}
                className="appearance-none w-full pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer">
                <option value="all">All Severities</option>
                {["info","success","warning","error","critical"].map(s => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Date Range</label>
            <div className="relative">
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                className="appearance-none w-full pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer">
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>
        </div>
        {hasFilters && (
          <div className="flex justify-end mt-3">
            <button onClick={clearFilters} className="text-blue-600 text-xs font-bold hover:underline">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-3">Identity</div>
          <div className="col-span-3">Action / Event</div>
          <div className="col-span-2">Source IP</div>
          <div className="col-span-1">Severity</div>
          <div className="col-span-1 text-right">Details</div>
        </div>
        <div className="divide-y divide-gray-50">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : logs.length === 0
            ? (
              <div className="py-16 text-center">
                <HiShieldCheck className="text-4xl text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No log entries found</p>
                <p className="text-xs text-gray-300 mt-1">
                  {hasFilters ? "Try adjusting your filters" : "Logs will appear as actions are performed"}
                </p>
              </div>
            )
            : logs.map((l, i) => {
              const ss   = SEV[l.severity] || SEV.INFO;
              const rc   = ROLE_COLOR[l.actorRole] || ROLE_COLOR.system;
              const ts   = fmtTimestamp(l.createdAt);
              const init = l.actorName
                ? l.actorName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
                : "SY";
              return (
                <div key={l.id || i} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50 transition">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-700 font-semibold">{ts.date}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{ts.time}</p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 shrink-0">
                      {init}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{l.actorName || "System"}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded capitalize ${rc}`}>
                        {l.actorRole || "system"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{l.action}</p>
                    {l.target && <p className="text-[10px] text-gray-400 truncate">{l.target}</p>}
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {l.sourceIp || "—"}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${ss.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />{l.severity}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => setViewing(l)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <HiEye className="text-sm" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {!loading && totalLogs > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              Showing {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, totalLogs)} of{" "}
              <span className="font-bold text-gray-800">{totalLogs.toLocaleString()}</span> entries
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40">
                Previous
              </button>
              {pageNums().map((n,i) =>
                n==="..."
                  ? <span key={`d${i}`} className="w-8 text-center text-xs text-gray-400">…</span>
                  : <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                        page===n ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}>{n}</button>
              )}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <HiShieldCheck className="text-blue-600 text-xl"/>,  bg:"bg-blue-50",  label:"AUTH UPTIME",     value:"99.998%",                   sub:"System availability"      },
          { icon: <HiCheckCircle className="text-green-600 text-xl"/>, bg:"bg-green-50", label:"INTEGRITY CHECK", value:"Passed",                    sub:"All checksums valid"       },
          { icon: <div className="w-5 h-3 bg-green-400 rounded-sm animate-pulse"/>, bg:"bg-gray-100", label:"TOTAL LOGS", value: totalLogs.toLocaleString(), sub:"Entries in current range" },
        ].map((s,i)=>(
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Severity Chips */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(sevCounts).map(([lvl,cnt]) => {
          const ss = SEV[lvl];
          const isActive = severity === lvl.toLowerCase();
          return (
            <button key={lvl}
              onClick={() => setSeverity(isActive ? "all" : lvl.toLowerCase())}
              className={`bg-white rounded-xl border p-3 flex items-center gap-3 hover:border-gray-300 transition text-left ${
                isActive ? "ring-2 ring-blue-300 border-blue-200" : "border-gray-200"
              }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${ss.dot} shrink-0`}/>
              <div>
                <p className="text-lg font-black text-gray-900">{cnt}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{lvl}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}