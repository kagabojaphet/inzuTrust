import React from 'react';
import { HiStar } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';

const Ratings = () => {
  const { t } = useLanguage();

  const ratingData = [
    { title: t("ratings.topRatedHouses"), count: "1,200+", tag: t("ratings.verifiedQuality") },
    { title: t("ratings.verifiedTenants"), count: "8,500+", tag: t("ratings.highTrustScore") },
    { title: t("ratings.trustedLandlords"), count: "450+", tag: t("ratings.reliableService") }
  ];

  return (
    <section className="w-full py-20 bg-white font-sans">
      <div className="w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {ratingData.map((item, index) => (
          <div 
            key={index} 
            className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <HiStar key={i} className="text-yellow-400 text-2xl" />
              ))}
            </div>

            <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">
              {item.count}
            </h3>
            <p className="text-xl font-bold text-slate-900 mb-4 opacity-90">
              {item.title}
            </p>

            <span className="inline-block bg-slate-50 text-brand-blue-bright text-xs font-black px-4 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wider">
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Ratings;