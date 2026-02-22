import React, { useState } from 'react';
import { HiChevronDown } from "react-icons/hi";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { 
      q: "How exactly is my Rental Trust Score calculated?", 
      a: "Your Trust Score is a comprehensive metric calculated through our proprietary algorithm. It evaluates four key areas: 1) Identity verification through official government integration, 2) Your history of on-time rental payments via Mobile Money or Bank transfer, 3) Verified reviews from previous landlords on our platform, and 4) Digital lease compliance. A higher score unlocks lower security deposits and priority access to premium listings." 
    },
    { 
      q: "Are my financial transactions and personal data secure?", 
      a: "Security is our highest priority. All payments are processed through bank-grade encrypted gateways in direct partnership with MTN Rwanda, Airtel Money, and local commercial banks. We never store your full card details or mobile money PINs. Furthermore, your personal data is protected under the Law Relating to the Protection of Personal Data and Privacy in Rwanda." 
    },
    { 
      q: "What is the physical verification process for house listings?", 
      a: "Unlike other marketplaces, we don't just allow anyone to upload photos. Our field verification team physically visits every property listed as 'Verified'. We check the actual condition of the house, confirm the landlord's ownership documents, and ensure the amenities (water, electricity, internet) match the description. This eliminates the risk of 'ghost houses' or misleading advertisements." 
    },
    { 
      q: "How do digital lease agreements work on the platform?", 
      a: "Once you and the landlord agree on terms, we generate a legally binding digital lease agreement. Both parties can review, suggest edits, and sign electronically. These documents are securely stored in your dashboard and serve as official proof of residence, which can be used for administrative purposes or to help build your rental history and Trust Score over time." 
    },
    { 
      q: "What happens if there is a dispute between me and my landlord?", 
      a: "Our platform includes a dedicated dispute mediation module. If an issue arises regarding maintenance or deposits, you can raise a ticket through your dashboard. Our legal and support team will review the digital communication history and lease terms to provide an objective mediation. Because all interactions and payments are recorded on the platform, most disputes are resolved within 48 hours." 
    }
  ];

  return (
    <section className="w-full py-24 bg-white font-sans">
      {/* Full-width container with horizontal padding */}
      <div className="w-full px-6 md:px-12">
        
        <div className="mb-16 text-left">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-900 text-lg md:text-xl font-semibold opacity-80 max-w-3xl">
            Everything you need to know about the most advanced rental ecosystem in Rwanda.
          </p>
        </div>

        {/* FAQ Grid/List spanning the full width */}
        <div className="grid grid-cols-1 gap-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 transition-all duration-500 ${openIndex === index ? 'shadow-2xl ring-1 ring-brand-blue-bright/10' : ''}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left group"
              >
                <span className={`text-xl md:text-2xl font-black tracking-tight transition-colors duration-300 ${openIndex === index ? 'text-brand-blue-bright' : 'text-slate-900'}`}>
                  {faq.q}
                </span>
                <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 shadow-sm transition-all duration-300 ${openIndex === index ? 'bg-brand-blue-bright text-white rotate-180' : 'bg-white text-slate-400'}`}>
                  <HiChevronDown className="text-xl" />
                </div>
              </button>
              
              {/* Expandable Answer */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-8 pt-0 text-slate-900 text-lg md:text-xl font-semibold opacity-70 leading-relaxed border-t border-slate-50 mt-2">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action for more questions */}
        <div className="mt-16 p-10 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Still have questions?</h3>
          <p className="text-lg font-semibold text-slate-900 opacity-70 mb-6">We're here to help you 24/7.</p>
          <button className="bg-brand-blue-bright text-white px-10 py-4 rounded-lg font-bold shadow-xl hover:bg-brand-blue-bright transition-all transform hover:-translate-y-1">
            Contact Support Team
          </button>
        </div>

      </div>
    </section>
  );
};

export default FAQ;