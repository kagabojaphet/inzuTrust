// src/components/landlord/agents/AgentDrawer.jsx
// Full: permission editing inline, unassign, reassign (assign new property)
import { useState } from "react";
import {
  HiX, HiOfficeBuilding, HiCheckCircle, HiClock,
  HiTrash, HiPlus, HiShieldCheck, HiPencil, HiSave,
} from "react-icons/hi";
import {
  fmtDate, isOnline, PERM_LABELS, PERM_COLORS,
  apiRevoke, apiAssign, apiUpdatePermissions,
} from "./agentHelpers";

// ── Permission badge (static display) ────────────────────────────────────────
function PermBadge({ permKey, active }) {
  const meta = PERM_LABELS[permKey];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg border transition ${
      active ? PERM_COLORS[meta.color] : "bg-gray-50 text-gray-300 border-gray-100"
    }`}>
      {active ? "✓" : "✗"} {meta.label}
    </span>
  );
}

// ── Property card with inline permission editor ───────────────────────────────
function PropertyCard({ p, agentId, token, onRevoke, onSaved, revoking }) {
  const [editing,  setEditing]  = useState(false);
  const [perms,    setPerms]    = useState({ ...p.permissions });
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");

  const togglePerm = key => setPerms(prev => ({ ...prev, [key]: !prev[key] }));

  const savePerms = async () => {
    setSaving(true); setErr("");
    try {
      const data = await apiUpdatePermissions(token, {
        agentId, propertyId: p.id, permissions: perms,
      });
      if (data.success) { setEditing(false); onSaved(); }
      else setErr(data.message || "Failed to update permissions");
    } catch (e) { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const cancelEdit = () => { setPerms({ ...p.permissions }); setEditing(false); setErr(""); };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition">
      {/* Property header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {p.mainImage ? (
            <img src={p.mainImage} alt={p.title} className="w-10 h-10 rounded-xl object-cover shrink-0"/>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <HiOfficeBuilding className="text-gray-400"/>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{p.title}</p>
            <p className="text-[10px] text-gray-400">{p.district} · Assigned {fmtDate(p.assignedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Edit permissions toggle */}
          <button onClick={() => editing ? cancelEdit() : setEditing(true)}
            title={editing ? "Cancel" : "Edit permissions"}
            className={`p-1.5 rounded-lg text-xs transition ${
              editing ? "bg-gray-100 text-gray-600" : "text-blue-500 hover:bg-blue-50"
            }`}>
            {editing ? <HiX/> : <HiPencil/>}
          </button>
          {/* Unassign */}
          <button onClick={() => onRevoke(p.id, p.title)} disabled={revoking === p.id}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
            title="Unassign from property">
            {revoking === p.id
              ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"/>
              : <HiTrash className="text-sm"/>}
          </button>
        </div>
      </div>

      {/* Permission section */}
      {editing ? (
        // ── Editable permission checkboxes ──────────────────────────────────
        <div className="mt-3 pt-3 border-t border-gray-100">
          {err && <p className="text-[10px] text-red-600 font-bold mb-2">{err}</p>}
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Edit Permissions</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(PERM_LABELS).map(([key, { label }]) => (
              <label key={key} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer text-xs font-bold transition ${
                perms[key] ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-400"
              }`}>
                <input type="checkbox" checked={!!perms[key]} onChange={() => togglePerm(key)} className="w-3 h-3 accent-blue-600"/>
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={cancelEdit}
              className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={savePerms} disabled={saving}
              className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-1">
              {saving
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <HiSave/>}
              Save Permissions
            </button>
          </div>
        </div>
      ) : (
        // ── Static permission badges ────────────────────────────────────────
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
          {Object.keys(PERM_LABELS).map(k => (
            <PermBadge key={k} permKey={k} active={p.permissions?.[k] ?? false}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function AgentDrawer({ agentData, token, allProperties, onClose, onUpdated }) {
  const { agent: a, properties: assignedProps } = agentData;

  const [showAssign, setShowAssign] = useState(false);
  const [newPropId,  setNewPropId]  = useState("");
  const [newPerms,   setNewPerms]   = useState(
    Object.fromEntries(Object.keys(PERM_LABELS).map(k => [k, ["canEditDetails","canManageTenants","canHandleMaintenance","canViewTenants"].includes(k)]))
  );
  const [assigning, setAssigning] = useState(false);
  const [revoking,  setRevoking]  = useState(null);
  const [error,     setError]     = useState("");

  const unassigned = allProperties.filter(p => !assignedProps.some(ap => ap.id === p.id));

  const handleRevoke = async (propertyId, propertyTitle) => {
    if (!confirm(`Remove this agent from "${propertyTitle}"? They will lose access immediately.`)) return;
    setRevoking(propertyId);
    setError("");
    try {
      const data = await apiRevoke(token, a.id, propertyId);
      if (data.success) onUpdated();
      else setError(data.message);
    } catch (e) { setError(e.message); }
    finally { setRevoking(null); }
  };

  const handleAssign = async () => {
    if (!newPropId) return;
    setAssigning(true); setError("");
    try {
      const data = await apiAssign(token, { agentId: a.id, propertyIds: [newPropId], permissions: newPerms });
      if (data.success) { onUpdated(); setShowAssign(false); setNewPropId(""); }
      else setError(data.message);
    } catch (e) { setError(e.message); }
    finally { setAssigning(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={`https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=dbeafe&color=2563eb&bold=true&size=80`}
                alt="" className="w-12 h-12 rounded-xl"/>
              {isOnline(a.lastSeenAt) && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"/>
              )}
            </div>
            <div>
              <h3 className="font-black text-gray-900">{a.firstName} {a.lastName}</h3>
              <p className="text-xs text-gray-400">{a.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {a.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <HiCheckCircle className="text-xs"/> KYC Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <HiClock className="text-xs"/> Pending KYC
                  </span>
                )}
                {isOnline(a.lastSeenAt) && (
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Online
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400"><HiX className="text-lg"/></button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-bold">{error}</div>
          )}

          {/* Agent metadata */}
          <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-2 gap-3">
            {[
              { label:"Phone",     value: a.phone || "—"                          },
              { label:"Role",      value: a.role  || "agent"                       },
              { label:"Joined",    value: fmtDate(a.createdAt)                     },
              { label:"Last seen", value: a.lastSeenAt ? fmtDate(a.lastSeenAt) : "Never" },
            ].map((r, i) => (
              <div key={i}>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{r.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Assigned properties */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Assigned Properties ({assignedProps.length})
              </p>
              {unassigned.length > 0 && (
                <button onClick={() => setShowAssign(s => !s)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                  <HiPlus className="text-sm"/> {showAssign ? "Cancel" : "Assign Property"}
                </button>
              )}
            </div>

            {/* Assign new property panel */}
            {showAssign && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Assign New Property</p>
                <select value={newPropId} onChange={e => setNewPropId(e.target.value)}
                  className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">Select a property...</option>
                  {unassigned.map(p => (
                    <option key={p.id} value={p.id}>{p.title} — {p.district}</option>
                  ))}
                </select>

                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Initial Permissions</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(PERM_LABELS).map(([key, { label }]) => (
                      <label key={key} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer text-xs font-bold transition ${
                        newPerms[key] ? "bg-white border-blue-300 text-blue-700" : "bg-white/50 border-transparent text-gray-400"
                      }`}>
                        <input type="checkbox" checked={!!newPerms[key]}
                          onChange={() => setNewPerms(p => ({ ...p, [key]: !p[key] }))}
                          className="w-3 h-3 accent-blue-600"/>
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setShowAssign(false); setNewPropId(""); }}
                    className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-white transition">
                    Cancel
                  </button>
                  <button onClick={handleAssign} disabled={!newPropId || assigning}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-1">
                    {assigning
                      ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      : <HiShieldCheck/>}
                    Confirm Assign
                  </button>
                </div>
              </div>
            )}

            {/* Property list */}
            {assignedProps.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl py-8 text-center">
                <HiOfficeBuilding className="text-3xl text-gray-200 mx-auto mb-2"/>
                <p className="text-xs text-gray-400">No properties assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedProps.map(p => (
                  <PropertyCard
                    key={p.id}
                    p={p}
                    agentId={a.id}
                    token={token}
                    onRevoke={handleRevoke}
                    onSaved={onUpdated}
                    revoking={revoking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}