import React from 'react';
import { HiOutlineTrendingUp } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';

const AdminAnalytics = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full py-20 bg-white">
      <div className="w-full px-6 md:px-12">

        {/* HEADER */}
        <div className="w-full mb-14 text-left">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 leading-tight">
            {t("adminAnalytics.title")}
          </h2>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl">
            {t("adminAnalytics.subtitle")}
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* CARD 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col">

            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold text-slate-900">
                {t("adminAnalytics.overview")}
              </h3>

              <span className="bg-brand-blue-bright text-white px-3 py-1 rounded-lg text-xs font-medium">
                {t("adminAnalytics.monthly")}
              </span>
            </div>

            <div className="w-full h-48 relative flex items-end">

              <div className="absolute left-0 top-0 text-slate-400 text-xs flex flex-col justify-between h-full py-2">
                <span>10k</span>
                <span>6k</span>
                <span>5k</span>
                <span>0</span>
              </div>

              <div className="w-full h-full ml-8 border-l border-b border-slate-100 relative overflow-hidden">

                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d="M0,90 Q15,95 25,75 T50,60 T75,80 T100,30"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="75"
                    cy="80"
                    r="4"
                    fill="white"
                    stroke="#1863c2"
                    strokeWidth="2.5"
                  />
                </svg>

                <div className="absolute top-10 left-1/2 bg-white shadow-md border border-slate-100 px-3 py-2 rounded-xl text-center">
                  <p className="text-[10px] font-medium text-slate-400 uppercase">
                    {t("adminAnalytics.ratings")}
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    5,560$
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col">

            <span className="bg-brand-blue-bright text-white px-3 py-1 rounded-lg text-xs font-medium w-fit mb-8">
              {t("adminAnalytics.newVotes")}
            </span>

            <div className="flex flex-col mb-4 text-left">
              <h3 className="text-5xl md:text-6xl font-semibold text-slate-900">
                3,729
              </h3>

              <p className="text-brand-green-mid text-lg font-medium mt-2">
                70.0% ↑
              </p>
            </div>

            <div className="w-full h-32 mt-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M0,80 C20,95 30,30 40,60 C50,90 60,10 70,40 C80,70 90,50 100,55"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

          </div>

          {/* CARD 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col">

            <div className="flex justify-between items-start mb-8">

              <h3 className="text-xl font-semibold text-slate-900">
                {t("adminAnalytics.scoreHistory")}
              </h3>

              <div className="bg-brand-green-mid/10 text-brand-green-mid px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-medium">
                <HiOutlineTrendingUp />
                +15 Pts
              </div>

            </div>

            <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">

              <div className="w-14 h-14 rounded-full border-4 border-white border-t-brand-green-mid bg-white shadow-sm flex items-center justify-center text-sm font-semibold text-slate-900">
                90
              </div>

              <p className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                {t("adminAnalytics.verifiedStatus")}
              </p>

            </div>

            <div className="w-full h-32 relative mt-auto">

              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M0,80 L25,60 L50,65 L75,30 L100,20"
                  fill="none"
                  stroke="#1863c2"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle
                  cx="75"
                  cy="30"
                  r="5"
                  fill="#1863c2"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>

              <div className="w-full flex justify-between pt-4 text-[11px] font-medium text-slate-400 uppercase">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jun</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AdminAnalytics;