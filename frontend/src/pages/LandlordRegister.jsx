import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  HiShieldCheck, HiChartBar, HiDocumentText,
  HiArrowRight, HiArrowLeft, HiLockClosed, HiEye, HiEyeOff,
  HiCheckCircle, HiHome, HiOfficeBuilding, HiLocationMarker,
  HiUpload, HiCheck
} from "react-icons/hi";

// ── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "PERSONAL",  sublabel: "Personal"  },
  { id: 2, label: "PORTFOLIO", sublabel: "Portfolio" },
  { id: 3, label: "SECURITY",  sublabel: "Security"  },
];

// ── Left panel benefits ──────────────────────────────────────────────────────
const benefits = [
  {
    icon: <HiShieldCheck className="text-green-600 text-xl" />,
    bg: "bg-green-50",
    title: "Secure Rent Collection",
    desc: "Automated payouts directly to your business account.",
  },
  {
    icon: <HiChartBar className="text-blue-600 text-xl" />,
    bg: "bg-blue-50",
    title: "Real-time Dashboard",
    desc: "Track occupancy, late payments, and financial health.",
  },
  {
    icon: <HiDocumentText className="text-gray-600 text-xl" />,
    bg: "bg-gray-100",
    title: "Compliance Ready",
    desc: "Automatic generation of tax reports and legal forms.",
  },
];

const propertyTypes = ["Apartment", "House", "Villa", "Commercial", "Studio", "Mixed Use"];
const rwandaDistricts = ["Kigali", "Gasabo", "Kicukiro", "Nyarugenge", "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Rwamagana"];

// ── Input component ──────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white"
    />
  );
}

