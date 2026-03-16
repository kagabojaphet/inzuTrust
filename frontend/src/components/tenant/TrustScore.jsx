import React from 'react';
import { 
  HiChevronRight, HiOutlineDownload, HiOutlineFilter, 
  HiCalendar, HiClock, HiOutlineDocumentText, HiMail, 
  HiCreditCard, HiCheckCircle, HiInformationCircle, HiShieldCheck,
  HiFolderOpen
} from "react-icons/hi";

const userName = "Keza";
const currentMonth = "October";
const trustScore = 85;
const trustBoost = "+15 pts this month";

const rentStatus = {
  month: "October",
  status: "PAID Cleared",
  nextDue: "Nov 01, 2026",
  amount: 250000,
  note: "Your rent for October is fully paid. Your next payment cycle begins on November 1st."
};

const leaseMonthsLeft = 8;
const securityDeposit = 50000;

const recentTransactions = [
  { date: "Oct 01, 2026", desc: "October Rent",     ref: "TXN-8821", amount: 250000, status: "Paid", icon: "🏠" },
  { date: "Sep 01, 2026", desc: "September Rent",   ref: "TXN-7734", amount: 250000, status: "Paid", icon: "🏠" },
  { date: "Aug 01, 2026", desc: "August Rent",      ref: "TXN-6612", amount: 250000, status: "Paid", icon: "🏠" },
  { date: "Jul 15, 2026", desc: "Maintenance Fee",  ref: "TXN-5990", amount: 15000,  status: "Paid", icon: "🛠️" },
  { date: "Jul 01, 2026", desc: "Security Deposit", ref: "TXN-5591", amount: 500000, status: "Paid", icon: "🔒" },
];

const formatRWF = (num) => `RWF ${num.toLocaleString()}`;

