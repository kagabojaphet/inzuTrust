// src/components/shared/dispute/DisputeSidebar.jsx

import React from "react";
import { HiPlus, HiRefresh } from "react-icons/hi";
import { mapStatus, STATUS_STYLE, fmtDate } from "./disputeHelpers";

export default function DisputeSidebar({
  disputes,
  selected,
  loading,
  search,
  setSearch,
  filter,
  setFilter,
  onSelect,
  onRefresh,
  onNew,
  mobile = false,
}) {
  const FILTERS = ["All", "Open", "Review", "Mediation", "Resolved"];

  const filtered = disputes.filter((d) => {
    const display = mapStatus(d.status);

    const matchF =
      filter === "All" || display === filter;

    const matchS =
      !search ||
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.docId?.toLowerCase().includes(search.toLowerCase());

    return matchF && matchS;
  });

  return (
    <div
      className={`
        bg-white flex flex-col shrink-0 border-r border-gray-200
        ${mobile ? "w-full h-full" : "w-72"}
      `}
    >

      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Active Disputes
          </p>

          <button
            onClick={onRefresh}
            title="Refresh"
            className="text-gray-400 hover:text-blue-600 transition"
          >
            <HiRefresh className="text-base" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search disputes..."
            className="w-full bg-gray-50 text-gray-700 text-xs placeholder:text-gray-400 rounded-xl px-4 py-2.5 border border-gray-100 outline-none focus:border-blue-500 focus:bg-white transition shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                filter === f
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="px-3 py-4 animate-pulse"
            >
              <div className="h-2.5 bg-gray-100 rounded w-1/2 mb-2" />

              <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />

              <div className="h-2.5 bg-gray-100 rounded w-2/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-gray-400 text-xs">
              {search
                ? "No disputes match your search"
                : "No disputes yet"}
            </p>
          </div>
        ) : (
          filtered.map((d) => {
            const ds =
              STATUS_STYLE[mapStatus(d.status)] ||
              STATUS_STYLE.Open;

            const isActive =
              selected?.id === d.id;

            return (
              <div
                key={d.id}
                onClick={() => onSelect(d)}
                className={`px-4 py-4 cursor-pointer rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50/50 border border-blue-100 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5 gap-2">
                  <p
                    className={`text-[10px] font-mono font-bold ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    #{d.docId}
                  </p>

                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 uppercase tracking-tighter ${ds.badge}`}
                  >
                    {mapStatus(d.status)}
                  </span>
                </div>

                <p
                  className={`text-sm font-bold leading-tight mb-1 break-words ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {d.title}
                </p>

                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className="text-[10px] text-gray-500 truncate max-w-[140px]">
                    {d.property?.title ||
                      "No Property linked"}
                  </p>

                  <p className="text-[9px] text-gray-400 font-medium shrink-0">
                    {fmtDate(d.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom button */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-[#03609b] hover:bg-[#024d7c] text-white py-3 rounded-xl text-sm font-bold transition shadow-lg shadow-gray-200"
        >
          <HiPlus className="text-lg" />
          File New Dispute
        </button>
      </div>
    </div>
  );
}