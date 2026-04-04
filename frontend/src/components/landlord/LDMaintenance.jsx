// src/components/landlord/LDMaintenance.jsx
// Landlord view: all maintenance requests across their properties
// Actions: acknowledge, schedule, assign agent, resolve, reject
import React, { useState, useEffect, useCallback } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiCog, HiRefresh, HiSearch, HiFilter,
  HiCheckCircle, HiX, HiUser, HiClock,
  HiExclamation, HiChevronDown, HiChevronRight,
  HiChat, HiPhotograph,
} from "react-icons/hi";
import { API_BASE } from "../../config";

const hdrs = tk => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtTime = d => d ? new Date(d).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" }) : "";

function PriorityBadge({ priority }) {
  const s = {
    emergency: "bg-red-100 text-red-700 border border-red-200",
    high:      "bg-orange-50 text-orange-700 border border-orange-200",
    medium:    "bg-amber-50 text-amber-700 border border-amber-200",
    low:       "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${s[priority]||s.low}`}>{priority}</span>;
}

function StatusBadge({ status }) {
  const s = {
    open:         "bg-blue-50 text-blue-700",
    acknowledged: "bg-indigo-50 text-indigo-700",
    in_progress:  "bg-amber-50 text-amber-700",
    resolved:     "bg-green-50 text-green-700",
    rejected:     "bg-red-50 text-red-600",
    cancelled:    "bg-gray-100 text-gray-500",
  };
  return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${s[status]||s.open}`}>{status?.replace("_"," ")}</span>;
}

function CategoryIcon({ category }) {
  const icons = {
    plumbing:"🔧", electrical:"⚡", structural:"🏗️", appliance:"🧺",
    pest_control:"🐛", cleaning:"🧹", security:"🔒", internet:"📶", other:"📋",
  };
  return <span className="text-base">{icons[category] || "📋"}</span>;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon:Icon, color, loading }) {
  const bg = { blue:"bg-blue-50 text-blue-600", amber:"bg-amber-50 text-amber-600", green:"bg-green-50 text-green-600", red:"bg-red-50 text-red-600" };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg[color]||bg.blue}`}>
        {loading ? <Skeleton circle width={24} height={24}/> : <Icon className="text-xl"/>}
      </div>
      <div>
        {loading ? <><Skeleton width={40} height={20} borderRadius={6}/><Skeleton width={80} height={10} borderRadius={4} className="mt-1"/></> : (
          <><p className="text-2xl font-black text-gray-900">{value}</p><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p></>
        )}
      </div>
    </div>
  );
}

