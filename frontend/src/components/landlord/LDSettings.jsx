// src/components/landlord/LDSettings.jsx
import { useState, useEffect, useCallback } from "react";
import {
  HiUser, HiOfficeBuilding, HiLockClosed, HiSave,
  HiEye, HiEyeOff, HiCheckCircle, HiExclamationCircle,
  HiCamera, HiShieldCheck, HiClock, HiBadgeCheck,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const API  = import.meta.env.VITE_API_URL || "https://inzutrust-api.onrender.com/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });

// ── Reusable UI pieces (unchanged) ────────────────────────────────────────────
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

// ── Badge metadata ────────────────────────────────────────────────────────────
const BADGE_META = {
  verified_landlord:   { label: "Verified Landlord",  color: "bg-blue-50 text-blue-700 border-blue-200"       },
  top_landlord:        { label: "Top Landlord",        color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  responsive_landlord: { label: "Responsive",          color: "bg-green-50 text-green-700 border-green-200"    },
  long_term_host:      { label: "Long-Term Host",      color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  dispute_free:        { label: "Dispute-Free",        color: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  verified_agent:      { label: "Verified Agent",      color: "bg-blue-50 text-blue-700 border-blue-200"       },
  top_agent:           { label: "Top Agent",           color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  trusted_agent:       { label: "Trusted Agent",       color: "bg-green-50 text-green-700 border-green-200"    },
  experienced_agent:   { label: "Experienced Agent",   color: "bg-purple-50 text-purple-700 border-purple-200" },
};

function BadgePill({ badge }) {
  const meta = BADGE_META[badge] || { label: badge, color: "bg-gray-50 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${meta.color}`}>
      <HiCheckCircle className="text-xs shrink-0"/> {meta.label}
    </span>
  );
}

// ── Platform Agreement terms ──────────────────────────────────────────────────
const REQUIRED_TERMS = [
  "accurateInformation", "ownershipOrAuthorization", "noFraudOrMisleadingListings",
  "verificationConsent", "platformPolicies", "feesAndCommission",
  "policyEnforcement", "platformRole",
];

const TERM_LABELS = [
  ["Accurate Information",           "I confirm the property information is accurate and authentic."],
  ["Ownership or Authorization",     "I confirm I am the owner or authorized to manage this property."],
  ["No Fraud or Misleading Listings","I agree not to upload misleading, duplicate, or fraudulent listings."],
  ["Verification Consent",           "I understand InzuTrust may verify my identity and property information."],
  ["Platform Policies",              "I agree to follow InzuTrust platform policies and community guidelines."],
  ["Fees & Commission",              "I agree to the applicable platform service or commission fees."],
  ["Policy Enforcement",             "I understand violations may result in listing suspension or account restriction."],
  ["Platform Role",                  "I understand InzuTrust is a digital rental facilitation platform, not a property owner."],
];

// ── NEW: Platform Agreement Panel ─────────────────────────────────────────────
function PlatformAgreementPanel({ token }) {
  const [status,  setStatus]  = useState(null);   // null = loading
  const [open,    setOpen]    = useState(false);
  const [sig,     setSig]     = useState("");
  const [signing, setSigning] = useState(false);
  const [err,     setErr]     = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/platform-agreement/status`, { headers: hdrs(token) });
      const d = await r.json();
      if (d.success) setStatus(d.data);
    } catch { /* non-fatal */ }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleSign = async () => {
    if (!sig.trim()) { setErr("Please type your full name as your digital signature."); return; }
    setSigning(true); setErr("");
    try {
      const r = await fetch(`${API}/platform-agreement/sign`, {
        method: "POST", headers: hdrs(token),
        body: JSON.stringify({ acceptedTerms: REQUIRED_TERMS, userSignature: sig.trim() }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message || "Signing failed");
      setOpen(false); setSig(""); await load();
    } catch (e) { setErr(e.message); }
    finally { setSigning(false); }
  };

  if (!status) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <Skeleton width={200} height={14} borderRadius={6} className="mb-3"/>
        <Skeleton height={44} borderRadius={12}/>
      </div>
    );
  }

  const isSigned  = status.hasSigned && status.status === "active";
  const isPending = status.hasSigned && status.status === "pending";
  const isUnsigned = !status.hasSigned;

  return (
    <Section title="InzuTrust Platform Agreement" icon={HiShieldCheck}>
      <div className="space-y-4">
        {/* Status badge */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
            Required before you can publish properties or access all platform features.
          </p>
          {isSigned && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <HiCheckCircle/> Active
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <HiClock/> Awaiting Admin Approval
            </span>
          )}
          {isUnsigned && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              <HiExclamationCircle/> Not Signed
            </span>
          )}
        </div>

        {/* Signed info */}
        {isSigned && (
          <div className="bg-green-50 rounded-xl p-4 text-xs text-green-700 border border-green-200">
            ✅ Signed on{" "}
            {new Date(status.signedAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}.
            Your agreement has been countersigned by InzuTrust.
          </div>
        )}

        {/* Pending info */}
        {isPending && (
          <div className="bg-amber-50 rounded-xl p-4 text-xs text-amber-700 border border-amber-200">
            ⏳ You signed this agreement on{" "}
            {new Date(status.signedAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}.
            An InzuTrust admin will countersign within 24 hours.
          </div>
        )}

        {/* Sign flow */}
        {isUnsigned && (
          <>
            {!open ? (
              <button
                onClick={() => setOpen(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <HiShieldCheck/> Review & Sign Agreement
              </button>
            ) : (
              <div className="space-y-4">
                {/* Terms list */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 max-h-52 overflow-y-auto p-4 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    InzuTrust Listing Agreement — v1.0
                  </p>
                  {TERM_LABELS.map(([title, desc]) => (
                    <div key={title} className="flex items-start gap-2 pb-2 border-b border-gray-100 last:border-0">
                      <HiCheckCircle className="text-blue-500 shrink-0 mt-0.5 text-sm"/>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Field label="Digital Signature — type your full name">
                  <input
                    value={sig}
                    onChange={e => { setSig(e.target.value); setErr(""); }}
                    placeholder="e.g. Jean Habimana"
                    className={inputCls}
                  />
                </Field>

                {err && <p className="text-xs text-red-600 font-bold bg-red-50 px-3 py-2 rounded-xl border border-red-200">{err}</p>}

                <div className="flex gap-3">
                  <button onClick={() => { setOpen(false); setErr(""); setSig(""); }}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={signing || !sig.trim()}
                    className="flex-1 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                    {signing
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      : <HiShieldCheck/>}
                    Accept & Sign
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}

// ── NEW: Profile Completion + Badges Panel ─────────────────────────────────────
function ProfileCompletionPanel({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/users/profile`, { headers: hdrs(token) })
      .then(r => r.json())
      .then(d => {
        if (d.success) setData({
          percentage: d.data?.profileCompletion ?? 0,
          badges:     d.data?.badges            ?? [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <Skeleton width={160} height={14} borderRadius={6} className="mb-4"/>
        <Skeleton height={10} borderRadius={6} className="mb-3"/>
        <div className="flex gap-2 mt-2">
          <Skeleton width={90} height={30} borderRadius={20}/>
          <Skeleton width={90} height={30} borderRadius={20}/>
        </div>
      </div>
    );
  }

  const pct    = data?.percentage ?? 0;
  const badges = data?.badges     ?? [];

  const barColor =
    pct >= 80 ? "bg-green-500" :
    pct >= 50 ? "bg-blue-500"  :
    "bg-amber-400";

  return (
    <Section title="Profile Completion & Badges" icon={HiBadgeCheck}>
      <div className="space-y-5">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">
              {pct < 100
                ? "Complete your profile to unlock all features and earn badges."
                : "Your profile is complete!"}
            </p>
            <span className={`text-sm font-black ${
              pct >= 80 ? "text-green-600" : pct >= 50 ? "text-blue-600" : "text-amber-600"
            }`}>{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Earned Badges</p>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map(b => <BadgePill key={b} badge={b}/>)}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-semibold">No badges earned yet.</p>
              <p className="text-[11px] text-gray-300 mt-1">
                Get KYC verified and sign the platform agreement to earn your first badge.
              </p>
            </div>
          )}
        </div>

        {/* KYC note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-black text-amber-800 mb-1">KYC Verification</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            To unlock all platform features and earn the <strong>Verified Landlord</strong> badge,
            ensure your identity is verified by an InzuTrust admin. Contact support if your KYC status is pending.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── Main LDSettings (all existing sections preserved exactly) ─────────────────
export default function LDSettings({ token, user: propUser }) {
  const [loading, setLoading] = useState(true);

  // ── Personal ──────────────────────────────────────────────────────────────
  const [personal, setPersonal] = useState({ firstName:"", lastName:"", phone:"", email:"" });
  const [pSaving,  setPSaving]  = useState(false);
  const [pAlert,   setPAlert]   = useState({ type:"", msg:"" });

  // ── Business ──────────────────────────────────────────────────────────────
  const [business, setBusiness] = useState({ companyName:"", tinNumber:"", businessAddress:"", website:"", bio:"" });
  const [bSaving,  setBSaving]  = useState(false);
  const [bAlert,   setBAlert]   = useState({ type:"", msg:"" });

  // ── Password ──────────────────────────────────────────────────────────────
  const [pass,    setPass]    = useState({ currentPassword:"", newPassword:"", confirm:"" });
  const [showPw,  setShowPw]  = useState({ cur:false, nw:false, cf:false });
  const [pwSave,  setPwSave]  = useState(false);
  const [pwAlert, setPwAlert] = useState({ type:"", msg:"" });

  // ── Fetch profile on mount (unchanged) ────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/users/profile`, { headers: hdrs(token) })
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const u  = d.data;
        const lp = u.landlordProfile || {};
        setPersonal({ firstName:u.firstName||"", lastName:u.lastName||"", phone:u.phone||"", email:u.email||"" });
        setBusiness({ companyName:lp.companyName||"", tinNumber:lp.tinNumber||"", businessAddress:lp.businessAddress||"", website:lp.website||"", bio:lp.bio||"" });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  // ── Save personal (unchanged — uses PUT /users/profile) ───────────────────
  const savePersonal = async () => {
    setPSaving(true); setPAlert({ type:"", msg:"" });
    try {
      const r = await fetch(`${API}/users/profile`, {
        method:"PUT", headers:hdrs(token),
        body: JSON.stringify({ firstName:personal.firstName, lastName:personal.lastName, phone:personal.phone }),
      });
      const d = await r.json();
      setPAlert({ type:d.success?"success":"error", msg:d.success?"Personal info saved successfully.":d.message });
    } catch { setPAlert({ type:"error", msg:"Network error." }); }
    finally { setPSaving(false); }
  };

  // ── Save business — FIXED: uses PUT /users/profile (not POST /landlords/profile) ──
  const saveBusiness = async () => {
    setBSaving(true); setBAlert({ type:"", msg:"" });
    try {
      const r = await fetch(`${API}/users/profile`, {
        method:"PUT", headers:hdrs(token),
        body: JSON.stringify(business),
      });
      const d = await r.json();
      setBAlert({ type:d.success?"success":"error", msg:d.success?"Business profile saved successfully.":d.message });
    } catch { setBAlert({ type:"error", msg:"Network error." }); }
    finally { setBSaving(false); }
  };

  // ── Change password (unchanged) ───────────────────────────────────────────
  const changePassword = async () => {
    if (pass.newPassword !== pass.confirm) { setPwAlert({ type:"error", msg:"New passwords do not match." }); return; }
    if (pass.newPassword.length < 8)       { setPwAlert({ type:"error", msg:"Password must be at least 8 characters." }); return; }
    setPwSave(true); setPwAlert({ type:"", msg:"" });
    try {
      const r = await fetch(`${API}/users/change-password`, {
        method:"PUT", headers:hdrs(token),
        body: JSON.stringify({ currentPassword:pass.currentPassword, newPassword:pass.newPassword }),
      });
      const d = await r.json();
      if (d.success) {
        setPwAlert({ type:"success", msg:"Password changed successfully." });
        setPass({ currentPassword:"", newPassword:"", confirm:"" });
      } else {
        setPwAlert({ type:"error", msg:d.message||"Failed to change password." });
      }
    } catch { setPwAlert({ type:"error", msg:"Network error." }); }
    finally { setPwSave(false); }
  };

  const PwField = ({ label, fKey, showKey }) => (
    <Field label={label}>
      <div className="relative">
        <input type={showPw[showKey]?"text":"password"} value={pass[fKey]}
          onChange={e => setPass(p => ({...p,[fKey]:e.target.value}))}
          className={`${inputCls} pr-12`}/>
        <button type="button" onClick={() => setShowPw(p => ({...p,[showKey]:!p[showKey]}))}
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
        <p className="text-sm text-gray-500 mt-1">Manage your account, agreements and business profile.</p>
      </div>

      {/* ── NEW: Profile Completion + Badges ── */}
      <ProfileCompletionPanel token={token}/>

      {/* ── NEW: Platform Agreement ── */}
      <PlatformAgreementPanel token={token}/>

      {/* ── EXISTING: Personal Info (unchanged) ── */}
      <Section title="Personal Information" icon={HiUser}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({length:4}).map((_,i) => (
              <div key={i}>
                <Skeleton width={80} height={10} borderRadius={4}/>
                <Skeleton height={44} borderRadius={12} className="mt-1.5"/>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
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
                <input className={inputCls} value={personal.firstName} onChange={e => setPersonal(p => ({...p, firstName:e.target.value}))}/>
              </Field>
              <Field label="Last Name">
                <input className={inputCls} value={personal.lastName}  onChange={e => setPersonal(p => ({...p, lastName:e.target.value}))}/>
              </Field>
            </div>
            <Field label="Email Address">
              <input className={`${inputCls} cursor-not-allowed opacity-60`} value={personal.email} disabled title="Email cannot be changed"/>
            </Field>
            <Field label="Phone Number">
              <input className={inputCls} value={personal.phone} onChange={e => setPersonal(p => ({...p, phone:e.target.value}))} placeholder="+250 7XX XXX XXX"/>
            </Field>
            <button onClick={savePersonal} disabled={pSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
              <HiSave/> {pSaving ? "Saving..." : "Save Personal Info"}
            </button>
          </div>
        )}
      </Section>

      {/* ── EXISTING: Business Profile (fixed endpoint) ── */}
      <Section title="Business Profile" icon={HiOfficeBuilding}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({length:5}).map((_,i) => (
              <div key={i}>
                <Skeleton width={80} height={10} borderRadius={4}/>
                <Skeleton height={44} borderRadius={12} className="mt-1.5"/>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert type={bAlert.type} msg={bAlert.msg}/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name">
                <input className={inputCls} value={business.companyName} onChange={e => setBusiness(p => ({...p,companyName:e.target.value}))} placeholder="Optional"/>
              </Field>
              <Field label="TIN Number">
                <input className={inputCls} value={business.tinNumber}   onChange={e => setBusiness(p => ({...p,tinNumber:e.target.value}))}   placeholder="Tax ID"/>
              </Field>
            </div>
            <Field label="Business Address">
              <input className={inputCls} value={business.businessAddress} onChange={e => setBusiness(p => ({...p,businessAddress:e.target.value}))} placeholder="KG 123 ST, Kigali"/>
            </Field>
            <Field label="Website">
              <input className={inputCls} value={business.website} onChange={e => setBusiness(p => ({...p,website:e.target.value}))} placeholder="https://"/>
            </Field>
            <Field label="Bio / About">
              <textarea rows={3} className={inputCls} value={business.bio} onChange={e => setBusiness(p => ({...p,bio:e.target.value}))} placeholder="Tell tenants about your properties..."/>
            </Field>
            <button onClick={saveBusiness} disabled={bSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
              <HiSave/> {bSaving ? "Saving..." : "Save Business Profile"}
            </button>
          </div>
        )}
      </Section>

      {/* ── EXISTING: Password (unchanged) ── */}
      <Section title="Change Password" icon={HiLockClosed}>
        <div className="space-y-4">
          <Alert type={pwAlert.type} msg={pwAlert.msg}/>
          <PwField label="Current Password"      fKey="currentPassword" showKey="cur"/>
          <PwField label="New Password"          fKey="newPassword"     showKey="nw"/>
          <PwField label="Confirm New Password"  fKey="confirm"         showKey="cf"/>
          <button onClick={changePassword} disabled={pwSave || !pass.currentPassword || !pass.newPassword}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-black disabled:opacity-50 transition">
            <HiLockClosed/> {pwSave ? "Changing..." : "Change Password"}
          </button>
        </div>
      </Section>

    </div>
  );
}