import React from 'react';
import {
  HiOutlineChatAlt2,
  HiOutlineVideoCamera,
  HiOutlineCalendar
} from "react-icons/hi";

import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import SupportIcon from '../../assets/image/SupportIcon.png';

const AdminFeatures = () => {
  const { t } = useLanguage();

  const adminTools = [
    {
      icon: <HiOutlineChatAlt2 />,
      title: t("adminFeatures.messagingTitle"),
      desc: t("adminFeatures.messagingDesc"),
      color: "bg-blue-50 text-brand-blue-bright",
      isImage: false
    },
    {
      icon: <HiOutlineVideoCamera />,
      title: t("adminFeatures.videoTitle"),
      desc: t("adminFeatures.videoDesc"),
      color: "bg-green-50 text-brand-green-mid",
      isImage: false
    },
    {
      icon: <HiOutlineCalendar />,
      title: t("adminFeatures.scheduleTitle"),
      desc: t("adminFeatures.scheduleDesc"),
      color: "bg-blue-50 text-brand-blue-mid",
      isImage: false
    },
    {
      icon: SupportIcon,
      title: t("adminFeatures.supportTitle"),
      desc: t("adminFeatures.supportDesc"),
      color: "bg-slate-50",
      isImage: true
    }
  ];

  return (
    <section className="w-full py-20 bg-white">
      <div className="w-full px-6 md:px-12 flex flex-col lg:flex-row items-start gap-14">

        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/3 text-left lg:sticky lg:top-24">

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-snug mb-5">
            {t("adminFeatures.title")}
          </h2>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-md">
            {t("adminFeatures.subtitle")}
          </p>

          {/* LINKED BUTTON */}
          <Link
            to="/admin/dashboard"
            className="inline-block bg-brand-blue-bright text-white px-6 py-3 rounded-lg font-medium hover:opacity-95 transition-all text-sm shadow-sm"
          >
            {t("adminFeatures.button")}
          </Link>

        </div>

        {/* RIGHT GRID */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {adminTools.map((tool, index) => (
            <div
              key={index}
              className="group bg-white p-7 rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-300 text-left"
            >

              {/* ICON */}
              <div
                className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}
              >
                {tool.isImage ? (
                  <img
                    src={tool.icon}
                    alt={tool.title}
                    className="w-full h-full object-cover p-2.5"
                  />
                ) : (
                  <span className="text-xl">
                    {tool.icon}
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
                {tool.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-slate-600 text-sm leading-relaxed">
                {tool.desc}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default AdminFeatures;