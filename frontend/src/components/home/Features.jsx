import React from 'react';
import { HiOutlineBadgeCheck } from "react-icons/hi";
import house from '../../assets/image/verfiedhouse.png';
import paymentMethod from '../../assets/image/mobilecardspayement.png';

const Features = () => (
  <section className="w-full py-24 bg-white font-sans">
    <div className="w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
      
      {/* Card 1: Verified Listings */}
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="w-full h-52 bg-slate-50 rounded-3xl overflow-hidden relative mb-8 border border-slate-100">
          <img 
            src={house} 
            alt="Verified Property" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
          <div className="absolute bottom-4 right-4 bg-brand-green-mid text-white p-2.5 rounded-full border-4 border-white shadow-lg">
            <HiOutlineBadgeCheck className="text-2xl" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Verified Listings</h3>
        <p className="text-slate-900 text-lg leading-relaxed font-semibold opacity-80">
          Every property is physically verified by our team to ensure your safety and quality.
        </p>
      </div>

      {/* Card 2: Build Rental Trust */}
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative mb-10 mt-6">
          {/* Progress Circle matching the aesthetic of your charts */}
          <div className="w-36 h-36 rounded-full border-[14px] border-slate-100 border-t-brand-blue-bright border-r-brand-blue-bright flex items-center justify-center transition-transform group-hover:rotate-12 duration-700">
            <span className="text-5xl font-black text-slate-900">90</span>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border border-slate-200 shadow-md">
            <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Trust Score</span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Build Rental Trust</h3>
        <p className="text-slate-900 text-lg leading-relaxed font-semibold opacity-80">
          Earn a high reputation based on timely payments and digital lease history to unlock better homes.
        </p>
      </div>

      {/* Card 3: Pay Easily */}
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="w-full h-52 flex items-center justify-center mb-8 bg-slate-50 rounded-3xl border border-dashed border-slate-300 overflow-hidden px-6">
          <img 
            src={paymentMethod} 
            alt="Payment Methods" 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
          />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Pay Easily</h3>
        <p className="text-slate-900 text-lg leading-relaxed font-semibold opacity-80">
          Seamlessly pay your rent using MTN Mobile Money, Airtel Money, or your preferred local bank.
        </p>
      </div>

    </div>
  </section>
);

export default Features;