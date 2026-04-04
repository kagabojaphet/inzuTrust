// src/pages/LandlordDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHome, HiOfficeBuilding, HiUsers, HiDocumentText,
  HiCreditCard, HiCog, HiBell, HiSearch, HiPlus,
  HiMenu, HiChevronLeft, HiChevronDown, HiChevronRight,
  HiX, HiChat, HiExclamationCircle, HiClipboardList,
  HiShieldCheck, HiSwitchHorizontal,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../context/AuthContext";

import LDOverview     from "../components/landlord/LDOverview";
import LDProperties   from "../components/landlord/LDProperties";
import LDTenants      from "../components/landlord/LDTenants";
import LDAgreements   from "../components/landlord/LDAgreements";
import LDPayments     from "../components/landlord/LDPayments";
import LDSettings     from "../components/landlord/LDSettings";
import LDAddProperty  from "../components/landlord/LDAddProperty";
import LDApplications from "../components/landlord/LDApplications";
import LDMaintenance  from "../components/landlord/LDMaintenance";
import LDAgents       from "../components/landlord/LDAgents";
import Messages       from "../components/shared/Messages";
import DisputeCenter  from "../components/shared/DisputeCenter";

// HiSwitchHorizontal used as maintenance icon (HiWrench doesn't exist in react-icons/hi v2)
const HiWrench = HiSwitchHorizontal;

// ── Nav structure with optional "children" for dropdown groups ────────────────
const NAV = [
  { id:"dashboard",    label:"Dashboard",    icon:HiHome          },
  { id:"properties",   label:"Properties",   icon:HiOfficeBuilding },
  {
    id:"people",
    label:"People",
    icon:HiUsers,
    children:[
      { id:"tenants",      label:"Tenants",      icon:HiUsers         },
      { id:"agents",       label:"Agents",       icon:HiShieldCheck   },
      { id:"applications", label:"Applications", icon:HiClipboardList },
    ],
  },
  { id:"agreements",   label:"Agreements",   icon:HiDocumentText   },
  { id:"maintenance",  label:"Maintenance",  icon:HiWrench         },
  { id:"payments",     label:"Payments",     icon:HiCreditCard     },
  { id:"messages",     label:"Messages",     icon:HiChat           },
  { id:"disputes",     label:"Disputes",     icon:HiExclamationCircle },
  { id:"settings",     label:"Settings",     icon:HiCog            },
];

