// src/components/admin/ADDisputes.jsx
// Main entry — fetches disputes, holds state, composes sub-components
import React, { useState, useEffect } from "react";
import { HiRefresh } from "react-icons/hi";
import { API_BASE }   from "../../config";
import DisputeTable from "./disputes/DisputeTable";
import DetailDrawer from "./disputes/DetailDrawer";

export default function ADDisputes({ token }) {
  const [disputes,   setDisputes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState("all");
  const [category,   setCategory]   = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [page,       setPage]       = useState(1);

  // ── Fetch summary list ────────────────────────────────────────────────────
  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (status !== "all") params.set("status", status);
      const res  = await fetch(`${API_BASE}/disputes/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDisputes(data.data || []);
    } catch (err) {
      console.error("Failed to fetch disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDisputes(); setPage(1); }, [token, status]);

  // ── Update a single row after stage advance or resolve ───────────────────
  const handleAdvanced = (updated) =>
    setDisputes(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));

  const handleResolved = (updated) => {
    setDisputes(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));
    setSelectedId(null);
  };

  return (
    <>
      {selectedId && (
        <DetailDrawer
          disputeId={selectedId}
          token={token}
          onClose={() => setSelectedId(null)}
          onAdvanced={handleAdvanced}
          onResolved={handleResolved}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Dispute Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review, advance stages, and resolve all platform disputes
            </p>
          </div>
          <button onClick={fetchDisputes}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <HiRefresh className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <DisputeTable
          disputes={disputes}   loading={loading}
          search={search}       setSearch={setSearch}
          status={status}       setStatus={setStatus}
          category={category}   setCategory={setCategory}
          page={page}           setPage={setPage}
          onRefresh={fetchDisputes}
          onView={(id) => setSelectedId(id)}
        />
      </div>
    </>
  );
}