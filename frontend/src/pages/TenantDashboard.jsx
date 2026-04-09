// src/pages/TenantDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHome, HiCreditCard, HiShieldCheck, HiCog, HiChat,
  HiDocumentText, HiExclamationCircle,
  HiMenu, HiX, HiChevronLeft, HiLogout, HiViewGrid, HiSearch,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

import Overview                from "../components/tenant/Overview";
import Payments                from "../components/tenant/Payments";
import TrustScore              from "../components/tenant/TrustScore";
import Maintenance             from "../components/tenant/Maintenance";
import Messages                from "../components/shared/Messages";
import Notifications           from "../components/tenant/Notifications";
import Profile                 from "../components/tenant/Profile";
import TenantAgreements        from "../components/tenant/TenantAgreements";
import DisputeCenter           from "../components/shared/DisputeCenter";
import TenantApplications      from "../components/tenant/TenantApplications";
import TenantBrowseProperties  from "../components/tenant/TenantBrowseProperties";
import NotificationBell        from "../components/shared/NotificationBell";
import ProfileDropdown         from "../components/shared/ProfileDropdown";
import GlobalSearchBar         from "../components/shared/GlobalSearchBar";

const NAV = [
  { id: "overview",      label: "Overview",      icon: HiHome              },
  { id: "payments",      label: "Payments",       icon: HiCreditCard        },
  { id: "trust",         label: "Trust Score",    icon: HiShieldCheck       },
  { id: "maintenance",   label: "Maintenance",    icon: HiCog               },
  { id: "messages",      label: "Messages",       icon: HiChat              },
  { id: "agreements",    label: "Agreements",     icon: HiDocumentText      },
  { id: "disputes",      label: "Disputes",       icon: HiExclamationCircle },
  { id: "applications",  label: "Applications",   icon: HiViewGrid          },
  { id: "browse",        label: "Browse",         icon: HiSearch            },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function TenantSidebar({ active, setActive, collapsed, setCollapsed, user, onLogout, mobileOpen, setMobileOpen }) {
  const NavItem = ({ item, mobile = false }) => {
    const isActive = active === item.id;
    return (
      <button
        onClick={() => { setActive(item.id); if (mobile) setMobileOpen(false); }}
        className={`w-full flex items-center ${collapsed && !mobile ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-xs font-black transition-all ${
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}>
        <item.icon className={`text-xl shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}/>
        {(!collapsed || mobile) && <span>{item.label}</span>}
      </button>
    );
  };

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className={`flex items-center justify-between px-5 py-5 border-b border-gray-100 ${mobile ? "" : "relative"}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <HiHome className="text-white text-lg"/>
          </div>
          {(!collapsed || mobile) && (
            <div>
              <p className="text-sm font-black text-black leading-none uppercase">InzuTrust</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Tenant Portal</p>
            </div>
          )}
        </div>
        {mobile ? (
          <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-700"><HiX size={22}/></button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm z-40">
            {collapsed ? <HiMenu size={12}/> : <HiChevronLeft size={12}/>}
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(item => <NavItem key={item.id} item={item} mobile={mobile}/>)}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className={`flex items-center ${collapsed && !mobile ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
            {(user?.firstName?.[0] || "T").toUpperCase()}
          </div>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-black truncate">{user?.firstName} {user?.lastName}</p>
              <button onClick={onLogout}
                className="text-[10px] text-red-500 font-bold hover:underline uppercase flex items-center gap-1">
                <HiLogout className="text-xs"/> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300`}>
        <SidebarContent/>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl">
            <SidebarContent mobile/>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function TenantDashboard() {
  const navigate  = useNavigate();
  const { user, token, logout } = useAuth();

  const [activeTab,  setActiveTab]  = useState("overview");
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout   = () => { logout?.(); navigate("/login"); };
  const handleNavigate = (tab) => { setActiveTab(tab); setMobileOpen(false); };

  const mainML = collapsed ? "md:pl-20" : "md:pl-64";

  const renderPage = () => {
    switch (activeTab) {
      case "overview":      return <Overview             setActiveTab={setActiveTab} token={token}/>;
      case "payments":      return <Payments             token={token}/>;
      case "trust":         return <TrustScore           token={token}/>;
      case "maintenance":   return <Maintenance          token={token}/>;
      case "messages":      return <Messages             token={token} user={user} userRole="tenant"/>;
      case "agreements":    return <TenantAgreements     token={token} user={user}/>;
      case "disputes":      return <DisputeCenter        token={token} userRole="tenant"/>;
      case "applications":  return <TenantApplications  token={token}/>;
      case "browse":        return <TenantBrowseProperties token={token}/>;
      case "notifications": return <Notifications        token={token}/>;
      case "profile":       return <Profile              token={token} user={user}/>;
      default:              return <Overview             setActiveTab={setActiveTab} token={token}/>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">
      <TenantSidebar
        active={activeTab} setActive={setActiveTab}
        collapsed={collapsed} setCollapsed={setCollapsed}
        user={user} onLogout={handleLogout}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${mainML}`}>

        {/* ── Top navbar ── */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 gap-3">

          {/* Left: burger + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600 shrink-0">
              <HiMenu size={22}/>
            </button>
            {/* ── GlobalSearchBar replaces static input ── */}
            <div className="hidden sm:flex flex-1 max-w-sm">
              <GlobalSearchBar token={token} onNavigate={handleNavigate}/>
            </div>
          </div>

          {/* Right: bell + profile dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell token={token} onNavigate={handleNavigate}/>
            <ProfileDropdown
              user={user}
              onSettingsClick={() => handleNavigate("profile")}
              onLogout={handleLogout}
            />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around items-center z-50">
        {NAV.slice(0,5).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition ${
              activeTab === tab.id ? "text-blue-600" : "text-gray-400"
            }`}>
            <tab.icon className="text-xl"/>
            <span className="text-[9px] font-bold uppercase">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
        <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-gray-400">
          <HiMenu className="text-xl"/>
          <span className="text-[9px] font-bold uppercase">More</span>
        </button>
      </div>
    </div>
  );
}