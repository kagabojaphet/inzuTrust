import React from 'react';
import { FaXTwitter, FaInstagram, FaFacebookF } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import Logo from "../assets/logo/logo.jpeg"; 

export default function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Trust Score", "Integrations"]
    },
    {
      title: "Resources",
      links: ["Documentation", "Media Kit", "API Status", "Safety"]
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Press", "Contact"]
    },
    {
      title: "Support",
      links: ["Help Center", "Privacy Policy", "Terms of Service", "Trust Center"]
    }
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-100 pt-20 pb-10 px-6 md:px-12 font-sans">
      
      {/* Newsletter Section */}
      <div className="w-full mb-20 p-8 md:p-12 bg-slate-50 rounded-lg flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-100 shadow-xl shadow-slate-200/30">
        <div className="max-w-md text-left">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Subscribe to our newsletter</h3>
          <p className="text-black font-semibold">Join our community for property insights and digital rental tips.</p>
        </div>
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full sm:w-72 pl-12 pr-4 py-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-bold text-black"
            />
          </div>
          {/* Removed uppercase and tracking from button */}
          <button className="bg-brand-blue-bright text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg text-md">
            Subscribe
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="space-y-6 md:col-span-1 text-left">
          <div className="flex items-center gap-2">
            <img 
              src={Logo} 
              alt="InzuTrust Logo" 
              className="h-9 w-auto object-contain rounded" 
            />
            <span className="text-black font-black text-xl tracking-tighter">InzuTrust</span>
          </div>
          <p className="text-black text-sm leading-relaxed max-w-xs font-bold opacity-80">
            Making renting secure, transparent, and easy for everyone in East Africa.
          </p>
        </div>

        {/* Links Columns */}
        {footerSections.map((section) => (
          <div key={section.title} className="text-left">
            {/* Title: Removed uppercase and tracking */}
            <h4 className="font-black text-black mb-8 text-lg">
              {section.title}
            </h4>
            <ul className="space-y-4 text-black text-sm font-bold">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-brand-blue-bright transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="w-full pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 text-black text-[13px] font-bold">
          <div className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
            ©
          </div>
          <span>
            2026 Inzu Trust Rwanda. All rights reserved
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-6 text-black/60 text-xl">
            <a href="#" className="hover:text-brand-blue-bright transition-all"><FaXTwitter /></a>
            <a href="#" className="hover:text-brand-blue-bright transition-all"><FaInstagram /></a>
            <a href="#" className="hover:text-brand-blue-bright transition-all"><FaFacebookF /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}