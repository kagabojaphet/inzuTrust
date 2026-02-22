import React from 'react';
import { HiChevronDown } from "react-icons/hi"; // Added for the dropdown arrow
import logo from '../assets/logo/logo.jpeg';

export default function Navbar() {
  const aboutLinks = [
    { name: "About Us", href: "#" },
    { name: "Mission", href: "#" },
    { name: "Vision", href: "#" },
    { name: "Services", href: "#" },
    { name: "Board", href: "#" },
  ];

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-sm sticky top-0 z-50 font-sans">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="InzuTrust" className="h-10 w-auto rounded object-contain" />
        <span className="text-xl font-extrabold text-brand-blue-dark">InzuTrust</span>
      </div>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8 text-slate-700 font-semibold">
        <a href="/" className="text-brand-blue-bright border-b-2 border-brand-blue-bright pb-1 transition-all">
          Home
        </a>

        {/* Dropdown Menu for About */}
        <div className="relative group py-2">
          <button className="flex items-center gap-1 hover:text-brand-blue-bright transition-colors cursor-pointer">
            About <HiChevronDown className="group-hover:rotate-180 transition-transform duration-300" />
          </button>
          
          {/* Dropdown Content */}
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

        <a href="#" className="hover:text-brand-blue-bright transition-colors">Properties</a>
        <a href="#" className="hover:text-brand-blue-bright transition-colors">Prices</a>
        <a href="#" className="hover:text-brand-blue-bright transition-colors">Careers</a>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="text-slate-600 font-bold hover:text-brand-blue-dark transition-colors">Log In</button>
        <button className="bg-brand-green-mid hover:bg-brand-green-dark text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
          Get Started
        </button>
      </div>
    </nav>
  );
}