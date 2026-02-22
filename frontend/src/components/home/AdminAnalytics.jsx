import React from 'react';
import { HiOutlineTrendingUp } from "react-icons/hi";

const AdminAnalytics = () => {
  return (
    <section className="w-full py-24 bg-white font-sans">
      <div className="w-full px-6 md:px-12">
        {/* Section Header - Left Aligned */}
        <div className="w-full mb-16 text-left">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-6 leading-tight tracking-tight">
            Your Dashboard, Your Data, Your Growth
          </h2>
          <p className="text-slate-900 text-lg md:text-xl font-semibold opacity-80 leading-relaxed max-w-3xl">
            Track property performance, tenant behavior, and financial trends with our integrated analytical engine.
          </p>
        </div>

        {/* 3-Column Analytics Grid with rounded-lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* 1. Overview Chart Card */}
          <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h3>
              <span className="bg-brand-blue-bright text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">Monthly</span>
            </div>
            <div className="w-full h-48 relative flex items-end">
              <div className="absolute left-0 top-0 text-slate-400 text-xs flex flex-col justify-between h-full py-2 font-bold">
                <span>10k</span><span>6k</span><span>5k</span><span>0</span>
              </div>
              <div className="w-full h-full ml-8 border-l border-b border-slate-100 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,90 Q15,95 25,75 T50,60 T75,80 T100,30" fill="none" stroke="black" strokeWidth="3" />
                  <circle cx="75" cy="80" r="4" fill="white" stroke="#1863c2" strokeWidth="3" />
                </svg>
                <div className="absolute top-10 left-1/2 bg-white shadow-xl border border-slate-100 p-2 rounded-lg text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Ratings</p>
                  <p className="text-sm font-black text-slate-900">5,560$</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. New Votes Stats Card */}
          <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
            <span className="bg-brand-blue-bright text-white px-4 py-1.5 rounded-lg text-sm font-bold w-fit mb-8 shadow-sm">New votes</span>
            <div className="flex flex-col mb-4 text-left">
              <h3 className="text-6xl font-black text-slate-900 tracking-tighter">3,729</h3>
              <p className="text-brand-green-mid text-xl font-black mt-2">70.0% ↑</p>
            </div>
            <div className="w-full h-32 mt-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,80 C20,95 30,30 40,60 C50,90 60,10 70,40 C80,70 90,50 100,55" fill="none" stroke="black" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* 3. Trust Score History Card */}
          <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Score History</h3>
              <div className="bg-brand-green-mid/10 text-brand-green-mid px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-black">
                <HiOutlineTrendingUp /> +15 Pts
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-14 h-14 rounded-full border-4 border-white border-t-brand-green-mid bg-white shadow-sm flex items-center justify-center text-sm font-black text-slate-900">90</div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Level 4 Verified Status</p>
            </div>

            <div className="w-full h-32 relative mt-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,80 L25,60 L50,65 L75,30 L100,20" fill="none" stroke="#1863c2" strokeWidth="4" strokeLinecap="round" />
                <circle cx="75" cy="30" r="5" fill="#1863c2" stroke="white" strokeWidth="2" />
              </svg>
              <div className="w-full flex justify-between pt-4 text-[11px] font-black text-slate-400 uppercase">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jun</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdminAnalytics;