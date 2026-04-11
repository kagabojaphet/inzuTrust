// src/components/admin/shared/ADTableShell.jsx
// Reusable table wrapper: header row + body + empty state + skeleton
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ADTableHeader({ cols }) {
  return (
    <div className={`grid gap-4 px-5 py-3.5 bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-400`}
      style={{ gridTemplateColumns: cols.map(c => c.width || "1fr").join(" ") }}>
      {cols.map((c, i) => <div key={i} className={c.align === "right" ? "text-right" : ""}>{c.label}</div>)}
    </div>
  );
}

export function ADEmptyState({ icon, title, sub }) {
  return (
    <div className="py-20 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-gray-600 font-bold">{title}</p>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function ADSkeletonRows({ cols, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-4 px-5 py-4 items-center border-b border-gray-50 last:border-0"
          style={{ gridTemplateColumns: cols.map(c => c.width || "1fr").join(" ") }}>
          {cols.map((_, j) => <Skeleton key={j} height={14} borderRadius={6}/>)}
        </div>
      ))}
    </>
  );
}

export default function ADTableShell({ cols, loading, empty, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <ADTableHeader cols={cols}/>
      <div className="divide-y divide-gray-50">
        {loading ? (
          <ADSkeletonRows cols={cols}/>
        ) : empty ? (
          empty
        ) : children}
      </div>
    </div>
  );
}