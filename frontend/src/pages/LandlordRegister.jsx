// src/pages/LandlordRegister.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  HiShieldCheck, HiChartBar, HiDocumentText,
  HiArrowRight, HiArrowLeft, HiLockClosed,
  HiEye, HiEyeOff, HiCheckCircle, HiCheck,
  HiHome, HiOfficeBuilding, HiUpload,
} from "react-icons/hi";

const API = import.meta.env.VITE_API_URL || "https://inzutrust-api.onrender.com/api";

const STEPS = [
  { id: 1, label: "PERSONAL",  sublabel: "Personal"  },
  { id: 2, label: "BUSINESS",  sublabel: "Business"  },
  { id: 3, label: "SECURITY",  sublabel: "Security"  },
];

const DISTRICTS = [
  "Kigali","Gasabo","Kicukiro","Nyarugenge","Bugesera",
  "Gatsibo","Kayonza","Kirehe","Ngoma","Rwamagana",
];

const benefits = [
  {
    icon: <HiShieldCheck className="text-green-600 text-xl"/>,
    bg: "bg-green-50",
    title: "Secure Rent Collection",
    desc: "Automated payouts directly to your account.",
  },
  {
    icon: <HiChartBar className="text-blue-600 text-xl"/>,
    bg: "bg-blue-50",
    title: "Real-time Dashboard",
    desc: "Track occupancy, late payments, and finances.",
  },
  {
    icon: <HiDocumentText className="text-gray-600 text-xl"/>,
    bg: "bg-gray-100",
    title: "Compliance Ready",
    desc: "Auto-generate tax reports and legal forms.",
  },
];

// ── Reusable field wrapper ────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white"
    />
  );
}

