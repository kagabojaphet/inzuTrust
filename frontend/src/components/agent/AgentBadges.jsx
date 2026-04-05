// src/components/agent/AgentBadges.jsx
export function PriorityBadge({ priority }) {
  const s = {
    emergency: "bg-red-100 text-red-700 border border-red-200",
    high:      "bg-orange-50 text-orange-700 border border-orange-200",
    medium:    "bg-amber-50 text-amber-700 border border-amber-200",
    low:       "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${s[priority] || s.low}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = {
    open:         "bg-blue-50 text-blue-700",
    acknowledged: "bg-indigo-50 text-indigo-700",
    in_progress:  "bg-amber-50 text-amber-700",
    resolved:     "bg-green-50 text-green-700",
    rejected:     "bg-red-50 text-red-600",
    cancelled:    "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${s[status] || s.open}`}>
      {status?.replace("_", " ")}
    </span>
  );
}