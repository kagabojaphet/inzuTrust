import React, { useEffect, useState } from "react";
import { HiSearch, HiRefresh } from "react-icons/hi";
// FIX: Import from the central config file
import { API_BASE } from "../../config";

const MOCK_LOGS = [
  { id:1,  level:"INFO",    action:"User registered",            actor:"System",          target:"bosco@gmail.com",          time:"Oct 24, 2023 10:21 AM", ip:"197.157.10.1"  },
  { id:2,  level:"SUCCESS", action:"KYC approved",               actor:"Jean Kamanzi",    target:"Aline Uwimana",            time:"Oct 24, 2023 10:15 AM", ip:"197.157.10.2"  },
  { id:3,  level:"WARNING", action:"Payment overdue flagged",    actor:"System",          target:"Eric Habimana",            time:"Oct 24, 2023 09:50 AM", ip:"—"             },
  { id:4,  level:"INFO",    action:"Property submitted",         actor:"Grace Mukamana",  target:"Kimironko Studio 2A",      time:"Oct 24, 2023 09:30 AM", ip:"41.186.22.3"   },
  { id:5,  level:"ERROR",   action:"Login failed (3x)",          actor:"Unknown",         target:"grace@gmail.com",          time:"Oct 24, 2023 09:10 AM", ip:"102.22.44.1"   },
  { id:6,  level:"SUCCESS", action:"Dispute resolved",           actor:"Jean Kamanzi",    target:"Unjustified eviction",     time:"Oct 23, 2023 04:00 PM", ip:"197.157.10.2"  },
  { id:7,  level:"INFO",    action:"Escrow released",            actor:"System",          target:"Vision City Villa #12",    time:"Oct 23, 2023 03:30 PM", ip:"—"             },
  { id:8,  level:"WARNING", action:"Suspicious login detected",  actor:"System",          target:"david@gmail.com",          time:"Oct 23, 2023 02:15 PM", ip:"89.44.120.5"   },
];

const levelStyle = {
  INFO:    { badge: "bg-blue-50 text-blue-700 border border-blue-200",    dot: "bg-blue-500"   },
  SUCCESS: { badge: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500"  },
  WARNING: { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",dot:"bg-yellow-500"},
  ERROR:   { badge: "bg-red-50 text-red-600 border border-red-200",       dot: "bg-red-500"    },
};

export default function ADLogs({ token }) {
  const [logs,    setLogs]    = useState(MOCK_LOGS);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);
  const hdrs = { Authorization: `Bearer ${token}` };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/logs`, { headers: hdrs });
      if (res.ok) { 
        const d = await res.json(); 
        if (d.data?.length) setLogs(d.data); 
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchLogs(); 
  }, [token]);

  const filtered = logs.filter(l => {
    const matchF = filter === "all" || l.level.toLowerCase() === filter;
    const matchS = `${l.action} ${l.actor} ${l.target}`.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  const counts = { INFO: 0, SUCCESS: 0, WARNING: 0, ERROR: 0 };
  logs.forEach(l => { if (counts[l.level] !== undefined) counts[l.level]++; });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">System Logs</h2>
          <p className="text-sm text-gray-400 mt-0.5">{logs.length} events recorded</p>
        </div>
        <button onClick={fetchLogs} disabled={loading}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition disabled:opacity-60">
          <HiRefresh className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counts).map(([lvl, cnt]) => {
          const s = levelStyle[lvl];
          return (
            <div key={lvl} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
              <div>
                <p className="text-lg font-black text-gray-900">{cnt}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{lvl}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-64">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
        {["all","info","success","warning","error"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>{f === "all" ? "All" : f}</button>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-1">LEVEL</div>
          <div className="col-span-3">ACTION</div>
          <div className="col-span-2">ACTOR</div>
          <div className="col-span-3">TARGET</div>
          <div className="col-span-2">TIME</div>
          <div className="col-span-1">IP</div>
        </div>
        <div className="divide-y divide-gray-50 font-mono">
          {filtered.length > 0 ? filtered.map((l, i) => {
            const s = levelStyle[l.level] || levelStyle.INFO;
            return (
              <div key={l.id || i} className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-gray-50 transition">
                <div className="col-span-1">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.badge}`}>{l.level}</span>
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-900">{l.action}</div>
                <div className="col-span-2 text-xs text-gray-500">{l.actor}</div>
                <div className="col-span-3 text-xs text-gray-500 truncate">{l.target}</div>
                <div className="col-span-2 text-[10px] text-gray-400">{l.time}</div>
                <div className="col-span-1 text-[10px] text-gray-400">{l.ip}</div>
              </div>
            )
          }) : (
            <div className="p-10 text-center text-gray-400 text-sm">No logs found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
}