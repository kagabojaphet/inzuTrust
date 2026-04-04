// src/pages/AgentDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiHome, HiOfficeBuilding, HiWrench, HiChat, HiMenu, HiX, HiChevronLeft, HiBell, HiLogout, HiCheckCircle, HiClock, HiExclamation, HiRefresh } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import Messages from "../components/shared/Messages";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}` });

const NAV = [
  { id:"overview",    label:"Overview",      icon:HiHome          },
  { id:"properties",  label:"My Properties", icon:HiOfficeBuilding },
  { id:"maintenance", label:"Maintenance",   icon:HiWrench        },
  { id:"messages",    label:"Messages",      icon:HiChat          },
];

function StatCard({ label, value, icon:Icon, color="blue" }) {
  const colors = { blue:"bg-blue-50 text-blue-600", green:"bg-green-50 text-green-600", amber:"bg-amber-50 text-amber-600", red:"bg-red-50 text-red-600" };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}><Icon className="text-xl"/></div>
      <div><p className="text-2xl font-black text-gray-900">{value ?? "—"}</p><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p></div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const s = { emergency:"bg-red-100 text-red-700 border border-red-200", high:"bg-orange-50 text-orange-700 border border-orange-200", medium:"bg-amber-50 text-amber-700 border border-amber-200", low:"bg-gray-100 text-gray-600 border border-gray-200" };
  return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${s[priority]||s.low}`}>{priority}</span>;
}
function StatusBadge({ status }) {
  const s = { open:"bg-blue-50 text-blue-700", acknowledged:"bg-indigo-50 text-indigo-700", in_progress:"bg-amber-50 text-amber-700", resolved:"bg-green-50 text-green-700", rejected:"bg-red-50 text-red-600", cancelled:"bg-gray-100 text-gray-500" };
  return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${s[status]||s.open}`}>{status?.replace("_"," ")}</span>;
}

