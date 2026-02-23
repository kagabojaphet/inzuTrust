import React, { useState } from 'react';
import { HiCheckCircle, HiArrowRight, HiOutlineShieldCheck, HiOutlineLibrary, HiOutlineLightningBolt } from "react-icons/hi";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Standard Tenant",
      tagline: "Secure your next home with trust.",
      price: isYearly ? "2,500" : "3,000",
      icon: <HiOutlineShieldCheck className="text-brand-blue-bright" />,
      features: [
        "Verified Trust Score",
        "Digital Lease Signing",
        "Rent Payment Tracking",
        "24/7 Support Access"
      ],
      buttonText: "Get Started",
      highlight: false
    },
    {
      name: "Professional Landlord",
      tagline: "Manage properties with zero stress.",
      price: isYearly ? "12,000" : "15,000",
      icon: <HiOutlineLightningBolt className="text-brand-green-mid" />,
      features: [
        "Everything in Tenant Plan",
        "Tenant Background Checks",
        "Automated Rent Collection",
        "Maintenance Request Portal",
        "Financial Analytics Dashboard"
      ],
      buttonText: "Start Managing",
      highlight: true
    },
    {
      name: "Enterprise",
      tagline: "For large agencies and developers.",
      price: "Custom",
      icon: <HiOutlineLibrary className="text-brand-blue-bright" />,
      features: [
        "Unlimited Property Listings",
        "Custom Trust Algorithms",
        "Dedicated Account Manager",
        "API Integration Access",
        "On-site Team Training"
      ],
      buttonText: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Header Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 bg-slate-50 border-b border-slate-100 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-8 leading-tight">
            Plans built for <br /> 
            <span className="text-brand-blue-bright">Total Transparency.</span>
          </h1>
          <p className="text-xl text-black/60 font-medium mb-12">
            Choose the right plan to protect your property interests in Rwanda.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4">
            <span className={`font-bold ${!isYearly ? 'text-black' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-16 h-8 bg-brand-blue-bright rounded-full relative p-1 transition-all"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${isYearly ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
            <span className={`font-bold ${isYearly ? 'text-black' : 'text-slate-400'}`}>
              Yearly <span className="text-brand-green-mid text-xs ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Pricing Cards */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`p-10 rounded-[48px] border-2 transition-all flex flex-col ${
                plan.highlight 
                ? 'border-brand-blue-bright bg-brand-blue-bright text-white shadow-2xl scale-105 z-10' 
                : 'border-slate-100 bg-white text-black hover:border-brand-blue-bright/30'
              }`}
            >
              <div className={`text-5xl mb-6`}>{plan.icon}</div>
              <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
              <p className={`text-sm font-bold mb-8 ${plan.highlight ? 'text-white/70' : 'text-slate-400'}`}>
                {plan.tagline}
              </p>
              
              <div className="mb-8">
                <span className="text-5xl font-black">
                  {plan.price !== "Custom" ? `RWF ${plan.price}` : "Custom"}
                </span>
                {plan.price !== "Custom" && <span className="text-sm font-bold opacity-60"> / month</span>}
              </div>

              <div className="space-y-4 mb-12 flex-grow">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <HiCheckCircle className={plan.highlight ? 'text-brand-green-mid' : 'text-brand-blue-bright'} />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-full font-black uppercase tracking-widest transition-all ${
                plan.highlight 
                ? 'bg-brand-green-mid text-black hover:scale-105' 
                : 'bg-black text-white hover:bg-brand-blue-bright'
              }`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Detailed Comparison Section (Table) */}
      <section className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <h2 className="text-3xl font-black text-black mb-12 text-center">Compare every detail</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-6 px-4 font-black text-black uppercase tracking-widest text-sm">Feature</th>
                <th className="py-6 px-4 font-black text-black uppercase tracking-widest text-sm">Tenant</th>
                <th className="py-6 px-4 font-black text-brand-blue-bright uppercase tracking-widest text-sm">Landlord</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-6 px-4 font-bold text-black">Verified Trust Score</td>
                <td className="py-6 px-4">Included</td>
                <td className="py-6 px-4">Included</td>
              </tr>
              <tr>
                <td className="py-6 px-4 font-bold text-black">E-Sign Documents</td>
                <td className="py-6 px-4">1 / Month</td>
                <td className="py-6 px-4">Unlimited</td>
              </tr>
              <tr>
                <td className="py-6 px-4 font-bold text-black">Tenant Background Check</td>
                <td className="py-6 px-4 text-slate-300">—</td>
                <td className="py-6 px-4">Included</td>
              </tr>
              <tr>
                <td className="py-6 px-4 font-bold text-black">Mobile Money Auto-Pay</td>
                <td className="py-6 px-4">Included</td>
                <td className="py-6 px-4">Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Pricing;