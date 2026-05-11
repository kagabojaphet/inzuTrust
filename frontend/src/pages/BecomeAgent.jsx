import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
      icon: <UserCheck className="w-7 h-7" />,
      title: "Register & Verify",
      desc: "Create your agent profile and complete verification to unlock trusted access inside InzuTrust.",
    },
    {
      icon: <Building2 className="w-7 h-7" />,
      title: "Manage Properties",
      desc: "Upload listings, manage landlords, and organize rental inventory from one dashboard.",
    },
    {
      icon: <CalendarCheck className="w-7 h-7" />,
      title: "Schedule Viewings",
      desc: "Coordinate tenant visits and streamline communication professionally.",
    },
    {
      icon: <FileCheck className="w-7 h-7" />,
      title: "Secure Agreements",
      desc: "Generate trusted digital lease agreements with verification and transparency.",
    },
  ];

return (
  <>
    <Navbar />

    <div className="bg-[#f8fafc] text-slate-900 overflow-hidden">

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6">

        <div className="absolute inset-0 bg-gradient-to-br from-[#eff6ff] via-white to-[#dbeafe]" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >

            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Trusted Rental Ecosystem
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900">
              Become a Verified Agent on InzuTrust
            </h1>

            <p className="text-lg text-slate-600 mt-8 leading-relaxed max-w-xl">
              Join Rwanda’s modern rental platform and help landlords and tenants
              connect through secure listings, verified agreements, and trusted
              digital workflows.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">

              <a
                href="/register-agent"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-blue-200 transition-all duration-300 flex items-center gap-2"
              >
                Become an Agent
                <ArrowRight className="w-5 h-5" />
              </a>

              <button className="border border-blue-200 bg-white text-blue-700 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300">
                Learn More
              </button>

            </div>

          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_20px_60px_rgba(37,99,235,0.12)] p-8">

              <div className="flex justify-between items-center mb-8">

                <div>
                  <h3 className="font-bold text-2xl text-slate-900">
                    Agent Dashboard
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    InzuTrust Workspace
                  </p>
                </div>

                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Verified
                </div>

              </div>

              <div className="space-y-5">

                <div className="bg-blue-50 rounded-3xl p-5 flex justify-between items-center border border-blue-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Active Listings
                    </p>

                    <h2 className="text-4xl font-black text-slate-900 mt-1">
                      24
                    </h2>
                  </div>

                  <Building2 className="text-blue-600 w-10 h-10" />
                </div>

                <div className="bg-slate-50 rounded-3xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Viewing Requests
                    </p>

                    <h2 className="text-4xl font-black text-slate-900 mt-1">
                      18
                    </h2>
                  </div>

                  <CalendarCheck className="text-blue-600 w-10 h-10" />
                </div>

                <div className="bg-slate-50 rounded-3xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Trust Score
                    </p>

                    <h2 className="text-4xl font-black text-slate-900 mt-1">
                      91%
                    </h2>
                  </div>

                  <CheckCircle2 className="text-blue-600 w-10 h-10" />
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <h2 className="text-5xl font-black tracking-tight text-slate-900">
              How Agents Work on InzuTrust
            </h2>

            <p className="text-slate-500 text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
              Everything is designed to help agents operate professionally,
              securely, and transparently inside Rwanda’s trusted rental ecosystem.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {steps.map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300"
              >

                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  {step.icon}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {step.title}
                </h3>

                <p className="text-slate-500 leading-relaxed">
                  {step.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-24 px-6">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

          <div>

            <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              Trust & Verification
            </div>

            <h2 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Built Around Security & Transparency
            </h2>

            <div className="space-y-8 mt-10">

              <div className="flex gap-4">
                <ShieldCheck className="w-7 h-7 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-bold text-lg text-slate-900">
                    Verified Identities
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Every agent completes verification before accessing platform tools.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <QrCode className="w-7 h-7 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-bold text-lg text-slate-900">
                    QR Verified Agreements
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Lease agreements include secure verification and digital tracking.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-7 h-7 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-bold text-lg text-slate-900">
                    Accountability System
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Ratings, trust scores, and audit trails improve professionalism.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* TRUST CARD */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-10 text-white shadow-[0_25px_70px_rgba(37,99,235,0.35)]">

            <div className="flex justify-between items-center">

              <h3 className="text-2xl font-bold">
                Agent Trust Score
              </h3>

              <CheckCircle2 className="w-8 h-8" />

            </div>

            <div className="text-7xl font-black mt-8 tracking-tight">
              91%
            </div>

            <div className="space-y-5 mt-10 text-blue-100">

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
      <section className="py-24 px-6">

        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2.5rem] text-white p-16 text-center shadow-[0_25px_70px_rgba(37,99,235,0.3)]">

          <h2 className="text-5xl font-black tracking-tight leading-tight">
            Join Rwanda’s Trusted Rental Infrastructure
          </h2>

          <p className="mt-6 text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Start managing rentals professionally with secure tools,
            verified workflows, and trusted digital agreements.
          </p>

          <a
            href="/register"
            className="inline-flex items-center gap-2 mt-10 bg-white text-blue-700 px-10 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg"
          >
            Continue To Registration
            <ArrowRight className="w-5 h-5" />
          </a>

        </div>

      </section>
      <Footer />

       </div>
  </>
  );
}