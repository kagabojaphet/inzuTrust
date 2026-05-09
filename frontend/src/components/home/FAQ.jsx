import React, { useState } from 'react';
import { HiChevronDown } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

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
    <section className="w-full py-20 bg-white">
      <div className="w-full px-6 md:px-12 text-left">

        {/* HEADER */}
        <div className="mb-12 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-snug mb-5">
            {t("faq.title")}
          </h2>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-normal">
            {t("faq.subtitle")}
          </p>
        </div>

        {/* FAQ LIST */}
        <div className="w-full flex flex-col gap-4">

          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`w-full bg-white rounded-2xl border transition-all duration-300 ${
                openIndex === index
                  ? 'border-brand-blue-bright shadow-lg shadow-slate-200/60'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >

              {/* QUESTION */}
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between gap-5 px-5 md:px-7 py-4 md:py-5 text-left"
              >

                <span
                  className={`flex-1 text-sm md:text-base font-medium leading-7 transition-colors duration-300 ${
                    openIndex === index
                      ? 'text-brand-blue-bright'
                      : 'text-slate-800'
                  }`}
                >
                  {faq.q}
                </span>

                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === index
                      ? 'bg-brand-blue-bright text-white rotate-180'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <HiChevronDown className="text-lg" />
                </div>

              </button>

              {/* ANSWER */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-[500px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >

                <div className="px-5 md:px-7 pb-6 text-slate-600 text-sm md:text-[15px] leading-7 font-normal">
                  {faq.a}
                </div>

              </div>

            </div>
          ))}

          {/* CONTACT SUPPORT */}
          <div
            className={`w-full bg-slate-50 rounded-2xl border transition-all duration-300 ${
              openIndex === contactIndex
                ? 'border-brand-blue-bright shadow-lg shadow-slate-200/60'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >

            <button
              onClick={() =>
                setOpenIndex(
                  openIndex === contactIndex ? null : contactIndex
                )
              }
              className="w-full flex items-center justify-between gap-5 px-5 md:px-7 py-4 md:py-5 text-left"
            >

              <span
                className={`flex-1 text-sm md:text-base font-medium leading-7 transition-colors duration-300 ${
                  openIndex === contactIndex
                    ? 'text-brand-blue-bright'
                    : 'text-slate-800'
                }`}
              >
                {t("faq.stillQuestions")}
              </span>

              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === contactIndex
                    ? 'bg-brand-blue-bright text-white rotate-180'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <HiChevronDown className="text-lg" />
              </div>

            </button>

            {/* CONTACT CONTENT */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === contactIndex
                  ? 'max-h-[300px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >

              <div className="px-5 md:px-7 pb-8 text-left">

                <p className="text-slate-600 text-sm md:text-[15px] leading-7 font-normal mb-6 max-w-2xl">
                  {t("faq.supportText")}
                </p>

                {/* FIXED BUTTON → LINK */}
                <Link
                  to="/contact-us"
                  className="bg-brand-blue-bright text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20 inline-block"
                >
                  {t("faq.contactSupport")}
                </Link>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQ;