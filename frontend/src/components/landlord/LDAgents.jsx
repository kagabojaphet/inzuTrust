// src/components/landlord/LDAgents.jsx
import React, { useState, useEffect, useCallback } from "react";
import { HiUserAdd, HiRefresh, HiSearch, HiUsers } from "react-icons/hi";
import { fetchAgents, fetchProperties } from "./agents/agentHelpers";
import AgentTable      from "./agents/AgentTable";
import AgentDrawer     from "./agents/AgentDrawer";
import CreateAgentModal from "./agents/CreateAgentModal";

export default function LDAgents({ token }) {
  const [agents,      setAgents]      = useState([]);
  const [properties,  setProperties]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [showCreate,  setShowCreate]  = useState(false);
  const [viewing,     setViewing]     = useState(null); // agentData for drawer

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [a, p] = await Promise.all([fetchAgents(token), fetchProperties(token)]);
      setAgents(a);
      setProperties(p);
    } catch (e) {
      console.error("[LDAgents]", e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = agents.filter(({ agent: a }) =>
    !search ||
    `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdated = () => {
    loadAll();
    // Refresh drawer data if open
    if (viewing) {
      setViewing(null); // close and reopen after refresh would need state-linking; close for now
    }
  };

  return (
    <div className="space-y-6">

      {/* Modals */}
      {showCreate && (
        <CreateAgentModal
          token={token}
          properties={properties}
          onCreated={() => { setShowCreate(false); loadAll(); }}
          onClose={() => setShowCreate(false)}
        />
      )}
      {viewing && (
        <AgentDrawer
          agentData={viewing}
          token={token}
          allProperties={properties}
          onClose={() => setViewing(null)}
          onUpdated={() => { loadAll(); setViewing(null); }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Agents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create agent accounts and assign them to manage your properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="p-2.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition"
            title="Refresh"
          >
            <HiRefresh className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            <HiUserAdd /> Add Agent
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {!loading && agents.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Agents",      value: agents.length,                                          color: "bg-blue-50 text-blue-700"  },
            { label: "Properties Covered", value: new Set(agents.flatMap(a => a.properties.map(p => p.id))).size, color: "bg-indigo-50 text-indigo-700" },
            { label: "Verified Agents",   value: agents.filter(({ agent: a }) => a.isVerified).length,   color: "bg-green-50 text-green-700" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                <HiUsers className="text-lg" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative w-80">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Empty state */}
      {!loading && agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiUserAdd className="text-3xl text-blue-400" />
          </div>
          <p className="text-gray-700 font-bold text-base">No agents yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6 max-w-xs mx-auto">
            Create agent accounts to delegate property management tasks to your team.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition"
          >
            Add First Agent
          </button>
        </div>
      ) : (
        <AgentTable
          agents={filtered}
          loading={loading}
          onView={setViewing}
          onRevokeProperty={() => {}}
          onAddProperty={() => {}}
        />
      )}
    </div>
  );
}