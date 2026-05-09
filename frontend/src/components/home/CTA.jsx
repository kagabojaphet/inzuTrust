import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full relative overflow-hidden min-h-[500px] flex items-center justify-center">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-brand-blue-bright/90 z-10" />

      {/* CONTENT */}
      <div className="relative z-20 text-center text-white px-6 md:px-12 w-full max-w-4xl mx-auto">

        {/* TITLE */}
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug mb-5">
          {t("cta.title")}
        </h2>

        {/* SUBTITLE */}
        <p className="text-sm md:text-lg font-normal opacity-90 mb-10 max-w-2xl mx-auto leading-7">
          {t("cta.subtitle")}
        </p>

        {/* BUTTONS */}
        <div className="flex flex-wrap justify-center items-center gap-6">

          {/* START FREE */}
          <Link
            to="/register"
            className="bg-white text-brand-blue-bright px-8 py-3 rounded-xl text-sm md:text-base font-medium shadow-xl hover:bg-slate-100 transition-all active:scale-95"
          >
            {t("cta.startFree")}
          </Link>

          {/* CONTACT SALES */}
          <Link
            to="/contact-us"
            className="flex items-center gap-2 text-white text-sm md:text-base font-medium hover:gap-4 transition-all group"
          >
            {t("cta.contactSales")}
            <HiArrowRight className="text-lg transition-transform" />
          </Link>

        </div>

      </div>
    </section>
  );
};

export default CTA;