function Select({ options, ...props }) {
  return (
    <select
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white appearance-none"
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}


// ── Step 1: Personal ─────────────────────────────────────────────────────────
function StepPersonal({ data, onChange }) {
  return (
    <div>
      <h2 className="text-3xl font-black text-gray-900 mb-2 text-left">Create your account</h2>
      <p className="text-gray-500 text-sm mb-8 text-left">Let's start with some basic information about you and your business.</p>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Full Name">
          <Input placeholder="Uwizeyimana Yvette" value={data.fullName} onChange={e => onChange("fullName", e.target.value)} />
        </Field>
        <Field label="Email Address">
          <Input type="email" placeholder="yvette1@gmail.com" value={data.email} onChange={e => onChange("email", e.target.value)} />
        </Field>
        <Field label="Phone Number">
          <div className="phone-input-wrapper">
            <PhoneInput
              defaultCountry="rw"
              value={data.phone}
              onChange={(phone) => onChange("phone", phone)}
              inputStyle={{
                width: "100%",
                height: "46px",
                fontSize: "14px",
                border: "1px solid #e5e7eb",
                borderRadius: "0 12px 12px 0",
                paddingLeft: "12px",
                backgroundColor: "#fff",
                outline: "none",
              }}
              countrySelectorStyleProps={{
                buttonStyle: {
                  height: "46px",
                  border: "1px solid #e5e7eb",
                  borderRight: "none",
                  borderRadius: "12px 0 0 12px",
                  backgroundColor: "#fff",
                  paddingLeft: "10px",
                  paddingRight: "8px",
                },
              }}
            />
          </div>
        </Field>
        <Field label="Company Name (Optional)">
          <Input placeholder="Hallmark Residences" value={data.company} onChange={e => onChange("company", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

// ── Step 2: Portfolio ────────────────────────────────────────────────────────
function StepPortfolio({ data, onChange }) {
  const [selectedTypes, setSelectedTypes] = useState(data.propertyTypes || []);

  const toggleType = (type) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    onChange("propertyTypes", updated);
  };

  return (
    <div>
      <h2 className="text-3xl font-black text-gray-900 mb-2 text-left">Your Property Portfolio</h2>
      <p className="text-gray-500 text-sm mb-8 text-left">Tell us about the properties you manage.</p>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Number of Properties">
            <Input type="number" placeholder="e.g. 5" min="1" value={data.propertyCount} onChange={e => onChange("propertyCount", e.target.value)} />
          </Field>
          <Field label="Primary Location">
            <Select options={rwandaDistricts} value={data.location} onChange={e => onChange("location", e.target.value)} />
          </Field>
        </div>
        <Field label="Property Types (select all that apply)">
          <div className="grid grid-cols-3 gap-2 mt-1">
            {propertyTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                  selectedTypes.includes(type)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <HiHome className="text-sm shrink-0" />
                {type}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Average Monthly Rent (RWF)">
            <Input type="number" placeholder="e.g. 250,000" value={data.avgRent} onChange={e => onChange("avgRent", e.target.value)} />
          </Field>
          <Field label="Years Managing Properties">
            <Input type="number" placeholder="e.g. 3" min="0" value={data.yearsExp} onChange={e => onChange("yearsExp", e.target.value)} />
          </Field>
        </div>
        <Field label="Business Registration Number (Optional)">
          <Input placeholder="e.g. RDB-2023-XXXXX" value={data.regNumber} onChange={e => onChange("regNumber", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

// ── Step 3: Security ─────────────────────────────────────────────────────────
function StepSecurity({ data, onChange }) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [twoFA, setTwoFA] = useState(data.twoFA || false);

  const strength = (() => {
    const p = data.password || "";
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  return (
    <div>
      <h2 className="text-3xl font-black text-gray-900 mb-2 text-left">Secure your account</h2>
      <p className="text-gray-500 text-sm mb-8 text-left">Set a strong password and verify your identity.</p>
      <div className="space-y-5">
        {/* Password */}
        <Field label="Password">
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Create a strong password"
              value={data.password || ""}
              onChange={e => onChange("password", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>
          {data.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                ))}
              </div>
              <p className={`text-xs font-semibold ${["","text-red-500","text-yellow-600","text-blue-600","text-green-600"][strength]}`}>
                {strengthLabel}
              </p>
            </div>
          )}
        </Field>

        {/* Confirm Password */}
        <Field label="Confirm Password">
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={data.confirmPassword || ""}
              onChange={e => onChange("confirmPassword", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 transition bg-white ${
                data.confirmPassword && data.password !== data.confirmPassword
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirm ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>
          {data.confirmPassword && data.password !== data.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </Field>

        {/* ID Upload */}
        <Field label="National ID / Passport">
          <div
            onClick={() => setIdUploaded(true)}
            className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition ${
              idUploaded ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            {idUploaded ? (
              <div className="flex flex-col items-center gap-1">
                <HiCheckCircle className="text-green-500 text-2xl" />
                <p className="text-sm font-bold text-green-700">Document uploaded</p>
                <p className="text-xs text-green-500">Click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <HiUpload className="text-gray-400 text-2xl" />
                <p className="text-sm font-semibold text-gray-600">Click to upload your ID</p>
                <p className="text-xs text-gray-400">PNG, JPG or PDF · Max 5MB</p>
              </div>
            )}
          </div>
        </Field>

        {/* 2FA Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <HiShieldCheck className="text-blue-600 text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-400">Add an extra layer of security</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setTwoFA(!twoFA); onChange("twoFA", !twoFA); }}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${twoFA ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" className="mt-0.5 accent-blue-600" />
          <p className="text-xs text-gray-500 leading-relaxed">
            I agree to InzuTrust's{" "}
            <a href="#" className="text-blue-600 font-semibold hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>.
            My account will be reviewed within 24 hours.
          </p>
        </label>
      </div>
    </div>
  );
}

// ── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ name }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
        <HiCheckCircle className="text-green-500 text-5xl" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">You're all set!</h2>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
        Welcome to InzuTrust, <strong>{name || "Landlord"}</strong>! Your account is under review.
        You'll receive a confirmation email within 24 hours.
      </p>
      <button className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition">
        Go to Dashboard
      </button>
    </div>
  );
}

// ── API base URL — change to your deployed URL in production ─────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Main Component ───────────────────────────────────────────────────────────
export default function LandlordRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [personal,  setPersonal]  = useState({ fullName: "", email: "", phone: "", company: "" });
  const [portfolio, setPortfolio] = useState({ propertyCount: "", location: "", propertyTypes: [], avgRent: "", yearsExp: "", regNumber: "" });
  const [security,  setSecurity]  = useState({ password: "", confirmPassword: "", twoFA: false });

  const updatePersonal  = (k, v) => { setApiError(""); setPersonal(d  => ({ ...d, [k]: v })); };
  const updatePortfolio = (k, v) => { setApiError(""); setPortfolio(d => ({ ...d, [k]: v })); };
  const updateSecurity  = (k, v) => { setApiError(""); setSecurity(d  => ({ ...d, [k]: v })); };

  const progress = Math.round(((step - 1) / 3) * 100 + 33);

  // ── Step 1 validation ──
  const validateStep1 = () => {
    if (!personal.fullName.trim()) return "Full name is required.";
    if (!personal.email.trim() || !/\S+@\S+\.\S+/.test(personal.email)) return "A valid email is required.";
    if (!personal.phone.trim()) return "Phone number is required.";
    return null;
  };

  // ── Step 2 validation ──
  const validateStep2 = () => {
    if (!portfolio.propertyCount || parseInt(portfolio.propertyCount) < 1) return "Enter a valid number of properties.";
    if (!portfolio.location) return "Please select a primary location.";
    return null;
  };

  // ── Step 3 validation ──
  const validateStep3 = () => {
    if (!security.password || security.password.length < 8) return "Password must be at least 8 characters.";
    if (security.password !== security.confirmPassword) return "Passwords do not match.";
    return null;
  };

  // ── handleNext: validate then either advance or submit ──
  const handleNext = async () => {
    setApiError("");

    if (step === 1) {
      const err = validateStep1();
      if (err) { setApiError(err); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      const err = validateStep2();
      if (err) { setApiError(err); return; }
      setStep(3);
      return;
    }

    // Step 3 — submit to backend
    const err = validateStep3();
    if (err) { setApiError(err); return; }

    setLoading(true);
    try {
      // Split fullName into firstName + lastName
      const nameParts = personal.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName  = nameParts.slice(1).join(" ") || "-";

      // ── 1. Register user  POST /api/users/register ──
      const registerRes = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email:    personal.email.trim(),
          phone:    personal.phone.trim(),
          password: security.password,
          role:     "landlord",
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.message || "Registration failed.");
      }

      // ── 2. Register landlord profile  POST /api/landlords/profile ──
      //    (uses the token returned from step 1 if your backend requires auth,
      //     or sends it as part of body — adjust to match your route)
      const token = registerData.data?.token;

      const profilePayload = {
        companyName:     personal.company.trim() || null,
        businessAddress: portfolio.location      || null,
        bio: [
          portfolio.propertyTypes.length ? `Property types: ${portfolio.propertyTypes.join(", ")}` : "",
          portfolio.propertyCount ? `Properties managed: ${portfolio.propertyCount}` : "",
          portfolio.avgRent       ? `Avg rent: RWF ${parseInt(portfolio.avgRent).toLocaleString()}` : "",
          portfolio.yearsExp      ? `Years of experience: ${portfolio.yearsExp}` : "",
        ].filter(Boolean).join(" | ") || null,
        tinNumber: portfolio.regNumber.trim() || null,
      };

      if (token) {
        await fetch(`${API_BASE}/landlords/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(profilePayload),
        });
        // Note: profile creation failure is non-blocking — user is already registered
      }

      // Redirect to OTP verification page passing email
      navigate("/verify-otp", { state: { email: personal.email.trim() } });

    } catch (error) {
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => { setApiError(""); if (step > 1) setStep(s => s - 1); };

  const nextLabel = step === 1 ? "Continue to Portfolio" : step === 2 ? "Continue to Security" : "Create Account";

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">

      {/* ── Top Navbar ── */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-black text-sm">I</span>
          </div>
          <span className="text-lg font-black text-gray-900">InzuTrust</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Already have an account?
          <a href="#" className="text-blue-600 font-bold hover:underline ml-1">Log in</a>
        </div>
      </nav>

      {/* ── Page body ── */}
      <div className="flex-1 flex items-start gap-8 px-10 py-8 max-w-5xl">

        {/* ── Left Panel — white card with border, no shadow ── */}
        <div className="w-80 bg-white rounded-2xl border border-gray-200 p-8 flex flex-col shrink-0 text-left">
          <div>
            <div className="text-2xl font-black text-blue-700 mb-8 hidden">InzuTrust</div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-3 text-left">
              Join 500+ Verified Landlords
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 text-left">
              The standard for secure property management and automated rent collection.
            </p>
            <div className="space-y-5 mb-8">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 text-left">
                  <div className={`w-9 h-9 ${b.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trusted avatars */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-2">
                {[
                  "https://randomuser.me/api/portraits/women/65.jpg",
                  "https://randomuser.me/api/portraits/men/75.jpg",
                  "https://randomuser.me/api/portraits/women/44.jpg",
                ].map((src, i) => (
                  <img key={i} src={src} alt="agency"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-left">TRUSTED BY TOP AGENCIES</span>
            </div>

            {/* Testimonial */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed italic mb-2">
                "InzuTrust simplified our collection process. We've seen a 40% reduction in late payments since switching."
              </p>
              <p className="text-xs font-bold text-blue-600">— Marcus Thorne, Prime Properties</p>
            </div>
          </div>
        </div>

        {/* ── Right Panel — no card, just plain bg ── */}
        <div className="flex-1 flex flex-col text-left">
          {done ? (
            <SuccessScreen name={personal.fullName} />
          ) : (
            <>
              {/* Progress header */}
              <div className="pb-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                    Step {step} of 3
                  </span>
                  <span className="text-xs font-bold text-gray-400">{progress}% Complete</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Step indicators */}
                <div className="flex items-center gap-8">
                  {STEPS.map(s => (
                    <div key={s.id} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                        s.id < step
                          ? "bg-blue-600 text-white"
                          : s.id === step
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {s.id < step ? <HiCheck className="text-sm" /> : s.id}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        s.id <= step ? "text-blue-600" : "text-gray-400"
                      }`}>
                        {s.sublabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form body */}
              <div className="flex-1 overflow-y-auto pb-6">
                {step === 1 && <StepPersonal  data={personal}  onChange={updatePersonal}  />}
                {step === 2 && <StepPortfolio data={portfolio} onChange={updatePortfolio} />}
                {step === 3 && <StepSecurity  data={security}  onChange={updateSecurity}  />}
              </div>

              {/* Footer: CTA + security note + upcoming step preview */}
              <div className="pb-6 space-y-4">
                {/* API / validation error */}
                {apiError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {apiError}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                    >
                      <HiArrowLeft /> Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      <>{nextLabel} <HiArrowRight /></>
                    )}
                  </button>
                </div>

                {/* Security note */}
                <p className="text-xs text-gray-400 flex items-center gap-1.5 text-left">
                  <HiLockClosed className="text-green-500" /> Your data is encrypted and secure
                </p>

                {/* Upcoming steps preview — dashed cards */}
                {step === 1 && (
                  <div className="space-y-3 mt-2">
                    {/* Card 1: Portfolio Details */}
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 bg-white/60 opacity-70">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <HiOfficeBuilding className="text-gray-400 text-lg" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-500">Portfolio Details</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">COMING UP NEXT</p>
                        </div>
                      </div>
                      <div className="space-y-2 pl-1">
                        <div className="h-2 bg-gray-200 rounded-full w-4/5" />
                        <div className="h-2 bg-gray-200 rounded-full w-3/5" />
                      </div>
                    </div>
                    {/* Card 2: Compliance & KYC */}
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 bg-white/60 opacity-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <HiShieldCheck className="text-gray-400 text-lg" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-500">Compliance & KYC</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">FINAL STEP</p>
                        </div>
                      </div>
                      <div className="space-y-2 pl-1">
                        <div className="h-2 bg-gray-200 rounded-full w-4/5" />
                        <div className="h-2 bg-gray-200 rounded-full w-2/5" />
                      </div>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-3 mt-2">
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 bg-white/60 opacity-70">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <HiShieldCheck className="text-gray-400 text-lg" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-500">Compliance & KYC</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">COMING UP NEXT</p>
                        </div>
                      </div>
                      <div className="space-y-2 pl-1">
                        <div className="h-2 bg-gray-200 rounded-full w-4/5" />
                        <div className="h-2 bg-gray-200 rounded-full w-2/5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}