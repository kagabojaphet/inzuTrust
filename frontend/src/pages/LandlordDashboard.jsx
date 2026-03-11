import React from 'react';
import { 
  HiOutlineHome, HiOutlineUserGroup, HiOutlineDocumentText, 
  HiOutlineCash, HiOutlineCog, HiOutlinePlus, HiOutlineBell, HiOutlineSearch 
} from "react-icons/hi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data for the chart
const data = [
  { name: 'Feb', revenue: 1.2 },
  { name: 'Mar', revenue: 2.1 },
  { name: 'Apr', revenue: 3.8 },
  { name: 'May', revenue: 3.2 },
  { name: 'Jun', revenue: 4.5 },
];

const LandlordDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-900">Inzu<span className="text-blue-600">Trust</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<HiOutlineHome />} label="Dashboard" active />
          <NavItem icon={<HiOutlineHome />} label="Properties" />
          <NavItem icon={<HiOutlineUserGroup />} label="Tenants" />
          <NavItem icon={<HiOutlineDocumentText />} label="Agreements" />
          <NavItem icon={<HiOutlineCash />} label="Payments" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <NavItem icon={<HiOutlineCog />} label="Settings" />
          <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">JP</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Jean-Paul M.</p>
              <p className="text-xs text-slate-500 truncate">jean@inzutrust.rw</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div className="relative w-96">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input 
              type="text" 
              placeholder="Search properties, tenants..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
              <HiOutlineBell className="text-xl" />
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              <HiOutlinePlus /> Add Property
            </button>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Active Agreements" value="10" change="+10%" color="blue" />
          <StatCard label="Rent Collected" value="4.5M RWF" change="+15%" color="green" />
          <StatCard label="Pending Payments" value="350k RWF" change="Action needed" color="orange" isWarning />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* REVENUE VIEW */}
          <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900">Revenue View</h3>
              <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-1 text-slate-500">
                <option>This Year</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QUICK ACTIONS & STATUS */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon={<HiOutlineHome />} label="New Listing" />
                <QuickAction icon={<HiOutlineDocumentText />} label="Create Lease" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Portfolio Status</h3>
              <div className="flex items-center justify-between">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-600" strokeWidth="3" strokeDasharray="83, 100" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900">83%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Occupied (10)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-200"></span> Vacant (2)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
    <span className="text-xl">{icon}</span>
    <span className="font-bold text-sm">{label}</span>
  </div>
);

const StatCard = ({ label, value, change, color, isWarning }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{label}</p>
    <h2 className={`text-2xl font-black mb-1 ${isWarning ? 'text-orange-600' : 'text-slate-900'}`}>{value}</h2>
    <p className={`text-xs font-bold ${isWarning ? 'text-orange-400' : 'text-green-500'}`}>{change}</p>
  </div>
);

const QuickAction = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all gap-2 group">
    <span className="text-xl text-slate-400 group-hover:text-blue-600">{icon}</span>
    <span className="text-[10px] font-black text-slate-500 group-hover:text-blue-600 uppercase tracking-tighter">{label}</span>
  </button>
);

export default LandlordDashboard;