import React, { useEffect, useState } from "react";
import { HiPlus, HiX, HiDocumentText, HiCheckCircle, HiClock, HiExclamation } from "react-icons/hi";
import { API_BASE } from "../../config"; // Centralized config import

const MOCK = [
  { id: 1, tenant: "Bosco Mutabazi",  property: "Kigali Heights Apt 4B", start: "Jan 01, 2026", end: "Dec 31, 2026", rent: 1200000, status: "Active"  },
  { id: 2, tenant: "Claire Uwera",    property: "Vision City Villa #12",  start: "Mar 01, 2026", end: "Feb 28, 2027", rent: 2500000, status: "Active"  },
  { id: 3, tenant: "Arangwa Jean",    property: "Kimironko Studio 2A",    start: "Jul 01, 2025", end: "Jun 30, 2026", rent: 450000,  status: "Expiring" },
  { id: 4, tenant: "David Nzeyimana", property: "Rebero Heights Unit 5",  start: "Nov 01, 2024", end: "Oct 31, 2025", rent: 800000,  status: "Expired" },
];

const statusStyle = {
  Active:   { badge: "bg-green-50 text-green-700 border border-green-200",   icon: <HiCheckCircle className="text-green-600" /> },
  Expiring: { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200", icon: <HiClock className="text-yellow-600" />       },
  Expired:  { badge: "bg-red-50 text-red-600 border border-red-200",          icon: <HiExclamation className="text-red-500" />    },
};

const formatRWF = (n) => `${(n / 1000).toLocaleString()}k RWF`;

export default function LDAgreements({ token }) {
  const [agreements, setAgreements] = useState(MOCK);
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [form, setForm] = useState({ tenant: "", property: "", start: "", end: "", rent: "" });

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const res = await fetch(`${API_BASE}/agreements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { 
          const d = await res.json(); 
          setAgreements(d.data || MOCK); 
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchAgreements();
  }, [token]);

  const handleCreate = async () => {
    if (!form.tenant || !form.property || !form.start || !form.end) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agreements`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rent: Number(form.rent) }),
      });
      
      if (res.ok) {
        const d = await res.json();
        setAgreements(a => [d.data, ...a]);
      } else {
        // Fallback for local testing if backend isn't ready
        throw new Error("Backend unreachable");
      }
    } catch {
      // Local UI update for demo/testing
      const newAgreement = { 
        id: Date.now(), 
        ...form, 
        rent: Number(form.rent), 
        status: "Active" 
      };
      setAgreements(a => [newAgreement, ...a]);
    } finally {
      setShowForm(false);
      setLoading(false);
      setForm({ tenant: "", property: "", start: "", end: "", rent: "" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Agreements</h2>
          <p className="text-sm text-gray-400 mt-0.5">{agreements.length} lease agreements</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          <HiPlus /> New Lease
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-3">TENANT</div>
          <div className="col-span-3">PROPERTY</div>
          <div className="col-span-2">PERIOD</div>
          <div className="col-span-2">RENT</div>
          <div className="col-span-2">STATUS</div>
        </div>
        <div className="divide-y divide-gray-50">
          {agreements.map((a, i) => {
            const s = statusStyle[a.status] || statusStyle.Active;
            return (
              <div key={a.id || i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
                <div className="col-span-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <HiDocumentText className="text-blue-500 text-sm" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{a.tenant}</span>
                </div>
                <div className="col-span-3 text-sm text-gray-600 truncate">{a.property}</div>
                <div className="col-span-2 text-xs text-gray-500">
                  <p>{a.start}</p>
                  <p className="text-gray-400">{a.end}</p>
                </div>
                <div className="col-span-2 text-sm font-bold text-blue-600">{formatRWF(a.rent)}/mo</div>
                <div className="col-span-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${s.badge}`}>
                    {s.icon} {a.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">Create Lease Agreement</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <HiX className="text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Tenant Name",    key: "tenant",   placeholder: "e.g. Bosco Mutabazi" },
                { label: "Property",       key: "property", placeholder: "e.g. Kigali Heights Apt 4B" },
                { label: "Start Date",     key: "start",    type: "date" },
                { label: "End Date",       key: "end",      type: "date" },
                { label: "Monthly Rent",   key: "rent",     placeholder: "e.g. 1200000", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{f.label}</label>
                  <input 
                    type={f.type || "text"} 
                    placeholder={f.placeholder}
                    value={form[f.key]} 
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" 
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60">
                  {loading ? "Creating..." : "Create Lease"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}