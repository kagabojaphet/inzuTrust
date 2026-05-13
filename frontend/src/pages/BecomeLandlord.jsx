// src/pages/BecomeLandlord.jsx

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  FileCheck,
  UserCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Home,
  Wallet,
  CalendarCheck,
} from "lucide-react";

export default function BecomeLandlord() {
  const features = [
    {
      icon: <Home className="w-6 h-6" />,
      title: "List Properties",
      desc: "Upload and manage rental properties in a structured system.",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Verified Tenants",
      desc: "Reduce risk by connecting only with verified users.",
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Digital Agreements",
      desc: "Secure QR-verified lease contracts.",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Rental Management",
      desc: "Track tenants, payments, and rental operations.",
    },
  ];

  return (
    <>
      <div className="bg-[#f8fafc] text-slate-900 overflow-x-hidden">

        {/* HERO */}
        <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#eff6ff] via-white to-[#dbeafe]" />

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">

            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight text-slate-900">
                Manage Properties Professionally
              </h1>

              <p className="text-base text-slate-600 mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                InzuTrust helps landlords manage rentals, tenants, and agreements in a secure system.
              </p>

              <div className="flex flex-wrap gap-4 mt-7 justify-center lg:justify-start">

                <a
                  href="/register/landlord"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition flex items-center gap-2"
                >
                  Become a Landlord
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button className="border border-blue-200 bg-white text-blue-700 px-6 py-3 rounded-2xl font-medium hover:bg-blue-50 transition">
                  Learn More
                </button>

              </div>
            </motion.div>

            {/* RIGHT DASHBOARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-6 sm:p-8">

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-medium text-lg text-slate-900">
                      Landlord Dashboard
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Property Management Workspace
                    </p>
                  </div>

                  <div className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full text-xs font-medium">
                    Verified
                  </div>
                </div>

                <div className="space-y-4">

                  <div className="bg-blue-50 rounded-2xl p-5 flex justify-between items-center border border-blue-100">
                    <div>
                      <p className="text-sm text-slate-500">Active Properties</p>
                      <h2 className="text-2xl font-medium text-slate-900 mt-1">
                        12
                      </h2>
                    </div>
                    <Building2 className="text-blue-600 w-7 h-7" />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500">Active Tenants</p>
                      <h2 className="text-2xl font-medium text-slate-900 mt-1">
                        28
                      </h2>
                    </div>
                    <UserCheck className="text-blue-600 w-7 h-7" />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500">Lease Agreements</p>
                      <h2 className="text-2xl font-medium text-slate-900 mt-1">
                        19
                      </h2>
                    </div>
                    <FileCheck className="text-blue-600 w-7 h-7" />
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-medium text-slate-900">
                Everything You Need
              </h2>

              <p className="text-slate-500 text-base mt-4 max-w-2xl mx-auto">
                Tools for modern rental management.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-slate-200 rounded-[1.5rem] p-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>

                  <h3 className="text-base font-medium text-slate-900 mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-slate-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-medium text-slate-900">
                How It Works
              </h2>

              <p className="text-slate-500 text-base mt-4 max-w-2xl mx-auto">
                Simple structured workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {[
                { icon: <UserCheck />, title: "Register", desc: "Create account" },
                { icon: <ShieldCheck />, title: "Verify", desc: "Identity check" },
                { icon: <Building2 />, title: "Add Properties", desc: "List rentals" },
                { icon: <CalendarCheck />, title: "Manage", desc: "Handle tenants" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>

                  <h3 className="text-base font-medium text-slate-900 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}

            </div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">

            <div>
              <h2 className="text-2xl sm:text-3xl font-medium text-slate-900">
                Trusted Rental System
              </h2>

              <div className="space-y-6 mt-8">

                {[
                  "Verified Tenants",
                  "QR Lease Contracts",
                  "Secure Records",
                ].map((t, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-base text-slate-900">
                        {t}
                      </h4>
                      <p className="text-slate-500 text-sm mt-1">
                        System-backed verification
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white border border-blue-500">

              <h3 className="text-lg font-medium">
                Landlord Status
              </h3>

              <div className="text-4xl font-medium mt-6">
                Verified
              </div>

              <div className="mt-6 space-y-3 text-sm text-blue-100">
                <div className="flex justify-between"><span>Identity</span><span>✔</span></div>
                <div className="flex justify-between"><span>Properties</span><span>✔</span></div>
                <div className="flex justify-between"><span>History</span><span>✔</span></div>
              </div>

            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2rem] text-white p-10 text-center border border-blue-500">

            <h2 className="text-2xl sm:text-3xl font-medium">
              Start Managing Properties
            </h2>

            <p className="mt-4 text-blue-100 text-sm">
              Join structured rental management.
            </p>

            <a
              href="/register/landlord"
              className="inline-flex items-center gap-2 mt-6 bg-white text-blue-700 px-6 py-3 rounded-2xl font-medium"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>

          </div>
        </section>

      </div>
    </>
  );
}