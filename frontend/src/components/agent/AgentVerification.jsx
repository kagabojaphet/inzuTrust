// src/components/agent/AgentVerification.jsx
// Identity verification flow — upload National ID + Agency License
import { useState, useRef } from "react";
import {
  HiShieldCheck, HiCheckCircle, HiClock, HiUpload,
  HiDocumentText, HiX, HiLockClosed,
} from "react-icons/hi";

const API  = import.meta.env.VITE_API_URL || "https://inzutrust-api.onrender.com/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}` });

const STEPS = [
  { label:"Email Verified",       icon:HiCheckCircle, done:true  },
  { label:"Phone Number Linked",  icon:HiCheckCircle, done:true  },
  { label:"Document Upload",      icon:HiClock,       done:false },
  { label:"Manual Review",        icon:HiClock,       done:false, sub:"Usually takes 24-48 hours" },
];

function UploadZone({ label, required, description, file, onFile, accept }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = e => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <HiDocumentText className="text-blue-600"/>
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{label}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        {required && (
          <span className="text-[10px] font-black text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded-full">
            *Required
          </span>
        )}
      </div>

      <div className={`m-4 border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
        drag ? "border-blue-400 bg-blue-50" : file ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
      }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}>

        <input ref={inputRef} type="file" className="hidden" accept={accept || ".svg,.png,.jpg,.pdf"}
          onChange={e => e.target.files[0] && onFile(e.target.files[0])}/>

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <HiCheckCircle className="text-green-500 text-2xl shrink-0"/>
            <div className="text-left min-w-0">
              <p className="text-sm font-bold text-green-700 truncate">{file.name}</p>
              <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={e => { e.stopPropagation(); onFile(null); }}
              className="ml-auto p-1 text-gray-400 hover:text-red-500 transition">
              <HiX/>
            </button>
          </div>
        ) : (
          <>
            <HiUpload className="text-3xl text-gray-300 mx-auto mb-2"/>
            <p className="text-sm font-bold text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AgentVerification({ token, user, onVerified }) {
  const [nationalId,     setNationalId]     = useState(null);
  const [agencyLicense,  setAgencyLicense]  = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [error,          setError]          = useState("");

  const handleSubmit = async () => {
    if (!nationalId) { setError("National ID is required."); return; }
    setSubmitting(true); setError("");
    try {
      const fd = new FormData();
      fd.append("nationalId", nationalId);
      if (agencyLicense) fd.append("agencyLicense", agencyLicense);

      const res = await fetch(`${API}/agents/verification/submit`, {
        method: "POST",
        headers: hdrs(token),
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Submission failed");
      setSubmitted(true);
      onVerified?.();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <HiShieldCheck className="text-green-500 text-4xl"/>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Documents Submitted!</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
          Your documents are under review. Verification usually takes 24–48 hours.
          You'll be notified once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Identity Verification</h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          To maintain a trusted marketplace, we require government-issued identification and
          professional licensing. Your documents are encrypted and securely processed.
        </p>
      </div>

      {/* Pending badge */}
      <div className="flex justify-end">
        <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
          <HiClock/> Pending Verification
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upload area */}
        <div className="lg:col-span-2 space-y-4">
          <UploadZone
            label="National ID"
            required
            description="Upload a clear photo of your Passport or National ID card"
            file={nationalId}
            onFile={setNationalId}
          />
          <UploadZone
            label="Agency License"
            description="Upload your official real estate brokerage or agent licence"
            file={agencyLicense}
            onFile={setAgencyLicense}
          />
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Verification steps */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Verification Steps</p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    s.done ? "bg-green-500" : "bg-gray-100"
                  }`}>
                    {s.done
                      ? <HiCheckCircle className="text-white text-xs"/>
                      : <div className="w-2 h-2 bg-gray-300 rounded-full"/>
                    }
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${s.done ? "text-gray-900" : "text-gray-500"}`}>{s.label}</p>
                    {s.done && i === 0 && <p className="text-[10px] text-gray-400">{user?.email || "—"}</p>}
                    {s.done && i === 1 && <p className="text-[10px] text-gray-400">{user?.phone || "—"}</p>}
                    {s.sub  && <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <HiLockClosed className="text-gray-400"/>
              <HiShieldCheck className="text-gray-400"/>
              <p className="text-xs font-black text-gray-700">Bank-Grade Security</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Your documents are encrypted using AES-256 and stored securely.
              We only use this information to verify your identity and protect our community.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">
          ⚠️ {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={submitting || !nationalId}
        className="w-full py-3.5 bg-blue-600 text-white font-black text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
        {submitting
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Submitting...</>
          : <>Submit for Review →</>
        }
      </button>
    </div>
  );
}