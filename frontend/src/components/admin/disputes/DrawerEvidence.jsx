// src/components/admin/disputes/DrawerEvidence.jsx
// Evidence tab inside the detail drawer
import React from "react";
import { HiPhotograph, HiDocumentText, HiDownload } from "react-icons/hi";
import { fmtDate } from "./disputeAdminHelpers";

function EvidenceIcon({ type }) {
  if (type === "image") return <HiPhotograph className="text-blue-500 text-xl" />;
  if (type === "pdf")   return <HiDocumentText className="text-red-500 text-xl" />;
  return <HiDocumentText className="text-gray-500 text-xl" />;
}

export default function DrawerEvidence({ evidence = [] }) {
  if (evidence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center p-6">
        <HiPhotograph className="text-4xl text-gray-200 mb-3" />
        <p className="text-sm font-semibold text-gray-400">No evidence uploaded yet</p>
        <p className="text-xs text-gray-300 mt-1">Parties upload files during Evidence Review stage</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-4">
        {evidence.length} File{evidence.length !== 1 ? "s" : ""} Submitted
      </p>

      {evidence.map(ev => (
        <div key={ev.id}
          className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition group">

          {/* Thumbnail for images, icon for docs */}
          {ev.fileType === "image" ? (
            <img
              src={ev.fileUrl}
              alt={ev.fileName}
              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border
              ${ev.fileType === "pdf" ? "bg-red-50 border-red-200" : "bg-gray-100 border-gray-200"}`}>
              <EvidenceIcon type={ev.fileType} />
            </div>
          )}

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700 transition">
              {ev.fileName}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span className="text-[10px] text-gray-400">{ev.fileSize}</span>
              {ev.uploader && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">
                    By <span className="font-semibold text-gray-600">
                      {ev.uploader.firstName} {ev.uploader.lastName}
                    </span>
                  </span>
                </>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-[10px] text-gray-400">{fmtDate(ev.createdAt)}</span>
            </div>
          </div>

          {/* Download button */}
          <a
            href={ev.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition shrink-0"
            title="Download file"
          >
            <HiDownload className="text-sm" />
          </a>
        </div>
      ))}
    </div>
  );
}