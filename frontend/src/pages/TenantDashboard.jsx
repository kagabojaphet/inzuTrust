import React, { useState } from "react";
import {
  HiBell, HiHome, HiCreditCard, HiShieldCheck,
  HiCog, HiChat, HiUser
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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="text-2xl font-black text-blue-700">InzuTrust</div>

          {/* Center nav — Dashboard, Payments, Trust Score, Maintenance, Messages, Properties */}
          <div className="hidden md:flex items-center gap-10">
            {tabs
              .filter(tab => tab.id !== "notifications" && tab.id !== "profile")
              .map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative font-medium transition ${
                    activeTab === tab.id
                      ? "text-gray-900 font-semibold border-b-2 border-blue-600 pb-1"
                      : "text-gray-600 hover:text-gray-900"
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

          {/* Right side — Bell, EN/KNY toggle, Avatar */}
          <div className="flex items-center gap-6">

            {/* Bell → Notifications */}
            <button
              onClick={() => setActiveTab("notifications")}
              className={`relative transition ${activeTab === "notifications" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            >
              <HiBell className="text-xl" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Language toggle — EN / KNY, no globe icon */}
            <button
              onClick={toggleLang}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
            >
              {lang}
            </button>

            {/* Avatar → Profile (no name text) */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm transition ${
                activeTab === "profile"
                  ? "ring-2 ring-blue-500 ring-offset-1"
                  : "hover:ring-2 hover:ring-blue-300 hover:ring-offset-1"
              }`}
            >
              K
            </button>
          </div>

        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">

        {/* Welcome header — only on Overview */}
        {activeTab === "overview" && (
          <div className="mb-12 text-left">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Here is your rental financial health overview for October.
            </p>
          </div>
        )}

        {/* Page title for all other tabs */}
        {activeTab !== "overview" && (
          <div className="mb-8 text-left">
            <p className="text-sm text-gray-400 mb-1">
              <button onClick={() => setActiveTab("overview")} className="hover:text-blue-600 font-medium">
                Dashboard
              </button>
              {" / "}
              <span className="text-gray-700 font-semibold">
                {tabs.find(t => t.id === activeTab)?.label}
              </span>
            </p>
            <h1 className="text-3xl font-black text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
        )}

        {ActiveComponent}
      </main>

      {/* Footer */}
      <div className="mt-16 pt-10 border-t border-gray-200 max-w-7xl mx-auto w-full px-6 pb-10 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <div>© 2026 InzuTrust. All rights reserved.</div>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <a href="#" className="hover:text-gray-700">Privacy Policy</a>
          <a href="#" className="hover:text-gray-700">Terms of Service</a>
          <a href="#" className="hover:text-gray-700">Support</a>
        </div>
      </div>

    </div>
  );
}