// src/pages/AdminDashboard.jsx — Full responsive admin dashboard
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiViewGrid, HiUsers, HiShieldCheck, HiCreditCard,
  HiScale, HiClipboardList, HiChat, HiExclamationCircle,
  HiDocumentText, HiMenu, HiX, HiChevronLeft, HiLogout,
  HiDownload, HiCog,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

import ADOverview      from "../components/admin/ADOverview";
import ADUsers         from "../components/admin/ADUsers";
import ADProperties    from "../components/admin/ADProperties";
import ADPayments      from "../components/admin/ADPayments";
import ADDisputes      from "../components/admin/ADDisputes";
import ADLogs          from "../components/admin/ADLogs";
import ADAgreements    from "../components/admin/ADAgreements";
import ADApplications  from "../components/admin/ADApplications";
import ADSettings      from "../components/admin/ADSettings";
import Messages        from "../components/shared/Messages";
import DisputeCenter   from "../components/shared/DisputeCenter";
import NotificationBell from "../components/shared/NotificationBell";
import ProfileDropdown  from "../components/shared/ProfileDropdown";
import GlobalSearchBar  from "../components/shared/GlobalSearchBar";

const NAV = [
  { id:"dashboard",    label:"Dashboard",            icon:HiViewGrid      },
  { id:"users",        label:"User Management",       icon:HiUsers         },
  { id:"properties",   label:"Property Verification", icon:HiShieldCheck   },
  { id:"agreements",   label:"Agreements",            icon:HiDocumentText  },
  { id:"applications", label:"Applications",          icon:HiClipboardList },
  { id:"payments",     label:"Payments & Escrow",     icon:HiCreditCard    },
  { id:"disputes",     label:"Dispute Resolution",    icon:HiScale         },
  { id:"messages",     label:"Messages",              icon:HiChat          },
  { id:"reports",      label:"Reports Center",        icon:HiExclamationCircle },
  { id:"logs",         label:"System Logs",           icon:HiClipboardList },
  { id:"settings",     label:"Settings",              icon:HiCog           },
];

const BOTTOM_NAV = [
  { id:"dashboard",    label:"Dashboard",  icon:HiViewGrid    },
  { id:"users",        label:"Users",       icon:HiUsers       },
  { id:"properties",   label:"Properties", icon:HiShieldCheck },
  { id:"agreements",   label:"Agreements", icon:HiDocumentText},
  { id:"disputes",     label:"Disputes",   icon:HiScale       },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: ctxUser, token: ctxToken, logout: ctxLogout } = useAuth?.() || {};

  const token = ctxToken || localStorage.getItem("inzu_token") || "";
  const user  = ctxUser  || (() => { try { return JSON.parse(localStorage.getItem("user")||"{}"); } catch { return {}; } })();

  const [active,     setActive]     = useState("dashboard");
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    ctxLogout?.();
    localStorage.removeItem("inzu_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const handleNavigate = (tab) => { setActive(tab); setMobileOpen(false); };

  const sideW  = collapsed ? "w-20" : "w-64";
  const mainML = collapsed ? "md:pl-20" : "md:pl-64";

  const pages = {
    dashboard:    <ADOverview     token={token} setActive={setActive}/>,
    users:        <ADUsers        token={token}/>,
    properties:   <ADProperties   token={token}/>,
    agreements:   <ADAgreements   token={token}/>,
    applications: <ADApplications token={token}/>,
    payments:     <ADPayments     token={token}/>,
    disputes:     <ADDisputes     token={token}/>,
    messages:     <Messages       token={token} user={user} userRole="admin"/>,
    reports:      <DisputeCenter  token={token} userRole="admin"/>,
    logs:         <ADLogs         token={token}/>,
    settings:     <ADSettings     token={token}/>,
  };

  const NavItem = ({ item, mobile = false }) => {
    const isActive = active === item.id;
    return (
      <button onClick={() => handleNavigate(item.id)}
        className={`w-full flex items-center ${collapsed && !mobile ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-xs font-black transition-all ${
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}>
        <item.icon className={`text-xl shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}/>
        {(!collapsed || mobile) && <span className="text-left">{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">

      {/* ── Desktop sidebar ── */}
      <aside className={`hidden md:flex ${sideW} bg-white border-r border-gray-200 flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <HiShieldCheck className="text-white text-lg"/>
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-black text-black leading-none uppercase">InzuTrust</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Admin Portal</p>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm z-40">
            {collapsed ? <HiMenu size={12}/> : <HiChevronLeft size={12}/>}
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.id} item={item}/>)}
        </nav>

        <div className="px-4 py-5 border-t border-gray-100">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <img src={`https://ui-avatars.com/api/?name=${user?.firstName||"A"}&background=dbeafe&color=2563eb&bold=true`}
              alt="avatar" className="w-8 h-8 rounded-full shrink-0 border border-gray-100"/>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-black truncate">{user?.firstName||"Admin"} {user?.lastName}</p>
                <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold hover:underline uppercase flex items-center gap-1">
                  <HiLogout className="text-xs"/> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${mainML}`}>
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600 shrink-0"><HiMenu size={22}/></button>
            <div className="hidden sm:flex flex-1 max-w-sm">
              <GlobalSearchBar token={token} onNavigate={handleNavigate}/>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition">
              <HiDownload/> Export
            </button>
            <NotificationBell token={token} onNavigate={handleNavigate}/>
            <ProfileDropdown user={user} onSettingsClick={() => handleNavigate("settings")} onLogout={handleLogout}/>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          {pages[active] || pages.dashboard}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2 flex justify-around items-center z-50">
        {BOTTOM_NAV.map(tab => (
          <button key={tab.id} onClick={() => handleNavigate(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition ${
              active === tab.id ? "text-blue-600" : "text-gray-400"
            }`}>
            <tab.icon className="text-xl"/><span className="text-[9px] font-bold uppercase">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
        <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-gray-400">
          <HiMenu className="text-xl"/><span className="text-[9px] font-bold uppercase">More</span>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                  <HiShieldCheck className="text-white text-lg"/>
                </div>
                <div>
                  <p className="text-sm font-black text-black leading-none uppercase">InzuTrust</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">Admin Portal</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600"><HiX size={22}/></button>
            </div>
            <div className="px-3 pt-4 pb-2">
              <GlobalSearchBar token={token} onNavigate={handleNavigate}/>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {NAV.map(item => <NavItem key={item.id} item={item} mobile/>)}
            </nav>
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${user?.firstName||"A"}&background=dbeafe&color=2563eb&bold=true`}
                  alt="avatar" className="w-8 h-8 rounded-full shrink-0 border border-gray-100"/>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-black truncate">{user?.firstName||"Admin"} {user?.lastName}</p>
                  <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold hover:underline uppercase">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}