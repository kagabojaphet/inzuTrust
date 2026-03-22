import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiViewGrid, HiUsers, HiShieldCheck, HiCreditCard,
  HiScale, HiClipboardList, HiBell, HiSearch, HiDownload,
  HiGlobe, HiLogout, HiChevronLeft, HiChevronRight,
  HiMenu, HiX, HiChat, HiExclamationCircle
} from "react-icons/hi";

import ADOverview    from "../components/admin/ADOverview";
import ADUsers       from "../components/admin/ADUsers";
import ADProperties  from "../components/admin/ADProperties";
import ADPayments    from "../components/admin/ADPayments";
import ADDisputes    from "../components/admin/ADDisputes";
import ADLogs        from "../components/admin/ADLogs";
import Messages      from "../components/shared/Messages";
import DisputeCenter from "../components/shared/DisputeCenter";

const NAV = [
  { id:"dashboard",  label:"Dashboard",             icon:HiViewGrid         },
  { id:"users",      label:"User Management",        icon:HiUsers            },
  { id:"properties", label:"Property Verification",  icon:HiShieldCheck      },
  { id:"payments",   label:"Payments & Escrow",      icon:HiCreditCard       },
  { id:"disputes",   label:"Dispute Resolution",     icon:HiScale            },
  { id:"messages",   label:"Messages",               icon:HiChat             },
  { id:"reports",    label:"Reports Center",         icon:HiExclamationCircle},
  { id:"logs",       label:"System Logs",            icon:HiClipboardList    },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active,       setActive]       = useState("dashboard");
  const [isCollapsed,  setIsCollapsed]  = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [search,       setSearch]       = useState("");

  const user  = (() => { try { return JSON.parse(localStorage.getItem("user")||"{}"); } catch { return {}; } })();
  const token = localStorage.getItem("inzu_token") || localStorage.getItem("token") || "";

  const handleLogout = () => {
    localStorage.removeItem("inzu_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pages = {
    dashboard:  <ADOverview    token={token} setActive={setActive}/>,
    users:      <ADUsers       token={token}/>,
    properties: <ADProperties  token={token}/>,
    payments:   <ADPayments    token={token}/>,
    disputes:   <ADDisputes    token={token}/>,
    messages:   <Messages      token={token} user={user} userRole="admin"/>,
    reports:    <DisputeCenter token={token} userRole="admin"/>,
    logs:       <ADLogs        token={token}/>,
  };

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Logo */}
      <div className={`px-6 py-8 flex items-center gap-3 ${isCollapsed && !mobile ? "justify-center" : ""}`}>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
          <HiShieldCheck className="text-white text-2xl"/>
        </div>
        {(!isCollapsed || mobile) && (
          <div className="leading-tight">
            <p className="text-lg font-bold text-gray-900 leading-none">Admin</p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Super Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV.map(item => {
          const Icon = item.icon;
          const on = active === item.id;
          return (
            <button key={item.id}
              onClick={()=>{ setActive(item.id); if(mobile) setIsMobileOpen(false); }}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                on ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 rounded-r-none" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              } ${isCollapsed && !mobile ? "justify-center" : "justify-start"}`}>
              <Icon className={`text-xl shrink-0 ${on?"text-blue-600":"text-gray-400"}`}/>
              {(!isCollapsed || mobile) && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-6 border-t border-gray-50">
        <div className={`flex items-center gap-3 px-3 py-4 rounded-2xl ${(!isCollapsed||mobile)?"bg-gray-50":"justify-center"}`}>
          <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            src={`https://ui-avatars.com/api/?name=${user.firstName||"Admin"}&background=dbeafe&color=1d4ed8&bold=true`} alt="avatar"/>
          {(!isCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user.firstName || "Chief Admin"}</p>
              <button onClick={handleLogout} className="text-[9px] text-red-500 font-bold uppercase hover:underline">Logout</button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white flex font-sans overflow-x-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-full z-20 bg-white border-r border-gray-100 flex-col transition-all duration-300 ${isCollapsed?"w-20":"w-64"}`}>
        <button onClick={()=>setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 shadow-sm z-30">
          {isCollapsed?<HiMenu size={12}/>:<HiChevronLeft/>}
        </button>
        <SidebarContent/>
      </aside>

      {/* ── Mobile drawer ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setIsMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <button onClick={()=>setIsMobileOpen(false)} className="absolute right-4 top-8 p-2 text-gray-400"><HiX size={24}/></button>
            <SidebarContent mobile/>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed?"md:ml-20":"md:ml-64"}`}>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-10 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={()=>setIsMobileOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <HiMenu size={24}/>
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions, users, or properties..."
                className="w-full pl-11 pr-4 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50/50 outline-none focus:ring-2 focus:ring-blue-100"/>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 border border-gray-100 rounded-xl">
              <HiBell className="text-xl"/>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"/>
            </button>
            <button className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">
              <HiDownload/> Export
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-10 py-6 md:py-8 w-full bg-[#f8fafc]">
          <div className="max-w-[1600px] mx-auto">
            {pages[active]}
          </div>
        </main>
      </div>
    </div>
  );
}