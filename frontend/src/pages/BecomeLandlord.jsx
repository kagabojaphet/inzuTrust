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
  Sparkles,
  CalendarCheck,
} from "lucide-react";

import {
  FaXTwitter,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";

export default function BecomeLandlord() {

  const features = [
    {
      icon: <Home className="w-7 h-7" />,
      title: "List Properties",
      desc: "Upload and manage rental properties professionally inside a trusted ecosystem.",
    },
    {
      icon: <UserCheck className="w-7 h-7" />,
      title: "Verified Tenants",
      desc: "Connect with verified tenants and reduce fraud and rental risks.",
    },
    {
      icon: <FileCheck className="w-7 h-7" />,
      title: "Digital Agreements",
      desc: "Generate QR-verified lease agreements securely online.",
    },
    {
      icon: <Wallet className="w-7 h-7" />,
      title: "Rental Management",
      desc: "Track agreements, tenants, and rental operations digitally.",
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
              Manage Your Properties Professionally With InzuTrust
            </h1>

            <p className="text-lg text-slate-600 mt-8 leading-relaxed max-w-xl">
              InzuTrust helps landlords list properties, manage tenants,
              generate secure lease agreements, and simplify rental operations
              through a trusted digital platform.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">

              <a
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-blue-200 transition-all duration-300 flex items-center gap-2"
              >
                Become a Landlord
                <ArrowRight className="w-5 h-5" />
              </a>

              <button className="border border-blue-200 bg-white text-blue-700 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300">
                Learn More
              </button>

            </div>

          </motion.div>

          {/* RIGHT DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_20px_60px_rgba(37,99,235,0.12)] p-8">

              <div className="flex justify-between items-center mb-8">

                <div>
                  <h3 className="font-bold text-2xl text-slate-900">
                    Landlord Dashboard
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Property Management Workspace
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
                      Active Properties
                    </p>

                    <h2 className="text-4xl font-black text-slate-900 mt-1">
                      12
                    </h2>
                  </div>

                  <Building2 className="text-blue-600 w-10 h-10" />
                </div>

                <div className="bg-slate-50 rounded-3xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Active Tenants
                    </p>

                    <h2 className="text-4xl font-black text-slate-900 mt-1">
                      28
                    </h2>
                  </div>

                  <UserCheck className="text-blue-600 w-10 h-10" />
                </div>

                <div className="bg-slate-50 rounded-3xl p-5 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">
                      Lease Agreements
                    </p>

                    <h2 className="text-4xl font-black text-slate-900 mt-1">
                      19
                    </h2>
                  </div>

                  <FileCheck className="text-blue-600 w-10 h-10" />
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <h2 className="text-5xl font-black tracking-tight text-slate-900">
              Everything You Need To Manage Rentals
            </h2>

            <p className="text-slate-500 text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
              InzuTrust gives landlords modern tools for secure,
              transparent, and efficient property management.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300"
              >

                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {feature.title}
                </h3>

                <p className="text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <h2 className="text-5xl font-black tracking-tight text-slate-900">
              How Landlords Work Within InzuTrust
            </h2>

            <p className="text-slate-500 text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
              InzuTrust provides landlords with a secure digital workflow
              for managing properties and rental operations.
            </p>

          </div>

          <div className="grid md:grid-cols-4 gap-8">

            {[
              {
                icon: <UserCheck className="w-7 h-7" />,
                title: "Register",
                desc: "Create your landlord account securely.",
              },
              {
                icon: <ShieldCheck className="w-7 h-7" />,
                title: "Verify Identity",
                desc: "Complete verification for trust and security.",
              },
              {
                icon: <Building2 className="w-7 h-7" />,
                title: "Add Properties",
                desc: "Upload and manage your listings digitally.",
              },
              {
                icon: <CalendarCheck className="w-7 h-7" />,
                title: "Manage Rentals",
                desc: "Handle tenants and agreements professionally.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:shadow-xl transition-all"
              >

                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed">
                  {item.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* VERIFIED STATUS */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-24 px-6">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

          <div>

            <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              Security & Verification
            </div>

            <h2 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Trusted Rental Operations
            </h2>

            <div className="space-y-8 mt-10">

              <div className="flex gap-4">
                <ShieldCheck className="w-7 h-7 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-bold text-lg text-slate-900">
                    Verified Tenants
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Reduce risks by renting to verified users with trusted profiles.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <QrCode className="w-7 h-7 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-bold text-lg text-slate-900">
                    QR-Verified Contracts
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Lease agreements are digitally secured and verifiable.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-7 h-7 text-blue-600 mt-1" />

                <div>
                  <h4 className="font-bold text-lg text-slate-900">
                    Transparent Records
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Access rental history and secure activity tracking.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* VERIFIED STATUS CARD */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-[2rem] p-10 text-white shadow-[0_30px_80px_rgba(37,99,235,0.35)] border border-white/10">

            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl" />

            <div className="relative flex justify-between items-start">

              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Trusted Property Owner
                </div>

                <h3 className="text-3xl font-black mt-6 tracking-tight">
                  Verified Landlord Status
                </h3>

                <p className="text-blue-100 mt-3 max-w-sm leading-relaxed">
                  This landlord has successfully completed identity and property verification within the InzuTrust ecosystem.
                </p>
              </div>

              <div className="bg-emerald-400/15 border border-emerald-300/20 text-emerald-100 px-5 py-3 rounded-2xl text-sm font-semibold backdrop-blur-md shadow-lg">
                VERIFIED
              </div>

            </div>

            <div className="relative grid sm:grid-cols-2 gap-5 mt-10">

              {[
                "Identity Verified",
                "Property Ownership Confirmed",
                "Secure Lease History",
                "No Fraud Reports",
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"
                >

                  <div className="flex justify-between items-center">

                    <span className="text-blue-100">
                      {item}
                    </span>

                    <span className="text-emerald-300 text-lg">
                      ✔
                    </span>

                  </div>

                </div>
              ))}

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
            Digitally manage your properties, tenants, and agreements
            inside a secure trusted ecosystem.
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