// src/components/shared/dispute/NewDisputeModal.jsx

// Both tenant AND landlord select from agreements — respondentId filled automatically
import React, { useState, useEffect } from "react";
import { HiX, HiExclamationCircle, HiCheckCircle } from "react-icons/hi";
import { API_BASE } from "../../../config";
import { CATEGORIES } from "./disputeHelpers";

const inp =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

export default function NewDisputeModal({
  token,
  userRole,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    title: "",
    category: "payment",
    claimAmount: "",
    description: "",
    propertyId: "",
    respondentId: "",
    agreementId: "",
  });

  const [agreements, setAgreements] = useState([]);
  const [loadingOpts, setLoadingOpts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoFilled, setAutoFilled] = useState(null);

  const up = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Load agreements ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOpts(true);

      try {
        const endpoint =
          userRole === "tenant"
            ? `${API_BASE}/agreements/my`
            : `${API_BASE}/agreements`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setAgreements(data.data || []);
      } catch (e) {
        console.warn("Failed to load agreements:", e);
      } finally {
        setLoadingOpts(false);
      }
    };

    loadOptions();
  }, [token, userRole]);

  // ── Agreement select ────────────────────────────────────────────────────────
  const handleAgreementSelect = (e) => {
    const agId = e.target.value;

    up("agreementId", agId);

    if (!agId) {
      up("propertyId", "");
      up("respondentId", "");
      setAutoFilled(null);
      return;
    }

    const ag = agreements.find((a) => String(a.id) === String(agId));

    if (!ag) return;

    if (userRole === "tenant") {
      up("propertyId", ag.propertyId || ag.property?.id || "");
      up("respondentId", ag.landlordId || "");

      setAutoFilled({
        property: ag.property?.title || ag.propertyAddress || "Property",
        respondent: ag.landlordName || "Landlord",
        respondentRole: "Landlord",
        docId: ag.docId,
      });
    } else {
      up("propertyId", ag.propertyId || ag.property?.id || "");
      up("respondentId", ag.tenantId || "");

      setAutoFilled({
        property: ag.property?.title || ag.propertyAddress || "Property",
        respondent:
          ag.tenantName ||
          `${ag.tenant?.firstName || ""} ${
            ag.tenant?.lastName || ""
          }`.trim() ||
          "Tenant",
        respondentRole: "Tenant",
        docId: ag.docId,
      });
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      return setError("Dispute title is required.");
    }

    if (!form.description.trim()) {
      return setError("Description is required.");
    }

    if (!form.agreementId) {
      return setError("Please select a related lease agreement.");
    }

    if (!form.respondentId) {
      return setError(
        "Could not determine respondent. Please re-select the agreement."
      );
    }

    setError("");
    setLoading(true);

    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        claimAmount: form.claimAmount
          ? Number(form.claimAmount)
          : undefined,
        propertyId: form.propertyId || undefined,
        respondentId: form.respondentId || undefined,
        agreementId: form.agreementId || undefined,
      };

      const res = await fetch(`${API_BASE}/disputes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to file dispute");
      }

      onCreated(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Agreement label ─────────────────────────────────────────────────────────
  const agreementLabel = (a) => {
    const property =
      a.property?.title || a.propertyAddress || "Property";

    const other =
      userRole === "tenant"
        ? a.landlordName || "Landlord"
        : a.tenantName ||
          `${a.tenant?.firstName || ""} ${
            a.tenant?.lastName || ""
          }`.trim() ||
          "Tenant";

    return `${property} · ${other} · ${a.docId}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              File New Dispute
            </h2>

            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Select a lease agreement — property and respondent
              will be filled automatically
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition shrink-0"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
              <HiExclamationCircle className="shrink-0 text-lg mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Agreement selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
              Related Lease Agreement *
            </label>

            {loadingOpts ? (
              <div className={`${inp} text-gray-400`}>
                Loading your agreements...
              </div>
            ) : agreements.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                No signed agreements found.{" "}
                {userRole === "tenant"
                  ? "You need an active lease to file a dispute."
                  : "You need a signed agreement with a tenant to file a dispute."}
              </div>
            ) : (
              <select
                value={form.agreementId}
                onChange={handleAgreementSelect}
                className={inp}
              >
                <option value="">
                  — Select your lease agreement —
                </option>

                {agreements.map((a) => (
                  <option key={a.id} value={a.id}>
                    {agreementLabel(a)}
                  </option>
                ))}
              </select>
            )}

            {/* Auto-filled */}
            {autoFilled && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1">
                <div className="flex items-center gap-2 font-black text-blue-800">
                  <HiCheckCircle className="text-green-500 text-base" />

                  <span>
                    Auto-filled from agreement {autoFilled.docId}
                  </span>
                </div>

                <div className="text-gray-600 break-words">
                  <span className="font-semibold">Property:</span>{" "}
                  {autoFilled.property}
                </div>

                <div className="text-gray-600 break-words">
                  <span className="font-semibold">
                    Respondent ({autoFilled.respondentRole}):
                  </span>{" "}
                  {autoFilled.respondent}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
              Dispute Title *
            </label>

            <input
              value={form.title}
              onChange={(e) => up("title", e.target.value)}
              placeholder="e.g. Security Deposit Withheld"
              className={inp}
            />
          </div>

          {/* Category + Claim Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Category
              </label>

              <select
                value={form.category}
                onChange={(e) => up("category", e.target.value)}
                className={inp}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Claim Amount (RWF)
              </label>

              <input
                type="number"
                value={form.claimAmount}
                onChange={(e) => up("claimAmount", e.target.value)}
                placeholder="800000"
                className={inp}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
              Description *
            </label>

            <textarea
              value={form.description}
              onChange={(e) => up("description", e.target.value)}
              rows={5}
              placeholder="Describe the dispute in detail — include dates, amounts, what happened and what resolution you seek..."
              className={`${inp} resize-none`}
            />

            <p className="text-[10px] text-gray-400 mt-1">
              {form.description.length}/1000
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">

            <button
              onClick={onClose}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                loadingOpts ||
                agreements.length === 0
              }
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Filing...
                </>
              ) : (
                "File Dispute"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}