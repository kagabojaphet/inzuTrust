import React from 'react';
import { HiOutlineChatAlt2, HiOutlineVideoCamera, HiOutlineCalendar } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';
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
    <section className="w-full py-24 bg-white font-sans">
      <div className="w-full px-6 md:px-12 flex flex-col lg:flex-row items-start gap-16">
        
        <div className="w-full lg:w-1/3 text-left lg:sticky lg:top-24">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
            {t("adminFeatures.title")}
          </h2>
          <p className="text-black text-lg md:text-xl mb-10 leading-relaxed">
            {t("adminFeatures.subtitle")}
          </p>
          <button className=" bg-brand-blue-bright text-white px-8 py-4 rounded-lg font-black shadow-xl shadow-slate-200/50 hover:bg-brand-blue-bright transition-all transform hover:-translate-y-1 text-sm tracking-widest">
            {t("adminFeatures.button")}
          </button>
        </div>

        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {adminTools.map((tool, index) => (
            <div 
              key={index} 
              className="group bg-white p-10 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 text-left"
            >
              <div className={`w-16 h-16 ${tool.color} rounded-lg flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>
                {tool.isImage ? (
                  <img 
                    src={tool.icon} 
                    alt={tool.title} 
                    className="w-full h-full object-cover p-3" 
                  />
                ) : (
                  <span className="text-3xl">{tool.icon}</span>
                )}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                {tool.title}
              </h3>
              <p className="text-black text-lg leading-relaxed">
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