function AgentOverview({ stats, properties, requests, setActive }) {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-gray-900">Agent Overview</h1><p className="text-sm text-gray-500 mt-1">Your assigned properties and active maintenance tasks.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Assigned Properties" value={properties.length} icon={HiOfficeBuilding} color="blue"/>
        <StatCard label="Open Tasks"           value={stats.open}       icon={HiClock}          color="amber"/>
        <StatCard label="In Progress"          value={stats.inProgress} icon={HiWrench}         color="blue"/>
        <StatCard label="Resolved"             value={stats.resolved}   icon={HiCheckCircle}    color="green"/>
      </div>
      {stats.emergency > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <HiExclamation className="text-red-500 text-xl shrink-0"/>
          <p className="text-sm font-bold text-red-700">{stats.emergency} emergency {stats.emergency===1?"request":"requests"} need immediate attention.</p>
          <button onClick={()=>setActive("maintenance")} className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition shrink-0">View Now</button>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-gray-900 text-sm">Recent Maintenance Tasks</h3>
          <button onClick={()=>setActive("maintenance")} className="text-blue-600 text-xs font-bold hover:underline">View all</button>
        </div>
        {requests.slice(0,5).length===0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No tasks assigned yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.slice(0,5).map(r=>(
              <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{r.title}</p><p className="text-xs text-gray-400 truncate">{r.property?.title||"—"}</p></div>
                <PriorityBadge priority={r.priority}/>
                <StatusBadge status={r.status}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentProperties({ properties }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-gray-900">My Assigned Properties</h1>
      {properties.length===0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <HiOfficeBuilding className="text-5xl text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 font-semibold">No properties assigned yet</p>
          <p className="text-xs text-gray-400 mt-1">Your landlord will assign properties to you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {properties.map(({ property, permissions, assignedAt })=>(
            <div key={property.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="h-36 bg-gray-100 relative">
                {property.mainImage ? <img src={property.mainImage} alt={property.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><HiOfficeBuilding className="text-gray-300 text-4xl"/></div>}
                <span className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full ${property.verificationStatus==="approved"?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}`}>{property.verificationStatus||"pending"}</span>
              </div>
              <div className="p-5">
                <h3 className="font-black text-gray-900 text-sm">{property.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{property.district}{property.address?`, ${property.address}`:""}</p>
                <p className="text-sm font-bold text-blue-600 mt-2">RWF {Number(property.rentAmount).toLocaleString()}/mo</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Your Permissions</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[{key:"canEditDetails",label:"Edit Details"},{key:"canManageTenants",label:"Manage Tenants"},{key:"canViewPayments",label:"View Payments"},{key:"canHandleMaintenance",label:"Handle Maintenance"}].map(p=>(
                      <span key={p.key} className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${permissions[p.key]?"bg-green-50 text-green-700":"bg-gray-100 text-gray-400 line-through"}`}>{permissions[p.key]?"✓":"✗"} {p.label}</span>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-3">Assigned {new Date(assignedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentMaintenance({ token, requests, loading, onRefresh }) {
  const [updating, setUpdating] = useState(null);
  const updateStatus = async (id, status, note="") => {
    setUpdating(id);
    try {
      await fetch(`${API}/maintenance/${id}/status`, { method:"PUT", headers:{...hdrs(token),"Content-Type":"application/json"}, body:JSON.stringify({ status, resolutionNote:note||undefined }) });
      onRefresh();
    } catch(e){console.error(e);} finally{setUpdating(null);}
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-gray-900">Maintenance Tasks</h1>
        <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition"><HiRefresh/> Refresh</button>
      </div>
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"/><p className="text-gray-400 text-sm">Loading tasks...</p></div>
      ) : requests.length===0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center"><HiWrench className="text-5xl text-gray-200 mx-auto mb-3"/><p className="text-gray-500 font-semibold">No maintenance tasks assigned</p></div>
      ) : (
        <div className="space-y-4">
          {requests.map(r=>(
            <div key={r.id} className={`bg-white rounded-2xl border overflow-hidden ${r.priority==="emergency"?"border-red-300":"border-gray-200"}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1"><PriorityBadge priority={r.priority}/><StatusBadge status={r.status}/></div>
                    <h3 className="font-black text-gray-900">{r.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{r.property?.title} · Filed by {r.tenant?.firstName} {r.tenant?.lastName}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(r.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{r.description}</p>
                {r.images?.length>0&&(<div className="flex gap-2 mb-4 overflow-x-auto">{r.images.map((img,i)=><img key={i} src={img} alt="" className="h-20 w-24 object-cover rounded-xl shrink-0 border border-gray-100"/>)}</div>)}
                {!["resolved","rejected","cancelled"].includes(r.status)&&(
                  <div className="flex gap-2 flex-wrap">
                    {r.status==="open"&&<button disabled={updating===r.id} onClick={()=>updateStatus(r.id,"acknowledged")} className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition disabled:opacity-60">Acknowledge</button>}
                    {["open","acknowledged"].includes(r.status)&&<button disabled={updating===r.id} onClick={()=>updateStatus(r.id,"in_progress")} className="px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition disabled:opacity-60">Start Work</button>}
                    {r.status==="in_progress"&&<button disabled={updating===r.id} onClick={()=>{const note=prompt("Describe the resolution:");if(note!==null)updateStatus(r.id,"resolved",note);}} className="px-4 py-2 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition disabled:opacity-60">Mark Resolved</button>}
                  </div>
                )}
                {r.status==="resolved"&&r.tenantRating&&<p className="text-xs text-gray-400 mt-2">Tenant rated: {"⭐".repeat(r.tenantRating)} ({r.tenantRating}/5){r.tenantFeedback&&` — "${r.tenantFeedback}"`}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user:ctxUser, token:ctxToken, logout } = useAuth();
  const token = ctxToken || localStorage.getItem("inzu_token") || "";
  const user  = ctxUser  || (()=>{try{return JSON.parse(localStorage.getItem("user")||"{}");}catch{return {};}})();
  const [active,     setActive]     = useState("overview");
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [stats,      setStats]      = useState({ open:0, inProgress:0, resolved:0, emergency:0 });
  const [loadingReq, setLoadingReq] = useState(true);

  const fetchData = async () => {
    if(!token) return;
    setLoadingReq(true);
    try {
      const [pR,rR,sR] = await Promise.all([
        fetch(`${API}/agents/my-properties`,{ headers:hdrs(token) }),
        fetch(`${API}/maintenance`,         { headers:hdrs(token) }),
        fetch(`${API}/maintenance/stats`,   { headers:hdrs(token) }),
      ]);
      const [pD,rD,sD] = await Promise.all([pR.json(),rR.json(),sR.json()]);
      if(pD.success) setProperties(pD.data||[]);
      if(rD.success) setRequests(rD.data||[]);
      if(sD.success) setStats(sD.data||{});
    } catch(e){console.error(e);} finally{setLoadingReq(false);}
  };

  useEffect(()=>{fetchData();},[token]);
  const handleLogout = ()=>{logout?.();navigate("/login");};
  const renderPage = ()=>{
    switch(active){
      case "overview":    return <AgentOverview stats={stats} properties={properties} requests={requests} setActive={setActive}/>;
      case "properties":  return <AgentProperties properties={properties}/>;
      case "maintenance": return <AgentMaintenance token={token} requests={requests} loading={loadingReq} onRefresh={fetchData}/>;
      case "messages":    return <Messages token={token} user={user} userRole="agent"/>;
      default:            return <AgentOverview stats={stats} properties={properties} requests={requests} setActive={setActive}/>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">
      <aside className={`hidden md:flex ${collapsed?"w-20":"w-64"} bg-white border-r border-gray-200 flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300`}>
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0"><HiWrench className="text-white text-lg"/></div>
            {!collapsed&&<div><p className="text-sm font-black text-gray-900 uppercase">InzuTrust</p><p className="text-[10px] text-gray-400 font-bold">Agent Portal</p></div>}
          </div>
          <button onClick={()=>setCollapsed(!collapsed)} className="absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm z-40">
            {collapsed?<HiMenu size={12}/>:<HiChevronLeft size={12}/>}
          </button>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV.map(item=>{
            const on=active===item.id;
            return <button key={item.id} onClick={()=>setActive(item.id)} className={`w-full flex items-center ${collapsed?"justify-center":"gap-3"} px-4 py-3 rounded-xl text-xs font-black transition ${on?"bg-blue-50 text-blue-700":"text-gray-500 hover:bg-gray-50"}`}><item.icon className={`text-xl shrink-0 ${on?"text-blue-600":"text-gray-400"}`}/>{!collapsed&&<span>{item.label}</span>}</button>;
          })}
        </nav>
        <div className="px-4 py-5 border-t border-gray-100">
          <div className={`flex items-center ${collapsed?"justify-center":"gap-3"}`}>
            <img src={`https://ui-avatars.com/api/?name=${user.firstName||"A"}+${user.lastName||"G"}&background=dbeafe&color=2563eb&bold=true`} alt="avatar" className="w-8 h-8 rounded-full shrink-0 border border-gray-100"/>
            {!collapsed&&<div className="flex-1 min-w-0"><p className="text-[11px] font-black text-gray-900 truncate">{user.firstName} {user.lastName}</p><button onClick={handleLogout} className="text-[10px] text-red-500 font-bold hover:underline uppercase">Logout</button></div>}
          </div>
        </div>
      </aside>
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed?"md:pl-20":"md:pl-64"}`}>
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={()=>setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600"><HiMenu size={24}/></button>
            <p className="font-black text-gray-900 text-lg">{NAV.find(n=>n.id===active)?.label||"Agent Portal"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><HiRefresh className="text-lg"/></button>
            <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl"><HiBell className="text-xl"/></button>
            <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"><HiLogout className="text-lg"/></button>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6">{renderPage()}</main>
      </div>
      {mobileOpen&&(
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><span className="font-black text-lg">Agent <span className="text-blue-600">Portal</span></span><button onClick={()=>setMobileOpen(false)}><HiX size={24}/></button></div>
            {NAV.map(item=><button key={item.id} onClick={()=>{setActive(item.id);setMobileOpen(false);}} className={`w-full flex items-center gap-4 p-3 mb-1 rounded-xl font-bold text-sm ${active===item.id?"bg-blue-50 text-blue-600":"text-gray-500 hover:bg-gray-50"}`}><item.icon size={20}/>{item.label}</button>)}
            <hr className="my-4 border-gray-100"/>
            <button onClick={handleLogout} className="w-full text-left p-3 text-red-500 font-bold text-sm">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}