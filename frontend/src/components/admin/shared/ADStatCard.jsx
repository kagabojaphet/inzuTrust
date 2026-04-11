// src/components/admin/shared/ADStatCard.jsx
import Skeleton from "react-loading-skeleton";

export default function ADStatCard({ icon, label, value, sub, color = "blue", loading }) {
  const colors = {
    blue:   "bg-blue-500",   green: "bg-green-500",
    amber:  "bg-amber-500",  red:   "bg-red-500",
    purple: "bg-purple-500", indigo:"bg-indigo-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl text-white shrink-0 ${colors[color]||colors.blue}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-semibold">{label}</p>
        {loading
          ? <Skeleton width={60} height={24} borderRadius={6}/>
          : <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        }
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}