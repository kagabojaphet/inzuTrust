// src/pages/TenantDashboard.jsx
// Responsive: collapsible sidebar (desktop) + mobile bottom nav + mobile drawer
// Matches landlord dashboard pattern exactly
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHome, HiCreditCard, HiShieldCheck, HiCog, HiChat,
  HiDocumentText, HiExclamationCircle,
  HiMenu, HiX, HiChevronLeft, HiLogout, HiViewGrid, HiSearch,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

import Overview               from "../components/tenant/Overview";
import Payments               from "../components/tenant/Payments";
import TrustScore             from "../components/tenant/TrustScore";
import Maintenance            from "../components/tenant/Maintenance";
import Messages               from "../components/shared/Messages";
import Notifications          from "../components/tenant/Notifications";
import Profile                from "../components/tenant/Profile";
import TenantAgreements       from "../components/tenant/TenantAgreements";
import DisputeCenter          from "../components/shared/DisputeCenter";
import TenantApplications     from "../components/tenant/TenantApplications";
import TenantBrowseProperties from "../components/tenant/TenantBrowseProperties";
import NotificationBell       from "../components/shared/NotificationBell";
import ProfileDropdown        from "../components/shared/ProfileDropdown";
import GlobalSearchBar        from "../components/shared/GlobalSearchBar";

// ── Nav definition ─────────────────────────────────────────────────────────
const NAV = [
  { id:"overview",     label:"Overview",     icon:HiHome              },
  { id:"payments",     label:"Payments",      icon:HiCreditCard        },
  { id:"trust",        label:"Trust Score",   icon:HiShieldCheck       },
  { id:"maintenance",  label:"Maintenance",   icon:HiCog               },
  { id:"messages",     label:"Messages",      icon:HiChat              },
  { id:"agreements",   label:"Agreements",    icon:HiDocumentText      },
  { id:"disputes",     label:"Disputes",      icon:HiExclamationCircle },
  { id:"applications", label:"Applications",  icon:HiViewGrid          },
  { id:"browse",       label:"Browse",        icon:HiSearch            },
];

// Bottom nav items (5 most important + More)
const BOTTOM_NAV = [
  { id:"overview",    label:"Dashboard",   icon:HiHome        },
  { id:"payments",    label:"Payments",    icon:HiCreditCard  },
  { id:"maintenance", label:"Maintenance", icon:HiCog         },
  { id:"messages",    label:"Messages",    icon:HiChat        },
  { id:"agreements",  label:"Agreements",  icon:HiDocumentText},
];

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [activeTab,  setActiveTab]  = useState("overview");
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout   = () => { logout?.(); navigate("/login"); };
  const handleNavigate = (tab) => { setActiveTab(tab); setMobileOpen(false); };

  const mainML = collapsed ? "md:pl-20" : "md:pl-64";
  const sideW  = collapsed ? "w-20"     : "w-64";

  const renderPage = () => {
    switch (activeTab) {
      case "overview":     return <Overview             setActiveTab={setActiveTab} token={token}/>;
      case "payments":     return <Payments             token={token}/>;
      case "trust":        return <TrustScore           token={token}/>;
      case "maintenance":  return <Maintenance          token={token}/>;
      case "messages":     return <Messages             token={token} user={user} userRole="tenant"/>;
      case "agreements":   return <TenantAgreements     token={token} user={user}/>;
      case "disputes":     return <DisputeCenter        token={token} userRole="tenant"/>;
      case "applications": return <TenantApplications  token={token}/>;
      case "browse":       return <TenantBrowseProperties token={token}/>;
      case "notifications":return <Notifications        token={token}/>;
      case "profile":      return <Profile              token={token} user={user}/>;
      default:             return <Overview             setActiveTab={setActiveTab} token={token}/>;
    }
  };

  // ── Nav item (reusable) ────────────────────────────────────────────────────
  const NavItem = ({ item, mobile = false }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => handleNavigate(item.id)}
        className={`w-full flex items-center ${collapsed && !mobile ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-xs font-black transition-all ${
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}>
        <item.icon className={`text-xl shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}/>
        {(!collapsed || mobile) && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">

      {/* ── Desktop sidebar ── */}
      <aside className={`hidden md:flex ${sideW} bg-white border-r border-gray-200 flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <HiHome className="text-white text-lg"/>
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-black text-black leading-none uppercase">InzuTrust</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Tenant Portal</p>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm z-40">
            {collapsed ? <HiMenu size={12}/> : <HiChevronLeft size={12}/>}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.id} item={item}/>)}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <img
              src={`https://ui-avatars.com/api/?name=${user?.firstName||"T"}+${user?.lastName||"A"}&background=dbeafe&color=2563eb&bold=true`}
              alt="avatar" className="w-8 h-8 rounded-full shrink-0 border border-gray-100"/>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-black truncate">{user?.firstName} {user?.lastName}</p>
                <button onClick={handleLogout}
                  className="text-[10px] text-red-500 font-bold hover:underline uppercase flex items-center gap-1">
                  <HiLogout className="text-xs"/> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${mainML}`}>

        {/* Sticky header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 gap-3">
          {/* Left: hamburger (mobile) + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600 shrink-0">
              <HiMenu size={22}/>
            </button>
            <div className="hidden sm:flex flex-1 max-w-sm">
              <GlobalSearchBar token={token} onNavigate={handleNavigate}/>
            </div>
          </div>
          {/* Right: bell + profile */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell token={token} onNavigate={handleNavigate}/>
            <ProfileDropdown user={user} onSettingsClick={() => handleNavigate("profile")} onLogout={handleLogout}/>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          {renderPage()}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2 flex justify-around items-center z-50">
        {BOTTOM_NAV.map(tab => (
          <button key={tab.id} onClick={() => handleNavigate(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition min-w-0 ${
              activeTab === tab.id ? "text-blue-600" : "text-gray-400"
            }`}>
            <tab.icon className="text-xl shrink-0"/>
            <span className="text-[9px] font-bold uppercase truncate">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
        <button onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-gray-400">
          <HiMenu className="text-xl"/>
          <span className="text-[9px] font-bold uppercase">More</span>
        </button>
      </div>

      {/* ── Mobile full drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                  <HiHome className="text-white text-lg"/>
                </div>
                <div>
                  <p className="text-sm font-black text-black leading-none uppercase">InzuTrust</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">Tenant Portal</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600">
                <HiX size={22}/>
              </button>
            </div>
            {/* Search */}
            <div className="px-3 pt-4 pb-2">
              <GlobalSearchBar token={token} onNavigate={handleNavigate}/>
            </div>
            {/* Nav */}
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {NAV.map(item => <NavItem key={item.id} item={item} mobile/>)}
            </nav>
            {/* Footer */}
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.firstName||"T"}+${user?.lastName||"A"}&background=dbeafe&color=2563eb&bold=true`}
                  alt="avatar" className="w-8 h-8 rounded-full shrink-0 border border-gray-100"/>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-black truncate">{user?.firstName} {user?.lastName}</p>
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