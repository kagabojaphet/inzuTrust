import React from 'react';
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';
import house from '../../assets/image/verfiedhouse.png';
import paymentMethod from '../../assets/image/mobilecardspayement.png';

const Features = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full py-24 bg-white font-sans">
      <div className="w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-start text-left group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
          <div className="w-full h-52  overflow-hidden relative mb-8">
            <img 
              src={house} 
              alt="Verified Property" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute bottom-4 right-4 bg-brand-green-mid text-white p-2.5 rounded-full border-4 border-white shadow-lg">
              <HiOutlineBadgeCheck className="text-2xl" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{t("featuresSection.verifiedTitle")}</h3>
          <p className="text-black text-lg leading-relaxed">
            {t("featuresSection.verifiedDesc")}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-start text-left group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
          <div className="relative mb-10 mt-6">
            <div className="w-36 h-36 rounded-full border-[14px] border-slate-100 border-t-brand-blue-bright border-r-brand-blue-bright flex items-center justify-center transition-transform group-hover:rotate-12 duration-700">
              <span className="text-5xl font-black text-slate-900">90</span>
            </div>
            <div className="absolute -bottom-4 left-0 bg-white px-6 py-2 rounded-full border border-slate-200 shadow-md">
              <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{t("featuresSection.trustScore")}</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{t("featuresSection.trustTitle")}</h3>
          <p className="text-black text-lg leading-relaxed">
            {t("featuresSection.trustDesc")}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-start text-left group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
          <div className="w-full h-52 flex items-center justify-center mb-8  overflow-hidden px-6">
            <img 
              src={paymentMethod} 
              alt="Payment Methods" 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
            />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{t("featuresSection.payTitle")}</h3>
          <p className="text-black text-lg leading-relaxed">
            {t("featuresSection.payDesc")}
          </p>
        </div>

      </div>
    </section>
  );
};

export default Features;