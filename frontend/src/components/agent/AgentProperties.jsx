// src/components/agent/AgentProperties.jsx
// Agent can VIEW and EDIT properties (if canEditDetails permission granted)
import { useState } from "react";
import { HiOfficeBuilding, HiPencil, HiCheck, HiX, HiPhotograph } from "react-icons/hi";

const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const hdrs = tk => ({ Authorization: `Bearer ${tk}`, "Content-Type": "application/json" });

const PERM_LABELS = {
  canEditDetails:       "Edit Details",
  canManageTenants:     "Manage Tenants",
  canViewPayments:      "View Payments",
  canHandleMaintenance: "Handle Maintenance",
  canCreateProperty:    "Create Property",
  canViewTenants:       "View Tenants",
  canRespondDisputes:   "Respond Disputes",
};

function EditPropertyModal({ property, token, onClose, onSaved }) {
  const [form, setForm]       = useState({
    title:       property.title       || "",
    description: property.description || "",
    rentAmount:  property.rentAmount  || "",
    address:     property.address     || "",
    bedrooms:    property.bedrooms    || "",
    bathrooms:   property.bathrooms   || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const save = async () => {
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API}/properties/${property.id}`, {
        method: "PUT", headers: hdrs(token), body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onSaved(); onClose(); }
      else setError(data.message || "Update failed");
    } catch (e) { setError("Network error"); }
    finally { setSaving(false); }
  };

  const field = (label, key, type = "text") => (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      {key === "description" ? (
        <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"/>
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"/>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-gray-900">Edit Property</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><HiX/></button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded-xl">{error}</div>}

        {field("Title", "title")}
        {field("Description", "description")}
        {field("Monthly Rent (RWF)", "rentAmount", "number")}
        {field("Address", "address")}
        <div className="grid grid-cols-2 gap-3">
          {field("Bedrooms", "bedrooms", "number")}
          {field("Bathrooms", "bathrooms", "number")}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgentProperties({ properties, token, onRefresh }) {
  const [editing, setEditing] = useState(null);

  return (
    <div className="space-y-5">
      {editing && (
        <EditPropertyModal
          property={editing}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={onRefresh}
        />
      )}

      <h1 className="text-2xl font-black text-gray-900">My Assigned Properties</h1>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <HiOfficeBuilding className="text-5xl text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 font-semibold">No properties assigned yet</p>
          <p className="text-xs text-gray-400 mt-1">Your landlord will assign properties to you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {properties.map(({ property, permissions, tenants: pts, assignedAt }) => (
            <div key={property.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Image */}
              <div className="h-40 bg-gray-100 relative">
                {property.mainImage
                  ? <img src={property.mainImage} alt={property.title} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center"><HiOfficeBuilding className="text-gray-300 text-4xl"/></div>
                }
                <span className={`absolute top-3 left-3 text-[10px] font-black px-2 py-0.5 rounded-full ${
                  property.verificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {property.verificationStatus || "pending"}
                </span>
                <span className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full ${
                  property.status === "occupied" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {property.status}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-black text-gray-900 text-sm">{property.title}</h3>
                  {permissions?.canEditDetails && (
                    <button onClick={() => setEditing(property)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg hover:bg-blue-100 transition shrink-0">
                      <HiPencil/> Edit
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">{property.district}{property.address ? `, ${property.address}` : ""}</p>
                <p className="text-sm font-bold text-blue-600 mt-2">RWF {Number(property.rentAmount).toLocaleString()}/mo</p>

                {/* Active tenants */}
                {pts?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Active Tenants</p>
                    {pts.map(t => (
                      <div key={t.id} className="flex items-center gap-2 mb-1.5">
                        <img src={`https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=dbeafe&color=2563eb&bold=true&size=24`}
                          className="w-6 h-6 rounded-full shrink-0" alt=""/>
                        <span className="text-xs font-semibold text-gray-700">{t.firstName} {t.lastName}</span>
                        <span className="text-xs text-gray-400 ml-auto">{t.email}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Permissions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Your Permissions</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(PERM_LABELS).map(([key, label]) => (
                      permissions?.[key] !== undefined ? (
                        <span key={key} className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                          permissions[key] ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400 line-through"
                        }`}>
                          {permissions[key] ? "✓" : "✗"} {label}
                        </span>
                      ) : null
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 mt-3">
                  Assigned {new Date(assignedAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}