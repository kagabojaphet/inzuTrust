import { useState, useEffect, useRef } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const SUGGESTIONS = ["Kigali", "Gasabo", "Nyarutarama", "Kimironko", "Remera"];

export default function SearchModal({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const go = (q) => {
    onClose();

    const trimmed = q?.trim();

    // IMPORTANT: always go through backend via query param
    navigate(
      trimmed
        ? `/properties?search=${encodeURIComponent(trimmed)}`
        : "/properties"
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    go(query);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-wider">
            Search Properties
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-brand-blue-mid">
            <HiSearch className="text-gray-400 text-xl" />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search properties..."
              className="flex-1 bg-transparent focus:outline-none"
            />

            {query && (
              <button type="button" onClick={() => setQuery("")}>
                <HiX />
              </button>
            )}
          </div>

          <button className="mt-3 w-full bg-brand-blue-dark text-white py-3 rounded-lg font-bold">
            Search Properties
          </button>
        </form>

        {/* Suggestions */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => go(term)}
                className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}