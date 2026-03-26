import React, { useState } from "react";
import {
  HiBell, HiHome, HiCreditCard, HiShieldCheck,
  HiCog, HiChat, HiUser, HiMenu, HiX, HiViewGrid,
  HiDocumentText, HiExclamationCircle
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

import Overview         from "../components/tenant/Overview";
import Payments         from "../components/tenant/Payments";
import TrustScore       from "../components/tenant/TrustScore";
import Maintenance      from "../components/tenant/Maintenance";
import Messages         from "../components/shared/Messages";
import Notifications    from "../components/tenant/Notifications";
import Profile          from "../components/tenant/Profile";
import TenantAgreements from "../components/tenant/TenantAgreements";
import DisputeCenter    from "../components/shared/DisputeCenter";
import Properties       from "./Properties";

const tabs = [
  { id:"overview",    label:"Overview",     icon:HiHome              },
  { id:"payments",    label:"Payments",     icon:HiCreditCard        },
  { id:"trust",       label:"Trust Score",  icon:HiShieldCheck       },
  { id:"maintenance", label:"Maintenance",  icon:HiCog               },
  { id:"messages",    label:"Messages",     icon:HiChat              },
  { id:"agreements",  label:"Agreements",   icon:HiDocumentText      },
  { id:"disputes",    label:"Disputes",     icon:HiExclamationCircle },
  { id:"properties",  label:"Browse",       icon:HiHome              },
];

const unreadMessages = 2;
const unreadNotifs   = 3;
const openDisputes   = 1;

export default function TenantDashboard() {
  const [activeTab,  setActiveTab]  = useState("overview");
  const [lang,       setLang]       = useState("EN");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, token } = useAuth();
  const userName = user?.firstName || "Keza";

  const ActiveComponent = {
    overview:    <Overview setActiveTab={setActiveTab} token={token}/>,
    payments:    <Payments />,
    trust:       <TrustScore />,
    maintenance: <Maintenance />,
    messages:    <Messages token={token} user={user} userRole="tenant" />,
    agreements:  <TenantAgreements token={token} user={user} />,
    disputes:    <DisputeCenter token={token} userRole="tenant" />,
    properties:  <Properties />,
    notifications:<Notifications />,
    profile:     <Profile />,
  }[activeTab];

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-sans flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 w-full sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={()=>setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {isMenuOpen?<HiX className="text-2xl"/>:<HiMenu className="text-2xl"/>}
            </button>
            <div className="flex items-center gap-2">
              <HiViewGrid className="text-blue-600 text-2xl"/>
              <div className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Tenant <span className="text-blue-600">Dashboard</span>
              </div>
            </div>
          </div>

          {/* Desktop tabs */}
          <div className="hidden lg:flex items-center gap-5">
            {tabs.filter(t=>t.id!=="notifications"&&t.id!=="profile").map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className={`relative text-sm font-bold transition ${activeTab===tab.id?"text-blue-600 border-b-2 border-blue-600 pb-1":"text-gray-500 hover:text-gray-900"}`}>
                {tab.label}
                {tab.id==="messages"&&unreadMessages>0&&(
                  <span className="absolute -top-2 -right-3 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadMessages}</span>
                )}
                {tab.id==="agreements"&&(
                  <span className="absolute -top-2 -right-3 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">1</span>
                )}
                {tab.id==="disputes"&&openDisputes>0&&(
                  <span className="absolute -top-2 -right-3 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{openDisputes}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={()=>setActiveTab("notifications")}
              className={`relative p-2 rounded-full transition ${activeTab==="notifications"?"bg-blue-50 text-blue-600":"text-gray-500 hover:bg-gray-50"}`}>
              <HiBell className="text-xl sm:text-2xl"/>
              {unreadNotifs>0&&<span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">{unreadNotifs}</span>}
            </button>
            <button onClick={()=>setLang(l=>l==="EN"?"KNY":"EN")} className="hidden sm:block text-sm font-bold text-gray-700 hover:text-blue-600">{lang}</button>
            <button onClick={()=>setActiveTab("profile")}
              className={`w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm transition ${activeTab==="profile"?"ring-4 ring-blue-100":""}`}>
              {(user?.firstName?.[0]||"K").toUpperCase()}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen&&(
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2 shadow-xl">
            {[...tabs,{id:"notifications",label:"Notifications",icon:HiBell},{id:"profile",label:"Profile",icon:HiUser}].map(tab=>(
              <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setIsMenuOpen(false);}}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition ${activeTab===tab.id?"bg-blue-50 text-blue-700":"text-gray-600 hover:bg-gray-50"}`}>
                <tab.icon className="text-xl"/> {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-full w-full mx-auto mb-20 lg:mb-0">
        {activeTab==="overview"&&(
          <div className="mb-8 sm:mb-10 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-500 mt-2 text-base sm:text-lg">October rental health overview.</p>
          </div>
        )}
        {activeTab!=="overview"&&(
          <div className="mb-5">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              {[...tabs,{id:"notifications",label:"Notifications"},{id:"profile",label:"Profile"}].find(t=>t.id===activeTab)?.label}
            </h2>
          </div>
        )}
        <div className="w-full">{ActiveComponent}</div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
        {tabs.slice(0,5).map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition ${activeTab===tab.id?"text-blue-600":"text-gray-400"}`}>
            <tab.icon className="text-2xl"/>
            <span className="text-[10px] font-bold mt-1 uppercase">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <footer className="hidden sm:flex mt-10 pt-8 border-t border-gray-200 max-w-full w-full mx-auto px-6 md:px-12 pb-8 flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400">
        <div>© 2026 InzuTrust Rwanda.</div>
        <div className="flex gap-4 sm:gap-8 mt-4 sm:mt-0 font-medium">
          <a href="#" className="hover:text-blue-600">Privacy</a>
          <a href="#" className="hover:text-blue-600">Terms</a>
          <a href="#" className="hover:text-blue-600">Help</a>
        </div>
      </footer>
    </div>
  );
}