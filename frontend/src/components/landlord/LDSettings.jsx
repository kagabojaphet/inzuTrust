// src/components/landlord/LDSettings.jsx
// Real data: fetches + updates user profile, landlord profile, password change
import { useState, useEffect, useRef } from "react";
import {
  HiUser, HiOfficeBuilding, HiLockClosed, HiBell, HiSave,
  HiEye, HiEyeOff, HiCheckCircle, HiExclamationCircle, HiCamera,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });

function Alert({ type, msg }) {
  if (!msg) return null;
  const ok = type === "success";
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
      ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
    }`}>
      {ok ? <HiCheckCircle className="shrink-0"/> : <HiExclamationCircle className="shrink-0"/>}
      {msg}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="text-blue-600 text-sm"/>
        </div>
        <h3 className="font-black text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition";

export default function LDSettings({ token, user: propUser }) {
  const [loading, setLoading] = useState(true);

  // Personal profile state
  const [personal, setPersonal] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [pSaving,  setPSaving]  = useState(false);
  const [pAlert,   setPAlert]   = useState({ type: "", msg: "" });

  // Business profile state
  const [business, setBusiness] = useState({ companyName: "", tinNumber: "", businessAddress: "", website: "", bio: "" });
  const [bSaving,  setBSaving]  = useState(false);
  const [bAlert,   setBAlert]   = useState({ type: "", msg: "" });

  // Password state
  const [pass,    setPass]    = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw,  setShowPw]  = useState({ cur: false, nw: false, cf: false });
  const [pwSave,  setPwSave]  = useState(false);
  const [pwAlert, setPwAlert] = useState({ type: "", msg: "" });

  // Fetch full profile on mount
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/users/profile`, { headers: hdrs(token) })
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const u = d.data;
        setPersonal({
          firstName: u.firstName || "",
          lastName:  u.lastName  || "",
          phone:     u.phone     || "",
          email:     u.email     || "",
        });
        const lp = u.landlordProfile || {};
        setBusiness({
          companyName:     lp.companyName     || "",
          tinNumber:       lp.tinNumber       || "",
          businessAddress: lp.businessAddress || "",
          website:         lp.website         || "",
          bio:             lp.bio             || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  // ── Save personal ─────────────────────────────────────────────────────────
  const savePersonal = async () => {
    setPSaving(true); setPAlert({ type: "", msg: "" });
    try {
      const r = await fetch(`${API}/users/profile`, {
        method: "PUT", headers: hdrs(token),
        body: JSON.stringify({ firstName: personal.firstName, lastName: personal.lastName, phone: personal.phone }),
      });
      const d = await r.json();
      setPAlert({ type: d.success ? "success" : "error", msg: d.success ? "Personal info saved successfully." : d.message });
    } catch { setPAlert({ type: "error", msg: "Network error." }); }
    finally { setPSaving(false); }
  };

  // ── Save business ─────────────────────────────────────────────────────────
  const saveBusiness = async () => {
    setBSaving(true); setBAlert({ type: "", msg: "" });
    try {
      const r = await fetch(`${API}/users/landlords/profile`, {
        method: "POST", headers: hdrs(token),
        body: JSON.stringify(business),
      });
      const d = await r.json();
      setBAlert({ type: d.success ? "success" : "error", msg: d.success ? "Business profile saved successfully." : d.message });
    } catch { setBAlert({ type: "error", msg: "Network error." }); }
    finally { setBSaving(false); }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = async () => {
    if (pass.newPassword !== pass.confirm) {
      setPwAlert({ type: "error", msg: "New passwords do not match." }); return;
    }
    if (pass.newPassword.length < 8) {
      setPwAlert({ type: "error", msg: "Password must be at least 8 characters." }); return;
    }
    setPwSave(true); setPwAlert({ type: "", msg: "" });
    try {
      const r = await fetch(`${API}/users/change-password`, {
        method: "PUT", headers: hdrs(token),
        body: JSON.stringify({ currentPassword: pass.currentPassword, newPassword: pass.newPassword }),
      });
      const d = await r.json();
      if (d.success) {
        setPwAlert({ type: "success", msg: "Password changed successfully." });
        setPass({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        setPwAlert({ type: "error", msg: d.message || "Failed to change password." });
      }
    } catch { setPwAlert({ type: "error", msg: "Network error." }); }
    finally { setPwSave(false); }
  };

  const PwField = ({ label, fKey, showKey }) => (
    <Field label={label}>
      <div className="relative">
        <input type={showPw[showKey] ? "text" : "password"} value={pass[fKey]}
          onChange={e => setPass(p => ({ ...p, [fKey]: e.target.value }))}
          className={`${inputCls} pr-12`}/>
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPw[showKey] ? <HiEyeOff/> : <HiEye/>}
        </button>
      </div>
    </Field>
  );

  const avatar = `https://ui-avatars.com/api/?name=${personal.firstName||"L"}+${personal.lastName||"A"}&background=dbeafe&color=2563eb&bold=true&size=96`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and business profile.</p>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information" icon={HiUser}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({length:4}).map((_,i)=><div key={i}><Skeleton width={80} height={10} borderRadius={4}/><Skeleton height={44} borderRadius={12} className="mt-1.5"/></div>)}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Avatar display */}
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <img src={avatar} alt="avatar" className="w-16 h-16 rounded-2xl border border-gray-200"/>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                  <HiCamera className="text-white text-[9px]"/>
                </div>
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">{personal.firstName} {personal.lastName}</p>
                <p className="text-xs text-gray-400">{personal.email}</p>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">Landlord</span>
              </div>
            </div>

            <Alert type={pAlert.type} msg={pAlert.msg}/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name">
                <input className={inputCls} value={personal.firstName} onChange={e => setPersonal(p => ({...p, firstName: e.target.value}))}/>
              </Field>
              <Field label="Last Name">
                <input className={inputCls} value={personal.lastName} onChange={e => setPersonal(p => ({...p, lastName: e.target.value}))}/>
              </Field>
            </div>
            <Field label="Email Address">
              <input className={`${inputCls} cursor-not-allowed opacity-60`} value={personal.email} disabled title="Email cannot be changed"/>
            </Field>
            <Field label="Phone Number">
              <input className={inputCls} value={personal.phone} onChange={e => setPersonal(p => ({...p, phone: e.target.value}))} placeholder="+250 7XX XXX XXX"/>
            </Field>
            <button onClick={savePersonal} disabled={pSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
              <HiSave/> {pSaving ? "Saving..." : "Save Personal Info"}
            </button>
          </div>
        )}
      </Section>

      {/* Business Profile */}
      <Section title="Business Profile" icon={HiOfficeBuilding}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({length:5}).map((_,i)=><div key={i}><Skeleton width={80} height={10} borderRadius={4}/><Skeleton height={44} borderRadius={12} className="mt-1.5"/></div>)}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert type={bAlert.type} msg={bAlert.msg}/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name">
                <input className={inputCls} value={business.companyName} onChange={e => setBusiness(p => ({...p, companyName: e.target.value}))} placeholder="Optional"/>
              </Field>
              <Field label="TIN Number">
                <input className={inputCls} value={business.tinNumber} onChange={e => setBusiness(p => ({...p, tinNumber: e.target.value}))} placeholder="Tax ID"/>
              </Field>
            </div>
            <Field label="Business Address">
              <input className={inputCls} value={business.businessAddress} onChange={e => setBusiness(p => ({...p, businessAddress: e.target.value}))} placeholder="KG 123 ST, Kigali"/>
            </Field>
            <Field label="Website">
              <input className={inputCls} value={business.website} onChange={e => setBusiness(p => ({...p, website: e.target.value}))} placeholder="https://"/>
            </Field>
            <Field label="Bio / About">
              <textarea rows={3} className={inputCls} value={business.bio} onChange={e => setBusiness(p => ({...p, bio: e.target.value}))} placeholder="Tell tenants about your properties..."/>
            </Field>
            <button onClick={saveBusiness} disabled={bSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
              <HiSave/> {bSaving ? "Saving..." : "Save Business Profile"}
            </button>
          </div>
        )}
      </Section>

      {/* Password */}
      <Section title="Change Password" icon={HiLockClosed}>
        <div className="space-y-4">
          <Alert type={pwAlert.type} msg={pwAlert.msg}/>
          <PwField label="Current Password"  fKey="currentPassword" showKey="cur"/>
          <PwField label="New Password"      fKey="newPassword"      showKey="nw"/>
          <PwField label="Confirm New Password" fKey="confirm"       showKey="cf"/>
          <button onClick={changePassword} disabled={pwSave || !pass.currentPassword || !pass.newPassword}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-black disabled:opacity-50 transition">
            <HiLockClosed/> {pwSave ? "Changing..." : "Change Password"}
          </button>
        </div>
      </Section>

      {/* Account status info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-black text-amber-800 mb-1">KYC Verification</p>
        <p className="text-xs text-amber-700">To unlock all platform features, ensure your identity is verified by the InzuTrust admin. Contact support if your KYC status is pending.</p>
      </div>
    </div>
  );
}