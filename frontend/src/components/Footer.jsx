import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaXTwitter,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn
} from "react-icons/fa6";

import {
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineClock
} from "react-icons/hi";

import Logo from "../assets/logo/logo.jpeg";

export default function Footer() {
  const [email, setEmail] = useState("");

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Properties", path: "/properties" },
        { name: "Pricing", path: "/prices" },
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact-us" }
      ]
    },

    {
      title: "Become",
      links: [
        { name: "Become an Agent", path: "/register/agent" },
        { name: "Become a Landlord", path: "/register/landlord" },
        { name: "Register as Tenant", path: "/register/tenant" }
      ]
    },

    {
      title: "Company",
      links: [
        { name: "Careers", path: "/careers" },
        { name: "News", path: "/news" },
        { name: "Board of Directors", path: "/board" },
        { name: "Support", path: "/contact-us" }
      ]
    },

    {
      title: "Resources",
      links: [
        { name: "Help Center", path: "/help-center" },
        { name: "Documentation", path: "/documentation" },
        { name: "Terms & Conditions", path: "/terms-and-conditions" },
        { name: "Services", path: "/services" }
      ]
    }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    console.log("Subscribed email:", email);

    // later: connect to backend / email service
    alert("Subscribed successfully!");
    setEmail("");
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-20 pb-10 px-6 md:px-12">

      {/* TOP GRID */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

        {/* BRAND */}
        <div className="lg:col-span-2 text-left">

          <Link to="/" className="flex items-center gap-3 mb-6">
            <img
              src={Logo}
              alt="InzuTrust Logo"
              className="h-10 w-10 object-cover rounded-xl"
            />
            <span className="text-slate-900 font-semibold text-2xl">
              InzuTrust
            </span>
          </Link>

          <p className="text-slate-600 text-sm leading-7 mb-6 max-w-sm">
            Making renting secure, transparent, and simple for tenants,
            landlords, and agents across Rwanda and East Africa.
          </p>

          {/* CONTACT */}
          <div className="space-y-3">

            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <HiOutlineMail className="text-brand-blue-bright" />
              support@inzutrust.com
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <HiOutlinePhone className="text-brand-blue-bright" />
              +250 788 000 000
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <HiOutlineLocationMarker className="text-brand-blue-bright" />
              Kigali, Rwanda
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <HiOutlineClock className="text-brand-blue-bright" />
              Mon - Fri: 08:00 - 18:00
            </div>

          </div>
        </div>

        {/* LINKS */}
        {footerSections.map((section) => (
          <div key={section.title} className="text-left">

            <h4 className="text-slate-900 font-semibold text-lg mb-6">
              {section.title}
            </h4>

            <ul className="space-y-4">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-600 text-sm hover:text-brand-blue-bright transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

          </div>
        ))}

       {/* NEWSLETTER */}
<div className="lg:col-span-2 text-left">

  <h4 className="text-slate-900 font-semibold text-lg mb-6">
    Newsletter
  </h4>

  <p className="text-slate-600 text-sm mb-4">
    Get updates about properties, rentals, and market insights.
  </p>

  {/* 🔥 FIXED: input + button in same row */}
  <form onSubmit={handleSubscribe} className="w-full">

    <div className="flex flex-col sm:flex-row gap-3">

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue-bright"
      />

      <button
        type="submit"
        className="px-6 py-3 bg-brand-blue-bright text-white rounded-lg font-medium hover:bg-blue-700 transition whitespace-nowrap"
      >
        Subscribe
      </button>

    </div>

  </form>

</div>

      </div>

      {/* BOTTOM */}
      <div className="w-full pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="text-slate-500 text-sm">
          © 2026 InzuTrust Rwanda. All rights reserved.
        </div>

        <div className="flex items-center gap-5 text-lg text-slate-500">

          <a href="#" className="hover:text-brand-blue-bright"><FaXTwitter /></a>
          <a href="#" className="hover:text-brand-blue-bright"><FaInstagram /></a>
          <a href="#" className="hover:text-brand-blue-bright"><FaFacebookF /></a>
          <a href="#" className="hover:text-brand-blue-bright"><FaLinkedinIn /></a>

        </div>

      </div>

    </footer>
  );
}