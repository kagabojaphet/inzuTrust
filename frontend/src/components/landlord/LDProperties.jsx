// src/components/landlord/LDProperties.jsx
import React, { useEffect, useState } from "react";
import { HiPlus, HiPencil, HiTrash, HiEye, HiSearch } from "react-icons/hi";
import { API_BASE } from "../../config";

const statusColors = { 
  Occupied: "bg-green-50 text-green-700 border border-green-100", 
  Vacant: "bg-yellow-50 text-yellow-700 border border-yellow-100" 
};

// Standardizing RWF display (e.g., 1,200,000 RWF)
const formatRWF = (n) => `${Number(n).toLocaleString()} RWF`;

export default function LDProperties({ token, setActive }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Memoized headers for consistency
  const headers = { 
    Authorization: `Bearer ${token}`, 
    "Content-Type": "application/json" 
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/properties`, { headers });
        const d = await res.json();
        
        if (res.ok) {
          // Fallback to empty array if data is missing
          setProperties(d.data || []); 
        } else {
          console.error("Server error:", d.message);
        }
      } catch (err) {
        console.error("Network fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProperties();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, { 
        method: "DELETE", 
        headers 
      });
      
      if (res.ok) {
        setProperties(p => p.filter(x => x.id !== id && x._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Filter logic: Checks name, location, or district
  const filtered = properties.filter(p => {
    const searchStr = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(searchStr) || 
      p.location?.toLowerCase().includes(searchStr) ||
      p.district?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Properties</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? "Loading..." : `${properties.length} total properties`}
          </p>
        </div>
        
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
          placeholder="Search by name or district..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition" 
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-400">Fetching your properties...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p._id || p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
              <div className="h-32 bg-gray-50 flex items-center justify-center relative">
                 {p.images && p.images[0] ? (
                   <img 
                    src={p.images[0]} 
                    alt={p.title} 
                    className="w-full h-full object-cover" 
                   />
                 ) : (
                   <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏠</span>
                 )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{p.title || p.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[p.status || 'Vacant']}`}>
                    {p.status || "Vacant"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2 truncate">
                  {p.district}, {p.sector}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-black text-blue-600">{formatRWF(p.rentAmount || p.rent)}/mo</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold capitalize">{p.type}</span>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                    <HiEye /> View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition">
                    <HiPencil /> Edit
                  </button>
                  <button onClick={() => handleDelete(p._id || p.id)}
                    className="w-10 flex items-center justify-center border border-red-100 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition">
                    <HiTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-12 text-center">
          <p className="text-gray-500 font-medium">No properties found matching your search.</p>
        </div>
      )}
    </div>
  );
}