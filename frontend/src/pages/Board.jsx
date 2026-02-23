import React, { useState } from 'react';
import { HiShieldCheck, HiScale, HiTrendingUp, HiBadgeCheck, HiX } from "react-icons/hi";

const Board = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const boardMembers = [
    {
      name: "Jean-Paul Munyaneza",
      title: "Executive Chairman",
      focus: "Strategic Oversight",
      bio: "20+ years of regional leadership in property development.",
      desc: "Jean-Paul leads the mission to digitize Rwanda's property market. He ensures that InzuTrust aligns with national urban development goals while maintaining the highest standards of executive governance.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=500&fit=crop"
    },
    {
      name: "Alice Umutoni",
      title: "Legal Director",
      focus: "Regulatory Compliance",
      bio: "Senior consultant in Rwandan Civil and Property Law.",
      desc: "Alice ensures all digital leases and trust frameworks align perfectly with local laws. She protects the rights of both parties within the InzuTrust ecosystem through rigorous legal auditing.",
      img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&h=500&fit=crop"
    },
    {
      name: "Dr. Marc Uwimana",
      title: "Fintech Advisor",
      focus: "Financial Innovation",
      bio: "Blockchain and Mobile Money infrastructure expert.",
      desc: "Dr. Marc oversees the integration of secure payment gateways. His focus is on ensuring that verified payments remain tamper-proof and accessible for every user in Rwanda.",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=500&fit=crop"
    },
    {
      name: "Sonia Kalisa",
      title: "Operations Director",
      focus: "Customer Trust",
      bio: "Operations specialist with a focus on community scalability.",
      desc: "Sonia manages the day-to-day ecosystem health. She is responsible for ensuring the 2,000+ members have a seamless experience from onboarding to final payment.",
      img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=400&h=500&fit=crop"
    },
    {
      name: "Emmanuel Gakwaya",
      title: "Technology Lead",
      focus: "System Security",
      bio: "Full-stack architect specializing in algorithmic fairness.",
      desc: "Emmanuel is the brain behind the Trust Score. He ensures the technology stack is secure, fast, and that the data privacy of our users is never compromised.",
      img: "https://images.unsplash.com/photo-1540560085032-7f4464c39938?q=80&w=400&h=500&fit=crop"
    },
    {
      name: "Divine Iradukunda",
      title: "External Auditor",
      focus: "Financial Integrity",
      bio: "Chartered accountant with expertise in fintech transparency.",
      desc: "Divine provides independent oversight of our financial workflows. She ensures that rental deposits and automated payments are handled with absolute transparency.",
      img: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=400&h=500&fit=crop"
    }
  ];

  const committees = [
    {
      title: "Audit & Risk Committee",
      desc: "Overseeing the security protocols for 'Verified Payments' and ensuring financial data integrity for all transactions in Kigali.",
      icon: <HiShieldCheck />
    },
    {
      title: "Ethics & Trust Governance",
      desc: "Ensuring the 'Trust Score' algorithm remains fair, objective, and unbiased, protecting the rights of both landlords and tenants.",
      icon: <HiScale />
    },
    {
      title: "Innovation & Growth",
      desc: "Guiding the technological expansion of InzuTrust as we scale our services to secondary cities across Rwanda.",
      icon: <HiTrendingUp />
    }
  ];

  return (
    <div className="bg-white min-h-screen relative">
      {/* 1. Header Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 bg-slate-50 border-b border-slate-100 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-blue-bright/10 text-brand-blue-bright px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
            Leadership
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black mb-8 leading-tight">
            Governed by <br /> Integrity & Experience.
          </h1>
          <p className="text-xl md:text-2xl text-black leading-relaxed max-w-3xl font-medium">
            Our board consists of industry veterans who provide the strategic oversight for the InzuTrust ecosystem.
          </p>
        </div>
      </section>

      {/* 2. Board Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-black text-black mb-16">The Board of Directors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {boardMembers.map((member, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedMember(member)}
              className="flex flex-col items-start group cursor-pointer"
            >
              <div className="w-full aspect-[4/5] bg-slate-100 rounded-[32px] overflow-hidden mb-6 border-2 border-slate-50 group-hover:border-brand-blue-bright transition-all shadow-sm">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="text-2xl font-black text-black mb-1">{member.name}</h3>
              <p className="text-brand-blue-bright font-bold text-sm uppercase tracking-widest">{member.title}</p>
              <button className="mt-4 text-xs font-black uppercase tracking-tighter text-black/40 group-hover:text-black transition-colors">View Profile →</button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Modal System */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedMember(null)} />
          <div className="relative bg-white w-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-all"
            >
              <HiX className="text-2xl" />
            </button>
            <div className="w-full md:w-5/12 h-80 md:h-auto">
              <img src={selectedMember.img} alt={selectedMember.name} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-7/12 p-8 md:p-16 text-left self-center">
              <span className="text-brand-blue-bright font-black text-xs uppercase tracking-[0.2em]">{selectedMember.focus}</span>
              <h2 className="text-4xl md:text-5xl font-black text-black mt-2 mb-1">{selectedMember.name}</h2>
              <p className="text-xl font-bold text-slate-400 mb-8">{selectedMember.title}</p>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase text-black mb-2 tracking-widest">Short Bio</h4>
                  <p className="text-lg text-black font-bold leading-tight">{selectedMember.bio}</p>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-black mb-2 tracking-widest">Description</h4>
                  <p className="text-black font-medium leading-relaxed opacity-80">{selectedMember.desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Pillars Section (Updated to Primary Blue & White Cards) */}
      <section className="py-24 px-6 md:px-12 bg-brand-blue-bright overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col items-start relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-left text-white">The Pillars of <br />Our Governance</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {committees.map((item, i) => (
              <div key={i} className="p-10 bg-white rounded-[40px] shadow-xl flex flex-col items-start text-left border border-white/10 hover:translate-y-[-8px] transition-transform">
                <div className="text-brand-green-mid text-4xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-black mb-4 text-black">{item.title}</h3>
                <p className="text-black/70 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative Green Glow */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-green-mid opacity-30 rounded-full blur-[100px]" />
      </section>

      {/* 5. Final Accountability */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <HiBadgeCheck className="text-6xl text-brand-blue-bright mx-auto mb-8" />
          <h2 className="text-4xl font-black text-black mb-6">A Shared Responsibility</h2>
          <p className="text-xl text-black font-medium leading-relaxed">
            The board is committed to the highest standards of transparency. We meet quarterly to review the security of our user data and the performance of the InzuTrust ecosystem for the 2,000+ members we serve.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Board;