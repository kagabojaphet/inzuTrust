// src/pages/TenantDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  HiBell, HiHome, HiCreditCard, HiShieldCheck,
  HiCog, HiChat, HiUser, HiMenu, HiX, HiViewGrid,
  HiDocumentText, HiExclamationCircle, HiSearch, HiCollection
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

import Overview              from "../components/tenant/Overview";
import Payments              from "../components/tenant/Payments";
import TrustScore            from "../components/tenant/TrustScore";
import Maintenance           from "../components/tenant/Maintenance";
import Messages              from "../components/shared/Messages";
import Notifications         from "../components/tenant/Notifications";
import Profile               from "../components/tenant/Profile";
import TenantAgreements      from "../components/tenant/TenantAgreements";
import DisputeCenter         from "../components/shared/DisputeCenter";
import TenantBrowseProperties from "../components/tenant/TenantBrowseProperties";
import TenantApplications    from "../components/tenant/TenantApplications";

const tabs = [
  { id:"overview",      label:"Overview",      icon:HiHome              },
  { id:"browse",        label:"Browse",        icon:HiSearch            },
  { id:"applications",  label:"Applications",  icon:HiCollection        },
  { id:"payments",      label:"Payments",      icon:HiCreditCard        },
  { id:"trust",         label:"Trust Score",   icon:HiShieldCheck       },
  { id:"maintenance",   label:"Maintenance",   icon:HiCog               },
  { id:"messages",      label:"Messages",      icon:HiChat              },
  { id:"agreements",    label:"Agreements",    icon:HiDocumentText      },
  { id:"disputes",      label:"Disputes",      icon:HiExclamationCircle },
];

export default function TenantDashboard() {
  const [activeTab,  setActiveTab]  = useState("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const { user, token } = useAuth();
  const userName = user?.firstName || "Keza";

  // If arriving from register after Apply Lease, land on the applications tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":     return <Overview setActiveTab={setActiveTab}/>;
      case "browse":       return (
        <TenantBrowseProperties
          token={token}
          onNavigateToApplications={() => setActiveTab("applications")}
        />
      );
      case "applications": return (
        <TenantApplications
          token={token}
          onBrowse={() => setActiveTab("browse")}
        />
      );
      case "payments":     return <Payments/>;
      case "trust":        return <TrustScore/>;
      case "maintenance":  return <Maintenance/>;
      case "messages":     return <Messages token={token} user={user} userRole="tenant"/>;
      case "agreements":   return <TenantAgreements token={token} user={user}/>;
      case "disputes":     return <DisputeCenter token={token} userRole="tenant"/>;
      case "notifications":return <Notifications/>;
      case "profile":      return <Profile/>;
      default:             return <Overview setActiveTab={setActiveTab}/>;
    }
  };

  const unreadNotifs   = 3;
  const unreadMessages = 2;

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-sans flex flex-col">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 w-full sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {isMenuOpen ? <HiX className="text-2xl"/> : <HiMenu className="text-2xl"/>}
            </button>
            <div className="flex items-center gap-2">
              <HiViewGrid className="text-blue-600 text-2xl"/>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Tenant <span className="text-blue-600">Dashboard</span>
              </span>
            </div>
          </div>

          {/* Desktop tabs */}
          <div className="hidden lg:flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2 text-sm font-bold rounded-lg transition ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {tab.id === "messages" && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {unreadMessages}
                  </span>
                )}
                {tab.id === "applications" && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition"
            >
              <HiBell className="text-xl"/>
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border-2 border-white">
                  {unreadNotifs}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm transition ${
                activeTab === "profile" ? "ring-4 ring-blue-100" : ""
              }`}
            >
              {(user?.firstName?.[0] || "T").toUpperCase()}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-1 shadow-xl">
            {[...tabs, {id:"notifications",label:"Notifications",icon:HiBell}, {id:"profile",label:"Profile",icon:HiUser}].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition ${
                  activeTab === tab.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="text-lg"/> {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Page header ── */}
      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 max-w-full w-full mx-auto mb-20 lg:mb-0">
        {activeTab === "overview" && (
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-500 mt-1">Here's your rental overview.</p>
          </div>
        )}
        {activeTab === "browse" && (
          <div className="mb-5">
            <h2 className="text-2xl font-black text-gray-900">Browse Properties</h2>
            <p className="text-gray-500 text-sm mt-1">
              Find your next home — apply directly from here without leaving your dashboard.
            </p>
          </div>
        )}
        {activeTab === "applications" && (
          <div className="mb-5">
            <h2 className="text-2xl font-black text-gray-900">My Applications</h2>
            <p className="text-gray-500 text-sm mt-1">Track the status of all your lease applications.</p>
          </div>
        )}
        {!["overview","browse","applications"].includes(activeTab) && (
          <div className="mb-5">
            <h2 className="text-2xl font-black text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label || ""}
            </h2>
          </div>
        )}

        {renderContent()}
      </main>

      {/* ── Mobile bottom nav ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around items-center z-50">
        {[
          { id:"overview",     icon:HiHome,       label:"Home"    },
          { id:"browse",       icon:HiSearch,     label:"Browse"  },
          { id:"applications", icon:HiCollection, label:"Applied" },
          { id:"messages",     icon:HiChat,       label:"Chat"    },
          { id:"agreements",   icon:HiDocumentText,label:"Leases"  },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
              activeTab === tab.id ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <tab.icon className="text-2xl"/>
            <span className="text-[10px] font-bold mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}