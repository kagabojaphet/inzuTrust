import React from 'react';
import { HiOutlineUserAdd, HiSearch, HiOutlineCash, HiOutlineDocumentText } from "react-icons/hi";

const HowItWorks = () => {
  const steps = [
    {
      icon: <HiOutlineUserAdd />,
      number: "1",
      title: "Register & Login",
      desc: "Create your secure account and log in to access the full rental marketplace and management tools."
    },
    {
      icon: <HiSearch />,
      number: "2",
      title: "Browse Dream Houses",
      desc: "Explore our verified listings to find your dream home. Choose the property that perfectly fits your lifestyle."
    },
    {
      icon: <HiOutlineCash />,
      number: "3",
      title: "Secure Payment",
      desc: "Complete your rental payment seamlessly through our integrated MTN, Airtel, or Bank payment gateways."
    },
    {
      icon: <HiOutlineDocumentText />,
      number: "4",
      title: "Sign Agreements",
      desc: "Finalize your move by signing digital lease agreements with your landlord directly on the platform."
    }
  ];

  return (
    <section className="w-full py-24 bg-white font-sans">
      <div className="w-full px-6 md:px-12 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">How It Works</h2>
        <p className="text-slate-900 mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium opacity-80">
          Follow these simple steps to secure your next home in Rwanda.
        </p>
      </div>

      <div className="w-full px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
        
        {/* Connector Line - Adjusted for new spacing */}
        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
        
        {steps.map((item, index) => (
          <div key={index} className="flex flex-col items-center md:items-start group z-10">
            {/* Step Icon & Number */}
            <div className="relative inline-block mb-10">
              <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center text-brand-blue-bright text-4xl group-hover:bg-brand-blue-bright group-hover:text-white transition-all duration-500 border border-slate-100">
                {item.icon}
              </div>
              
              <div className="absolute -top-1 -right-1 w-10 h-10 bg-brand-green-mid text-white rounded-full flex items-center justify-center font-black border-4 border-white shadow-md">
                {item.number}
              </div>
            </div>

            {/* Content Card with rounded-lg and defined shadow/border */}
            <div className="bg-white p-7 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 h-full w-full">
              <h3 className="text-2xl font-black text-slate-900 mb-4 text-left tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-900 text-lg leading-relaxed text-left font-semibold opacity-80">
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