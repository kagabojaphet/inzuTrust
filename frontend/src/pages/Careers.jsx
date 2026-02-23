import React from 'react';
import { HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineHeart, HiOutlineSparkles, HiChevronRight } from "react-icons/hi";

const Careers = () => {
  const benefits = [
    {
      title: "Growth Mindset",
      desc: "We provide annual learning stipends and mentorship from industry veterans on our board.",
      icon: <HiOutlineLightningBolt />,
      bgColor: "bg-brand-blue-bright/10",
      iconColor: "text-brand-blue-bright"
    },
    {
      title: "Health & Wellness",
      desc: "Comprehensive health insurance and a focus on work-life harmony for all our team members.",
      icon: <HiOutlineHeart />,
      bgColor: "bg-brand-green-mid/10",
      iconColor: "text-brand-green-mid"
    },
    {
      title: "Hybrid Work",
      desc: "Work from our Kigali hub or from the comfort of your home. We trust our team to deliver.",
      icon: <HiOutlineGlobe />,
      bgColor: "bg-brand-blue-bright/10",
      iconColor: "text-brand-blue-bright"
    },
    {
      title: "Equity & Ownership",
      desc: "We believe in shared success. High-performing team members are eligible for stock options.",
      icon: <HiOutlineSparkles />,
      bgColor: "bg-brand-green-mid/10",
      iconColor: "text-brand-green-mid"
    }
  ];

  const jobs = [
    {
      role: "Senior Full-Stack Engineer",
      type: "Full-time",
      location: "Kigali / Remote",
      department: "Engineering"
    },
    {
      role: "Property Trust Specialist",
      type: "Full-time",
      location: "Kigali",
      department: "Operations"
    },
    {
      role: "Growth Marketing Manager",
      type: "Contract",
      location: "Remote",
      department: "Marketing"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-green-mid/10 text-brand-green-mid px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
            Join the Mission
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black mb-8 leading-tight">
            Build the Future of <br /> 
            <span className="text-brand-blue-bright">Property Trust.</span>
          </h1>
          <p className="text-xl md:text-2xl text-black/70 leading-relaxed max-w-3xl font-medium">
            We are looking for bold thinkers and problem solvers to help us digitize the Rwandan real estate market and create transparency for thousands.
          </p>
        </div>
      </section>

      {/* 2. Values / Benefits Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-black mb-4">Why work at InzuTrust?</h2>
            <p className="text-lg text-black/60 font-medium">We’re more than a workplace; we’re a collective of innovators dedicated to solving the trust gap in housing.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="p-8 rounded-[32px] border border-slate-100 bg-white hover:shadow-xl hover:border-transparent transition-all group">
              <div className={`w-14 h-14 ${benefit.bgColor} ${benefit.iconColor} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-black text-black mb-3">{benefit.title}</h3>
              <p className="text-black/60 font-medium leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Open Positions Section */}
      <section className="py-24 px-6 md:px-12 bg-brand-blue-bright">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-12">Open Positions</h2>
          
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div 
                key={i} 
                className="bg-white p-6 md:p-8 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between group hover:bg-brand-green-mid transition-colors cursor-pointer"
              >
                <div className="mb-4 md:mb-0">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-blue-bright group-hover:text-white/80 mb-2 block">
                    {job.department} • {job.type}
                  </span>
                  <h3 className="text-2xl font-black text-black group-hover:text-white transition-colors">
                    {job.role}
                  </h3>
                  <p className="text-black/40 group-hover:text-white/70 font-bold">{job.location}</p>
                </div>
                
                <div className="flex items-center text-black font-black uppercase text-sm tracking-widest group-hover:text-white">
                  Apply Now <HiChevronRight className="ml-2 text-xl group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-white/70 font-bold text-lg">
              Don't see a role that fits? 
              <a href="mailto:careers@inzutrust.com" className="ml-2 text-white underline hover:text-brand-green-mid transition-colors">
                Send us an open application
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Cultural Teaser */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="bg-slate-50 rounded-[48px] p-12 md:p-24 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-black mb-8">Ready to make an impact?</h2>
            <button className="bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
              View All 12 Roles
            </button>
          </div>
          {/* Subtle branding backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue-bright/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green-mid/5 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default Careers;