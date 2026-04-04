// src/components/landlord/agents/CreateAgentModal.jsx
import React, { useState } from "react";
import { HiUserAdd, HiCheck, HiX } from "react-icons/hi";
import { PERM_LABELS, apiCreateAgent, apiAssign } from "./agentHelpers";

export default function CreateAgentModal({ token, properties, onCreated, onClose }) {
  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });
  const [agentId, setAgentId] = useState(null);
  const [selectedProps, setSelectedProps] = useState([]);
  const [perms, setPerms] = useState({
    canEditDetails: true, canManageTenants: true,
    canViewPayments: false, canHandleMaintenance: true,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("First name, last name, email, and password are required."); return;
    }
    setLoading(true); setError("");
    const data = await apiCreateAgent(token, form).catch(e => ({ success: false, message: e.message }));
    setLoading(false);
    if (data.success) { setAgentId(data.data.id); setStep(2); }
    else setError(data.message || "Failed to create agent");
  };

  const handleFinish = async () => {
    setLoading(true); setError("");
    try {
      if (selectedProps.length > 0 && agentId) {
        const data = await apiAssign(token, { agentId, propertyIds: selectedProps, permissions: perms });
        if (!data.success) { setError(data.message); setLoading(false); return; }
      }
      onCreated();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900">
              {step === 1 ? "Create Agent Account" : "Assign Properties"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 ? "Step 1 of 2 — Agent details" : "Step 2 of 2 — Optional assignment"}
            </p>
            {/* Progress bar */}
            <div className="flex gap-1.5 mt-2">
              {[1, 2].map(s => (
                <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s <= step ? "bg-blue-600 w-8" : "bg-gray-200 w-4"}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400">
            <HiX className="text-lg" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "firstName", label: "First Name",        type: "text",     placeholder: "Patrick",            full: false },
                  { key: "lastName",  label: "Last Name",         type: "text",     placeholder: "Niyonzima",          full: false },
                  { key: "email",     label: "Email Address",     type: "email",    placeholder: "agent@example.com",  full: true  },
                  { key: "password",  label: "Password",          type: "password", placeholder: "Min 8 characters",   full: true  },
                  { key: "phone",     label: "Phone (optional)",  type: "tel",      placeholder: "+250 788 000 000",   full: true  },
                ].map(f => (
                  <div key={f.key} className={f.full ? "col-span-2" : "col-span-1"}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <HiUserAdd />}
                Create Agent Account
              </button>
            </div>
          )}

          {/* Step 2 — Assign */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-600">
                Select properties for this agent to manage (you can also skip and assign later).
              </p>

              {/* Properties */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Properties</p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-3">
                  {properties.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No properties yet</p>
                  ) : (
                    properties.map(p => (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${
                          selectedProps.includes(p.id) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProps.includes(p.id)}
                          onChange={e => setSelectedProps(prev =>
                            e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                          )}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{p.title}</p>
                          <p className="text-[10px] text-gray-400">{p.district} · {p.type}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Default Permissions</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERM_LABELS).map(([key, { label }]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition text-xs font-bold ${
                        perms[key]
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={perms[key]}
                        onChange={() => setPerms(p => ({ ...p, [key]: !p[key] }))}
                        className="w-3.5 h-3.5 accent-blue-600"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onCreated}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <HiCheck />}
                  {selectedProps.length > 0 ? "Assign & Finish" : "Finish"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}