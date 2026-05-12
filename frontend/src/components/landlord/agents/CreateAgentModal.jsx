// src/components/landlord/agents/CreateAgentModal.jsx
// Step 1: Create agent account (backend sends OTP welcome email)
// Step 2: Assign properties with granular permissions
import { useState } from "react";
import { HiX, HiUserAdd, HiOfficeBuilding, HiCheck, HiEye, HiEyeOff } from "react-icons/hi";

const PERM_DEFS = [
  { key: "canEditDetails",       label: "Edit Property Details",   desc: "Can update title, description, rent, images" },
  { key: "canManageTenants",     label: "Manage Tenants",          desc: "Review & accept/reject tenant applications" },
  { key: "canViewPayments",      label: "View Payments",           desc: "Read-only access to payment records" },
  { key: "canHandleMaintenance", label: "Handle Maintenance",      desc: "Acknowledge, schedule and resolve requests" },
  { key: "canViewTenants",       label: "View Tenant Profiles",    desc: "See tenant contact info and history" },
  { key: "canCreateProperty",    label: "Create Properties",       desc: "List new properties (landlord is notified)" },
  { key: "canRespondDisputes",   label: "Respond to Disputes",     desc: "Reply on behalf of landlord in disputes" },
];

export default function CreateAgentModal({ token, properties, onClose, onSuccess }) {
  const [step,         setStep]        = useState(1);
  const [createdAgent, setCreatedAgent] = useState(null);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState("");
  const [showPass,     setShowPass]    = useState(false);

  // Step 1 form
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });

  // Step 2: assignment
  const [selectedProps, setSelectedProps] = useState([]);
  const [permissions,   setPermissions]   = useState({
    canEditDetails: true, canManageTenants: true, canViewPayments: false,
    canHandleMaintenance: true, canViewTenants: true,
    canCreateProperty: false, canRespondDisputes: false,
  });

  // ── Step 1: Create account ────────────────────────────────────────────────
  const handleCreate = async () => {
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL || "https://inzutrust-api.onrender.com/api"}/agents/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setCreatedAgent(data.data);
      setStep(2);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  // ── Step 2: Assign properties ─────────────────────────────────────────────
  const handleAssign = async () => {
    if (selectedProps.length === 0) { setError("Select at least one property."); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/agents/assign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: createdAgent.id, propertyIds: selectedProps, permissions }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      onSuccess();
      onClose();
    } catch { setError("Assignment failed. Please try again."); }
    finally { setLoading(false); }
  };

  const toggleProp = id => setSelectedProps(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togglePerm = key => setPermissions(p => ({ ...p, [key]: !p[key] }));
  const inp = (label, key, type = "text") => (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"/>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-black text-gray-900 text-lg">Create Agent Account</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><HiX/></button>
          </div>
          <p className="text-xs text-gray-400">Step {step} of 2 — {step === 1 ? "Agent details" : "Assign properties"}</p>
          {/* Progress bar */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 h-1 rounded-full bg-blue-600"/>
            <div className={`flex-1 h-1 rounded-full ${step === 2 ? "bg-blue-600" : "bg-gray-200"}`}/>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-xs font-bold px-4 py-3 rounded-xl border border-red-100">{error}</div>}

          {step === 1 ? (
            <>
              <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 font-semibold border border-blue-100">
                📧 A welcome email with login credentials and a verification OTP will be sent to the agent automatically.
              </div>
              <div className="grid grid-cols-2 gap-3">
                {inp("First Name", "firstName")}
                {inp("Last Name",  "lastName")}
              </div>
              {inp("Email Address", "email", "email")}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <HiEyeOff/> : <HiEye/>}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Agent can change this password after first login</p>
              </div>
              {inp("Phone (optional)", "phone", "tel")}
            </>
          ) : (
            <>
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 border border-green-100">
                <HiCheck className="text-green-600 text-xl shrink-0"/>
                <div>
                  <p className="text-xs font-black text-green-800">Agent account created!</p>
                  <p className="text-xs text-green-700">Welcome email sent to <strong>{createdAgent?.email}</strong></p>
                </div>
              </div>

              {/* Property selection */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Select Properties</p>
                {properties.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No properties available. Add properties first.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {properties.map(p => (
                      <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedProps.includes(p.id) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                      }`}>
                        <input type="checkbox" checked={selectedProps.includes(p.id)} onChange={() => toggleProp(p.id)} className="accent-blue-600"/>
                        <HiOfficeBuilding className={selectedProps.includes(p.id) ? "text-blue-600" : "text-gray-400"}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.district} · RWF {Number(p.rentAmount).toLocaleString()}/mo</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Permissions</p>
                <div className="space-y-2">
                  {PERM_DEFS.map(({ key, label, desc }) => (
                    <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      permissions[key] ? "border-blue-200 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    }`}>
                      <input type="checkbox" checked={!!permissions[key]} onChange={() => togglePerm(key)} className="mt-0.5 accent-blue-600"/>
                      <div>
                        <p className="text-xs font-black text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-400">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {step === 2 && (
            <button onClick={() => { setStep(1); setError(""); }}
              className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition">
              Back
            </button>
          )}
          <button
            onClick={step === 1 ? handleCreate : handleAssign}
            disabled={loading || (step === 1 && (!form.firstName || !form.email || !form.password))}
            className="flex-1 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
            <HiUserAdd/>
            {loading ? "Please wait..." : step === 1 ? "Create Agent Account" : "Assign & Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}