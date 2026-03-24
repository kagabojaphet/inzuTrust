import React, { useState } from 'react';
import { HiChevronDown } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { t } = useLanguage();

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") }
  ];

  const contactIndex = faqs.length;

  return (
    <section className="w-full py-20 bg-white font-sans">
      <div className="w-full px-6 md:px-12 text-left">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-black text-lg font-medium max-w-3xl opacity-80">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg border border-slate-200 transition-all duration-300 ${openIndex === index ? 'shadow-lg border-brand-blue-bright/30' : 'hover:border-slate-300'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left"
              >
                <span className={`text-lg font-bold leading-snug transition-colors duration-300 ${openIndex === index ? 'text-brand-blue-bright opacity-100' : 'text-slate-900 opacity-90'}`}>
                  {faq.q}
                </span>
                
                <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-brand-blue-bright text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                  <HiChevronDown className="text-xl" />
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 text-slate-600 text-lg leading-relaxed font-medium">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}

          <div className={`bg-slate-50 rounded-lg border border-slate-200 transition-all duration-300 ${openIndex === contactIndex ? 'shadow-lg border-brand-blue-bright/30' : 'hover:border-slate-300'}`}>
            <button 
              onClick={() => setOpenIndex(openIndex === contactIndex ? null : contactIndex)}
              className="w-full flex items-center justify-between p-5 md:p-6 text-left"
            >
              <span className={`text-lg font-bold leading-snug transition-colors duration-300 ${openIndex === contactIndex ? 'text-brand-blue-bright' : 'text-slate-900'}`}>
                {t("faq.stillQuestions")}
              </span>
              
              <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === contactIndex ? 'bg-brand-blue-bright text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
                <HiChevronDown className="text-xl" />
              </div>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === contactIndex ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-6 pb-8 text-left">
                <p className="text-lg font-medium text-slate-600 mb-6">{t("faq.supportText")}</p>
                <button className="bg-brand-blue-bright text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 text-md">
                  {t("faq.contactSupport")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;