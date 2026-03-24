import React from 'react';
import { HiArrowRight } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full relative overflow-hidden h-[500px] flex items-center justify-center">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      <div className="absolute inset-0 bg-brand-blue-bright/90 z-10"></div>

      <div className="relative z-20 text-center text-white px-6 md:px-12 w-full max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
          {t("cta.title")}
        </h2>
        
        <p className="text-lg md:text-xl font-medium opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t("cta.subtitle")}
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8">
          <button className="bg-white text-brand-blue-bright font-bold px-10 py-4 rounded-lg text-md shadow-xl hover:bg-slate-50 transition-all active:scale-95">
            {t("cta.startFree")}
          </button>
          
          <button className="flex items-center gap-2 text-white font-bold text-md hover:gap-4 transition-all group">
            {t("cta.contactSales")}
            <HiArrowRight className="text-xl transition-transform" /> 
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;