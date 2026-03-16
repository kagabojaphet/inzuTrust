import React, { useState } from "react";
import {
  HiCheckCircle, HiOutlineDownload, HiOutlineFilter,
  HiCreditCard, HiClock, HiExclamation, HiPlus, HiX
} from "react-icons/hi";

const formatRWF = (num) => `RWF ${num.toLocaleString()}`;

const allTransactions = [
  { date: "Oct 01, 2026", desc: "October Rent",    ref: "TXN-8821", amount: 250000, status: "Paid",    icon: "🏠", type: "rent" },
  { date: "Sep 01, 2026", desc: "September Rent",  ref: "TXN-7734", amount: 250000, status: "Paid",    icon: "🏠", type: "rent" },
  { date: "Aug 01, 2026", desc: "August Rent",     ref: "TXN-6612", amount: 250000, status: "Paid",    icon: "🏠", type: "rent" },
  { date: "Jul 15, 2026", desc: "Maintenance Fee", ref: "TXN-5990", amount: 15000,  status: "Paid",    icon: "🛠️", type: "fee"  },
  { date: "Jul 01, 2026", desc: "Security Deposit",ref: "TXN-5591", amount: 500000, status: "Paid",    icon: "🔒", type: "deposit" },
  { date: "Jun 01, 2026", desc: "June Rent",       ref: "TXN-4481", amount: 250000, status: "Paid",    icon: "🏠", type: "rent" },
  { date: "May 01, 2026", desc: "May Rent",        ref: "TXN-3320", amount: 250000, status: "Paid",    icon: "🏠", type: "rent" },
];

const paymentMethods = [
  { id: 1, name: "MTN Mobile Money", sub: "•••• 8392", badge: "MoMo", color: "bg-yellow-50 text-yellow-600", active: true },
  { id: 2, name: "Airtel Money",     sub: "•••• 2210", badge: "AM",   color: "bg-red-50 text-red-500",    active: false },
];

export default function Payments() {
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(1);

  const filtered = filter === "all" ? allTransactions : allTransactions.filter(t => t.type === filter);

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Total Paid (2026)", value: formatRWF(1765000), icon: "💰", color: "text-green-600", bg: "bg-green-50" },
          { label: "Next Payment Due",  value: "Nov 01, 2026",     icon: "📅", color: "text-blue-600",  bg: "bg-blue-50"  },
          { label: "Monthly Rent",      value: formatRWF(250000),  icon: "🏠", color: "text-purple-600",bg: "bg-purple-50"},
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-xl`}>{s.icon}</div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pay Now card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">November 2026</p>
            <h2 className="text-4xl font-black mb-1">{formatRWF(250000)}</h2>
            <p className="text-blue-200 text-sm">Due on November 1st, 2026 · 17 days remaining</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(true)}
              className="bg-white text-blue-700 px-7 py-3.5 rounded-xl font-black text-sm hover:bg-blue-50 transition flex items-center gap-2">
              <HiCreditCard /> Pay Now
            </button>
            <button onClick={() => setShowModal(true)}
              className="border border-blue-400 px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2">
              <HiPlus /> Pay Advance
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-black text-gray-900">Payment Methods</h3>
          <button className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
            <HiPlus /> Add Method
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {paymentMethods.map(m => (
            <div key={m.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition cursor-pointer ${m.active ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${m.color.split(" ")[0]} rounded-xl flex items-center justify-center font-black text-sm ${m.color.split(" ")[1]}`}>
                  {m.badge}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
              </div>
              {m.active
                ? <HiCheckCircle className="text-blue-600 text-xl" />
                : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <h3 className="text-xl font-black text-gray-900">Transaction History</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {["all","rent","fee","deposit"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <button className="text-gray-400 hover:text-gray-700 ml-2"><HiOutlineDownload className="text-lg" /></button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-400">
          <div className="col-span-2">DATE</div>
          <div className="col-span-4">DESCRIPTION</div>
          <div className="col-span-2">REF</div>
          <div className="col-span-2 text-right">AMOUNT</div>
          <div className="col-span-2 text-right">STATUS</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((tx, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition">
              <div className="col-span-2 text-sm text-gray-500">{tx.date}</div>
              <div className="col-span-4 flex items-center gap-2">
                <span>{tx.icon}</span>
                <span className="font-medium text-gray-900 text-sm">{tx.desc}</span>
              </div>
              <div className="col-span-2 text-xs text-gray-400 font-medium">{tx.ref}</div>
              <div className="col-span-2 text-right font-semibold text-gray-900 text-sm">{formatRWF(tx.amount)}</div>
              <div className="col-span-2 text-right">
                <span className="inline-flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold text-green-700">
                  <HiCheckCircle className="text-xs" /> {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">Make Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700"><HiX className="text-2xl" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">Amount (RWF)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="250,000" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:border-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">Payment Method</label>
                {paymentMethods.map(m => (
                  <div key={m.id} onClick={() => setSelectedMethod(m.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer mb-2 transition ${selectedMethod === m.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                    <div className={`w-10 h-10 ${m.color.split(" ")[0]} rounded-lg flex items-center justify-center font-black text-xs ${m.color.split(" ")[1]}`}>{m.badge}</div>
                    <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                    {selectedMethod === m.id && <HiCheckCircle className="text-blue-600 ml-auto" />}
                  </div>
                ))}
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}