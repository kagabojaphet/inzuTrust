// src/pages/AgentDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHome, HiOfficeBuilding, HiCog, HiChat,
  HiUsers, HiMenu, HiX, HiRefresh,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

import AgentSidebar     from "../components/agent/AgentSidebar";
import AgentOverview    from "../components/agent/AgentOverview";
import AgentProperties  from "../components/agent/AgentProperties";
import AgentMaintenance from "../components/agent/AgentMaintenance";
import AgentTenants     from "../components/agent/AgentTenants";
import AgentSettings    from "../components/agent/AgentSettings";
import Messages         from "../components/shared/Messages";
import NotificationBell from "../components/shared/NotificationBell";
import ProfileDropdown  from "../components/shared/ProfileDropdown";
import GlobalSearchBar  from "../components/shared/GlobalSearchBar";

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
  const [stats,      setStats]      = useState({ open:0, inProgress:0, resolved:0, emergency:0 });
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

  const handleLogout   = () => { logout?.(); navigate("/login"); };
  const handleNavigate = (tab) => { setActive(tab); setMobileOpen(false); };

  const page = {
    overview:    <AgentOverview    stats={stats} properties={properties} requests={requests} tenants={tenants} setActive={setActive}/>,
    properties:  <AgentProperties  properties={properties} token={token} onRefresh={fetchData}/>,
    tenants:     <AgentTenants     tenants={tenants} loading={loading}/>,
    maintenance: <AgentMaintenance token={token} requests={requests} loading={loading} onRefresh={fetchData}/>,
    messages:    <Messages         token={token} user={user} userRole="agent"/>,
    settings:    <AgentSettings    token={token}/>,
  };

  const currentPage = page[active] || page.overview;

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">

      {/* Desktop sidebar */}
      <AgentSidebar
        NAV={NAV} active={active} setActive={setActive}
        collapsed={collapsed} setCollapsed={setCollapsed}
        user={user} onLogout={handleLogout}
      />

      {/* Main */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "md:pl-20" : "md:pl-64"}`}>

        {/* ── Header ── */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 gap-3">

          {/* Left: burger + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 shrink-0">
              <HiMenu size={24}/>
            </button>
            <div className="hidden sm:flex flex-1 max-w-sm">
              <GlobalSearchBar token={token} onNavigate={handleNavigate}/>
            </div>
          </div>

          {/* Right: refresh + bell + profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={fetchData}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              title="Refresh data">
              <HiRefresh className="text-lg"/>
            </button>
            <NotificationBell token={token} onNavigate={handleNavigate}/>
            <ProfileDropdown
              user={user}
              onSettingsClick={() => setActive("settings")}
              onLogout={handleLogout}
            />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6">{currentPage}</main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black text-lg">Agent <span className="text-blue-600">Portal</span></span>
              <button onClick={() => setMobileOpen(false)}><HiX size={24}/></button>
            </div>
            <div className="mb-4">
              <GlobalSearchBar token={token} onNavigate={handleNavigate}/>
            </div>
            {NAV.map(item => (
              <button key={item.id} onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-4 p-3 mb-1 rounded-xl font-bold text-sm ${
                  active === item.id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
                }`}>
                <item.icon size={20}/> {item.label}
              </button>
            ))}
            <hr className="my-4 border-gray-100"/>
            <button onClick={() => handleNavigate("settings")}
              className="w-full flex items-center gap-4 p-3 mb-1 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50">
              <HiCog size={20}/> Settings
            </button>
            <button onClick={handleLogout} className="w-full text-left p-3 text-red-500 font-bold text-sm">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}