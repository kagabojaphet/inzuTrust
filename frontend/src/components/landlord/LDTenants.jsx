import React, { useEffect, useState } from "react";
import { HiSearch, HiChevronRight, HiX, HiShieldCheck, HiPhone, HiMail } from "react-icons/hi";
import { API_BASE } from "../../config"; // Fixed import path

const MOCK_TENANTS = [
  { id: 1, firstName: "Bosco",   lastName: "Mutabazi", email: "bosco@gmail.com",  phone: "+250788111111", property: "Kigali Heights Apt 4B", risk: "Low",     status: "Verified",       trustScore: 88, rentAmount: 1200000 },
  { id: 2, firstName: "Claire",  lastName: "Uwera",    email: "claire@gmail.com", phone: "+250788222222", property: "Vision City Villa #12",  risk: "Medium", status: "Pending Check", trustScore: 65, rentAmount: 2500000 },
  { id: 3, firstName: "Arangwa", lastName: "Jean",     email: "aj@gmail.com",     phone: "+250788333333", property: "Kimironko Studio 2A",    risk: "Low",     status: "Verified",       trustScore: 91, rentAmount: 450000 },
];

const riskColor = { 
  Low: "text-green-600 bg-green-50", 
  Medium: "text-yellow-600 bg-yellow-50", 
  High: "text-red-600 bg-red-50" 
};

const riskBar = { 
  Low: "bg-green-500", 
  Medium: "bg-yellow-400", 
  High: "bg-red-500" 
};

const statusBadge = {
  "Verified":      "bg-green-50 text-green-700 border border-green-200",
  "Pending Check": "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const formatRWF = (n) => `${(n / 1000).toLocaleString()}k RWF`;

export function LDTenants({ token }) {
  const [tenants, setTenants] = useState(MOCK_TENANTS);
  const [search,  setSearch]  = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await fetch(`${API_BASE}/landlords/tenants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { 
          const d = await res.json(); 
          setTenants(d.data || MOCK_TENANTS); 
        }
      } catch (err) {
        console.error("Error fetching tenants:", err);
      }
    };

    if (token) fetchTenants();
  }, [token]);

  const filtered = tenants.filter(t =>
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    t.property?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Tenants</h2>
          <p className="text-sm text-gray-400 mt-0.5">{tenants.length} active tenants</p>
        </div>
        <div className="relative w-64">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tenants..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-3">TENANT</div>
          <div className="col-span-3">PROPERTY</div>
          <div className="col-span-1">TRUST</div>
          <div className="col-span-2">RISK</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map(t => (
            <div key={t.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition">
              <div className="col-span-3 flex items-center gap-2.5">
                <img 
                  src={`https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=dbeafe&color=2563eb&bold=true&size=32`}
                  className="w-8 h-8 rounded-full shrink-0" 
                  alt={t.firstName} 
                />
                <div className="truncate">
                  <p className="text-sm font-semibold text-gray-900 truncate">{t.firstName} {t.lastName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{t.email}</p>
                </div>
              </div>
              <div className="col-span-3 text-sm text-gray-700 font-medium truncate">{t.property}</div>
              <div className="col-span-1">
                <span className="text-sm font-black text-blue-600">{t.trustScore}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${riskBar[t.risk]}`}
                    style={{ width: t.risk === "Low" ? "35%" : t.risk === "Medium" ? "65%" : "90%" }} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskColor[t.risk]}`}>{t.risk}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[t.status] || statusBadge["Verified"]}`}>
                  {t.status}
                </span>
              </div>
              <div className="col-span-1 text-right">
                <button 
                  onClick={() => setSelected(t)}
                  className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition ml-auto shadow-sm"
                >
                  <HiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tenant detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50 transition-opacity">
          <div className="bg-white w-80 h-full overflow-y-auto p-6 shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">Tenant Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 transition">
                <HiX className="text-xl" />
              </button>
            </div>
            <div className="text-center mb-6">
              <img 
                src={`https://ui-avatars.com/api/?name=${selected.firstName}+${selected.lastName}&background=dbeafe&color=2563eb&bold=true&size=64`}
                className="w-16 h-16 rounded-full mx-auto mb-3 shadow-sm" 
                alt={selected.firstName} 
              />
              <h4 className="font-black text-gray-900">{selected.firstName} {selected.lastName}</h4>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge[selected.status] || statusBadge["Verified"]}`}>
                {selected.status}
              </span>
            </div>
            <div className="space-y-1">
              {[
                { label: "Email",    value: selected.email,    icon: <HiMail className="text-blue-500"/> },
                { label: "Phone",    value: selected.phone,    icon: <HiPhone className="text-blue-500"/> },
                { label: "Property", value: selected.property, icon: <HiShieldCheck className="text-blue-500"/> },
                { label: "Monthly Rent", value: formatRWF(selected.rentAmount || 0) },
                { label: "Trust Score",  value: `${selected.trustScore} / 100` },
                { label: "Risk Level",   value: selected.risk },
              ].map((row, i) => (
                <div key={i} className="flex flex-col py-3 border-b border-gray-50 last:border-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{row.label}</span>
                  <div className="flex items-center gap-2">
                    {row.icon && <span className="text-sm">{row.icon}</span>}
                    <span className="text-sm font-semibold text-gray-800">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setSelected(null)}
              className="w-full mt-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LDTenants;