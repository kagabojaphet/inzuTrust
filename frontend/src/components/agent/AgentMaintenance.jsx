// src/components/agent/AgentMaintenance.jsx
import { useState } from "react";
import { HiCog, HiRefresh } from "react-icons/hi";
import { PriorityBadge, StatusBadge } from "./AgentBadges";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AgentMaintenance({ token, requests, loading, onRefresh }) {
  const [updating, setUpdating] = useState(null);

  const updateStatus = async (id, status, note = "") => {
    setUpdating(id);
    try {
      await fetch(`${API}/maintenance/${id}/status`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ status, resolutionNote: note || undefined }),
      });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-gray-900">Maintenance Tasks</h1>
        <button onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
          <HiRefresh/> Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-gray-400 text-sm">Loading tasks...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <HiCog className="text-5xl text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 font-semibold">No maintenance tasks assigned</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl border overflow-hidden ${r.priority === "emergency" ? "border-red-300" : "border-gray-200"}`}>
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <PriorityBadge priority={r.priority}/>
                      <StatusBadge status={r.status}/>
                    </div>
                    <h3 className="font-black text-gray-900">{r.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.property?.title} · Filed by {r.tenant?.firstName} {r.tenant?.lastName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}
                  </p>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">{r.description}</p>

                {/* Evidence images */}
                {r.images?.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {r.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="h-20 w-24 object-cover rounded-xl shrink-0 border border-gray-100"/>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {!["resolved","rejected","cancelled"].includes(r.status) && (
                  <div className="flex gap-2 flex-wrap">
                    {r.status === "open" && (
                      <button disabled={updating === r.id} onClick={() => updateStatus(r.id, "acknowledged")}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                        Acknowledge
                      </button>
                    )}
                    {["open","acknowledged"].includes(r.status) && (
                      <button disabled={updating === r.id} onClick={() => updateStatus(r.id, "in_progress")}
                        className="px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition disabled:opacity-60">
                        Start Work
                      </button>
                    )}
                    {r.status === "in_progress" && (
                      <button disabled={updating === r.id}
                        onClick={() => {
                          const note = prompt("Describe what was done to resolve this:");
                          if (note !== null) updateStatus(r.id, "resolved", note);
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition disabled:opacity-60">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                )}

                {/* Tenant rating */}
                {r.status === "resolved" && r.tenantRating && (
                  <p className="text-xs text-gray-400 mt-3">
                    Tenant rated: {"⭐".repeat(r.tenantRating)} ({r.tenantRating}/5)
                    {r.tenantFeedback && ` — "${r.tenantFeedback}"`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}