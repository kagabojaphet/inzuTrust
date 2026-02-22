import React, { useState } from 'react';
import { HiChevronDown } from "react-icons/hi";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { 
      q: "How exactly is my Rental Trust Score calculated?", 
      a: "Your Trust Score is a comprehensive metric calculated through our proprietary algorithm. It evaluates four key areas: 1) Identity verification through official government integration, 2) Your history of on-time rental payments via Mobile Money or Bank transfer, 3) Verified reviews from previous landlords on our platform, and 4) Digital lease compliance." 
    },
    { 
      q: "Are my financial transactions and personal data secure?", 
      a: "Security is our highest priority. All payments are processed through bank-grade encrypted gateways in direct partnership with MTN Rwanda, Airtel Money, and local commercial banks. We never store your full card details or mobile money PINs." 
    },
    { 
      q: "What is the physical verification process for house listings?", 
      a: "Unlike other marketplaces, we don't just allow anyone to upload photos. Our field verification team physically visits every property listed as 'Verified'. We check the actual condition of the house, confirm the landlord's ownership documents, and ensure amenities match the description." 
    },
    { 
      q: "How do digital lease agreements work on the platform?", 
      a: "Once you and the landlord agree on terms, we generate a legally binding digital lease agreement. Both parties can review, suggest edits, and sign electronically. These documents are securely stored in your dashboard and serve as official proof of residence." 
    },
    { 
      q: "What happens if there is a dispute between me and my landlord?", 
      a: "Our platform includes a dedicated dispute mediation module. If an issue arises regarding maintenance or deposits, you can raise a ticket through your dashboard. Our legal and support team will review the digital communication history and lease terms to provide an objective mediation." 
    }
  ];

  const contactIndex = faqs.length;

  return (
    <section className="w-full py-20 bg-white font-sans">
      <div className="w-full px-6 md:px-12 text-left">
        
        {/* Header - Aligned Left */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-black text-lg font-medium max-w-3xl opacity-80">
            Everything you need to know about the most advanced rental ecosystem in Rwanda.
          </p>
        </div>

        {/* FAQ List */}
        <div className="w-full flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg border border-slate-200 transition-all duration-300 ${openIndex === index ? 'shadow-lg border-brand-blue-bright/30' : 'hover:border-slate-300'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left"
              >
                <span className={`text-lg font-bold leading-snug transition-colors duration-300 ${openIndex === index ? 'text-brand-blue-bright opacity-100' : 'text-slate-900 opacity-90'}`}>
                  {faq.q}
                </span>
                
                {/* Icon with background color matching reference */}
                <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-brand-blue-bright text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                  <HiChevronDown className="text-xl" />
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 text-slate-600 text-lg leading-relaxed font-medium">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}

          {/* Special "Still have questions?" Row */}
          <div className={`bg-slate-50 rounded-lg border border-slate-200 transition-all duration-300 ${openIndex === contactIndex ? 'shadow-lg border-brand-blue-bright/30' : 'hover:border-slate-300'}`}>
            <button 
              onClick={() => setOpenIndex(openIndex === contactIndex ? null : contactIndex)}
              className="w-full flex items-center justify-between p-5 md:p-6 text-left"
            >
              <span className={`text-lg font-bold leading-snug transition-colors duration-300 ${openIndex === contactIndex ? 'text-brand-blue-bright' : 'text-slate-900'}`}>
                Still have questions?
              </span>
              
              {/* Icon background for the last question box */}
              <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === contactIndex ? 'bg-brand-blue-bright text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
                <HiChevronDown className="text-xl" />
              </div>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === contactIndex ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-6 pb-8 text-left">
                <p className="text-lg font-medium text-slate-600 mb-6">We're here to help you 24/7. Reach out to our team for any assistance.</p>
                <button className="bg-brand-blue-bright text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 text-md">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;