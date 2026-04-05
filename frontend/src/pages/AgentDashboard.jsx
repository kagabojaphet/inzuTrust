// src/pages/AgentDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHome, HiOfficeBuilding, HiCog, HiChat,
  HiUsers, HiMenu, HiX, HiBell, HiRefresh, HiLogout,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

import AgentSidebar     from "../components/agent/AgentSidebar";
import AgentOverview    from "../components/agent/AgentOverview";
import AgentProperties  from "../components/agent/AgentProperties";
import AgentMaintenance from "../components/agent/AgentMaintenance";
import AgentTenants     from "../components/agent/AgentTenants";
import Messages         from "../components/shared/Messages";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}` });

const NAV = [
  { id: "overview",    label: "Overview",      icon: HiHome           },
  { id: "properties",  label: "My Properties", icon: HiOfficeBuilding },
  { id: "tenants",     label: "Tenants",       icon: HiUsers          },
  { id: "maintenance", label: "Maintenance",   icon: HiCog            },
  { id: "messages",    label: "Messages",      icon: HiChat           },
];

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user: ctxUser, token: ctxToken, logout } = useAuth();

  const token = ctxToken || localStorage.getItem("inzu_token") || "";
  const user  = ctxUser || (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const [active,     setActive]     = useState("overview");
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [tenants,    setTenants]    = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [stats,      setStats]      = useState({ open: 0, inProgress: 0, resolved: 0, emergency: 0 });
  const [loading,    setLoading]    = useState(true);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pR, rR, sR, tR] = await Promise.all([
        fetch(`${API}/agents/my-properties`, { headers: hdrs(token) }),
        fetch(`${API}/maintenance`,           { headers: hdrs(token) }),
        fetch(`${API}/maintenance/stats`,     { headers: hdrs(token) }),
        fetch(`${API}/agents/my-tenants`,     { headers: hdrs(token) }),
      ]);
      const [pD, rD, sD, tD] = await Promise.all([pR.json(), rR.json(), sR.json(), tR.json()]);
      if (pD.success) setProperties(pD.data || []);
      if (rD.success) setRequests(rD.data   || []);
      if (sD.success) setStats(sD.data      || {});
      if (tD.success) setTenants(tD.data    || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleLogout = () => { logout?.(); navigate("/login"); };

  const page = {
    overview:    <AgentOverview    stats={stats} properties={properties} requests={requests} tenants={tenants} setActive={setActive}/>,
    properties:  <AgentProperties  properties={properties} token={token} onRefresh={fetchData}/>,
    tenants:     <AgentTenants     tenants={tenants} loading={loading}/>,
    maintenance: <AgentMaintenance token={token} requests={requests} loading={loading} onRefresh={fetchData}/>,
    messages:    <Messages         token={token} user={user} userRole="agent"/>,
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">
      <AgentSidebar
        NAV={NAV} active={active} setActive={setActive}
        collapsed={collapsed} setCollapsed={setCollapsed}
        user={user} onLogout={handleLogout}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "md:pl-20" : "md:pl-64"}`}>
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
              <HiMenu size={24}/>
            </button>
            <p className="font-black text-gray-900 text-lg">
              {NAV.find(n => n.id === active)?.label || "Agent Portal"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Refresh">
              <HiRefresh className="text-lg"/>
            </button>
            <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl">
              <HiBell className="text-xl"/>
            </button>
            <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition" title="Logout">
              <HiLogout className="text-lg"/>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6">{page[active]}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black text-lg">Agent <span className="text-blue-600">Portal</span></span>
              <button onClick={() => setMobileOpen(false)}><HiX size={24}/></button>
            </div>
            {NAV.map(item => (
              <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-4 p-3 mb-1 rounded-xl font-bold text-sm ${active === item.id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>
                <item.icon size={20}/> {item.label}
              </button>
            ))}
            <hr className="my-4 border-gray-100"/>
            <button onClick={handleLogout} className="w-full text-left p-3 text-red-500 font-bold text-sm">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}