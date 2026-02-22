import React from 'react';
import { 
  HiCheckCircle, 
  HiDocumentSearch, 
  HiCreditCard, 
  HiTrendingUp, 
  HiShieldCheck, 
  HiClock, 
  HiCurrencyDollar, 
  HiUserGroup 
} from "react-icons/hi";

const Services = () => {
  const landlordServices = [
    {
      title: "Tenant Trust Screening",
      desc: "Access a tenant's verified history before signing. Our Trust Score analyzes past payment behavior and lease compliance to reduce your risk.",
      icon: <HiShieldCheck />,
      color: "text-brand-blue-bright"
    },
    {
      title: "Automated Rent Collection",
      desc: "Forget chasing payments. Our system collects rent digitally via mobile money or bank transfer and deposits it directly to you.",
      icon: <HiCurrencyDollar />,
      color: "text-brand-green-mid"
    },
    {
      title: "Digital Lease Vault",
      desc: "Generate legally binding, Rwanda-compliant digital leases in minutes. Sign electronically and store them in a secure, tamper-proof cloud.",
      icon: <HiDocumentSearch />,
      color: "text-brand-blue-bright"
    },
    {
      title: "Maintenance Tracking",
      desc: "Receive and manage maintenance requests through a centralized dashboard. Keep a digital paper trail of all property repairs.",
      icon: <HiClock />,
      color: "text-brand-green-mid"
    }
  ];

  const tenantServices = [
    {
      title: "Verified Property Listings",
      desc: "Every property on InzuTrust is verified for ownership and accuracy. No more 'ghost' listings or rental fraud in Kigali.",
      icon: <HiCheckCircle />,
      color: "text-brand-green-mid"
    },
    {
      title: "Build Your Trust Score",
      desc: "Every on-time payment boosts your score. Use your high Trust Score to negotiate lower deposits and better rental rates.",
      icon: <HiTrendingUp />,
      color: "text-brand-blue-bright"
    },
    {
      title: "Digital Payment Receipts",
      desc: "Get instant, permanent proof of payment for every transaction. No more disputes over whether rent was paid.",
      icon: <HiCreditCard />,
      color: "text-brand-green-mid"
    },
    {
      title: "Secure Communication",
      desc: "Communicate with your landlord through a secure portal that keeps a professional record of all agreements and requests.",
      icon: <HiUserGroup />,
      color: "text-brand-blue-bright"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Services Hero */}
      <section className="pt-32 pb-20 px-6 md:px-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto text-left">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-8">
            Complete Rental <br /> Ecosystem.
          </h1>
          <p className="text-xl md:text-2xl text-black leading-relaxed max-w-3xl font-medium">
            We provide the digital tools necessary to make renting in Rwanda as transparent and secure as a modern bank.
          </p>
        </div>
      </section>

      {/* 2. For Landlords - White Cards / Black Text */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-start mb-16 text-left">
          <div className="bg-brand-blue-bright/10 text-brand-blue-bright px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest mb-4">
            For Property Owners
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-black">Maximize Your Yield, <br/> Minimize Your Risk.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {landlordServices.map((service, i) => (
            <div key={i} className="p-10 bg-white border-2 border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
              <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mb-8 ${service.color}`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-black text-black mb-4">{service.title}</h3>
              <p className="text-lg text-black font-medium leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Feature Highlight: The Trust Score (Middle Section) */}
      <section className="py-24 bg-black text-white px-6 md:px-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-bright/20 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="text-left relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
              The Power of the <br /> <span className="text-brand-green-mid">Trust Score.</span>
            </h2>
            <p className="text-xl text-white/80 font-medium leading-relaxed mb-10">
              Our proprietary algorithm processes payment history, lease duration, and community feedback to create a verifiable reputation score. It’s the new gold standard for Rwanda’s rental market.
            </p>
            <ul className="space-y-4">
              {['Fraud Detection', 'Behavioral Analytics', 'History Tracking'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-lg font-bold">
                  <HiCheckCircle className="text-brand-green-mid text-2xl" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
             <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-sm">
                <div className="flex justify-between items-center mb-8">
                   <div className="text-left">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Global Status</p>
                      <p className="text-2xl font-black">Verified Member</p>
                   </div>
                   <div className="w-16 h-16 rounded-full border-4 border-brand-green-mid flex items-center justify-center">
                      <span className="font-black text-xl">87%</span>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[87%] bg-brand-green-mid" />
                   </div>
                   <p className="text-sm text-white/60 font-medium text-left">This member has 14 months of consecutive on-time payments across 2 properties.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. For Tenants - White Cards / Black Text */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-start mb-16 text-left">
          <div className="bg-brand-green-mid/10 text-brand-green-mid px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest mb-4">
            For Tenants
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-black">Rent with Respect, <br/> Pay with Ease.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {tenantServices.map((service, i) => (
            <div key={i} className="p-10 bg-white border-2 border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
              <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mb-8 ${service.color}`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-black text-black mb-4">{service.title}</h3>
              <p className="text-lg text-black font-medium leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto bg-brand-blue-bright p-12 md:p-20 rounded-[48px] text-center">
          <h2 className="text-4xl md:text-6xl font-black text-black mb-8">Ready to join the 2,000+?</h2>
          <p className="text-xl text-black font-bold mb-10 max-w-2xl mx-auto">
            Whether you're listing a villa in Nyarutarama or looking for an apartment in Kacyiru, InzuTrust is your partner in trust.
          </p>
          <button className="bg-black text-white px-10 py-5 rounded-2xl text-xl font-black hover:scale-105 transition-transform">
            Start Your Verification
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;