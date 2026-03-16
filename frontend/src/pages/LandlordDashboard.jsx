import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHome, HiOfficeBuilding, HiUsers, HiDocumentText,
  HiCreditCard, HiCog, HiBell, HiSearch, HiPlus, HiMenu, HiChevronLeft
} from "react-icons/hi";

// Sub-component Imports
import LDOverview from "../components/landlord/Ldoverview";
import LDProperties from "../components/landlord/Ldproperties";
import LDTenants from "../components/landlord/Ldtenants";
import LDAgreements from "../components/landlord/Ldagreements";
import LDPayments from "../components/landlord/Ldpayments";
import LDSettings from "../components/landlord/Ldsettings";
import LDAddProperty from "../components/landlord/LDAddProperty";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const NAV = [
  { id: "dashboard",   label: "Dashboard",   icon: HiHome           },
  { id: "properties",  label: "Properties",  icon: HiOfficeBuilding },
  { id: "tenants",     label: "Tenants",     icon: HiUsers          },
  { id: "agreements",  label: "Agreements",  icon: HiDocumentText   },
  { id: "payments",    label: "Payments",    icon: HiCreditCard     },
  { id: "settings",    label: "Settings",    icon: HiCog            },
];

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard":    return <LDOverview token={token} setActive={setActive} />;
      case "properties":   return <LDProperties token={token} setActive={setActive} />;
      case "tenants":      return <LDTenants token={token} />;
      case "agreements":   return <LDAgreements token={token} />;
      case "payments":     return <LDPayments token={token} />;
      case "settings":     return <LDSettings token={token} user={user} />;
      case "add-property": return <LDAddProperty onCancel={() => setActive("properties")} token={token} />;
      default:             return <LDOverview token={token} setActive={setActive} />;
    }
  };

  // Consistent widths for alignment
  const sideWidth = isCollapsed ? "w-20" : "w-64";
  const contentMargin = isCollapsed ? "pl-20" : "pl-64";

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">
      {/* Sidebar Section - Fixed and Full Height */}
      <aside 
        className={`${sideWidth} bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <HiHome className="text-white text-lg" />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap">
                <p className="text-sm font-black text-black leading-none uppercase tracking-tight">InzuTrust</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Landlord Admin</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm z-40 transition-transform"
          >
            {isCollapsed ? <HiMenu size={12}/> : <HiChevronLeft size={12}/>}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id || (active === "add-property" && item.id === "properties");
            return (
              <button 
                key={item.id} 
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Icon className={`text-xl shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-5 border-t border-gray-100">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <img 
              src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=dbeafe&color=2563eb&bold=true`}
              alt="avatar" 
              className="w-8 h-8 rounded-full shrink-0 border border-gray-100" 
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-black truncate">{user.firstName} {user.lastName}</p>
                <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold hover:underline uppercase tracking-tighter">Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 ${contentMargin} flex flex-col min-h-screen transition-all duration-300`}>
        
        {/* Sticky Top Navbar */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 w-full">
          <div className="relative w-72">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search properties..." 
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:bg-white focus:border-blue-300 transition-all placeholder:text-gray-400" 
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl transition">
              <HiBell className="text-xl" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

            <button
              onClick={() => setActive("add-property")}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100"
            >
              <HiPlus /> 
              {!isCollapsed && <span>Add Property</span>}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 px-8 py-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}