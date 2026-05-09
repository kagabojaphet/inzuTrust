// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { HiSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by neighborhood, street or landmark..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-3xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>
      </form>
    </div>
  );
}