// ── Request detail drawer ─────────────────────────────────────────────────────
function RequestDrawer({ request:r, token, agents, onClose, onUpdated }) {
  const [comment,    setComment]    = useState("");
  const [sending,    setSending]    = useState(false);
  const [updating,   setUpdating]   = useState(false);
  const [agentId,    setAgentId]    = useState(r.assignedAgentId || "");
  const [noteText,   setNoteText]   = useState("");
  const [schedDate,  setSchedDate]  = useState("");

  const updateStatus = async (status, extra = {}) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/maintenance/${r.id}/status`, {
        method:"PUT", headers:hdrs(token),
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await res.json();
      if (data.success) onUpdated();
    } catch(e){console.error(e);} finally{setUpdating(false);}
  };

  const assignAgent = async () => {
    if (!agentId) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/maintenance/${r.id}/assign`, {
        method:"PUT", headers:hdrs(token),
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (data.success) onUpdated();
    } catch(e){console.error(e);} finally{setUpdating(false);}
  };

  const sendComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/maintenance/${r.id}/comments`, {
        method:"POST", headers:hdrs(token),
        body: JSON.stringify({ text: comment.trim() }),
      });
      const data = await res.json();
      if (data.success) { setComment(""); onUpdated(); }
    } catch(e){console.error(e);} finally{setSending(false);}
  };

  const isClosed = ["resolved","rejected","cancelled"].includes(r.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CategoryIcon category={r.category}/>
              <PriorityBadge priority={r.priority}/>
              <StatusBadge status={r.status}/>
            </div>
            <h3 className="font-black text-gray-900 text-sm">{r.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400"><HiX className="text-lg"/></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Property",  value: r.property?.title || "—" },
              { label:"Tenant",    value: r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : "—" },
              { label:"Filed",     value: fmtDate(r.createdAt) },
              { label:"Scheduled", value: r.scheduledAt ? `${fmtDate(r.scheduledAt)} ${fmtTime(r.scheduledAt)}` : "Not scheduled" },
              { label:"Category",  value: r.category?.replace("_"," ") },
              { label:"Agent",     value: r.assignedAgent ? `${r.assignedAgent.firstName} ${r.assignedAgent.lastName}` : "Unassigned" },
            ].map((row,i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{row.label}</p>
                <p className="text-sm font-semibold text-gray-800 capitalize truncate">{row.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{r.description}</p>
          </div>

          {/* Images */}
          {r.images?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Evidence Photos</p>
              <div className="flex gap-2 overflow-x-auto">
                {r.images.map((img,i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer">
                    <img src={img} alt="" className="h-24 w-28 object-cover rounded-xl shrink-0 border border-gray-200 hover:opacity-90 transition"/>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments thread */}
          {r.comments?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Communication Log</p>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {r.comments.map((c,i) => {
                  if (c.isSystemNote) return (
                    <div key={i} className="text-center">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{c.text}</span>
                    </div>
                  );
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-gray-600">{c.author?.firstName} {c.author?.lastName}</span>
                        <span className={`text-[9px] px-1.5 rounded capitalize ${
                          c.author?.role==="landlord"?"bg-indigo-50 text-indigo-600":c.author?.role==="tenant"?"bg-blue-50 text-blue-600":"bg-gray-100 text-gray-500"
                        }`}>{c.author?.role}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">{fmtDate(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-700">{c.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rating */}
          {r.tenantRating && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Tenant Rating</p>
              <p className="text-sm font-bold text-gray-800">{"⭐".repeat(r.tenantRating)} ({r.tenantRating}/5)</p>
              {r.tenantFeedback && <p className="text-xs text-gray-600 mt-1 italic">"{r.tenantFeedback}"</p>}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!isClosed && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">

            {/* Assign agent */}
            {agents.length > 0 && (
              <div className="flex gap-2">
                <select value={agentId} onChange={e=>setAgentId(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Select agent to assign...</option>
                  {agents.map(a => (
                    <option key={a.agent.id} value={a.agent.id}>{a.agent.firstName} {a.agent.lastName}</option>
                  ))}
                </select>
                <button onClick={assignAgent} disabled={!agentId||updating}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition">
                  Assign
                </button>
              </div>
            )}

            {/* Schedule */}
            {["open","acknowledged"].includes(r.status) && (
              <div className="flex gap-2">
                <input type="datetime-local" value={schedDate} onChange={e=>setSchedDate(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"/>
                <button onClick={()=>updateStatus("in_progress", { scheduledAt:schedDate })} disabled={!schedDate||updating}
                  className="px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 disabled:opacity-50 transition">
                  Schedule
                </button>
              </div>
            )}

            {/* Status buttons */}
            <div className="flex gap-2 flex-wrap">
              {r.status === "open" && (
                <button onClick={()=>updateStatus("acknowledged")} disabled={updating}
                  className="flex-1 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
                  Acknowledge
                </button>
              )}
              {r.status === "in_progress" && (
                <button onClick={()=>{
                  const note = prompt("Describe what was done:");
                  if (note !== null) updateStatus("resolved", { resolutionNote:note });
                }} disabled={updating}
                  className="flex-1 py-2.5 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 disabled:opacity-60 transition">
                  <HiCheckCircle className="inline mr-1"/> Mark Resolved
                </button>
              )}
              {!["rejected"].includes(r.status) && (
                <button onClick={()=>{
                  const reason = prompt("Rejection reason (optional):");
                  updateStatus("rejected", { resolutionNote:reason||"" });
                }} disabled={updating}
                  className="px-4 py-2.5 bg-white text-red-600 border border-red-200 text-xs font-black rounded-xl hover:bg-red-50 disabled:opacity-60 transition">
                  Reject
                </button>
              )}
            </div>

            {/* Comment */}
            <div className="flex gap-2">
              <input value={comment} onChange={e=>setComment(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendComment()}
                placeholder="Add a comment or update..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"/>
              <button onClick={sendComment} disabled={!comment.trim()||sending}
                className="px-4 py-2 bg-gray-800 text-white text-xs font-black rounded-xl hover:bg-gray-900 disabled:opacity-50 transition">
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main LDMaintenance ────────────────────────────────────────────────────────
export default function LDMaintenance({ token }) {
  const [requests,   setRequests]   = useState([]);
  const [agents,     setAgents]     = useState([]);
  const [stats,      setStats]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [priorityFilter, setPriority] = useState("all");

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rRes, aRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/maintenance`,       { headers: { Authorization:`Bearer ${token}` } }),
        fetch(`${API_BASE}/agents`,            { headers: { Authorization:`Bearer ${token}` } }),
        fetch(`${API_BASE}/maintenance/stats`, { headers: { Authorization:`Bearer ${token}` } }),
      ]);
      const [rData, aData, sData] = await Promise.all([rRes.json(), aRes.json(), sRes.json()]);
      if (rData.success) setRequests(rData.data || []);
      if (aData.success) setAgents(aData.data || []);
      if (sData.success) setStats(sData.data || {});
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleUpdated = async () => {
    await fetchAll();
    if (selected) {
      const res  = await fetch(`${API_BASE}/maintenance/${selected.id}`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setSelected(data.data);
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch   = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.property?.title?.toLowerCase().includes(search.toLowerCase()) || `${r.tenant?.firstName} ${r.tenant?.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter   === "all" || r.status   === statusFilter;
    const matchPriority = priorityFilter === "all" || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      {selected && (
        <RequestDrawer request={selected} token={token} agents={agents} onClose={()=>setSelected(null)} onUpdated={handleUpdated}/>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Maintenance Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Manage repair and maintenance across all your properties.</p>
          </div>
          <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
            <HiRefresh/> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total"       value={stats.total}      icon={HiCog}         color="blue"  loading={loading}/>
          <StatCard label="Open"        value={stats.open}       icon={HiClock}       color="amber" loading={loading}/>
          <StatCard label="In Progress" value={stats.inProgress} icon={HiCog}         color="blue"  loading={loading}/>
          <StatCard label="Resolved"    value={stats.resolved}   icon={HiCheckCircle} color="green" loading={loading}/>
        </div>

        {/* Emergency alert */}
        {!loading && stats.emergency > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <HiExclamation className="text-red-500 text-xl shrink-0"/>
            <p className="text-sm font-bold text-red-700">
              {stats.emergency} emergency {stats.emergency===1?"request":"requests"} — requires immediate attention.
            </p>
            <button onClick={()=>{ setPriority("emergency"); setStatus("all"); }}
              className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 shrink-0 transition">
              Filter Emergency
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3.5 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Filters:</span>

          <div className="relative">
            <select value={statusFilter} onChange={e=>setStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer">
              <option value="all">All Statuses</option>
              {["open","acknowledged","in_progress","resolved","rejected","cancelled"].map(s=>
                <option key={s} value={s}>{s.replace("_"," ")}</option>
              )}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
          </div>

          <div className="relative">
            <select value={priorityFilter} onChange={e=>setPriority(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer">
              <option value="all">All Priorities</option>
              {["emergency","high","medium","low"].map(p=><option key={p} value={p}>{p}</option>)}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, property, or tenant..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"/>
          </div>

          {(statusFilter!=="all"||priorityFilter!=="all"||search) && (
            <button onClick={()=>{setStatus("all");setPriority("all");setSearch("");}} className="text-blue-600 text-xs font-bold hover:underline">Clear</button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Request</th>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4">Filed</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({length:5}).map((_,i)=>(
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton width={160} height={13} borderRadius={4}/><Skeleton width={80} height={10} borderRadius={4} className="mt-1"/></td>
                      <td className="px-6 py-4"><Skeleton width={120} height={13} borderRadius={4}/></td>
                      <td className="px-6 py-4"><Skeleton width={100} height={13} borderRadius={4}/></td>
                      <td className="px-6 py-4"><Skeleton width={70} height={20} borderRadius={20}/></td>
                      <td className="px-6 py-4"><Skeleton width={80} height={20} borderRadius={20}/></td>
                      <td className="px-6 py-4"><Skeleton width={90} height={13} borderRadius={4}/></td>
                      <td className="px-6 py-4"><Skeleton width={80} height={13} borderRadius={4}/></td>
                      <td className="px-6 py-4 flex justify-end"><Skeleton width={70} height={32} borderRadius={10}/></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-16 text-center">
                    <HiCog className="text-4xl text-gray-200 mx-auto mb-3"/>
                    <p className="text-sm font-semibold text-gray-400">No maintenance requests found</p>
                    <p className="text-xs text-gray-300 mt-1">Requests appear here when tenants file them</p>
                  </td></tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/60 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={r.category}/>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{r.title}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{r.category?.replace("_"," ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 truncate max-w-[140px]">{r.property?.title || "—"}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : "—"}</td>
                      <td className="px-6 py-4"><PriorityBadge priority={r.priority}/></td>
                      <td className="px-6 py-4"><StatusBadge status={r.status}/></td>
                      <td className="px-6 py-4 text-xs text-gray-500">{r.assignedAgent ? `${r.assignedAgent.firstName}` : <span className="text-gray-300">Unassigned</span>}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{fmtDate(r.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={async()=>{
                          const res  = await fetch(`${API_BASE}/maintenance/${r.id}`, { headers:{Authorization:`Bearer ${token}`} });
                          const data = await res.json();
                          setSelected(data.success ? data.data : r);
                        }} className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-black rounded-xl hover:bg-blue-100 transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing <span className="font-bold text-gray-700">{filtered.length}</span> of <span className="font-bold text-gray-700">{requests.length}</span> requests</p>
            </div>
          )}
        </div>
      </div>
    </SkeletonTheme>
  );
}