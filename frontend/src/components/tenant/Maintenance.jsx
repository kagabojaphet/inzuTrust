import React, { useState } from "react";
import { HiPlus, HiX, HiCheckCircle, HiClock, HiExclamation, HiPhotograph, HiChevronDown } from "react-icons/hi";

const initialRequests = [
  {
    id: 1, title: "Leaking faucet in bathroom", category: "Plumbing",
    priority: "High", status: "In Progress", date: "Oct 10, 2026",
    updated: "Oct 12, 2026", description: "The bathroom sink faucet has been dripping constantly.",
    notes: "Plumber scheduled for Oct 14.",
  },
  {
    id: 2, title: "Broken window latch – bedroom", category: "Windows & Doors",
    priority: "Medium", status: "Open", date: "Oct 05, 2026",
    updated: "Oct 05, 2026", description: "The latch on the bedroom window no longer locks securely.",
    notes: "",
  },
  {
    id: 3, title: "Electrical outlet not working", category: "Electrical",
    priority: "High", status: "Resolved", date: "Sep 20, 2026",
    updated: "Sep 28, 2026", description: "The outlet next to the kitchen counter stopped working.",
    notes: "Fixed on Sep 28. Please test and confirm.",
  },
  {
    id: 4, title: "Paint peeling in hallway", category: "General Repair",
    priority: "Low", status: "Open", date: "Sep 10, 2026",
    updated: "Sep 10, 2026", description: "Wall paint in the hallway near the entrance is peeling.",
    notes: "",
  },
];

const statusColors = {
  "Open":        "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Resolved":    "bg-green-100 text-green-700",
};
const priorityColors = {
  High:   "bg-red-100 text-red-600",
  Medium: "bg-orange-100 text-orange-600",
  Low:    "bg-gray-100 text-gray-600",
};

export default function Maintenance() {
  const [requests, setRequests] = useState(initialRequests);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({ title: "", category: "Plumbing", priority: "Medium", description: "" });

  const filtered = filterStatus === "all" ? requests : requests.filter(r => r.status.toLowerCase().replace(" ", "-") === filterStatus);

  const handleSubmit = () => {
    if (!form.title || !form.description) return;
    const newReq = {
      id: requests.length + 1,
      title: form.title,
      category: form.category,
      priority: form.priority,
      status: "Open",
      date: "Oct 14, 2026",
      updated: "Oct 14, 2026",
      description: form.description,
      notes: "",
    };
    setRequests([newReq, ...requests]);
    setForm({ title: "", category: "Plumbing", priority: "Medium", description: "" });
    setShowForm(false);
  };

  const stats = [
    { label: "Open",        count: requests.filter(r => r.status === "Open").length,        color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "In Progress", count: requests.filter(r => r.status === "In Progress").length, color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Resolved",    count: requests.filter(r => r.status === "Resolved").length,    color: "text-green-600", bg: "bg-green-50"  },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className={`text-4xl font-black ${s.color} mb-1`}>{s.count}</div>
            <div className="text-sm text-gray-500 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Header actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          {[["all","All"],["open","Open"],["in-progress","In Progress"],["resolved","Resolved"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilterStatus(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filterStatus === val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {lbl}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2">
          <HiPlus /> New Request
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.map(req => (
          <div key={req.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
              onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900">{req.title}</h4>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColors[req.priority]}`}>{req.priority}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>📁 {req.category}</span>
                  <span>📅 Submitted {req.date}</span>
                  <span>🔄 Updated {req.updated}</span>
                </div>
              </div>
              <HiChevronDown className={`text-gray-400 transition-transform shrink-0 ${expanded === req.id ? "rotate-180" : ""}`} />
            </div>
            {expanded === req.id && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{req.description}</p>
                </div>
                {req.notes && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-500 mb-1">Manager Note</p>
                    <p className="text-sm text-blue-700">{req.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🔧</span>
            <p className="font-semibold">No requests in this category</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">New Maintenance Request</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><HiX className="text-2xl" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Leaking pipe in kitchen"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition">
                    {["Plumbing","Electrical","Windows & Doors","General Repair","HVAC","Other"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition">
                    {["Low","Medium","High"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">Description *</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                  rows={4} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition resize-none" />
              </div>
              <button className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition text-sm font-semibold flex items-center justify-center gap-2">
                <HiPhotograph /> Attach Photos
              </button>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition text-sm">Cancel</button>
                <button onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}