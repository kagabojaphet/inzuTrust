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
  Sparkles,
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
    <div className="bg-[#f8fafc] text-slate-800 overflow-hidden">

      {/* HERO */}
      <section className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-8">

        <div className="absolute inset-0 bg-gradient-to-br from-[#eff6ff] via-white to-[#dbeafe]" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5">
              <Sparkles className="w-4 h-4" />
              Trusted Rental Ecosystem
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-slate-900">
              Become a Verified Agent on InzuTrust
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mt-6 leading-relaxed max-w-xl">
              Join Rwanda’s modern rental platform and help landlords and tenants
              connect through secure listings, verified agreements, and trusted
              digital workflows.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">

              <a
                href="/register/agent"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2"
              >
                Become an Agent
                <ArrowRight className="w-4 h-4" />
              </a>

              <button className="border border-blue-200 bg-white text-blue-700 px-6 py-3 rounded-2xl font-medium hover:bg-blue-50 transition-all duration-300">
                Learn More
              </button>

            </div>

          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-lg p-6 sm:p-8">

              <div className="flex justify-between items-center mb-7">

                <div>
                  <h3 className="font-semibold text-xl text-slate-900">
                    Agent Dashboard
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    InzuTrust Workspace
                  </p>
                </div>

                <div className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full text-xs sm:text-sm font-medium">
                  Verified
                </div>

              </div>

              <div className="space-y-4">

                <div className="bg-blue-50 rounded-2xl p-5 flex justify-between items-center border border-blue-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Active Listings
                    </p>

                    <h2 className="text-3xl font-semibold text-slate-900 mt-1">
                      24
                    </h2>
                  </div>

                  <Building2 className="text-blue-600 w-8 h-8" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Viewing Requests
                    </p>

                    <h2 className="text-3xl font-semibold text-slate-900 mt-1">
                      18
                    </h2>
                  </div>

                  <CalendarCheck className="text-blue-600 w-8 h-8" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Trust Score
                    </p>

                    <h2 className="text-3xl font-semibold text-slate-900 mt-1">
                      91%
                    </h2>
                  </div>

                  <CheckCircle2 className="text-blue-600 w-8 h-8" />
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              How Agents Work on InzuTrust
            </h2>

            <p className="text-slate-500 text-base sm:text-lg mt-5 max-w-3xl mx-auto leading-relaxed">
              Everything is designed to help agents operate professionally,
              securely, and transparently inside Rwanda’s trusted rental ecosystem.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {steps.map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-100 rounded-[1.8rem] p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >

                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  {step.icon}
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                  {step.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-20 px-4 sm:px-6 lg:px-8">

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5">
              <ShieldCheck className="w-4 h-4" />
              Trust & Verification
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
              Built Around Security & Transparency
            </h2>

            <div className="space-y-7 mt-8">

              <div className="flex gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-semibold text-lg text-slate-900">
                    Verified Identities
                  </h4>

                  <p className="text-slate-500 mt-1 leading-relaxed">
                    Every agent completes verification before accessing platform tools.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <QrCode className="w-6 h-6 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-semibold text-lg text-slate-900">
                    QR Verified Agreements
                  </h4>

                  <p className="text-slate-500 mt-1 leading-relaxed">
                    Lease agreements include secure verification and digital tracking.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-semibold text-lg text-slate-900">
                    Accountability System
                  </h4>

                  <p className="text-slate-500 mt-1 leading-relaxed">
                    Ratings, trust scores, and audit trails improve professionalism.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* TRUST CARD */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-8 sm:p-10 text-white shadow-xl">

            <div className="flex justify-between items-center">

              <h3 className="text-xl sm:text-2xl font-semibold">
                Agent Trust Score
              </h3>

              <CheckCircle2 className="w-7 h-7" />

            </div>

            <div className="text-6xl font-semibold mt-7 tracking-tight">
              91%
            </div>

            <div className="space-y-5 mt-10 text-blue-100 text-sm sm:text-base">

              <div className="flex justify-between">
                <span>Verified Identity</span>
                <span>✔</span>
              </div>

              <div className="flex justify-between">
                <span>24 Successful Rentals</span>
                <span>✔</span>
              </div>

              <div className="flex justify-between">
                <span>4.8/5 Tenant Rating</span>
                <span>✔</span>
              </div>

              <div className="flex justify-between">
                <span>No Fraud Reports</span>
                <span>✔</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">

        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2.5rem] text-white p-8 sm:p-12 md:p-16 text-center shadow-xl">

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Join Rwanda’s Trusted Rental Infrastructure
          </h2>

          <p className="mt-5 text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Start managing rentals professionally with secure tools,
            verified workflows, and trusted digital agreements.
          </p>

          <a
            href="/register/agent"
            className="inline-flex items-center gap-2 mt-8 bg-white text-blue-700 px-7 py-4 rounded-2xl font-medium hover:bg-blue-50 transition-all duration-300"
          >
            Continue To Registration
            <ArrowRight className="w-5 h-5" />
          </a>

        </div>

      </section>

    </div>
  );
}