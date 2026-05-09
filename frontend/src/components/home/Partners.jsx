import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

  const partners = [
    { name: "Government of Rwanda", logo: GovLogo },
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
    <section className="w-full py-14 bg-white overflow-hidden border-y border-slate-100">

      {/* TITLE */}
      <div className="w-full px-6 md:px-12 text-center mb-10">

        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
          {t("partners.title")}
        </h2>

      </div>

      {/* LOGOS */}
      <div className="relative flex w-full items-center">

        <div className="flex animate-infinite-scroll whitespace-nowrap items-center gap-14 md:gap-24">

          {scrollingPartners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center shrink-0 opacity-80 hover:opacity-100 transition-all duration-300"
            >

              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />

            </div>
          ))}

        </div>

      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }

            .animate-infinite-scroll {
              display: flex;
              width: max-content;
              animation: scroll 28s linear infinite;
            }

            .animate-infinite-scroll:hover {
              animation-play-state: paused;
            }
          `
        }}
      />

    </section>
  );
};

export default Partners;