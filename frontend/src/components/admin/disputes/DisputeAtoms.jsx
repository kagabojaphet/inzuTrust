// src/components/admin/disputes/DisputeAtoms.jsx
// Small reusable UI pieces used across all dispute components
import React from "react";
import { STATUS_META, STAGE_LABELS } from "./disputeAdminHelpers";

// ── Status badge pill ─────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${m.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label.toUpperCase()}
    </span>
  );
}

// ── 4-step stage progress bar ─────────────────────────────────────────────────
export function StageBar({ stage }) {
  return (
    <div className="flex items-center gap-1">
      {STAGE_LABELS.map((_, i) => (
        <React.Fragment key={i}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 transition-all
            ${i < stage   ? "bg-green-500 border-green-500 text-white"
            : i === stage ? "bg-blue-600 border-blue-600 text-white"
            :               "bg-white border-gray-200 text-gray-300"}`}>
            {i < stage ? "✓" : i + 1}
          </div>
          {i < 3 && (
            <div className={`h-0.5 w-4 transition-all ${i < stage ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}