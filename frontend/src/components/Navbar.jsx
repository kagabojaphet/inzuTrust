import React from 'react';
import { HiChevronDown } from "react-icons/hi";
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo/logo.jpeg';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  const aboutLinks = [
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Board", href: "/board" },
  ];

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-sm sticky top-0 z-50 font-sans">
      <div className="flex items-center gap-2">
        <img src={logo} alt="InzuTrust" className="h-10 w-auto rounded object-contain" />
        <span className="text-xl font-extrabold text-brand-blue-dark">InzuTrust</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-black font-semibold">
        <a href="/" className="text-brand-blue-bright border-b-2 border-brand-blue-bright pb-1 transition-all">
          {t("navbar.home")}
        </a>

        <div className="relative group py-2">
          <button className="flex items-center gap-1 hover:text-brand-blue-bright transition-colors cursor-pointer">
            About <HiChevronDown className="group-hover:rotate-180 transition-transform duration-300" />
          </button>
          
          <div className="absolute left-0 top-full hidden group-hover:block w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-2 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {aboutLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-blue-bright transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        <a href="/properties" className="hover:text-brand-blue-bright transition-colors">{t("navbar.properties")}</a>
        <a href="/prices" className="hover:text-brand-blue-bright transition-colors">Prices</a>
        <a href="/careers" className="hover:text-brand-blue-bright transition-colors">Careers</a>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group py-2">
          <button className="flex items-center gap-1.5 text-black font-bold hover:text-brand-blue-bright transition-colors text-sm uppercase">
            <span className="flex items-center gap-1.5">
              <span>{language === 'en' ? 'EN' : 'RW'}</span>
            </span>
            <HiChevronDown className="group-hover:rotate-180 transition-transform duration-300" />
          </button>

          <div className="absolute right-0 top-full hidden group-hover:block w-40 bg-white border border-slate-100 shadow-xl rounded-xl py-2 mt-1 animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-all hover:bg-slate-50 font-bold ${language === 'en' ? 'text-brand-blue-bright' : 'text-black'}`}
            >
              🇺🇸 English (EN)
            </button>
            <button 
              onClick={() => setLanguage('rw')}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-all hover:bg-slate-50 font-bold ${language === 'rw' ? 'text-brand-blue-bright' : 'text-black'}`}
            >
              🇷🇼 Kinyarwanda (RW)
            </button>
          </div>
        </div>

        <button className="text-black font-bold hover:text-brand-blue-dark transition-colors">{t("navbar.login")}</button>
        <button className="bg-brand-green-mid hover:bg-brand-green-dark text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
          {t("hero.getStarted")}
        </button>
      </div>
    </nav>
  );
}