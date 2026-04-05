// src/components/shared/ProfileDropdown.jsx
// Shows ONLY the avatar in the header — name/role shown inside the dropdown
import { useState, useRef, useEffect } from "react";
import { HiUser, HiLogout, HiCog, HiBadgeCheck, HiExclamationCircle, HiChevronDown } from "react-icons/hi";

const timeAgo = d => {
  if (!d) return "Never";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return "Just now";
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short" });
};

export default function ProfileDropdown({ user, onSettingsClick, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) return null;

  const avatar = `https://ui-avatars.com/api/?name=${user.firstName||"U"}+${user.lastName||""}&background=dbeafe&color=2563eb&bold=true&size=64`;

  return (
    <div className="relative" ref={ref}>
      {/* ── Trigger: avatar only ── */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-1.5 hover:bg-gray-100 rounded-xl transition"
        title={`${user.firstName} ${user.lastName}`}
      >
        <div className="relative">
          <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm"/>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"/>
        </div>
        <HiChevronDown className={`text-gray-400 text-xs transition-transform hidden sm:block ${open?"rotate-180":""}`}/>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">

          {/* Profile header — name + role shown HERE, not in trigger */}
          <div className="px-5 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img src={avatar} alt="avatar" className="w-12 h-12 rounded-xl border-2 border-white shadow-sm"/>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.isVerified
                      ? "text-green-700 bg-green-100"
                      : "text-amber-700 bg-amber-100"
                  }`}>
                    {user.isVerified ? <><HiBadgeCheck/> KYC Verified</> : <><HiExclamationCircle/> Pending KYC</>}
                  </span>
                  <span className="text-[10px] text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Last seen: {timeAgo(user.lastSeenAt)}</p>
          </div>

          {/* Actions */}
          <div className="py-2">
            <button onClick={() => { setOpen(false); onSettingsClick?.("settings"); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition font-semibold">
              <HiUser className="text-blue-500"/> View Profile
            </button>
            <button onClick={() => { setOpen(false); onSettingsClick?.("settings"); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition font-semibold">
              <HiCog className="text-gray-400"/> Settings
            </button>
          </div>

          <div className="border-t border-gray-100 py-2">
            <button onClick={() => { setOpen(false); onLogout?.(); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition font-bold">
              <HiLogout className="text-red-500"/> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}