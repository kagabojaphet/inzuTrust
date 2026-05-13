// src/pages/BecomeAgent.jsx

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  FileCheck,
  CalendarCheck,
  UserCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function BecomeAgent() {
  const steps = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Register & Verify",
      desc: "Create your agent profile and complete verification to unlock trusted access inside InzuTrust.",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Manage Properties",
      desc: "Upload listings, manage landlords, and organize rental inventory from one dashboard.",
    },
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: "Schedule Viewings",
      desc: "Coordinate tenant visits and streamline communication professionally.",
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Secure Agreements",
      desc: "Generate trusted digital lease agreements with verification and transparency.",
    },
  ];

  return (
    <div className="bg-[#f8fafc] text-slate-800 overflow-x-hidden">

      {/* HERO */}
      <section className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eff6ff] via-white to-[#dbeafe]" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight tracking-tight text-slate-900">
              Become a Verified Agent on InzuTrust
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mt-5 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Join Rwanda’s modern rental platform and connect landlords and tenants
              through verified listings and secure workflows.
            </p>

            <div className="flex flex-wrap gap-4 mt-7 justify-center lg:justify-start">

              <a
                href="/register/agent"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition flex items-center gap-2"
              >
                Become an Agent
                <ArrowRight className="w-4 h-4" />
              </a>

              <button className="border border-blue-200 bg-white text-blue-700 px-6 py-3 rounded-2xl font-medium hover:bg-blue-50 transition">
                Learn More
              </button>

            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative w-full max-w-md mx-auto lg:max-w-none"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-6 sm:p-8">

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-medium text-lg text-slate-900">
                    Agent Dashboard
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    InzuTrust Workspace
                  </p>
                </div>

                <div className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full text-xs font-medium">
                  Verified
                </div>
              </div>

              <div className="space-y-4">

                <div className="bg-blue-50 rounded-2xl p-5 flex justify-between items-center border border-blue-100">
                  <div>
                    <p className="text-sm text-slate-500">Active Listings</p>
                    <h2 className="text-xl sm:text-2xl font-medium text-slate-900 mt-1">
                      24
                    </h2>
                  </div>
                  <Building2 className="text-blue-600 w-6 h-6" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">Viewing Requests</p>
                    <h2 className="text-xl sm:text-2xl font-medium text-slate-900 mt-1">
                      18
                    </h2>
                  </div>
                  <CalendarCheck className="text-blue-600 w-6 h-6" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">Trust Score</p>
                    <h2 className="text-xl sm:text-2xl font-medium text-slate-900 mt-1">
                      91%
                    </h2>
                  </div>
                  <CheckCircle2 className="text-blue-600 w-6 h-6" />
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl font-medium text-slate-900">
              How Agents Work on InzuTrust
            </h2>

            <p className="text-slate-500 text-base mt-4 max-w-2xl mx-auto">
              Built for clarity, not complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {steps.map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200 rounded-[1.5rem] p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  {step.icon}
                </div>

                <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">
                  {step.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* TRUST */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-2xl sm:text-3xl font-medium text-slate-900">
              Built Around Security & Transparency
            </h2>

            <div className="space-y-6 mt-8">

              <div className="flex gap-4">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-base text-slate-900">
                    Verified Identities
                  </h4>
                  <p className="text-slate-500 text-sm mt-1">
                    Every agent is verified before access.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <QrCode className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-base text-slate-900">
                    QR Verified Agreements
                  </h4>
                  <p className="text-slate-500 text-sm mt-1">
                    Secure digital lease tracking.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-base text-slate-900">
                    Accountability System
                  </h4>
                  <p className="text-slate-500 text-sm mt-1">
                    Ratings and trust scoring.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-8 sm:p-10 text-white border border-blue-500">

            <h3 className="text-lg font-medium">
              Agent Trust Score
            </h3>

            <div className="text-4xl sm:text-5xl font-medium mt-6">
              91%
            </div>

            <div className="space-y-4 mt-8 text-blue-100 text-sm">
              <div className="flex justify-between"><span>Verified Identity</span><span>✔</span></div>
              <div className="flex justify-between"><span>24 Rentals</span><span>✔</span></div>
              <div className="flex justify-between"><span>4.8 Rating</span><span>✔</span></div>
              <div className="flex justify-between"><span>No Fraud</span><span>✔</span></div>
            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2rem] text-white p-8 sm:p-12 text-center border border-blue-500">

          <h2 className="text-2xl sm:text-3xl font-medium">
            Join Rwanda’s Trusted Rental System
          </h2>

          <p className="mt-4 text-blue-100 text-sm sm:text-base">
            Start managing rentals professionally.
          </p>

          <a
            href="/register/agent"
            className="inline-flex items-center gap-2 mt-6 bg-white text-blue-700 px-6 py-3 rounded-2xl font-medium"
          >
            Continue Registration
            <ArrowRight className="w-5 h-5" />
          </a>

        </div>
      </section>

    </div>
  );
}