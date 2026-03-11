import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HiChevronRight, HiOutlineDownload, HiOutlineFilter, 
  HiCalendar, HiClock, HiOutlineDocumentText, HiMail, 
  HiCreditCard, HiCheckCircle 
} from "react-icons/hi";
import mtmMomoLogo from '../assets/mtn_momo.png'; // You will need to add this image

// Mock Data (To be replaced with API calls later)
const financialSummary = {
  trustScore: 85,
  trustScorePts: '+15',
  currentStatus: 'Paid',
  monthRent: 'October',
  rentPaid: 250000,
  nextDue: 'Nov 01, 2026',
  leaseRemaining: 8,
  securityDeposit: 50000,
};

const recentTransactions = [
  { date: 'Oct 01, 2026', description: 'October Rent', refId: 'TXN-8921', amount: 250000, status: 'Paid', iconColor: 'text-blue-600' },
  { date: 'Sep 01, 2026', description: 'September Rent', refId: 'TXN-7734', amount: 250000, status: 'Paid', iconColor: 'text-blue-600' },
  { date: 'Aug 01, 2026', description: 'August Rent', refId: 'TXN-6612', amount: 250000, status: 'Paid', iconColor: 'text-blue-600' },
  { date: 'Jul 15, 2026', description: 'Maintenance Fee', refId: 'TXN-5999', amount: 15000, status: 'Paid', iconColor: 'text-yellow-600' },
  { date: 'Jul 01, 2026', description: 'Security Deposit', refId: 'TXN-5581', amount: 500000, status: 'Paid', iconColor: 'text-green-600' },
];

const messages = [
  { sender: 'Property Manager', excerpt: 'Your maintenance reque...', avatar: 'PM', time: '2 New' },
  { sender: 'InzuTrust Support', excerpt: 'How was your last payme...', avatar: 'IS' },
];

const formatCurrency = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' RWF';
};

