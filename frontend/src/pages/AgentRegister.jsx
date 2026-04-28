// src/pages/AgentRegister.jsx
// 3-step agent self-registration (Personal Info → Professional → Verification)
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HiUser, HiMail, HiPhone, HiBriefcase, HiLocationMarker,
  HiArrowRight, HiCheckCircle, HiShieldCheck,
} from "react-icons/hi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STEPS = [
  { id: 1, label: "Personal Info",   sub: "Your basic contact information" },
  { id: 2, label: "Professional",    sub: "Your experience & specialties"  },
  { id: 3, label: "Verification",    sub: "Set up your account"             },
];

const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white placeholder:text-gray-400 transition";

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

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"/>}
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default function AgentRegister() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState({
    // Step 1
    firstName: "", lastName: "", email: "", phone: "",
    // Step 2
    agencyName: "", licenseNumber: "", location: "", bio: "",
    specialties: [],
    // Step 3
    password: "", confirmPassword: "",
  });

  const up = (k, v) => { setError(""); setForm(f => ({...f, [k]: v})); };

  const SPECIALTIES = ["Residential","Commercial","Rental","Luxury","Land","New Builds"];

  const toggleSpec = (s) =>
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter(x => x !== s)
        : [...f.specialties, s],
    }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (step === 1) {
      if (!form.firstName.trim()) return "First name is required.";
      if (!form.lastName.trim())  return "Last name is required.";
      if (!form.email.includes("@")) return "Valid email is required.";
      if (!form.phone.trim()) return "Phone number is required.";
    }
    if (step === 2) {
      if (!form.agencyName.trim()) return "Agency or company name is required.";
      if (!form.location.trim())   return "Location is required.";
    }
    if (step === 3) {
      if (form.password.length < 8) return "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleNext = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (step < 3) { setStep(s => s + 1); return; }

    // Submit registration
    setLoading(true);
    try {
      const res  = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          firstName:   form.firstName,
          lastName:    form.lastName,
          email:       form.email,
          phone:       form.phone,
          password:    form.password,
          role:        "agent",
          agencyName:  form.agencyName,
          licenseNumber: form.licenseNumber,
          location:    form.location,
          bio:         form.bio,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Registration failed");
      // Redirect to verify OTP
      navigate("/verify-otp", { state: { email: form.email, role:"agent" } });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left panel (blue) ── */}
      <div className="hidden md:flex w-2/5 bg-blue-700 flex-col justify-between p-10 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({length:8}).map((_,i) => (
            <div key={i} className="absolute border-2 border-white rounded-full"
              style={{ width:`${200+i*80}px`, height:`${200+i*80}px`, top:"50%", left:"50%",
                transform:"translate(-50%,-50%)" }}/>
          ))}
        </div>

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <HiShieldCheck className="text-white text-xl"/>
            </div>
            <span className="text-white font-black text-xl tracking-wide">InzuTrust</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <HiCheckCircle/> Verified Agent Network
            </div>
            <h2 className="text-white text-3xl font-black leading-tight">
              Build trust before<br/>the first showing.
            </h2>
            <p className="text-white/70 text-sm mt-3 leading-relaxed">
              Join the premier network of verified real estate professionals.
              Elevate your profile, close deals with confidence, and stand out in a competitive market.
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["A","B","C"].map((l,i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white text-[10px] font-black">
                  {l}
                </div>
              ))}
            </div>
            <span className="text-white/80 text-xs font-medium">Join 5,000+ verified agents</span>
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
            <HiShieldCheck className="text-white text-2xl mb-2"/>
            <p className="text-white font-black text-sm">Bank-Grade Security</p>
            <p className="text-white/60 text-xs mt-1">Your documents are encrypted using AES-256 and stored securely.</p>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
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
            <p className="text-sm text-gray-500 mt-1">{STEPS[step-1].sub}</p>
          </div>

          <StepIndicator current={step}/>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" icon={HiUser}>
                  <input className={`${inp} pl-10`} placeholder="David" value={form.firstName}
                    onChange={e => up("firstName", e.target.value)}/>
                </Field>
                <Field label="Last Name">
                  <input className={inp} placeholder="Browse" value={form.lastName}
                    onChange={e => up("lastName", e.target.value)}/>
                </Field>
              </div>
              <Field label="Professional Email Address" icon={HiMail}>
                <input className={`${inp} pl-10`} type="email" placeholder="david123@gmail.com"
                  value={form.email} onChange={e => up("email", e.target.value)}/>
              </Field>
              <Field label="Direct Phone Number" icon={HiPhone}>
                <input className={`${inp} pl-10`} placeholder="+250 788 757 068"
                  value={form.phone} onChange={e => up("phone", e.target.value)}/>
              </Field>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                🔒 This will be used for two-factor authentication.
              </p>
            </div>
          )}

          {/* ── Step 2: Professional ── */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Agency / Company Name" icon={HiBriefcase}>
                <input className={`${inp} pl-10`} placeholder="Rwanda Realty Ltd"
                  value={form.agencyName} onChange={e => up("agencyName", e.target.value)}/>
              </Field>
              <Field label="Real Estate License Number (optional)">
                <input className={inp} placeholder="RW-LIC-2024-XXXX"
                  value={form.licenseNumber} onChange={e => up("licenseNumber", e.target.value)}/>
              </Field>
              <Field label="Primary Location" icon={HiLocationMarker}>
                <input className={`${inp} pl-10`} placeholder="Kigali, Rwanda"
                  value={form.location} onChange={e => up("location", e.target.value)}/>
              </Field>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 block">
                  Specialties (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSpec(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        form.specialties.includes(s)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Short Bio (optional)
                </label>
                <textarea value={form.bio} onChange={e => up("bio", e.target.value)} rows={3}
                  placeholder="Tell clients about your experience and what makes you unique..."
                  className={`${inp} resize-none`}/>
              </div>
            </div>
          )}

          {/* ── Step 3: Password ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-black text-blue-800 mb-1">Almost there! 🎉</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  After registration, verify your email, then submit your ID and license
                  to become a <strong>Verified Agent</strong>.
                </p>
              </div>
              <Field label="Password">
                <input type="password" className={inp} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => up("password", e.target.value)}/>
              </Field>
              <Field label="Confirm Password">
                <input type="password" className={inp} placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={e => up("confirmPassword", e.target.value)}/>
              </Field>
              <div className="space-y-2">
                {[
                  { ok: form.password.length >= 8, label: "At least 8 characters" },
                  { ok: /[A-Z]/.test(form.password), label: "One uppercase letter" },
                  { ok: /[0-9]/.test(form.password), label: "One number" },
                ].map((r,i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs font-medium ${r.ok ? "text-green-600" : "text-gray-400"}`}>
                    <HiCheckCircle className={r.ok ? "text-green-500" : "text-gray-300"}/>
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 gap-4">
            {step > 1 ? (
              <button onClick={() => { setError(""); setStep(s => s-1); }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition">
                Back
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