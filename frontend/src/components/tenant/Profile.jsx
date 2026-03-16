import React, { useState } from "react";
import { HiPencil, HiCheck, HiShieldCheck, HiBell, HiGlobe, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

const initialProfile = {
  firstName: "Keza", lastName: "Uwimana",
  email: "keza.uwimana@gmail.com", phone: "+250 788 123 456",
  nationalId: "119900xxxxxxxx", dob: "1990-05-14",
  address: "KG 12 Ave, Kicukiro, Kigali",
  emergencyName: "Jean Uwimana", emergencyPhone: "+250 788 987 654",
};

const notifPrefs = [
  { id: "rent_due",       label: "Rent due reminders",         desc: "7 and 3 days before due date", on: true  },
  { id: "payment_conf",   label: "Payment confirmations",       desc: "When a payment is processed",  on: true  },
  { id: "maintenance_upd",label: "Maintenance updates",        desc: "Status changes on requests",   on: true  },
  { id: "messages",       label: "New messages",               desc: "From your property manager",   on: true  },
  { id: "trust_score",    label: "Trust score changes",        desc: "Monthly score updates",        on: false },
  { id: "promotions",     label: "Platform news & tips",       desc: "InzuTrust newsletters",        on: false },
];

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialProfile);
  const [prefs, setPrefs] = useState(notifPrefs);
  const [activeSection, setActiveSection] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const togglePref = (id) => setPrefs(p => p.map(x => x.id === id ? { ...x, on: !x.on } : x));

  const sections = [
    { id: "personal",  label: "Personal Info",    icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security",  label: "Security",         icon: "🔒" },
    { id: "language",  label: "Language & Region",icon: "🌍" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Left nav */}
      <div className="sm:w-56 shrink-0 space-y-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSection === s.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">

        {/* Personal Info */}
        {activeSection === "personal" && (
          <>
            {/* Avatar section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-black shrink-0">
                K
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{profile.firstName} {profile.lastName}</h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <HiShieldCheck className="text-green-500" />
                  <span className="text-xs font-bold text-green-600">Verified Tenant</span>
                </div>
              </div>
              <button onClick={() => { setDraft(profile); setEditing(!editing); }}
                className={`ml-auto px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${editing ? "bg-gray-100 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                <HiPencil /> {editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="font-black text-gray-900 mb-5">Personal Information</h4>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { label: "First Name",       key: "firstName"     },
                  { label: "Last Name",        key: "lastName"      },
                  { label: "Email Address",    key: "email"         },
                  { label: "Phone Number",     key: "phone"         },
                  { label: "National ID",      key: "nationalId"    },
                  { label: "Date of Birth",    key: "dob", type: "date" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">{f.label}</label>
                    <input type={f.type || "text"} value={editing ? draft[f.key] : profile[f.key]}
                      disabled={!editing}
                      onChange={e => setDraft({...draft, [f.key]: e.target.value})}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition outline-none ${editing ? "border-blue-300 focus:border-blue-500 bg-white" : "border-gray-100 bg-gray-50 text-gray-600"}`} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">Home Address</label>
                  <input type="text" value={editing ? draft.address : profile.address}
                    disabled={!editing}
                    onChange={e => setDraft({...draft, address: e.target.value})}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition outline-none ${editing ? "border-blue-300 focus:border-blue-500 bg-white" : "border-gray-100 bg-gray-50 text-gray-600"}`} />
                </div>
              </div>
            </div>

            {/* Emergency contact */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="font-black text-gray-900 mb-5">Emergency Contact</h4>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { label: "Full Name",    key: "emergencyName"  },
                  { label: "Phone Number", key: "emergencyPhone" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">{f.label}</label>
                    <input type="text" value={editing ? draft[f.key] : profile[f.key]}
                      disabled={!editing}
                      onChange={e => setDraft({...draft, [f.key]: e.target.value})}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition outline-none ${editing ? "border-blue-300 focus:border-blue-500 bg-white" : "border-gray-100 bg-gray-50 text-gray-600"}`} />
                  </div>
                ))}
              </div>
            </div>

            {editing && (
              <button onClick={handleSave}
                className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition flex items-center gap-2">
                <HiCheck /> Save Changes
              </button>
            )}
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                <HiCheck /> Profile saved successfully!
              </div>
            )}
          </>
        )}

        {/* Notifications */}
        {activeSection === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h4 className="font-black text-gray-900 mb-6">Notification Preferences</h4>
            <div className="space-y-5">
              {prefs.map(p => (
                <div key={p.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </div>
                  <button onClick={() => togglePref(p.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${p.on ? "bg-blue-600" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${p.on ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        {activeSection === "security" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="font-black text-gray-900 mb-5">Change Password</h4>
              <div className="space-y-4 max-w-sm">
                {["Current Password", "New Password", "Confirm New Password"].map((lbl, i) => (
                  <div key={i}>
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">{lbl}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition" />
                      <button onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <HiEyeOff /> : <HiEye />}
                      </button>
                    </div>
                  </div>
                ))}
                <button className="bg-blue-600 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                  Update Password
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="font-black text-gray-900 mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account.</p>
              <button className="border border-blue-200 text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition flex items-center gap-2">
                <HiShieldCheck /> Enable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Language */}
        {activeSection === "language" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h4 className="font-black text-gray-900 mb-5">Language & Region</h4>
            <div className="space-y-5 max-w-sm">
              {[
                { label: "Language", options: ["English", "Kinyarwanda", "French"] },
                { label: "Currency", options: ["RWF – Rwandan Franc", "USD – US Dollar"] },
                { label: "Timezone", options: ["Africa/Kigali (CAT)", "UTC", "Europe/London"] },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">{f.label}</label>
                  <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition">
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button className="bg-blue-600 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}