export default function TenantDashboard() {
  const { user } = useAuth(); // Access global user state from Context

  return (
    <div className="min-h-screen bg-[#F6F7FB] font-sans pb-10">
      {/* Dashboard Content */}
      <div className="max-w-[1600px] mx-auto p-8">
        
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            Welcome back, {user?.firstName || 'Tenant'}
          </h1>
          <p className="text-gray-500 font-medium text-lg mt-1 leading-relaxed">
            Here is your rental financial health overview for {financialSummary.monthRent}.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Main Financial Area (3/4 Columns) */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Top Row: Trust Score & Rent Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Trust Score Card */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-100 flex flex-col items-center justify-between border border-gray-100">
                <div className="flex justify-between items-center w-full mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Trust Score</h3>
                    <div className="text-gray-300 text-sm cursor-pointer">ⓘ</div>
                </div>
                
                <div className="relative w-44 h-44 mb-6">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-blue-600" strokeDasharray={`${financialSummary.trustScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-black text-gray-950">{financialSummary.trustScore}%</span>
                  </div>
                </div>

                <div className="w-full bg-green-50/50 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 text-center">
                    <span className="text-green-500 text-sm font-black">{financialSummary.trustScorePts} pts</span>
                    <p className="text-green-800 text-xs font-bold">this month</p>
                </div>

                <p className="text-gray-400 text-center text-xs px-2 leading-relaxed font-medium">
                  Great job! Consistent on-time payments are boosting your score.
                </p>
              </div>

              {/* Rent Overview & Actions */}
              <div className="md:col-span-2 space-y-8">
                {/* Rent Status Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-100 grid md:grid-cols-1 gap-6 border border-gray-100 relative">
                    <div className="flex justify-between items-center w-full">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">CURRENT STATUS: PAID</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-950">{financialSummary.monthRent} Rent Cleared</h2>
                        </div>
                    </div>

                    <p className="text-gray-500 font-medium leading-relaxed max-w-lg mb-6">
                        Your rent for {financialSummary.monthRent} is fully paid. Your next payment cycle begins on November 1st.
                    </p>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">NEXT DUE:</p>
                            <p className="text-base font-extrabold text-gray-900">{financialSummary.nextDue}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">AMOUNT:</p>
                            <p className="text-base font-extrabold text-gray-900">{formatCurrency(financialSummary.rentPaid)}</p>
                        </div>
                    </div>
                </div>

                {/* Second Row: Actions */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] flex items-center justify-between border border-gray-100 shadow-xl shadow-gray-50/50">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Lease Remaining</p>
                        <h4 className="text-2xl font-black text-gray-950">{financialSummary.leaseRemaining} Months</h4>
                    </div>
                    <div className="w-20 h-2 bg-blue-100 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-600 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-xl shadow-gray-50/50">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><HiCreditCard className="text-2xl" /></div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Security Deposit Held</p>
                        <h4 className="text-2xl font-black text-gray-950">{formatCurrency(financialSummary.securityDeposit)}</h4>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900">Recent Transactions</h3>
                <div className="flex items-center gap-3">
                    <button className="text-gray-400 hover:text-gray-600"><HiOutlineFilter /></button>
                    <button className="text-gray-400 hover:text-gray-600"><HiOutlineDownload /></button>
                </div>
              </div>
              
              <div className="space-y-5">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-4 items-center p-5 bg-white border border-gray-100 rounded-2xl">
                    <div className="col-span-1 text-gray-400 font-bold text-xs uppercase tracking-wider">{tx.date}</div>
                    <div className="col-span-2 flex items-center gap-4">
                        <HiCalendar className={`text-xl ${tx.iconColor}`} />
                        <span className="text-sm font-extrabold text-gray-950">{tx.description}</span>
                    </div>
                    <div className="col-span-1 text-xs font-medium text-gray-400 tracking-wider">{tx.refId}</div>
                    <div className="col-span-1 text-sm font-extrabold text-gray-950 text-right">{formatCurrency(tx.amount)}</div>
                    <div className="col-span-1 flex justify-end">
                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                            <HiCheckCircle className="text-green-500 text-sm" />
                            <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">{tx.status}</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
                <div className="mt-8 text-center">
                    <button className="text-xs font-extrabold text-blue-600 flex items-center gap-1 mx-auto hover:underline">
                        View Full History <HiChevronRight className="text-lg" />
                    </button>
                </div>
            </div>
          </div>

          {/* Sidebar Area (1/4 Column) */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition">
                    <HiCreditCard className="text-xl"/> Pay Advance
                </button>
                <div className="grid grid-cols-2 gap-4">
                    <button className="p-5 border-2 border-gray-100 rounded-2xl flex flex-col items-center gap-2 font-bold text-gray-950 hover:border-gray-200 transition">
                        <HiCalendar className="text-2xl text-blue-600" /> Schedule Meeting
                    </button>
                    <button className="p-5 border-2 border-gray-100 rounded-2xl flex flex-col items-center gap-2 font-bold text-gray-950 hover:border-gray-200 transition">
                        <HiClock className="text-2xl text-blue-600" /> View History
                    </button>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-50 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-base font-bold text-gray-900">My Documents</h4>
                </div>
                <div className="space-y-4">
                    {[{ name: 'Lease Agreement', size: '2.4 MB' }, { name: 'Payment Receipts', size: '1.2 MB' }].map(doc => (
                        <div key={doc.name} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <HiOutlineDocumentText className="text-2xl text-red-500" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                    <p className="text-[10px] text-gray-400">{doc.size}</p>
                                </div>
                            </div>
                            <HiOutlineDownload className="text-xl text-gray-400 cursor-pointer" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-50 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-base font-bold text-gray-900">Recent Messages</h4>
                </div>
                <div className="space-y-5">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">{msg.avatar}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-900">{msg.sender}</p>
                                    {msg.time && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{msg.time}</span>}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{msg.excerpt}</p>
                            </div>
                        </div>
                    ))}
                    <button className="w-full mt-2 text-xs font-extrabold text-blue-600 flex items-center justify-center gap-1 hover:underline">
                        Open Messenger <HiChevronRight className="text-lg" />
                    </button>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-50 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-base font-bold text-gray-900">Payment Methods</h4>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                </div>
                <div className="p-4 border-2 border-gray-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-400 p-2 rounded-xl flex items-center justify-center">
                            <img src={mtmMomoLogo} alt="MTN MoMo" className="h-full object-contain" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">MTN Mobile Money</p>
                            <p className="text-xs text-gray-400">••••• 8382</p>
                        </div>
                    </div>
                    <HiCheckCircle className="text-xl text-green-500" />
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}