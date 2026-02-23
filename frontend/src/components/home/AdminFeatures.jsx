import React from 'react';
import { HiOutlineChatAlt2, HiOutlineVideoCamera, HiOutlineCalendar } from "react-icons/hi";
import SupportIcon from '../../assets/image/SupportIcon.png'; 

const AdminFeatures = () => {
  const adminTools = [
    {
      icon: <HiOutlineChatAlt2 />,
      title: "Real-time Messaging",
      desc: "Instant chat between landlords and tenants with file sharing and history tracking for secure communication.",
      color: "bg-blue-50 text-brand-blue-bright",
      isImage: false
    },
    {
      icon: <HiOutlineVideoCamera />,
      title: "Virtual Video Calls",
      desc: "Conduct property tours and tenant interviews remotely with high-definition, integrated video conferencing.",
      color: "bg-green-50 text-brand-green-mid",
      isImage: false
    },
    {
      icon: <HiOutlineCalendar />,
      title: "Smart Scheduling",
      desc: "Automated booking system for property visits and meetings, synced directly with your digital calendar.",
      color: "bg-blue-50 text-brand-blue-mid",
      isImage: false
    },
    {
      icon: SupportIcon,
      title: "24/7 Premium Support",
      desc: "Round-the-clock technical assistance and dispute mediation to ensure a smooth rental experience.",
      color: "bg-slate-50",
      isImage: true
    }
  ];

  return (
    <section className="w-full py-24 bg-white font-sans">
      <div className="w-full px-6 md:px-12 flex flex-col lg:flex-row items-start gap-16">
        
        {/* Left Side: Content - All text starts from left */}
        <div className="w-full lg:w-1/3 text-left lg:sticky lg:top-24">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Manage your rentals <br className="hidden md:block" /> like a pro
          </h2>
          <p className="text-black text-lg md:text-xl mb-10 leading-relaxed">
            Our dashboard provides all the professional tools you need to communicate, verify, and support your rental business in one place.
          </p>
          <button className=" bg-brand-blue-bright text-white px-8 py-4 rounded-lg font-black shadow-xl shadow-slate-200/50 hover:bg-brand-blue-bright transition-all transform hover:-translate-y-1 text-sm tracking-widest">
            Explore
          </button>
        </div>

        {/* Right Side: Features Grid */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {adminTools.map((tool, index) => (
            <div 
              key={index} 
              className="group bg-white p-10 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 text-left"
            >
              {/* Icon Container with rounded-lg */}
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

              {/* Text content starting from left */}
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