import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiViewGrid, HiUsers, HiShieldCheck, HiCreditCard,
  HiScale, HiClipboardList, HiBell, HiSearch, HiDownload,
  HiGlobe, HiLogout, HiChevronLeft, HiChevronRight
} from "react-icons/hi";

// Sub-component Imports
import ADOverview from "../components/admin/ADOverview";
import ADUsers from "../components/admin/ADUsers";
import ADProperties from "../components/admin/ADProperties";
import ADPayments from "../components/admin/ADPayments";
import ADDisputes from "../components/admin/ADDisputes";
import ADLogs from "../components/admin/ADLogs";

const NAV = [
  { id: "dashboard",   label: "Dashboard",             icon: HiViewGrid      },
  { id: "users",        label: "User Management",       icon: HiUsers         },
  { id: "properties",   label: "Property Verification", icon: HiShieldCheck   },
  { id: "payments",     label: "Payments & Escrow",     icon: HiCreditCard    },
  { id: "disputes",     label: "Dispute Resolution",    icon: HiScale         },
  { id: "logs",         label: "System Logs",           icon: HiClipboardList },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("EN/RW");

  const user = (() => { 
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } 
    catch { return {}; } 
  })();
  const token = localStorage.getItem("token") || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pages = {
    dashboard:  <ADOverview   token={token} setActive={setActive} />,
    users:      <ADUsers      token={token} />,
    properties: <ADProperties token={token} />,
    payments:   <ADPayments   token={token} />,
    disputes:   <ADDisputes   token={token} />,
    logs:       <ADLogs       token={token} />,
  };

  return (
    <div className="min-h-screen bg-white flex font-sans overflow-x-hidden">
      
      {/* ── Sidebar ── */}
      <aside 
        className={`fixed top-0 left-0 h-full z-20 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Floating Toggle Button - Changes based on Collapse state */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 z-30 transition-all active:scale-90"
        >
          {isCollapsed ? (
            <HiChevronRight className="text-lg" />
          ) : (
            <HiChevronLeft className="text-lg" />
          )}
        </button>

        {/* Logo Section - Matches Figma */}
        <div className={`px-6 py-8 flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
            <HiShieldCheck className="text-white text-2xl" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight animate-in fade-in duration-300">
              <p className="text-lg font-bold text-blue-600 leading-none">InzuTrust</p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Super Admin Portal</p>
            </div>
          )}
        </div>

        {/* Navigation - Figma style */}
        <nav className="flex-1 px-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const on = active === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActive(item.id)}
                title={isCollapsed ? item.label : ""}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  on ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 rounded-r-none" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                } ${isCollapsed ? "justify-center" : "justify-start"}`}
              >
                <Icon className={`text-xl shrink-0 ${on ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                {!isCollapsed && (
                  <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section - Figma style */}
        <div className="px-4 py-6 border-t border-gray-50 space-y-2">
          <button
            onClick={() => setLang(l => l === "EN/RW" ? "RW/EN" : "EN/RW")}
            className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition font-medium ${isCollapsed ? "justify-center" : ""}`}
          >
            <HiGlobe className="text-xl text-gray-400 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Language: {lang}</span>}
          </button>

          <button className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition font-medium ${isCollapsed ? "justify-center" : ""}`}>
            <HiLogout className="text-xl text-gray-400 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
          </button>
          
          <div className={`flex items-center gap-3 px-3 py-4 mt-2 rounded-2xl ${!isCollapsed ? 'bg-gray-50' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold shrink-0 border-2 border-white shadow-sm overflow-hidden">
               {/* User Avatar Placeholder */}
               <img src="https://ui-avatars.com/api/?name=Jean+Kamanzi&background=fdba74&color=9a3412" alt="avatar" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Jean Kamanzi"}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Chief Admin</p>
                <button onClick={handleLogout} className="text-[9px] text-red-500 font-bold uppercase hover:underline mt-1">Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content Container ── */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header - Matches Figma Header */}
        <header className="bg-white border-b border-gray-100 px-10 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-full max-w-xl">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions, users, or properties..."
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-100 bg-gray-50/50 transition-all placeholder:text-gray-400" 
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl transition border border-gray-100">
              <HiBell className="text-xl" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <HiDownload className="text-lg" /> 
              <span>Export Data</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 px-10 py-8 w-full bg-[#f8fafc]">
          <div className="max-w-[1600px] mx-auto">
            {pages[active]}
          </div>
        </main>
      </div>
    </div>
  );
}