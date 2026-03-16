import React, { useState } from "react";
import { HiCheck, HiPencil, HiShieldCheck } from "react-icons/hi";
import { API_BASE } from "../../config"; // Corrected path to config.js

export default function LDSettings({ token, user }) {
  const [profile, setProfile] = useState({
    firstName:   user?.firstName   || "",
    lastName:    user?.lastName    || "",
    email:       user?.email       || "",
    phone:       user?.phone       || "",
    companyName: user?.companyName || "",
  });
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (res.ok) {
        // Update local storage so data persists
        localStorage.setItem("user", JSON.stringify({ ...user, ...profile }));
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        // This helps catch the "400 Bad Request" errors seen in console
        console.error("Update failed:", data.message);
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "First Name",    key: "firstName"   },
    { label: "Last Name",     key: "lastName"    },
    { label: "Email Address", key: "email"       },
    { label: "Phone Number",  key: "phone"       },
    { label: "Company Name",  key: "companyName" },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-black text-gray-900">Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-gray-900">Profile Information</h3>
          <button 
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              editing ? "bg-gray-100 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <HiPencil /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <img 
            src={`https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=dbeafe&color=2563eb&bold=true&size=64`}
            className="w-16 h-16 rounded-full" 
            alt="avatar" 
          />
          <div>
            <p className="font-black text-gray-900">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <HiShieldCheck className="text-green-500 text-sm" />
              <span className="text-xs font-bold text-green-600">Verified Landlord</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{f.label}</label>
              <input
                value={profile[f.key]}
                disabled={!editing}
                onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition outline-none ${
                  editing
                    ? "border-blue-300 focus:ring-2 focus:ring-blue-200 bg-white"
                    : "border-gray-100 bg-gray-50 text-gray-600"
                }`}
              />
            </div>
          ))}
        </div>

        {editing && (
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="mt-5 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            <HiCheck /> {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
        {saved && (
          <p className="mt-3 text-sm text-green-600 font-bold flex items-center gap-1">
            <HiCheck /> Profile saved successfully!
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-black text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { label: "Rent payment received",    desc: "When a tenant pays rent",           on: true  },
            { label: "Late payment alerts",      desc: "When a payment is overdue",         on: true  },
            { label: "New lease signed",         desc: "When a tenant signs a lease",       on: true  },
            { label: "Maintenance requests",     desc: "When a tenant submits a request",   on: false },
          ].map((n, i) => <NotificationToggle key={i} item={n} />)}
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual toggles to maintain clean state
function NotificationToggle({ item }) {
  const [on, setOn] = useState(item.on);
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
        <p className="text-xs text-gray-400">{item.desc}</p>
      </div>
      <button 
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-blue-600" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}