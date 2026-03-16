import React, { useState } from "react";
import {
  HiBell, HiHome, HiCreditCard, HiShieldCheck,
  HiCog, HiChat, HiUser, HiMenu, HiX, HiViewGrid // Added HiViewGrid for the dashboard icon
} from "react-icons/hi";

import Overview      from "../components/tenant/Overview";
import Payments      from "../components/tenant/Payments";
import TrustScore    from "../components/tenant/TrustScore";
import Maintenance   from "../components/tenant/Maintenance";
import Messages      from "../components/tenant/Messages";
import Notifications from "../components/tenant/Notifications";
import Profile       from "../components/tenant/Profile";
import Properties    from "./Properties";

const userName = "Keza";

const tabs = [
  { id: "overview",      label: "Overview",      icon: HiHome       },
  { id: "payments",      label: "Payments",      icon: HiCreditCard },
  { id: "trust",         label: "Trust Score",   icon: HiShieldCheck},
  { id: "maintenance",   label: "Maintenance",   icon: HiCog        },
  { id: "messages",      label: "Messages",      icon: HiChat       },
  { id: "properties",    label: "Properties",    icon: HiHome       },
  { id: "notifications", label: "Notifications", icon: HiBell       },
  { id: "profile",       label: "Profile",       icon: HiUser       },
];

const unreadMessages = 2;
const unreadNotifs   = 3;

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [lang, setLang] = useState("EN");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const ActiveComponent = {
    overview:      <Overview      setActiveTab={setActiveTab} />,
    payments:      <Payments />,
    trust:         <TrustScore />,
    maintenance:   <Maintenance />,
    messages:      <Messages />,
    properties:    <Properties />,
    notifications: <Notifications />,
    profile:       <Profile />,
  }[activeTab];

  const toggleLang = () => setLang(l => l === "EN" ? "KNY" : "EN");

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-sans flex flex-col">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 w-full sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            </button>

            {/* Replaced InzuTrust with Tenant Dashboard + Icon */}
            <div className="flex items-center gap-2">
              <HiViewGrid className="text-blue-600 text-2xl" />
              <div className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Tenant <span className="text-blue-600">Dashboard</span>
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex items-center gap-8">
            {tabs
              .filter(tab => tab.id !== "notifications" && tab.id !== "profile")
              .map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative text-sm font-bold transition ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {tab.id === "messages" && unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-3 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                      {unreadMessages}
                    </span>
                  )}
                </button>
              ))}
          </div>

          {/* Right side Icons */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`relative p-2 rounded-full transition ${activeTab === "notifications" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <HiBell className="text-xl sm:text-2xl" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
                  {unreadNotifs}
                </span>
              )}
            </button>
            
            <button onClick={toggleLang} className="hidden sm:block text-sm font-bold text-gray-700 hover:text-blue-600">{lang}</button>
            
            <button 
              onClick={() => setActiveTab("profile")} 
              className={`w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm transition ${activeTab === "profile" ? "ring-4 ring-blue-100" : ""}`}
            >
              K
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-300">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition ${
                  activeTab === tab.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="text-xl" />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-10 max-w-full w-full mx-auto mb-20 lg:mb-0">
        
        {/* Responsive Header */}
        {activeTab === "overview" && (
          <div className="mb-8 sm:mb-12 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-500 mt-2 text-base sm:text-xl">
              October rental health overview.
            </p>
          </div>
        )}

        {/* Tab Title for Mobile */}
        {activeTab !== "overview" && (
          <div className="mb-6">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
        )}

        <div className="w-full">
            {ActiveComponent}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
        {tabs.slice(0, 5).map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition ${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}`}
          >
            <tab.icon className="text-2xl" />
            <span className="text-[10px] font-bold mt-1 uppercase">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="hidden sm:flex mt-16 pt-10 border-t border-gray-200 max-w-full w-full mx-auto px-6 md:px-12 pb-10 flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400">
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