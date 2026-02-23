import React from 'react';
import { HiShieldCheck, HiOutlineLightBulb, HiOutlineGlobe, HiUserGroup, HiOutlineTrendingUp } from "react-icons/hi";

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Header Section - Bold Black Text */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 bg-slate-50 border-b border-slate-100 overflow-hidden text-left">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue-bright opacity-10 rounded-full blur-[100px] z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-8 leading-tight">
            The Digital Foundation <br /> of Trust in Rwanda.
          </h1>
          <p className="text-xl md:text-2xl text-black leading-relaxed max-w-3xl font-medium">
            InzuTrust was founded to solve the most significant barrier in the rental market: a lack of verified information. We bridge the gap between landlords and tenants through data-driven transparency.
          </p>
        </div>
      </section>

      {/* 2. Mission & Vision Section (White Cards with Black Text) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Mission - White Card */}
          <div className="group p-12 rounded-[40px] bg-white border-2 border-slate-100 shadow-xl transform transition-transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-brand-blue-bright/10 rounded-2xl flex items-center justify-center text-3xl mb-8">
              <HiOutlineTrendingUp className="text-brand-blue-bright" />
            </div>
            <h2 className="text-4xl font-black mb-6 text-black">Our Mission</h2>
            <p className="text-xl leading-relaxed text-black font-medium">
              To modernize the rental experience in Rwanda through technology. We eliminate fraud, reduce payment disputes, and provide a seamless management tool for property owners while giving tenants a platform to build their financial reputation.
            </p>
          </div>

          {/* Vision - White Card */}
          <div className="group p-12 rounded-[40px] bg-white border-2 border-slate-100 shadow-xl transform transition-transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-brand-green-mid/10 rounded-2xl flex items-center justify-center text-3xl mb-8">
              <HiOutlineLightBulb className="text-brand-green-mid" />
            </div>
            <h2 className="text-4xl font-black mb-6 text-black">Our Vision</h2>
            <p className="text-xl leading-relaxed text-black font-medium">
              To be the most trusted rental verification ecosystem in Africa, where a person’s integrity—reflected in their Trust Score—becomes their greatest asset in accessing quality housing and dignity.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The "Trust Gap" & Story Content - High Contrast Black */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-100">
        <div className="grid md:grid-cols-2 gap-20 items-center text-left">
          <div className="flex flex-col items-start">
            <h2 className="text-3xl md:text-4xl font-black text-black mb-8">Bridging the Gap</h2>
            <div className="space-y-6 text-lg text-black font-medium">
              <p>
                Historically, the rental market in Kigali has relied on informal agreements. This creates a "trust gap" where landlords fear non-payment and tenants fear unfair treatment or unverified listings.
              </p>
              <p>
                Launched to revolutionize the sector, InzuTrust has grown into a community of over <strong>2,000+ happy tenants and landlords</strong>. We recognized that by digitizing the lease and payment process, we could create a permanent record of reliability for both parties.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <p className="text-4xl font-black text-brand-blue-bright leading-none">2k+</p>
                <p className="text-sm font-bold text-black uppercase tracking-tighter mt-2">Active Users</p>
              </div>
              <div className="w-px h-12 bg-slate-300" />
              <div>
                <p className="text-4xl font-black text-brand-green-mid leading-none">100%</p>
                <p className="text-sm font-bold text-black uppercase tracking-tighter mt-2">Verified Status</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-slate-100 rounded-[32px] transform rotate-3 z-0" />
            <div className="relative z-10 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-slate-200 aspect-video">
               <img 
                 src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" 
                 alt="Rental Ecosystem" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <HiUserGroup className="text-brand-blue-bright text-xl" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <p className="text-[10px] font-bold text-black opacity-50 uppercase tracking-tighter leading-none mb-1">Community</p>
                    <p className="text-sm font-black text-black leading-none">Kigali Focused</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values Section - White Cards / Black Text */}
      <section className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto text-left">
          <h2 className="text-3xl font-black text-black mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <HiShieldCheck />, 
                title: "Radical Transparency", 
                desc: "No hidden fees or surprise lease terms. Everything is digital and accessible to both parties at any time." 
              },
              { 
                icon: <HiOutlineGlobe />, 
                title: "Security First", 
                desc: "We protect user data and financial transactions with bank-grade encryption and biometric verification." 
              },
              { 
                icon: <HiUserGroup />, 
                title: "Empowerment", 
                desc: "We give tenants a Trust Score that helps them negotiate better deals based on their verified good history." 
              }
            ].map((val, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-start text-left">
                <div className="text-brand-blue-bright text-4xl mb-6">{val.icon}</div>
                <h4 className="text-xl font-bold text-black mb-4">{val.title}</h4>
                <p className="text-black font-medium leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;