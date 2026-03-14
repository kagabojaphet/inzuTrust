import React, { useEffect, useState } from "react";
import { HiPlus, HiPencil, HiTrash, HiEye, HiSearch } from "react-icons/hi";
import { API_BASE } from "../../config";

const MOCK = [
  { id: 1, name: "Kigali Heights Apt 4B",  location: "KG 7 Ave, Kigali",       type: "Apartment", rent: 1200000, status: "Occupied", tenant: "Bosco M." },
  { id: 2, name: "Vision City Villa #12",   location: "Vision City, Kigali",    type: "Villa",     rent: 2500000, status: "Occupied", tenant: "Claire U." },
  { id: 3, name: "Kimironko Studio 2A",     location: "Kimironko, Kigali",      type: "Studio",    rent: 450000,  status: "Occupied", tenant: "Arangwa J." },
  { id: 4, name: "Rebero Heights Unit 5",   location: "Rebero, Kigali",         type: "Apartment", rent: 800000,  status: "Vacant",   tenant: null },
  { id: 5, name: "Nyarutarama Penthouse",   location: "Nyarutarama, Kigali",    type: "House",     rent: 3500000, status: "Vacant",   tenant: null },
];

const statusColors = { 
  Occupied: "bg-green-50 text-green-700 border border-green-100", 
  Vacant: "bg-yellow-50 text-yellow-700 border border-yellow-100" 
};

const formatRWF = (n) => `${(n / 1000).toLocaleString()}k RWF`;

export default function LDProperties({ token, setActive }) {
  const [properties, setProperties] = useState(MOCK);
  const [search, setSearch] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${API_BASE}/properties`, { headers });
        if (res.ok) {
          const d = await res.json();
          setProperties(d.data || MOCK);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    if (token) fetchProperties();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await fetch(`${API_BASE}/properties/${id}`, { method: "DELETE", headers });
      setProperties(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filtered = properties.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Properties</h2>
          <p className="text-sm text-gray-400 mt-0.5">{properties.length} total properties</p>
        </div>
        
        {/* Updated Button: Uses setActive from props to switch view */}
        <button 
          onClick={() => setActive("add-property")} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm"
        >
          <HiPlus /> Add Property
        </button>
      </div>

      <div className="relative w-72">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Search properties..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
            <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative">
               <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏠</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{p.name}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>{p.status}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">{p.location}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-blue-600">{formatRWF(p.rent)}/mo</span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{p.type}</span>
              </div>
              
              {p.tenant ? (
                <p className="text-[11px] text-gray-500 mb-3 flex items-center gap-1">
                  Tenant: <span className="font-bold text-gray-700">{p.tenant}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 italic mb-3">No active tenant</p>
              )}

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                  <HiEye /> View
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition">
                  <HiPencil /> Edit
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="w-10 flex items-center justify-center border border-red-100 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition">
                  <HiTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}