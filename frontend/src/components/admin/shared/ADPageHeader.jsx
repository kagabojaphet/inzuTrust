// src/components/admin/shared/ADPageHeader.jsx
import { HiRefresh } from "react-icons/hi";

export default function ADPageHeader({ title, sub, onRefresh, loading, children }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button onClick={onRefresh}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold hover:bg-gray-50 transition">
            <HiRefresh className={loading ? "animate-spin" : ""}/>
            Refresh
          </button>
        )}
        {children}
      </div>
    </div>
  );
}