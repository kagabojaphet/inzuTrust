import React from 'react';
import { FcGoogle } from "react-icons/fc";
import { HiShieldCheck, HiChartBar, HiDocumentText, HiLockClosed } from "react-icons/hi";

const LandlordRegister = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">
      {/* LEFT SIDE - Marketing / Trust section */}
      <div className="lg:w-5/12 bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-8 md:p-12 lg:p-16 flex flex-col relative">
        {/* Logo */}
        <div className="absolute top-8 left-8 md:left-12">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-700/40">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-3xl font-black tracking-tight">
              Inzu<span className="text-blue-400">Trust</span>
            </span>
          </div>
        </div>

        <div className="mt-24 lg:mt-32 flex flex-col flex-1 max-w-md">
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-10">
            Join 500+ Verified Landlords
          </h2>

          <p className="text-blue-200 text-lg md:text-xl font-medium mb-12">
            The standard for secure property management and automated rent collection.
          </p>

          {/* Benefits */}
          <div className="space-y-9 mb-14">
            <div className="flex gap-5 items-start">
              <HiShieldCheck className="text-blue-400 w-9 h-9 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1.5">Secure Rent Collection</h4>
                <p className="text-blue-100/90">Automated payouts directly to your business account.</p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <HiChartBar className="text-blue-400 w-9 h-9 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1.5">Real-time Dashboard</h4>
                <p className="text-blue-100/90">Track occupancy, late payments, and financial health.</p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <HiDocumentText className="text-blue-400 w-9 h-9 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1.5">Compliance Ready</h4>
                <p className="text-blue-100/90">Automatic generation of tax reports and legal forms.</p>
              </div>
            </div>
          </div>

          {/* Trusted by */}
          <div className="mb-10">
            <p className="text-blue-300 text-sm font-bold uppercase tracking-wider mb-4">Trusted by top agencies</p>
            <div className="flex gap-3 opacity-80">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/10"></div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-lg p-7 rounded-3xl border border-white/10 mt-auto">
            <p className="text-lg leading-relaxed mb-6 italic">
              "InzuTrust simplified our collection process. We've seen a 40% reduction in late payments since switching."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                MT
              </div>
              <div>
                <p className="font-bold">Marcus Thorne</p>
                <p className="text-blue-300 text-sm">Prime Properties</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-white">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-3">
            <span>STEP 1 OF 3</span>
            <span>33% COMPLETE</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-blue-600 rounded-full"></div>
          </div>
          <div className="flex justify-between mt-4 text-xs md:text-sm font-semibold">
            <span className="text-blue-600 font-black">PERSONAL</span>
            <span className="text-slate-400">PORTFOLIO</span>
            <span className="text-slate-400">SECURITY</span>
          </div>
        </div>

        <div className="max-w-xl mx-auto w-full">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Create your account</h1>
          <p className="text-slate-500 mb-10 text-lg">
            Let's start with some basic information about you and your business.
          </p>

          {/* Form */}
          <form className="space-y-7">
            <div className="grid md:grid-cols-2 gap-7">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Uwirizimana Yvette"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="yvette1@gmail.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-7">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 000-657"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Company Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  defaultValue="Hallmark Residences"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            {/* Google sign-up option */}
            <button
              type="button"
              className="w-full py-4 border border-slate-200 rounded-xl flex items-center justify-center gap-3 font-semibold text-slate-700 hover:bg-slate-50 mt-4"
            >
              <FcGoogle className="text-2xl" />
              Continue with Google
            </button>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-xl font-black uppercase tracking-wide text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all mt-6"
            >
              Continue to Portfolio →
            </button>

            <p className="text-center text-sm text-slate-500 mt-8 flex items-center justify-center gap-2">
              <HiLockClosed className="text-green-600" />
              Your data is encrypted and secure
            </p>
          </form>

          {/* Coming soon sections */}
          <div className="mt-16 space-y-10 opacity-70 pointer-events-none">
            <div>
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">📂</span> Portfolio Details
              </h4>
              <div className="h-3 bg-slate-200 rounded-full w-3/4"></div>
              <p className="text-sm text-slate-400 mt-2 font-medium">COMING UP NEXT</p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <HiShieldCheck className="text-green-600" /> Compliance & KYC
              </h4>
              <p className="text-sm text-slate-400 font-medium">FINAL STEP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordRegister;