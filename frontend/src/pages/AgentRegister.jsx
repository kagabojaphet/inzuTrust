// src/pages/AgentRegister.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  HiUser, HiMail, HiBriefcase, HiLocationMarker,
  HiArrowRight, HiArrowLeft, HiCheckCircle, HiShieldCheck,
  HiEye, HiEyeOff, HiCheck,
} from "react-icons/hi";

const API = import.meta.env.VITE_API_URL || "https://inzutrust-api.onrender.com/api";

const STEPS = [
  { id: 1, label: "Personal",      sub: "Your basic contact information" },
  { id: 2, label: "Professional",  sub: "Your experience & agency details" },
  { id: 3, label: "Security",      sub: "Set your password"               },
];

// AgentProfile.specialization is a single ENUM — not an array
const SPECIALIZATIONS = ["residential", "commercial", "land", "all"];
const SPECIALIZATION_LABELS = {
  residential: "Residential",
  commercial:  "Commercial",
  land:        "Land",
  all:         "All Types",
};

// ── Reusable components ───────────────────────────────────────────────────────
const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white placeholder:text-gray-400 transition";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

// ── Step indicators ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const done   = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                done   ? "bg-blue-600 border-blue-600 text-white" :
                active ? "bg-white border-blue-600 text-blue-600" :
                         "bg-white border-gray-200 text-gray-400"
              }`}>
                {done ? <HiCheckCircle className="text-sm"/> : s.id}
              </div>
              <span className={`text-[10px] font-bold hidden sm:block ${active ? "text-blue-600" : done ? "text-gray-600" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mb-4 ${current > s.id ? "bg-blue-600" : "bg-gray-200"}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Personal Info ─────────────────────────────────────────────────────
// Maps to: User.firstName, lastName, email, phone, nationalId
function StepPersonal({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" error={errors.firstName}>
          <input className={inp} placeholder="Claudine"
            value={data.firstName} onChange={e => onChange("firstName", e.target.value)}/>
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <input className={inp} placeholder="Uwase"
            value={data.lastName} onChange={e => onChange("lastName", e.target.value)}/>
        </Field>
      </div>

      <Field label="Professional Email" error={errors.email}>
        <input className={inp} type="email" placeholder="claudine@example.com"
          value={data.email} onChange={e => onChange("email", e.target.value)}/>
      </Field>

      <Field label="Phone Number" error={errors.phone}>
        <PhoneInput
          defaultCountry="rw"
          value={data.phone}
          onChange={phone => onChange("phone", phone)}
          inputStyle={{
            width: "100%", height: "46px", fontSize: "14px",
            border: "1px solid #e5e7eb", borderRadius: "0 12px 12px 0",
            paddingLeft: "12px", backgroundColor: "#fff", outline: "none",
          }}
          countrySelectorStyleProps={{
            buttonStyle: {
              height: "46px", border: "1px solid #e5e7eb", borderRight: "none",
              borderRadius: "12px 0 0 12px", backgroundColor: "#fff",
              paddingLeft: "10px", paddingRight: "8px",
            },
          }}
        />
      </Field>

      {/* → User.nationalId (optional) */}
      <Field label="National ID Number (optional)">
        <input className={inp} placeholder="1 1998 8 0098765 4 32"
          value={data.nationalId} onChange={e => onChange("nationalId", e.target.value)}/>
      </Field>

      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
        🔒 Used for identity verification — never shared publicly.
      </p>
    </div>
  );
}

// ── Step 2: Professional Info ─────────────────────────────────────────────────
// Maps to: AgentProfile.agencyName, licenseNumber, agencyAddress,
//          specialization (single ENUM), yearsExperience, bio
function StepProfessional({ data, onChange, errors }) {
  return (
    <div className="space-y-4">

      {/* → AgentProfile.agencyName */}
      <Field label="Agency / Company Name" error={errors.agencyName}>
        <input className={inp} placeholder="Uwase Real Estate Ltd"
          value={data.agencyName} onChange={e => onChange("agencyName", e.target.value)}/>
      </Field>

      {/* → AgentProfile.licenseNumber (optional) */}
      <Field label="Real Estate License Number (optional)">
        <input className={inp} placeholder="RW-AGENT-2024-007"
          value={data.licenseNumber} onChange={e => onChange("licenseNumber", e.target.value)}/>
      </Field>

      {/* → AgentProfile.agencyAddress */}
      <Field label="Agency Location / Address" error={errors.agencyAddress}>
        <input className={inp} placeholder="KN 3 Ave, Nyarugenge, Kigali"
          value={data.agencyAddress} onChange={e => onChange("agencyAddress", e.target.value)}/>
      </Field>

      {/* → AgentProfile.yearsExperience (integer) */}
      <Field label="Years of Experience">
        <input className={inp} type="number" min="0" placeholder="e.g. 5"
          value={data.yearsExperience}
          onChange={e => onChange("yearsExperience", e.target.value)}/>
      </Field>

      {/* → AgentProfile.specialization (single ENUM: residential|commercial|land|all) */}
      <div>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 block">
          Specialization
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALIZATIONS.map(s => (
            <button key={s} type="button"
              onClick={() => onChange("specialization", s)}
              className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition ${
                data.specialization === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}>
              {SPECIALIZATION_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* → AgentProfile.bio (optional) */}
      <div>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
          Short Bio (optional)
        </label>
        <textarea rows={3} value={data.bio}
          onChange={e => onChange("bio", e.target.value)}
          placeholder="Tell clients about your experience..."
          className={`${inp} resize-none`}/>
      </div>
    </div>
  );
}

// ── Step 3: Security / Password ───────────────────────────────────────────────
// Maps to: User.password
function StepSecurity({ data, onChange, errors }) {
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = (() => {
    const p = data.password || "";
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-black text-blue-800 mb-1">Almost there! 🎉</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          After registration, verify your email then submit your ID and license
          to become a <strong>Verified Agent</strong> on InzuTrust.
        </p>
      </div>

      <Field label="Password" error={errors.password}>
        <div className="relative">
          <input type={showPass ? "text" : "password"} className={`${inp} pr-11`}
            placeholder="Min. 8 characters"
            value={data.password} onChange={e => onChange("password", e.target.value)}/>
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <HiEyeOff/> : <HiEye/>}
          </button>
        </div>
        {data.password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColor : "bg-gray-200"}`}/>
              ))}
            </div>
            <p className={`text-xs font-semibold ${["","text-red-500","text-yellow-600","text-blue-600","text-green-600"][strength]}`}>
              {strengthLabel}
            </p>
          </div>
        )}
      </Field>

      <Field label="Confirm Password" error={errors.confirmPassword}>
        <div className="relative">
          <input type={showConfirm ? "text" : "password"}
            className={`${inp} pr-11 ${
              data.confirmPassword && data.password !== data.confirmPassword
                ? "border-red-300" : ""
            }`}
            placeholder="Repeat your password"
            value={data.confirmPassword} onChange={e => onChange("confirmPassword", e.target.value)}/>
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showConfirm ? <HiEyeOff/> : <HiEye/>}
          </button>
        </div>
      </Field>

      {/* Password rules */}
      <div className="space-y-1.5">
        {[
          { ok: (data.password?.length || 0) >= 8, label: "At least 8 characters" },
          { ok: /[A-Z]/.test(data.password || ""),  label: "One uppercase letter"  },
          { ok: /[0-9]/.test(data.password || ""),  label: "One number"             },
        ].map((r, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs font-medium ${r.ok ? "text-green-600" : "text-gray-400"}`}>
            <HiCheckCircle className={r.ok ? "text-green-500" : "text-gray-300"}/>
            {r.label}
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="mt-0.5 accent-blue-600"
          checked={data.agreedToTerms}
          onChange={e => onChange("agreedToTerms", e.target.checked)}
        />
        <p className="text-xs text-gray-500 leading-relaxed">
          I agree to InzuTrust's{" "}
          <Link to="/terms" className="text-blue-600 font-semibold hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link>.
        </p>
      </label>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgentRegister() {
  const navigate = useNavigate();
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors,   setErrors]   = useState({});

  // Step 1 — User model fields
  const [personal, setPersonal] = useState({
    firstName: "", lastName: "", email: "", phone: "", nationalId: "",
  });

  // Step 2 — AgentProfile fields (passed to registerUser, auto-created)
  const [professional, setProfessional] = useState({
    agencyName: "", licenseNumber: "", agencyAddress: "",
    yearsExperience: "", specialization: "", bio: "",
  });

  // Step 3 — password
  const [security, setSecurity] = useState({
    password: "", confirmPassword: "", agreedToTerms: false,
  });

  const up = (setter) => (key, val) => {
    setApiError(""); setErrors({});
    setter(prev => ({ ...prev, [key]: val }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (step === 1) {
      if (!personal.firstName.trim()) errs.firstName = "Required";
      if (!personal.lastName.trim())  errs.lastName  = "Required";
      if (!/\S+@\S+\.\S+/.test(personal.email)) errs.email = "Valid email required";
      if (!personal.phone.trim())     errs.phone     = "Required";
    }
    if (step === 2) {
      if (!professional.agencyName.trim())    errs.agencyName    = "Required";
      if (!professional.agencyAddress.trim()) errs.agencyAddress = "Required";
    }
    if (step === 3) {
      if ((security.password?.length || 0) < 8) errs.password = "Min. 8 characters";
      if (security.password !== security.confirmPassword) errs.confirmPassword = "Passwords do not match";
      if (!security.agreedToTerms) errs.agreedToTerms = "You must accept the terms";
    }
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (step < 3) { setStep(s => s + 1); return; }

    setLoading(true);
    try {
      // POST /api/users/register — sends exactly what userService.registerUser expects
      const res = await fetch(`${API}/users/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // User fields
          firstName:  personal.firstName.trim(),
          lastName:   personal.lastName.trim(),
          email:      personal.email.trim(),
          phone:      personal.phone.trim(),
          password:   security.password,
          role:       "agent",
          nationalId: personal.nationalId.trim() || undefined,
          // AgentProfile fields (userService creates AgentProfile automatically)
          agencyName:    professional.agencyName.trim()    || undefined,
          licenseNumber: professional.licenseNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Registration failed");

      // If we have a token + profile data, update profile immediately
      const hasProfileData = professional.agencyAddress || professional.yearsExperience
        || professional.specialization || professional.bio;

      if (data.data?.token && hasProfileData) {
        await fetch(`${API}/users/profile`, {
          method:  "PUT",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${data.data.token}`,
          },
          body: JSON.stringify({
            agencyAddress:   professional.agencyAddress.trim()             || undefined,
            yearsExperience: professional.yearsExperience
              ? Number(professional.yearsExperience) : undefined,
            specialization:  professional.specialization                   || undefined,
            bio:             professional.bio.trim()                       || undefined,
          }),
        });
      }

      navigate("/verify-otp", { state: { email: personal.email.trim(), role: "agent" } });

    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left panel ── */}
      <div className="hidden md:flex w-2/5 bg-blue-700 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="absolute border-2 border-white rounded-full"
              style={{ width:`${200+i*80}px`, height:`${200+i*80}px`,
                top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}/>
          ))}
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <HiShieldCheck className="text-white text-xl"/>
          </div>
          <span className="text-white font-black text-xl tracking-wide">InzuTrust</span>
        </div>

        <div className="relative space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <HiCheckCircle/> Verified Agent Network
            </div>
            <h2 className="text-white text-3xl font-black leading-tight">
              Build trust before<br/>the first showing.
            </h2>
            <p className="text-white/70 text-sm mt-3 leading-relaxed">
              Join the premier network of verified real estate professionals in Rwanda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["A","B","C"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white text-[10px] font-black">
                  {l}
                </div>
              ))}
            </div>
            <span className="text-white/80 text-xs font-medium">Join 5,000+ verified agents</span>
          </div>
        </div>

        <div className="relative bg-white/10 border border-white/20 rounded-2xl p-4">
          <HiShieldCheck className="text-white text-2xl mb-2"/>
          <p className="text-white font-black text-sm">Bank-Grade Security</p>
          <p className="text-white/60 text-xs mt-1">
            Your documents are encrypted using AES-256 and stored securely.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <HiShieldCheck className="text-white"/>
            </div>
            <span className="font-black text-gray-900">InzuTrust</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900">
              {step === 1 ? "Create your agent profile" :
               step === 2 ? "Professional details" :
               "Set your password"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{STEPS[step - 1].sub}</p>
          </div>

          <StepIndicator current={step}/>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 font-medium">
              ⚠️ {apiError}
            </div>
          )}
          {errors.agreedToTerms && (
            <p className="text-xs text-red-500 font-medium mb-3">{errors.agreedToTerms}</p>
          )}

          {step === 1 && <StepPersonal     data={personal}     onChange={up(setPersonal)}     errors={errors}/>}
          {step === 2 && <StepProfessional data={professional} onChange={up(setProfessional)} errors={errors}/>}
          {step === 3 && <StepSecurity     data={security}     onChange={up(setSecurity)}     errors={errors}/>}

          <div className="flex items-center justify-between mt-8 gap-4">
            {step > 1 ? (
              <button onClick={() => { setErrors({}); setStep(s => s - 1); }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <HiArrowLeft/> Back
              </button>
            ) : (
              <Link to="/login" className="text-sm text-gray-500 font-semibold hover:text-blue-600 transition">
                Sign in instead
              </Link>
            )}
            <button onClick={handleNext} disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <>
                  {step === 3 ? "Create Account" : `Continue to Step ${step + 1}`}
                  <HiArrowRight/>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}