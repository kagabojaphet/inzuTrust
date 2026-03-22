// src/components/landlord/agreements/CreateLeaseWizard.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  HiShieldCheck, HiArrowRight, HiArrowLeft,
  HiCheck, HiPencilAlt, HiDownload, HiCheckCircle,
} from "react-icons/hi";
import { API_BASE } from "../../../config";
import SigCanvas from "./SigCanvas";
import LeaseDoc  from "./LeaseDoc";
import {
  inp, DISTRICTS, DURATIONS, STEPS,
  formatRWF,
} from "./agreementHelpers";

// ── Reusable field wrapper ────────────────────────────────────────────────────
function F({ label, req, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
        {label}{req ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

export default function CreateLeaseWizard({ token, user, prefill, onClose, onCreated }) {
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const docId = useRef(`RW-${Math.floor(1000 + Math.random() * 9000)}-KGL`).current;

  // ── Options from accepted applications ───────────────────────────────────
  const [tenantOptions,   setTenantOptions]   = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/lease-applications/received`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const accepted = (data.data || []).filter(a => a.status === "accepted");

        const tMap = {};
        accepted.forEach(a => { if (a.tenant) tMap[a.tenantId] = a.tenant; });
        setTenantOptions(
          Object.entries(tMap).map(([id, t]) => ({
            id, name: `${t.firstName} ${t.lastName}`, email: t.email || "",
          }))
        );

        const pMap = {};
        accepted.forEach(a => { if (a.property) pMap[a.propertyId] = a.property; });
        setPropertyOptions(
          Object.entries(pMap).map(([id, p]) => ({
            id, title: p.title, address: p.address || p.title,
            district: p.district, sector: p.sector || "", rentAmount: p.rentAmount,
          }))
        );
      } catch (e) { console.warn("Options load failed:", e); }
    })();
  }, [token]);

  // ── Form data ─────────────────────────────────────────────────────────────
  const [data, setData] = useState({
    tenantId:          prefill?.tenantId   || "",
    propertyId:        prefill?.propertyId || "",
    landlordName:      user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    tenantName:        "",
    tenantEmail:       "",
    propertyAddress:   prefill?.address || prefill?.title || "",
    district:          prefill?.district || "Gasabo",
    sector:            prefill?.sector   || "",
    rentAmount:        prefill?.rentAmount || "",
    securityDeposit:   "",
    leaseDuration:     "12",
    startDate:         "",
    endDate:           "",
    additionalTerms:   "",
    landlordSignature: null,
  });

  // Auto-calculate end date
  useEffect(() => {
    if (data.startDate && data.leaseDuration) {
      const d = new Date(data.startDate);
      d.setMonth(d.getMonth() + parseInt(data.leaseDuration));
      setData(p => ({ ...p, endDate: d.toISOString().split("T")[0] }));
    }
  }, [data.startDate, data.leaseDuration]);

  const up = (k, v) => { setError(""); setData(p => ({ ...p, [k]: v })); };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (step === 1) {
      if (!data.tenantId)               return "Please select a tenant.";
      if (!data.propertyId)             return "Please select a property.";
      if (!data.landlordName.trim())    return "Landlord name is required.";
      if (!data.tenantName.trim())      return "Tenant name is required.";
      if (!data.tenantEmail || !/\S+@\S+\.\S+/.test(data.tenantEmail))
                                        return "Valid tenant email is required.";
      if (!data.propertyAddress.trim()) return "Property address is required.";
    }
    if (step === 2) {
      if (!data.rentAmount) return "Monthly rent is required.";
      if (!data.startDate)  return "Start date is required.";
    }
    if (step === 4) {
      if (!data.landlordSignature) return "Your signature is required to send this agreement.";
    }
    return null;
  };

  // ── Download draft ────────────────────────────────────────────────────────
  const handleDownload = () => {
    const today = new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" });
    const html  = `<!DOCTYPE html><html><head><title>Lease - ${docId}</title>
<style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:40px;color:#1a1a1a;line-height:1.8;font-size:13px}
h1{text-align:center;text-transform:uppercase;letter-spacing:3px;font-size:16px;font-family:Arial}
.st{font-family:Arial;font-weight:700;font-size:12px;text-transform:uppercase;margin:16px 0 4px}
.sigs{display:flex;gap:60px;margin-top:40px;padding-top:20px;border-top:1px solid #ccc}.sb{flex:1}
.sl{border-bottom:1px solid #333;min-height:50px;margin-bottom:6px}</style></head><body>
<div style="display:flex;justify-content:space-between;margin-bottom:20px;font-family:Arial;font-size:12px">
<span>DOCUMENT ID: #${docId}</span><div style="text-align:right"><strong>InzuTrust Properties</strong><br>Kigali, Rwanda</div></div>
<h1>Residential Lease Agreement</h1>
<p>Made on <strong>${today}</strong> between <strong>${data.landlordName}</strong> and <strong>${data.tenantName}</strong>.</p>
<div class="st">1. Property</div><p><strong>${data.propertyAddress}, ${data.district}, Rwanda</strong></p>
<div class="st">2. Term</div><p>${data.leaseDuration} months · ${data.startDate} → ${data.endDate}</p>
<div class="st">3. Rent</div><p><strong>${formatRWF(data.rentAmount)}</strong>/month. Due 1st. Late fee 5%.</p>
<div class="st">4. Security Deposit</div><p><strong>${formatRWF(data.securityDeposit || data.rentAmount)}</strong> held in InzuTrust escrow.</p>
${data.additionalTerms ? `<div class="st">9. Additional Terms</div><p>${data.additionalTerms}</p>` : ""}
<div class="sigs">
<div class="sb">${data.landlordSignature ? `<img src="${data.landlordSignature}" height="50"/>` : '<div class="sl"></div>'}
<p><strong>${data.landlordName}</strong><br>Landlord</p></div>
<div class="sb"><div class="sl"></div><p><strong>${data.tenantName}</strong><br>Tenant (pending)</p></div>
</div></body></html>`;
    const a     = document.createElement("a");
    a.href      = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download  = `Lease-${docId}.html`;
    a.click();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (step < 4) { setStep(s => s + 1); return; }

    setLoading(true);
    try {
      const payload = {
        tenantId:          data.tenantId,
        propertyId:        data.propertyId,
        landlordName:      data.landlordName,
        tenantName:        data.tenantName,
        tenantEmail:       data.tenantEmail,
        propertyAddress:   data.propertyAddress,
        district:          data.district,
        sector:            data.sector,
        rentAmount:        Number(data.rentAmount),
        securityDeposit:   Number(data.securityDeposit || data.rentAmount),
        leaseDuration:     Number(data.leaseDuration),
        startDate:         data.startDate,
        endDate:           data.endDate,
        additionalTerms:   data.additionalTerms,
        landlordSignature: data.landlordSignature,
      };
      const res    = await fetch(`${API_BASE}/agreements`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create agreement");
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-5">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <HiCheckCircle className="text-green-500 text-5xl"/>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Agreement Sent!</h2>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          Document <span className="font-mono font-bold">#{docId}</span> has been created and sent to{" "}
          <strong>{data.tenantName}</strong> for their signature.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDownload}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
            <HiDownload/> Download Draft
          </button>
          <button onClick={() => { onCreated(); onClose(); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[600px] rounded-2xl overflow-hidden">

      {/* ── Progress sidebar ── */}
      <div className="w-56 shrink-0 flex flex-col bg-white border-r border-gray-100 p-6">

        {/* Section label */}
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
          Agreement Progress
        </p>

        {/* Steps */}
        <div className="flex-1 space-y-1">
          {STEPS.map(s => {
            const isDone   = step > s.id;
            const isActive = step === s.id;
            return (
              <div key={s.id} className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive ? "bg-blue-50 border border-blue-100" : ""
              }`}>
                {/* Step indicator */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isDone   ? "bg-green-500" :
                  isActive ? "bg-blue-500"  : "bg-gray-200"
                }`}>
                  {isDone   ? <HiCheck     className="text-white text-xs"/> :
                   isActive ? <HiPencilAlt className="text-white text-[10px]"/> :
                   <span className="text-[10px] font-black text-gray-400">{s.id}</span>}
                </div>
                {/* Labels */}
                <div className="min-w-0">
                  <p className={`text-xs font-black leading-tight ${
                    isActive ? "text-blue-700" :
                    isDone   ? "text-gray-700" : "text-gray-400"
                  }`}>{s.label}</p>
                  <p className={`text-[10px] mt-0.5 font-medium ${
                    isActive ? "text-blue-500"  :
                    isDone   ? "text-green-500" : "text-gray-300"
                  }`}>
                    {isDone ? "Completed" : isActive ? "In Progress" : s.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="flex-1 flex flex-col bg-white p-6">
        {/* Step heading */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              {step === 4 ? "Sign & Send" : STEPS[step - 1].label}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 1 && "Select the tenant and property, then confirm names."}
              {step === 2 && "Set the lease duration, rent, and deposit."}
              {step === 3 && "Review the generated agreement carefully before signing."}
              {step === 4 && "Sign the agreement. The tenant will sign from their dashboard."}
            </p>
          </div>
          {step === 4 && (
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
              <HiShieldCheck/> Secure
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 1: Parties & Property ── */}
        {step === 1 && (
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4 flex-1">
            <F label="Select Tenant" req>
              <select value={data.tenantId} onChange={e => {
                const t = tenantOptions.find(x => x.id === e.target.value);
                up("tenantId", e.target.value);
                if (t) { up("tenantName", t.name); up("tenantEmail", t.email); }
              }} className={inp}>
                <option value="">— Choose a tenant —</option>
                {tenantOptions.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
              {tenantOptions.length === 0 && (
                <p className="text-[10px] text-yellow-600 mt-1">
                  No accepted applications found. Accept an application first.
                </p>
              )}
            </F>

            <F label="Select Property" req>
              <select value={data.propertyId} onChange={e => {
                const p = propertyOptions.find(x => x.id === e.target.value);
                up("propertyId", e.target.value);
                if (p) {
                  up("propertyAddress", p.address || p.title);
                  up("district",        p.district || "Gasabo");
                  up("sector",          p.sector   || "");
                  up("rentAmount",      p.rentAmount || "");
                }
              }} className={inp}>
                <option value="">— Choose a property —</option>
                {propertyOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.title} — {p.district}</option>
                ))}
              </select>
            </F>

            <div className="grid grid-cols-2 gap-4">
              <F label="Landlord Full Name" req>
                <input value={data.landlordName} onChange={e => up("landlordName", e.target.value)}
                  placeholder="e.g. Uwizeyimana Yvette" className={inp}/>
              </F>
              <F label="Tenant Full Name" req>
                <input value={data.tenantName} onChange={e => up("tenantName", e.target.value)}
                  placeholder="e.g. Iradukunda Japhet" className={inp}/>
              </F>
            </div>

            <F label="Tenant Email" req>
              <input type="email" value={data.tenantEmail} onChange={e => up("tenantEmail", e.target.value)}
                placeholder="tenant@example.com" className={inp}/>
            </F>

            <div className="grid grid-cols-2 gap-4">
              <F label="Property Address / Name" req>
                <input value={data.propertyAddress} onChange={e => up("propertyAddress", e.target.value)}
                  placeholder="e.g. Unit 4B, Kigali Heights" className={inp}/>
              </F>
              <F label="District">
                <select value={data.district} onChange={e => up("district", e.target.value)} className={inp}>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </F>
            </div>

            <F label="Sector">
              <input value={data.sector} onChange={e => up("sector", e.target.value)}
                placeholder="e.g. Kacyiru" className={inp}/>
            </F>
          </div>
        )}

        {/* ── Step 2: Lease Terms ── */}
        {step === 2 && (
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <F label="Monthly Rent (RWF)" req>
                <input type="number" value={data.rentAmount} onChange={e => up("rentAmount", e.target.value)}
                  placeholder="800000" min="0" className={inp}/>
              </F>
              <F label="Security Deposit (RWF)">
                <input type="number" value={data.securityDeposit} onChange={e => up("securityDeposit", e.target.value)}
                  placeholder="Same as rent" min="0" className={inp}/>
              </F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Start Date" req>
                <input type="date" value={data.startDate} onChange={e => up("startDate", e.target.value)} className={inp}/>
              </F>
              <F label="Duration">
                <select value={data.leaseDuration} onChange={e => up("leaseDuration", e.target.value)} className={inp}>
                  {DURATIONS.map(m => (
                    <option key={m} value={m}>{m} month{m !== "1" ? "s" : ""}</option>
                  ))}
                </select>
              </F>
            </div>
            {data.endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-blue-700 font-semibold">
                📅 Ends: <strong>{new Date(data.endDate).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}</strong>
              </div>
            )}
            <F label="Additional Terms (Optional)">
              <textarea value={data.additionalTerms} onChange={e => up("additionalTerms", e.target.value)}
                rows={3} placeholder="Any special conditions..." className={`${inp} resize-none`}/>
            </F>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">#{docId}</span>
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:underline">
                <HiDownload/> Download Draft
              </button>
            </div>
            <LeaseDoc d={data} docId={docId} showSigs={false}/>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
              ⚠️ Review all details carefully before signing.
            </div>
          </div>
        )}

        {/* ── Step 4: Sign (landlord only) ── */}
        {step === 4 && (
          <div className="space-y-4 flex-1">
            <LeaseDoc d={data} docId={docId} showSigs={true}/>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <p className="text-sm font-black text-gray-900">Your Signature</p>
              <SigCanvas
                label={`${data.landlordName || "Landlord"} (Landlord)`}
                onSave={sig => up("landlordSignature", sig)}
                onClear={() => up("landlordSignature", null)}
              />
              <p className="text-xs text-gray-400 text-center">
                By signing, you confirm the agreement is ready to send. This e-signature is legally binding under Rwandan law.
              </p>
            </div>
            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
              <span className="text-blue-500 text-lg shrink-0 mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-bold text-blue-800">What happens next?</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                  After you sign, the agreement is sent to{" "}
                  <strong>{data.tenantName || "the tenant"}</strong> with status{" "}
                  <strong>Pending Signature</strong>. They sign from their own dashboard.
                  The agreement becomes fully active once both parties have signed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
          <button
            onClick={() => { setError(""); setStep(s => Math.max(1, s - 1)); }}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-30"
          >
            <HiArrowLeft/> Back
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STEPS.map(s => (
              <div key={s.id} className={`h-2 rounded-full transition-all ${
                step === s.id ? "bg-blue-600 w-5" : step > s.id ? "bg-green-500 w-2" : "bg-gray-300 w-2"
              }`}/>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={loading}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-black transition disabled:opacity-60 shadow-md ${
              step === 4 ? "bg-green-600 text-white hover:bg-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Sending...</>
              : step === 4
                ? <><HiCheck/> Sign & Send</>
                : <>Continue <HiArrowRight/></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}