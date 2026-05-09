import React, { useState, useEffect } from 'react';
import {
  HiOutlineArrowNarrowRight,
  HiChevronLeft,
  HiChevronRight
} from "react-icons/hi";

import { useLanguage } from '../../context/LanguageContext';

const News = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useLanguage();

  const articles = [
    {
      id: 1,
      category: t("newsSection.marketTrends"),
      date: "Feb 18, 2026",
      title: t("newsSection.article1Title"),
      desc: t("newsSection.article1Desc"),
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1073&auto=format&fit=crop"
    },
    {
      id: 2,
      category: t("newsSection.tenantTips"),
      date: "Feb 10, 2026",
      title: t("newsSection.article2Title"),
      desc: t("newsSection.article2Desc"),
      image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=687&auto=format&fit=crop"
    },
    {
      id: 3,
      category: t("newsSection.updates"),
      date: "Jan 25, 2026",
      title: t("newsSection.article3Title"),
      desc: t("newsSection.article3Desc"),
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1170&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % articles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [articles.length]);

  return (
    <section className="w-full py-20 bg-white overflow-hidden">

      {/* HEADER */}
      <div className="w-full px-6 md:px-12 mb-12 flex items-center justify-between gap-4 flex-wrap">

        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-snug mb-5">
            {t("newsSection.title")}
          </h2>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                (prev - 1 + articles.length) % articles.length
              )
            }
            className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
          >
            <HiChevronLeft className="text-xl" />
          </button>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                (prev + 1) % articles.length
              )
            }
            className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
          >
            <HiChevronRight className="text-xl" />
          </button>

        </div>
      </div>

      {/* ARTICLES */}
      <div className="w-full px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {articles.map((post) => (
            <article
              key={post.id}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >

              {/* IMAGE */}
              <div className="relative h-56 overflow-hidden">

                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              {/* CONTENT */}
              <div className="p-6">

                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {post.category} • {post.date}
                </span>

                <h3 className="text-xl font-semibold text-slate-900 mt-3 mb-3 leading-snug">
                  {post.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {post.desc}
                </p>

                <button className="flex items-center gap-2 text-brand-blue-bright font-medium text-sm hover:gap-3 transition-all">
                  {t("newsSection.readMore")}
                  <HiOutlineArrowNarrowRight className="text-lg" />
                </button>

              </div>

            </article>
          ))}

        </div>
      </div>

    </section>
  );
};

export default News;