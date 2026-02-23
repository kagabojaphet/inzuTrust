import React from 'react';

// Import logos from your local directory
import GovLogo from '../../assets/logo/Government.png';
import RRALogo from '../../assets/logo/RRA.png';
import IERLogo from '../../assets/logo/IER.png';
import MTNLogo from '../../assets/logo/MTN.png';
import AirtelLogo from '../../assets/logo/Airtel.png';
import BKLogo from '../../assets/logo/BK.png';
import EquityLogo from '../../assets/logo/Equity.png';
import IMLogo from '../../assets/logo/IM.png';
import VisaLogo from '../../assets/logo/Visa.png';

const Partners = () => {
  const partners = [
    { name: "Government of Rwanda", logo: GovLogo,},
    { name: "RRA", logo: RRALogo },
    { name: "IER", logo: IERLogo },
    { name: "MTN Rwanda", logo: MTNLogo },
    { name: "Airtel Money", logo: AirtelLogo },
    { name: "BK Group", logo: BKLogo },
    { name: "Equity Bank", logo: EquityLogo },
    { name: "VISA", logo: VisaLogo },
    { name: "I&M Bank", logo: IMLogo },
  ];

  const scrollingPartners = [...partners, ...partners];

  return (
    <section className="w-full py-16 bg-white overflow-hidden border-y border-slate-50">
      <div className="w-full px-6 md:px-12 text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
          Regulated & Trusted BY
        </h2>
      </div>

      {/* Unified Animation Track */}
      <div className="relative flex w-full items-center">
        {/* All logos move inside this single div */}
        <div className="flex animate-infinite-scroll whitespace-nowrap items-center gap-20 md:gap-32">
          {scrollingPartners.map((partner, index) => (
            <div 
              key={index} 
              className="flex items-center gap-6 shrink-0 transition-transform duration-500 hover:scale-110"
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className={`${
                  partner.isGov ? 'h-24 md:h-32' : 'h-14 md:h-18'
                } w-auto object-contain block`} 
              />

            </div>
          ))}
        </div>
      </div>

      {/* Critical CSS for the moving effect */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: scroll 30s linear infinite;
        }
        /* Pause on hover to let users look at a specific partner */
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default Partners;