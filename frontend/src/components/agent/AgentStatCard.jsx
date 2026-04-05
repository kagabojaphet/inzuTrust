// src/components/agent/AgentStatCard.jsx
export default function AgentStatCard({ label, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue:  "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red:   "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="text-xl"/>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value ?? "—"}</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
} 