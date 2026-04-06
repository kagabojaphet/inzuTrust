// src/components/agent/AgentSettings.jsx
// Agent profile + password settings (reuses same API endpoints as landlord)
import { useState, useEffect } from "react";
import { HiUser, HiLockClosed, HiSave, HiCheckCircle, HiExclamationCircle, HiEye, HiEyeOff } from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });

function Alert({ type, msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
      type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
    }`}>
      {type === "success" ? <HiCheckCircle className="shrink-0"/> : <HiExclamationCircle className="shrink-0"/>}
      {msg}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition";

export default function AgentSettings({ token }) {
  const [loading,  setLoading]  = useState(true);
  const [personal, setPersonal] = useState({ firstName:"", lastName:"", phone:"", email:"" });
  const [pSaving,  setPSaving]  = useState(false);
  const [pAlert,   setPAlert]   = useState({ type:"", msg:"" });

  const [pass,    setPass]    = useState({ currentPassword:"", newPassword:"", confirm:"" });
  const [showPw,  setShowPw]  = useState({ cur:false, nw:false, cf:false });
  const [pwSave,  setPwSave]  = useState(false);
  const [pwAlert, setPwAlert] = useState({ type:"", msg:"" });

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/users/profile`, { headers: hdrs(token) })
      .then(r => r.json())
      .then(d => {
        if (d.success) setPersonal({
          firstName: d.data.firstName || "",
          lastName:  d.data.lastName  || "",
          phone:     d.data.phone     || "",
          email:     d.data.email     || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const savePersonal = async () => {
    setPSaving(true); setPAlert({ type:"", msg:"" });
    try {
      const r = await fetch(`${API}/users/profile`, {
        method: "PUT", headers: hdrs(token),
        body: JSON.stringify({ firstName: personal.firstName, lastName: personal.lastName, phone: personal.phone }),
      });
      const d = await r.json();
      setPAlert({ type: d.success ? "success" : "error", msg: d.success ? "Profile saved successfully." : d.message });
    } catch { setPAlert({ type:"error", msg:"Network error." }); }
    finally { setPSaving(false); }
  };

  const changePassword = async () => {
    if (pass.newPassword !== pass.confirm) { setPwAlert({ type:"error", msg:"Passwords do not match." }); return; }
    if (pass.newPassword.length < 8) { setPwAlert({ type:"error", msg:"Password must be at least 8 characters." }); return; }
    setPwSave(true); setPwAlert({ type:"", msg:"" });
    try {
      const r = await fetch(`${API}/users/change-password`, {
        method: "PUT", headers: hdrs(token),
        body: JSON.stringify({ currentPassword: pass.currentPassword, newPassword: pass.newPassword }),
      });
      const d = await r.json();
      if (d.success) { setPwAlert({ type:"success", msg:"Password changed." }); setPass({ currentPassword:"", newPassword:"", confirm:"" }); }
      else setPwAlert({ type:"error", msg: d.message });
    } catch { setPwAlert({ type:"error", msg:"Network error." }); }
    finally { setPwSave(false); }
  };

  const PwField = ({ label, fKey, sk }) => (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <input type={showPw[sk] ? "text" : "password"} value={pass[fKey]}
          onChange={e => setPass(p => ({ ...p, [fKey]: e.target.value }))}
          className={`${inputCls} pr-12`}/>
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [sk]: !p[sk] }))}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPw[sk] ? <HiEyeOff/> : <HiEye/>}
        </button>
      </div>
    </div>
  );

  const avatar = `https://ui-avatars.com/api/?name=${personal.firstName||"A"}+${personal.lastName||"G"}&background=dbeafe&color=2563eb&bold=true&size=96`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your agent profile and account security.</p>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <HiUser className="text-blue-600 text-sm"/>
          </div>
          <h3 className="font-black text-gray-900 text-sm">Personal Information</h3>
        </div>
        <div className="p-6 space-y-4">
          {loading ? (
            Array.from({length:4}).map((_,i) => (
              <div key={i}><Skeleton width={80} height={10} borderRadius={4}/><Skeleton height={44} borderRadius={12} className="mt-1.5"/></div>
            ))
          ) : (
            <>
              <Alert type={pAlert.type} msg={pAlert.msg}/>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <img src={avatar} alt="" className="w-16 h-16 rounded-2xl border border-gray-200"/>
                <div>
                  <p className="font-black text-gray-900 text-sm">{personal.firstName} {personal.lastName}</p>
                  <p className="text-xs text-gray-400">{personal.email}</p>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">Agent</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">First Name</label>
                  <input className={inputCls} value={personal.firstName} onChange={e => setPersonal(p => ({...p, firstName:e.target.value}))}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">Last Name</label>
                  <input className={inputCls} value={personal.lastName} onChange={e => setPersonal(p => ({...p, lastName:e.target.value}))}/>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <input className={`${inputCls} opacity-60 cursor-not-allowed`} value={personal.email} disabled/>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                <input className={inputCls} value={personal.phone} onChange={e => setPersonal(p => ({...p, phone:e.target.value}))} placeholder="+250 7XX XXX XXX"/>
              </div>
              <button onClick={savePersonal} disabled={pSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
                <HiSave/> {pSaving ? "Saving..." : "Save Profile"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <HiLockClosed className="text-blue-600 text-sm"/>
          </div>
          <h3 className="font-black text-gray-900 text-sm">Change Password</h3>
        </div>
        <div className="p-6 space-y-4">
          <Alert type={pwAlert.type} msg={pwAlert.msg}/>
          <PwField label="Current Password"     fKey="currentPassword" sk="cur"/>
          <PwField label="New Password"          fKey="newPassword"     sk="nw"/>
          <PwField label="Confirm New Password"  fKey="confirm"         sk="cf"/>
          <button onClick={changePassword} disabled={pwSave || !pass.currentPassword || !pass.newPassword}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-black disabled:opacity-50 transition">
            <HiLockClosed/> {pwSave ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-black text-amber-800 mb-1">Your Account</p>
        <p className="text-xs text-amber-700">Your account was created by your landlord. For property-related changes, contact them directly through the Messages tab.</p>
      </div>
    </div>
  );
}