function Select({ options, placeholder = "Select...", ...props }) {
  return (
    <select
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Step 1: Personal Info ─────────────────────────────────────────────────────
// Maps to: User.firstName, lastName, email, phone, nationalId, landlordId (optional)
function StepPersonal({ data, onChange, errors }) {
  return (
    <div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">Create your account</h2>
      <p className="text-gray-500 text-sm mb-8">Start with your personal information.</p>
      <div className="grid grid-cols-2 gap-5">

        <Field label="First Name" error={errors.firstName}>
          <Input
            placeholder="Yvette"
            value={data.firstName}
            onChange={e => onChange("firstName", e.target.value)}
          />
        </Field>

        <Field label="Last Name" error={errors.lastName}>
          <Input
            placeholder="Uwizeyimana"
            value={data.lastName}
            onChange={e => onChange("lastName", e.target.value)}
          />
        </Field>

        <Field label="Email Address" error={errors.email}>
          <Input
            type="email"
            placeholder="yvette@example.com"
            value={data.email}
            onChange={e => onChange("email", e.target.value)}
          />
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

        {/* nationalId → User.nationalId (optional) */}
        <Field label="National ID Number (optional)">
          <Input
            placeholder="1 1998 8 0012345 6 78"
            value={data.nationalId}
            onChange={e => onChange("nationalId", e.target.value)}
          />
        </Field>

        {/* landlordId → User.landlordId (optional government-issued landlord ID) */}
        <Field label="Landlord ID / Gov. ID (optional)">
          <Input
            placeholder="LL-RW-2024-001"
            value={data.landlordId}
            onChange={e => onChange("landlordId", e.target.value)}
          />
        </Field>

      </div>
    </div>
  );
}

// ── Step 2: Business Info ─────────────────────────────────────────────────────
// Maps to: LandlordProfile.companyName, tinNumber, businessAddress, bio, website
function StepBusiness({ data, onChange, errors }) {
  return (
    <div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">Your Business Details</h2>
      <p className="text-gray-500 text-sm mb-8">
        Tell us about your properties. This populates your landlord profile.
      </p>
      <div className="space-y-5">

        <div className="grid grid-cols-2 gap-5">
          {/* → LandlordProfile.companyName */}
          <Field label="Company Name (optional)">
            <Input
              placeholder="Hallmark Residences Ltd"
              value={data.companyName}
              onChange={e => onChange("companyName", e.target.value)}
            />
          </Field>

          {/* → LandlordProfile.tinNumber */}
          <Field label="TIN / Business Reg. No. (optional)">
            <Input
              placeholder="TIN-RW-2024-12345"
              value={data.tinNumber}
              onChange={e => onChange("tinNumber", e.target.value)}
            />
          </Field>
        </div>

        {/* → LandlordProfile.businessAddress */}
        <Field label="Primary Business Location" error={errors.businessAddress}>
          <Select
            options={DISTRICTS}
            placeholder="Select district..."
            value={data.businessAddress}
            onChange={e => onChange("businessAddress", e.target.value)}
          />
        </Field>

        {/* → LandlordProfile.website */}
        <Field label="Website (optional)">
          <Input
            placeholder="https://yourcompany.rw"
            value={data.website}
            onChange={e => onChange("website", e.target.value)}
          />
        </Field>

        {/* → LandlordProfile.bio */}
        <Field label="Short Bio (optional)">
          <textarea
            rows={3}
            placeholder="Briefly describe your property portfolio and experience..."
            value={data.bio}
            onChange={e => onChange("bio", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white resize-none"
          />
        </Field>

      </div>
    </div>
  );
}

// ── Step 3: Security ──────────────────────────────────────────────────────────
// Maps to: User.password only — profilePicture upload is optional/post-registration
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
    <div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">Secure your account</h2>
      <p className="text-gray-500 text-sm mb-8">Set a strong password to protect your account.</p>
      <div className="space-y-5">

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-black text-blue-800 mb-1">Almost there! 🎉</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            After registration you'll verify your email via OTP, then complete your
            KYC to become a <strong>Verified Landlord</strong> and unlock all features.
          </p>
        </div>

        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={data.password}
              onChange={e => onChange("password", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <HiEyeOff/> : <HiEye/>}
            </button>
          </div>
          {data.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`}/>
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
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={data.confirmPassword}
              onChange={e => onChange("confirmPassword", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 transition bg-white ${
                data.confirmPassword && data.password !== data.confirmPassword
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirm ? <HiEyeOff/> : <HiEye/>}
            </button>
          </div>
          {data.confirmPassword && data.password !== data.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
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
            My account will be reviewed within 24 hours.
          </p>
        </label>

      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandlordRegister() {
  const navigate = useNavigate();
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors,   setErrors]   = useState({});

  // Step 1 — maps directly to User model fields
  const [personal, setPersonal] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", nationalId: "", landlordId: "",
  });

  // Step 2 — maps to LandlordProfile fields (created automatically by registerUser)
  // These are sent as updateUserProfile after registration OR stored for later
  const [business, setBusiness] = useState({
    companyName: "", tinNumber: "", businessAddress: "",
    website: "", bio: "",
  });

  // Step 3 — password only
  const [security, setSecurity] = useState({
    password: "", confirmPassword: "", agreedToTerms: false,
  });

  const up = (setter) => (key, val) => {
    setApiError(""); setErrors({});
    setter(prev => ({ ...prev, [key]: val }));
  };

  const progress = Math.round(((step - 1) / 3) * 100 + 33);

  // ── Validation per step ───────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (step === 1) {
      if (!personal.firstName.trim()) errs.firstName = "Required";
      if (!personal.lastName.trim())  errs.lastName  = "Required";
      if (!/\S+@\S+\.\S+/.test(personal.email)) errs.email = "Valid email required";
      if (!personal.phone.trim())     errs.phone     = "Required";
    }

    if (step === 2) {
      if (!business.businessAddress) errs.businessAddress = "Please select a location";
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
      // POST /api/users/register
      // Sends exactly what userService.registerUser expects
      const res = await fetch(`${API}/users/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // User model fields
          firstName:   personal.firstName.trim(),
          lastName:    personal.lastName.trim(),
          email:       personal.email.trim(),
          phone:       personal.phone.trim(),
          password:    security.password,
          role:        "landlord",
          nationalId:  personal.nationalId.trim()  || undefined,
          landlordId:  personal.landlordId.trim()  || undefined,
          // LandlordProfile fields (userService.registerUser creates profile automatically)
          companyName: business.companyName.trim()  || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Registration failed");

      // If we have a token + business profile data, update the profile immediately
      if (data.data?.token && (business.tinNumber || business.businessAddress || business.bio || business.website)) {
        await fetch(`${API}/users/profile`, {
          method:  "PUT",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${data.data.token}`,
          },
          body: JSON.stringify({
            tinNumber:       business.tinNumber.trim()       || undefined,
            businessAddress: business.businessAddress        || undefined,
            bio:             business.bio.trim()             || undefined,
            website:         business.website.trim()         || undefined,
          }),
        });
      }

      // Navigate to OTP verification
      navigate("/verify-otp", { state: { email: personal.email.trim(), role: "landlord" } });

    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextLabel =
    step === 1 ? "Continue to Business" :
    step === 2 ? "Continue to Security" :
    "Create Account";

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <div className="flex-1 flex items-start gap-8 px-10 py-8 max-w-5xl mx-auto w-full">

        {/* ── Left panel ── */}
        <div className="w-80 bg-white rounded-2xl border border-gray-200 p-8 flex flex-col shrink-0">
          <h2 className="text-2xl font-black text-gray-900 leading-tight mb-3">
            Join 500+ Verified Landlords
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            The standard for secure property management and automated rent collection.
          </p>

          <div className="space-y-5 mb-8">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
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

          <div className="flex items-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {[
                "https://randomuser.me/api/portraits/women/65.jpg",
                "https://randomuser.me/api/portraits/men/75.jpg",
                "https://randomuser.me/api/portraits/women/44.jpg",
              ].map((src, i) => (
                <img key={i} src={src} alt=""
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"/>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Trusted by top agencies
            </span>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed italic mb-2">
              "InzuTrust simplified our collection process. We've seen a 40% reduction in late payments."
            </p>
            <p className="text-xs font-bold text-blue-600">— Marcus Thorne, Prime Properties</p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col">

          {/* Step progress */}
          <div className="pb-6">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                Step {step} of 3
              </span>
              <span className="text-xs font-bold text-gray-400">{progress}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}/>
            </div>
            <div className="flex items-center gap-8">
              {STEPS.map(s => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                    s.id < step  ? "bg-blue-600 text-white" :
                    s.id === step ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {s.id < step ? <HiCheck className="text-sm"/> : s.id}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    s.id <= step ? "text-blue-600" : "text-gray-400"
                  }`}>{s.sublabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 pb-6">
            {step === 1 && <StepPersonal  data={personal}  onChange={up(setPersonal)}  errors={errors}/>}
            {step === 2 && <StepBusiness  data={business}  onChange={up(setBusiness)}  errors={errors}/>}
            {step === 3 && <StepSecurity  data={security}  onChange={up(setSecurity)}  errors={errors}/>}
          </div>

          {/* Footer */}
          <div className="space-y-4">
            {apiError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="shrink-0">⚠️</span> {apiError}
              </div>
            )}
            {errors.agreedToTerms && (
              <p className="text-xs text-red-500 font-medium">{errors.agreedToTerms}</p>
            )}

            <div className="flex items-center gap-4">
              {step > 1 && (
                <button onClick={() => { setErrors({}); setStep(s => s - 1); }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition">
                  <HiArrowLeft/> Back
                </button>
              )}
              <button onClick={handleNext} disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? (
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <>{nextLabel} <HiArrowRight/></>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <HiLockClosed className="text-green-500"/> Your data is encrypted and secure
            </p>

            <p className="text-xs text-gray-500 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}