export default function Overview({ setActiveTab }) {
  return (
    <div>
      {/* Main block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Trust Score */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col items-start text-left">
          <div className="flex justify-between w-full mb-5">
            <h3 className="text-lg font-bold text-gray-900">Trust Score</h3>
            <HiInformationCircle className="text-gray-400 text-xl cursor-help" />
          </div>

          <div className="relative w-44 h-44 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                fill="none"
                stroke="currentColor"
                className="text-blue-100"
                strokeWidth="4"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                fill="none"
                stroke="currentColor"
                className="text-blue-600"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${trustScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-black text-gray-900">{trustScore}%</span>
            </div>
          </div>

          <div className="bg-green-50 px-5 py-1.5 rounded-full text-sm font-bold text-green-700 mb-4">
            {trustBoost}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Great job! Consistent on-time payments are boosting your score.
          </p>
        </div>

        {/* Right container – Rent Cleared + Lease & Deposit */}
        <div className="md:col-span-2 space-y-6">
          {/* Rent Cleared */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3.5 h-3.5 bg-green-500 rounded-full"></div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">CURRENT STATUS: PAID</span>
            </div>

            <h2 className="text-4xl font-black text-gray-900 mb-3">
              {rentStatus.month} Rent Cleared
            </h2>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {rentStatus.note}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">NEXT DUE</p>
                <p className="text-xl font-extrabold text-gray-900">{rentStatus.nextDue}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">AMOUNT</p>
                <p className="text-xl font-extrabold text-gray-900">{formatRWF(rentStatus.amount)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab("payments")}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-blue-700 transition flex items-center gap-2"
              >
                <HiCreditCard /> Pay Advance
              </button>
              <button className="border border-gray-300 px-8 py-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                <HiCalendar /> Schedule Meeting
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className="border border-gray-300 px-8 py-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
              >
                <HiClock /> View History
              </button>
            </div>
          </div>

          {/* Lease Remaining + Security Deposit – side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Lease Remaining */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-left">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-black uppercase tracking-wider text-gray-500">Lease Remaining</p>
                <span className="text-xs font-medium text-gray-500 bg-green-50 px-2.5 py-1 rounded-full">Active</span>
              </div>
              <p className="text-3xl font-black text-gray-900 mb-4">{leaseMonthsLeft} Months</p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${(leaseMonthsLeft / 12) * 100}%` }}></div>
              </div>
            </div>

            {/* Security Deposit */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 flex items-center gap-5 text-left">
              <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <HiShieldCheck className="text-orange-600 text-3xl" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">Security Deposit Held</p>
                <p className="text-3xl font-black text-gray-900">{formatRWF(securityDeposit)}</p>
                <p className="text-xs text-gray-500 mt-1">Refundable at end of lease</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Recent Transactions + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        {/* Left: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-2xl font-black text-gray-900">Recent Transactions</h3>
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700">
                <HiOutlineFilter className="text-xl" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <HiOutlineDownload className="text-xl" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-black uppercase tracking-wider text-gray-500 text-left">
            <div className="col-span-2">DATE</div>
            <div className="col-span-5">DESCRIPTION</div>
            <div className="col-span-2">REF ID</div>
            <div className="col-span-2 text-right">AMOUNT</div>
            <div className="col-span-1 text-right">STATUS</div>
          </div>

          <div className="divide-y divide-gray-100">
            {recentTransactions.map((tx, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 transition text-left"
              >
                <div className="col-span-2 text-sm text-gray-600 font-medium">{tx.date}</div>
                <div className="col-span-5 flex items-center gap-3">
                  <span className="text-xl">{tx.icon}</span>
                  <span className="font-medium text-gray-900">{tx.desc}</span>
                </div>
                <div className="col-span-2 text-sm text-gray-500 font-medium flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                  {tx.ref}
                </div>
                <div className="col-span-2 text-right font-medium text-gray-900">{formatRWF(tx.amount)}</div>
                <div className="col-span-1 text-right">
                  <span className="inline-flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full text-xs font-bold text-green-700">
                    <HiCheckCircle className="text-green-600" />
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-200 text-left">
            <button
              onClick={() => setActiveTab("payments")}
              className="text-blue-600 font-bold flex items-center gap-1.5 hover:underline"
            >
              View Full History <HiChevronRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* My Documents */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left">
            <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <HiFolderOpen className="text-xl text-gray-500" /> My Documents
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                    <HiOutlineDocumentText className="text-red-500 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Lease Agreement</p>
                    <p className="text-xs text-gray-500">PDF • 2.4 MB</p>
                  </div>
                </div>
                <HiOutlineDownload className="text-gray-600 hover:text-gray-800 cursor-pointer text-lg" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <HiOutlineDocumentText className="text-blue-500 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Payment Receipts</p>
                    <p className="text-xs text-gray-500">ZIP • 1.1 MB</p>
                  </div>
                </div>
                <HiOutlineDownload className="text-gray-600 hover:text-gray-800 cursor-pointer text-lg" />
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiMail className="text-xl text-gray-500" /> Recent Messages
              </h4>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">2 New</span>
            </div>

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm shrink-0">
                  PM
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Property Manager</p>
                  <p className="text-xs text-gray-600 truncate">Your maintenance request...</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                  IS
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">InzuTrust Support</p>
                  <p className="text-xs text-gray-600 truncate">How was your last payment...</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("messages")}
              className="w-full mt-5 text-blue-600 font-bold flex items-center justify-center gap-1.5 hover:underline"
            >
              Open Messenger <HiChevronRight className="text-lg" />
            </button>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiCreditCard className="text-xl text-gray-500" /> Payment Methods
              </h4>
              <button
                onClick={() => setActiveTab("payments")}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                EDIT
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center p-2">
                  <span className="text-yellow-600 font-bold text-base">MoMo</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">MTN Mobile Money</p>
                  <p className="text-xs text-gray-500">•••• 8392</p>
                </div>
              </div>
              <HiCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}