// All page IDs that belong to the "people" group
const PEOPLE_IDS = ["tenants", "agents", "applications"];

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const [active,       setActive]       = useState("dashboard");
  const [search,       setSearch]       = useState("");
  const [isCollapsed,  setIsCollapsed]  = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups,   setOpenGroups]   = useState({ people: true });

  const { user: ctxUser, token: ctxToken, logout: ctxLogout, loading: authLoading } = useAuth();
  const token = ctxToken || localStorage.getItem("inzu_token") || "";
  const user  = ctxUser  || (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

  const handleLogout = () => { ctxLogout?.(); navigate("/login"); };
  const toggleGroup  = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const renderPage = () => {
    switch (active) {
      case "dashboard":    return <LDOverview     token={token} setActive={setActive}/>;
      case "properties":   return <LDProperties   token={token} setActive={setActive}/>;
      case "tenants":      return <LDTenants      token={token}/>;
      case "agents":       return <LDAgents       token={token}/>;
      case "agreements":   return <LDAgreements   token={token} user={user}/>;
      case "applications": return <LDApplications token={token}/>;
      case "maintenance":  return <LDMaintenance  token={token}/>;
      case "payments":     return <LDPayments     token={token}/>;
      case "messages":     return <Messages       token={token} user={user} userRole="landlord"/>;
      case "disputes":     return <DisputeCenter  token={token} userRole="landlord"/>;
      case "settings":     return <LDSettings     token={token} user={user}/>;
      case "add-property": return <LDAddProperty  token={token} onCancel={() => setActive("properties")}/>;
      default:             return <LDOverview     token={token} setActive={setActive}/>;
    }
  };

  // ── Nav item renderer ─────────────────────────────────────────────────────
  const NavItem = ({ item, mobile = false, collapsed = false }) => {
    const isGroupActive = item.children && PEOPLE_IDS.includes(active);
    const isActive      = active === item.id || (active === "add-property" && item.id === "properties") || isGroupActive;
    const isOpen        = openGroups[item.id];

    if (item.children) {
      return (
        <div>
          <button
            onClick={() => {
              if (collapsed) { setActive(item.children[0].id); }
              else { toggleGroup(item.id); }
            }}
            className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-xs font-black transition-all ${
              isGroupActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
            }`}>
            <item.icon className={`text-xl shrink-0 ${isGroupActive ? "text-blue-600" : "text-gray-400"}`}/>
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {isOpen
                  ? <HiChevronDown  className="text-gray-400 text-sm"/>
                  : <HiChevronRight className="text-gray-400 text-sm"/>}
              </>
            )}
          </button>

          {!collapsed && isOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
              {item.children.map(child => {
                const childActive = active === child.id;
                return (
                  <button key={child.id}
                    onClick={() => { setActive(child.id); if (mobile) setIsMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      childActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                    }`}>
                    <child.icon className={`text-base shrink-0 ${childActive ? "text-blue-600" : "text-gray-400"}`}/>
                    <span>{child.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => { setActive(item.id); if (mobile) setIsMobileOpen(false); }}
        className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-xs font-black transition-all ${
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
        }`}>
        <item.icon className={`text-xl shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}/>
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  };

  const sideW  = isCollapsed ? "w-20" : "w-64";
  const mainML = isCollapsed ? "md:pl-20" : "md:pl-64";

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="min-h-screen bg-[#f8f9fc] flex font-sans">

        {/* ── Desktop Sidebar ── */}
        <aside className={`hidden md:flex ${sideW} bg-white border-r border-gray-200 flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300`}>
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 relative">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <HiHome className="text-white text-lg"/>
              </div>
              {!isCollapsed && (
                authLoading
                  ? <div className="space-y-1.5">
                      <Skeleton width={80} height={12} borderRadius={4}/>
                      <Skeleton width={60} height={10} borderRadius={4}/>
                    </div>
                  : <div>
                      <p className="text-sm font-black text-black leading-none uppercase">InzuTrust</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">Landlord Portal</p>
                    </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm z-40">
              {isCollapsed ? <HiMenu size={12}/> : <HiChevronLeft size={12}/>}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
            {authLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-3`}>
                    <Skeleton circle width={22} height={22}/>
                    {!isCollapsed && <Skeleton width={90} height={12} borderRadius={6}/>}
                  </div>
                ))
              : NAV.map(item => <NavItem key={item.id} item={item} collapsed={isCollapsed}/>)
            }
          </nav>

          {/* User */}
          <div className="px-4 py-5 border-t border-gray-100">
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              {authLoading
                ? <>
                    <Skeleton circle width={32} height={32}/>
                    {!isCollapsed && (
                      <div className="flex-1 space-y-1.5">
                        <Skeleton width={100} height={11} borderRadius={4}/>
                        <Skeleton width={50}  height={10} borderRadius={4}/>
                      </div>
                    )}
                  </>
                : <>
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.firstName || "L"}+${user.lastName || "A"}&background=dbeafe&color=2563eb&bold=true`}
                      alt="avatar"
                      className="w-8 h-8 rounded-full shrink-0 border border-gray-100"
                    />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-black truncate">{user.firstName} {user.lastName}</p>
                        <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold hover:underline uppercase">
                          Logout
                        </button>
                      </div>
                    )}
                  </>
              }
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${mainML}`}>

          {/* Top bar */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 w-full">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden p-2 text-gray-600">
                <HiMenu size={24}/>
              </button>
              <div className="relative hidden sm:block w-48 lg:w-72">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50 outline-none focus:bg-white focus:border-blue-200 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl transition">
                <HiBell className="text-xl"/>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"/>
              </button>
              <button
                onClick={() => setActive("add-property")}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                <HiPlus/> <span className="hidden sm:inline">Add Property</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
            {renderPage()}
          </main>
        </div>

        {/* ── Mobile bottom nav ── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 flex justify-around items-center z-50">
          {[
            NAV[0],
            NAV[1],
            { id: "tenants",  label: "Tenants",  icon: HiUsers },
            NAV[4],
            NAV[5],
          ].map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`flex flex-col items-center gap-1 ${active === item.id ? "text-blue-600" : "text-gray-400"}`}>
              <item.icon size={22}/>
              <span className="text-[10px] font-bold">{item.label.split(" ")[0]}</span>
            </button>
          ))}
          <button onClick={() => setIsMobileOpen(true)} className="flex flex-col items-center gap-1 text-gray-400">
            <HiMenu size={22}/><span className="text-[10px] font-bold">More</span>
          </button>
        </div>

        {/* ── Mobile drawer ── */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)}/>
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-6 shadow-2xl animate-in slide-in-from-left overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <span className="font-black text-xl">Landlord <span className="text-blue-600">Portal</span></span>
                <button onClick={() => setIsMobileOpen(false)}><HiX size={24}/></button>
              </div>
              <div className="space-y-1">
                {NAV.map(item => <NavItem key={item.id} item={item} mobile collapsed={false}/>)}
                <hr className="my-4 border-gray-100"/>
                <button onClick={handleLogout} className="w-full text-left p-3 text-red-500 font-bold text-sm">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </SkeletonTheme>
  );
}