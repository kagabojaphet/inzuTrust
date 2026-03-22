// src/components/tenant/ApplyLeaseModal.jsx
import React, { useState } from "react";
import { HiX, HiCheckCircle } from "react-icons/hi";
import { API_BASE } from "../../config";

export default function ApplyLeaseModal({ property, token, onClose, onSuccess }) {
  const [message,    setMessage]    = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [duration,   setDuration]   = useState(12);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const today = new Date().toISOString().split("T")[0];
  const inp   = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return setError("Please write a message to the landlord.");
    if (!moveInDate)      return setError("Please select your preferred move-in date.");
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/lease-applications`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property.id,
          message:    message.trim(),
          moveInDate,
          duration:   Number(duration),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Application failed");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900">Apply for Lease</h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{property.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <HiX className="text-xl"/>
          </button>
        </div>

        {/* Rent summary */}
        <div className="mx-6 mt-5 bg-blue-50 border border-blue-100 rounded-xl p-3 flex justify-between items-center">
          <span className="text-sm font-bold text-blue-800">Monthly Rent</span>
          <span className="text-lg font-black text-blue-700">
            {Number(property.rentAmount).toLocaleString()} RWF
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Move-in Date *
              </label>
              <input
                type="date"
                min={today}
                value={moveInDate}
                onChange={e => setMoveInDate(e.target.value)}
                className={inp}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Duration
              </label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className={inp}>
                {[3, 6, 12, 18, 24].map(m => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
              Message to Landlord *
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              placeholder="Introduce yourself — employment, rental history, why this property suits you..."
              className={`${inp} resize-none`}
            />
            <p className="text-[10px] text-gray-400 mt-1">{message.length}/500</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Submitting...
                </>
              ) : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}