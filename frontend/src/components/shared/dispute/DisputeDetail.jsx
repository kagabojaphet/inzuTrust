// src/components/shared/dispute/DisputeDetail.jsx
import React from "react";
import {
  HiCheckCircle, HiDocumentText, HiShieldCheck,
  HiClock, HiExclamation, HiInformationCircle,
  HiDownload, HiPaperAirplane, HiPhotograph, HiUpload
} from "react-icons/hi";
import {
  STAGES, STATUS_STYLE, mapStatus,
  formatRWF, fmtDate
} from "./disputeHelpers";
import { API_BASE } from "../../../config";

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ stage }) {
  return (
    <div className="flex items-center justify-between mb-6 relative">
      <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 z-0"/>
      <div
        className="absolute top-5 left-0 h-[2px] bg-blue-500 z-0 transition-all duration-500"
        style={{ width: `${(stage / 3) * 100}%` }}
      />
      {STAGES.map((s, i) => {
        const done   = stage > i;
        const active = stage === i;
        return (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              done   ? "bg-blue-500 border-blue-500" :
              active ? "bg-white border-blue-500 ring-4 ring-blue-50" :
                       "bg-white border-gray-200"
            }`}>
              {done
                ? <HiCheckCircle className="text-white text-lg"/>
                : active
                  ? <div className="w-3 h-3 rounded-full bg-blue-500"/>
                  : <div className="w-3 h-3 rounded-full bg-gray-300"/>
              }
            </div>
            <span className={`text-xs font-bold ${done || active ? "text-blue-600" : "text-gray-400"}`}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DisputeDetail({ dispute: sel, token, onEvidenceUploaded }) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState("");

  const handleUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      const res  = await fetch(`${API_BASE}/disputes/${sel.id}/evidence`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      if (onEvidenceUploaded) onEvidenceUploaded();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };
  const status = mapStatus(sel.status);
  const ss     = STATUS_STYLE[status] || STATUS_STYLE.Open;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-xl font-black text-gray-900">{sel.title}</h2>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${ss.badge}`}>
                {status === "Review" ? "REVIEW IN PROGRESS" : status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <HiShieldCheck className="text-gray-400"/> ID: #{sel.docId}
              </span>
              {sel.property && (
                <span className="flex items-center gap-1">
                  <HiDocumentText className="text-gray-400"/> {sel.property.title}
                </span>
              )}
              <span className="flex items-center gap-1">
                <HiClock className="text-gray-400"/> Filed {fmtDate(sel.createdAt)}
              </span>
              {sel.deadline && (
                <span className="flex items-center gap-1 text-orange-500 font-semibold">
                  <HiExclamation className="shrink-0"/> Deadline: {fmtDate(sel.deadline)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition">
              <HiDownload/> Export PDF
            </button>
            {status !== "Resolved" && status !== "Closed" && (
              <button className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition">
                <HiPaperAirplane/> Submit Response
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 px-6 pt-5 pb-4">
          <ProgressBar stage={sel.stage || 0}/>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-sm text-blue-700">
            <HiInformationCircle className="text-blue-500 shrink-0 mt-0.5"/>
            <div>
              <p className="font-bold">Current Stage: {STAGES[sel.stage || 0]}</p>
              {sel.deadline && (
                <p className="text-xs text-blue-600 mt-0.5">
                  Both parties have until {fmtDate(sel.deadline)} to submit supporting documents.
                  InzuTrust mediators will review files within 48 hours.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dispute details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-black text-gray-900 text-sm flex items-center gap-2 mb-3">
            <HiDocumentText className="text-gray-400"/> Dispute Details
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{sel.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Claim Amount</p>
              <p className="text-lg font-black text-gray-900">{formatRWF(sel.claimAmount)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Category</p>
              <p className="text-lg font-black text-gray-900 capitalize">
                {sel.category?.replace("_", " ") || "—"}
              </p>
            </div>
          </div>
          {sel.respondent && (
            <div className="mt-3 bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Respondent</p>
              <p className="text-sm font-bold text-gray-900">
                {sel.respondent.firstName} {sel.respondent.lastName}
                <span className="ml-2 text-[10px] text-gray-400 font-normal capitalize">({sel.respondent.role})</span>
              </p>
            </div>
          )}
          {sel.resolution && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              <span className="font-bold">Resolution: </span>{sel.resolution}
            </div>
          )}
        </div>

        {/* Evidence vault */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <HiDocumentText className="text-gray-400"/> Evidence Vault
            </h3>
            <label className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer transition ${
              uploading ? "text-gray-400" : "text-blue-600 hover:underline"
            }`}>
              <input type="file" multiple className="hidden"
                disabled={uploading}
                onChange={e => handleUpload(e.target.files)}/>
              {uploading
                ? <><div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"/> Uploading...</>
                : <><HiUpload/> Upload New</>
              }
            </label>
          </div>

          {uploadError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl">{uploadError}</div>
          )}
          {(sel.evidence || []).length === 0 ? (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition">
              <input type="file" multiple className="hidden"
                onChange={e => handleUpload(e.target.files)}/>
              <HiUpload className="text-gray-400 text-2xl mb-1.5"/>
              <p className="text-xs text-gray-500 font-medium">Drag files or click to upload</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Photos, PDFs, documents</p>
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(sel.evidence || []).map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition cursor-pointer">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    f.fileType === "pdf" ? "bg-red-100" : f.fileType === "image" ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    {f.fileType === "pdf"
                      ? <HiDocumentText className="text-red-500"/>
                      : f.fileType === "image"
                        ? <HiPhotograph className="text-blue-500"/>
                        : <HiDocumentText className="text-gray-500"/>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{f.fileName}</p>
                    <p className="text-[10px] text-gray-400">
                      {f.fileSize} · {f.uploader ? `${f.uploader.firstName} ${f.uploader.lastName}` : "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
              {/* Drop zone */}
              <label className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition">
                <input type="file" multiple className="hidden"
                  onChange={e => handleUpload(e.target.files)}/>
                <HiUpload className="text-gray-400 text-xl mb-1"/>
                <p className="text-[10px] text-gray-400 text-center">Add more files</p>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}