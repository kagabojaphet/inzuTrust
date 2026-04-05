// src/components/landlord/LDSettings.jsx
import React, { useState, useEffect } from "react";
import {
  HiCheck, HiPencil, HiShieldCheck, HiRefresh,
  HiUser, HiBell, HiLockClosed, HiOfficeBuilding,
} from "react-icons/hi";
import { API_BASE } from "../../config";

const hdrs = (tk) => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <h3 className="text-base font-black text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, editing, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        disabled={!editing}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${
          editing
            ? "border-blue-300 focus:ring-2 focus:ring-blue-100 bg-white"
            : "border-gray-100 bg-gray-50 text-gray-600 cursor-default"
        }`}
      />
    </div>
  );
}

// ── Notification toggle ───────────────────────────────────────────────────────
function NotifToggle({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? "bg-blue-600" : "bg-gray-200"}`}
        role="switch"
        aria-checked={on}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LDSettings({ token }) {
  const [profile,     setProfile]     = useState(null);
  const [form,        setForm]        = useState({});
  const [editing,     setEditing]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState(null);

  // ── Fetch full profile on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/users/profile`, { headers: hdrs(token) })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const u = data.data;
          const p = u.landlordProfile || {};
          setProfile(u);
          setForm({
            firstName:       u.firstName       || "",
            lastName:        u.lastName        || "",
            email:           u.email           || "",
            phone:           u.phone           || "",
            companyName:     p.companyName     || "",
            tinNumber:       p.tinNumber       || "",
            businessAddress: p.businessAddress || "",
            website:         p.website         || "",
            bio:             p.bio             || "",
          });
        } else {
          setError(data.message);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCancel = () => {
    if (!profile) return;
    const p = profile.landlordProfile || {};
    setForm({
      firstName:       profile.firstName       || "",
      lastName:        profile.lastName        || "",
      email:           profile.email           || "",
      phone:           profile.phone           || "",
      companyName:     p.companyName           || "",
      tinNumber:       p.tinNumber             || "",
      businessAddress: p.businessAddress       || "",
      website:         p.website               || "",
      bio:             p.bio                   || "",
    });
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Update user basic info
      const userRes  = await fetch(`${API_BASE}/users/profile`, {
        method:  "PUT",
        headers: hdrs(token),
        body:    JSON.stringify({
          firstName: form.firstName,
          lastName:  form.lastName,
          phone:     form.phone,
        }),
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.message || "Failed to update user profile");

      // Update landlord-specific profile fields
      const ldRes  = await fetch(`${API_BASE}/users/landlords/profile`, {
        method:  "POST",
        headers: hdrs(token),
        body:    JSON.stringify({
          companyName:     form.companyName,
          tinNumber:       form.tinNumber,
          businessAddress: form.businessAddress,
          website:         form.website,
          bio:             form.bio,
        }),
      });
      const ldData = await ldRes.json();
      if (!ldRes.ok) throw new Error(ldData.message || "Failed to update landlord profile");

      // Refresh profile from server
      const freshRes  = await fetch(`${API_BASE}/users/profile`, { headers: hdrs(token) });
      const freshData = await freshRes.json();
      if (freshData.success) setProfile(freshData.data);

      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32" />
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Settings</h2>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
            <HiCheck /> Saved successfully
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* ── Personal Info ── */}
      <Section icon={<HiUser />} title="Personal Information">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=dbeafe&color=2563eb&bold=true&size=64`}
            className="w-14 h-14 rounded-full border border-gray-100"
            alt="avatar"
          />
          <div>
            <p className="font-black text-gray-900">{form.firstName} {form.lastName}</p>
            <p className="text-sm text-gray-400">{form.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <HiShieldCheck className="text-green-500 text-sm" />
              <span className="text-xs font-bold text-green-600">
                {profile?.isVerified ? "Verified Landlord" : "Pending Verification"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">Update your personal details</p>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition"
            >
              <HiPencil /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiCheck />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name"   value={form.firstName} editing={editing} onChange={set("firstName")} />
          <Field label="Last Name"    value={form.lastName}  editing={editing} onChange={set("lastName")}  />
          <Field label="Email Address" value={form.email}   editing={false}   onChange={() => {}} />
          <Field label="Phone Number" value={form.phone}    editing={editing} onChange={set("phone")} type="tel" />
        </div>
      </Section>

      {/* ── Business Info ── */}
      <Section icon={<HiOfficeBuilding />} title="Business Information">
        <p className="text-xs text-gray-400 mb-4">
          This information appears on lease agreements and invoices.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name"     value={form.companyName}     editing={editing} onChange={set("companyName")}     placeholder="Your company or trading name" />
          <Field label="TIN Number"       value={form.tinNumber}       editing={editing} onChange={set("tinNumber")}       placeholder="Tax Identification Number" />
          <Field label="Business Address" value={form.businessAddress} editing={editing} onChange={set("businessAddress")} placeholder="Full business address" />
          <Field label="Website"          value={form.website}         editing={editing} onChange={set("website")}         placeholder="https://yourwebsite.com" type="url" />
        </div>
        <div className="mt-4">
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Bio / About</label>
          <textarea
            value={form.bio || ""}
            disabled={!editing}
            onChange={e => set("bio")(e.target.value)}
            rows={3}
            placeholder="Describe your business or rental portfolio..."
            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition ${
              editing
                ? "border-blue-300 focus:ring-2 focus:ring-blue-100 bg-white"
                : "border-gray-100 bg-gray-50 text-gray-600 cursor-default"
            }`}
          />
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            <HiPencil className="text-sm" /> Edit business info
          </button>
        )}
      </Section>

      {/* ── Notifications ── */}
      <Section icon={<HiBell />} title="Notification Preferences">
        <p className="text-xs text-gray-400 mb-2">Choose which events send you an alert.</p>
        {[
          { label: "Rent payment received",   desc: "When a tenant completes a rent payment",    on: true  },
          { label: "Late payment alert",       desc: "When a payment is overdue by 3+ days",      on: true  },
          { label: "New lease signed",         desc: "When a tenant signs a lease agreement",     on: true  },
          { label: "Maintenance requests",     desc: "When a tenant submits a maintenance ticket", on: true  },
          { label: "New lease application",    desc: "When a tenant applies for your property",   on: true  },
          { label: "Dispute filed",            desc: "When a tenant files a dispute",             on: true  },
          { label: "Agent activity",           desc: "When one of your agents takes an action",   on: false },
        ].map((n, i) => <NotifToggle key={i} {...n} defaultOn={n.on} />)}
      </Section>

      {/* ── Security ── */}
      <Section icon={<HiLockClosed />} title="Security">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-900">Password</p>
              <p className="text-xs text-gray-400">Last changed — unknown</p>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline">Change password</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Two-factor authentication</p>
              <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Coming soon</span>
          </div>
        </div>
      </Section>

      {/* ── Account ── */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <h3 className="text-sm font-black text-red-800 mb-1">Danger Zone</h3>
        <p className="text-xs text-red-600 mb-4">
          Deactivating your account will remove all your listings and cannot be undone.
        </p>
        <button className="text-xs font-bold text-red-600 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-100 transition">
          Deactivate Account
        </button>
      </div>
    </div>
  );
}