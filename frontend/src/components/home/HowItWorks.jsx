import React from 'react';
import { HiOutlineUserAdd, HiSearch, HiOutlineCash, HiOutlineDocumentText } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <HiOutlineUserAdd />,
      number: "1",
      title: t("howItWorks.step1Title"),
      desc: t("howItWorks.step1Desc")
    },
    {
      icon: <HiSearch />,
      number: "2",
      title: t("howItWorks.step2Title"),
      desc: t("howItWorks.step2Desc")
    },
    {
      icon: <HiOutlineCash />,
      number: "3",
      title: t("howItWorks.step3Title"),
      desc: t("howItWorks.step3Desc")
    },
    {
      icon: <HiOutlineDocumentText />,
      number: "4",
      title: t("howItWorks.step4Title"),
      desc: t("howItWorks.step4Desc")
    }
  ];

  return (
     <section className="w-full py-24 bg-white font-sans">
      <div className="w-full px-6 md:px-12 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">{t("howItWorks.title")}</h2>
        <p className="text-black mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium opacity-80">
          {t("howItWorks.subtitle")}
        </p>
      </div>

      <div className="w-full px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
        <div className="hidden md:block absolute top-12 left-12 w-[calc(100%-6rem)] h-0.5 bg-slate-100 -z-0"></div>
        
        {steps.map((item, index) => (
          <div key={index} className="flex flex-col items-start group z-10">
            <div className="relative mb-10">
              <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center text-brand-blue-bright text-4xl group-hover:bg-brand-blue-bright group-hover:text-white transition-all duration-500 border border-slate-100">
                {item.icon}
              </div>
              
              <div className="absolute -top-1 -right-1 w-10 h-10 bg-brand-green-mid text-white rounded-full flex items-center justify-center font-black border-4 border-white shadow-md">
                {item.number}
              </div>
            </div>

            <div className="bg-white p-7 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 h-full w-full text-left">
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                {item.title}
              </h3>
              <p className="text-black text-lg leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;