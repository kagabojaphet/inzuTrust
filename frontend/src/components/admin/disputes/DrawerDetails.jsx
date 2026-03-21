// src/components/admin/disputes/DrawerDetails.jsx
// Details tab inside the detail drawer
import React from "react";
import { HiCheckCircle } from "react-icons/hi";
import { StageBar } from "./DisputeAtoms";
import { STAGE_LABELS, CATEGORY_LABELS, formatRWF, fmtDate } from "./disputeAdminHelpers";

export default function DrawerDetails({ dispute }) {
  return (
    <div className="p-6 space-y-4">

      {/* Stage progress */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
          Stage Progress — {STAGE_LABELS[dispute.stage]}
        </p>
        <StageBar stage={dispute.stage} />
        <div className="flex gap-3 mt-2">
          {STAGE_LABELS.map((lbl, i) => (
            <span key={i} className={`text-[9px] font-bold ${i <= dispute.stage ? "text-blue-600" : "text-gray-300"}`}>
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Parties + metadata grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { title: "Reporter (Filed)", party: dispute.reporter   },
          { title: "Respondent",       party: dispute.respondent },
        ].map(({ title, party }) => (
          <div key={title} className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{title}</p>
            {party ? (
              <>
                <p className="font-semibold text-gray-800 text-sm">{party.firstName} {party.lastName}</p>
                <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 inline-block">
                  {party.role}
                </span>
              </>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
        ))}

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Claim Amount</p>
          <p className="font-bold text-gray-900 text-sm">{formatRWF(dispute.claimAmount)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Category</p>
          <p className="font-semibold text-gray-800 text-sm">
            {CATEGORY_LABELS[dispute.category] || dispute.category}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Filed Date</p>
          <p className="font-semibold text-gray-800 text-sm">{fmtDate(dispute.createdAt)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Deadline</p>
          <p className={`font-semibold text-sm
            ${dispute.deadline && new Date(dispute.deadline) < new Date() ? "text-red-600" : "text-gray-800"}`}>
            {fmtDate(dispute.deadline)}
          </p>
        </div>
      </div>

      {/* Assigned mediator */}
      {dispute.assignedAdmin && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-black shrink-0">
            {dispute.assignedAdmin.firstName?.[0]}{dispute.assignedAdmin.lastName?.[0]}
          </div>
          <div>
            <p className="text-[10px] text-blue-500 font-bold uppercase">Assigned Mediator</p>
            <p className="text-sm font-semibold text-blue-800">
              {dispute.assignedAdmin.firstName} {dispute.assignedAdmin.lastName}
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Description</p>
        <p className="text-sm text-gray-700 leading-relaxed">{dispute.description}</p>
      </div>

      {/* Resolution (if closed) */}
      {dispute.resolution && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600 mb-2 flex items-center gap-1">
            <HiCheckCircle /> Final Resolution
          </p>
          <p className="text-sm text-green-800 leading-relaxed">{dispute.resolution}</p>
          <p className="text-[10px] text-green-500 mt-2 font-medium">
            Resolved on {fmtDate(dispute.resolvedAt)}
          </p>
        </div>
      )}
    </div>
  );
}