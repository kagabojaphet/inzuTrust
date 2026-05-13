import React, { useState } from "react";
import {
  HiCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineLibrary,
  HiOutlineLightningBolt
} from "react-icons/hi";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Standard Tenant",
      tagline: "Secure your next home with trust.",
      price: isYearly ? "2,500" : "3,000",
      icon: <HiOutlineShieldCheck className="text-brand-blue-bright" />,
      features: [
        "Verified Trust Score",
        "Digital Lease Signing",
        "Rent Payment Tracking",
        "24/7 Support Access"
      ],
      buttonText: "Get Started",
      highlight: false
    },
    {
      name: "Professional Landlord",
      tagline: "Manage properties with zero stress.",
      price: isYearly ? "12,000" : "15,000",
      icon: <HiOutlineLightningBolt className="text-brand-green-mid" />,
      features: [
        "Everything in Tenant Plan",
        "Tenant Background Checks",
        "Automated Rent Collection",
        "Maintenance Request Portal",
        "Financial Analytics Dashboard"
      ],
      buttonText: "Start Managing",
      highlight: true
    },
    {
      name: "Enterprise",
      tagline: "For large agencies and developers.",
      price: "Custom",
      icon: <HiOutlineLibrary className="text-brand-blue-bright" />,
      features: [
        "Unlimited Property Listings",
        "Custom Trust Algorithms",
        "Dedicated Account Manager",
        "API Integration Access",
        "On-site Team Training"
      ],
      buttonText: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="bg-white min-h-screen w-full">

      {/* HEADER */}
      <section className="pt-28 pb-14 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">

          <h1 className="text-3xl md:text-4xl font-semibold text-black mb-5 leading-snug">
            Plans built for{" "}
            <span className="text-brand-blue-bright">
              Total Transparency
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
            Choose the right plan to protect your property interests in Rwanda.
          </p>

          {/* TOGGLE */}
          <div className="flex items-center justify-center gap-3 text-sm">

            <span className={`${!isYearly ? "text-black font-medium" : "text-slate-400"}`}>
              Monthly
            </span>

            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 bg-brand-blue-bright rounded-full relative transition"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  isYearly ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>

            <span className={`${isYearly ? "text-black font-medium" : "text-slate-400"}`}>
              Yearly{" "}
              <span className="text-brand-green-mid text-xs">
                (Save 20%)
              </span>
            </span>

          </div>

        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {plans.map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border transition flex flex-col ${
                  plan.highlight
                    ? "border-brand-blue-bright bg-brand-blue-bright text-white shadow-lg"
                    : "border-slate-200 bg-white text-black"
                }`}
              >

                {/* ICON */}
                <div className="text-3xl mb-4">
                  {plan.icon}
                </div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold mb-1">
                  {plan.name}
                </h3>

                <p className={`text-sm mb-6 ${
                  plan.highlight ? "text-white/70" : "text-slate-500"
                }`}>
                  {plan.tagline}
                </p>

                {/* PRICE */}
                <div className="mb-6">
                  <span className="text-2xl font-semibold">
                    {plan.price !== "Custom"
                      ? `RWF ${plan.price}`
                      : "Custom"}
                  </span>

                  {plan.price !== "Custom" && (
                    <span className="text-xs ml-1 opacity-70">
                      / month
                    </span>
                  )}
                </div>

                {/* FEATURES */}
                <div className="space-y-3 flex-grow mb-6">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <HiCheckCircle
                        className={
                          plan.highlight
                            ? "text-green-300"
                            : "text-brand-blue-bright"
                        }
                      />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* BUTTON */}
                <button
                  className={`w-full py-3 rounded-lg text-sm font-medium transition ${
                    plan.highlight
                      ? "bg-brand-green-mid  hover:bg-green-300"
                      : "bg-brand-blue-bright text-white hover:bg-brand-blue-bright"
                  }`}
                >
                  {plan.buttonText}
                </button>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">

          <h2 className="text-xl md:text-2xl font-semibold text-center mb-10">
            Compare features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b">
                  <th className="py-4 text-left">Feature</th>
                  <th className="py-4 text-left">Tenant</th>
                  <th className="py-4 text-left text-brand-blue-bright">
                    Landlord
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                <tr>
                  <td className="py-4 font-medium">Verified Trust Score</td>
                  <td>Included</td>
                  <td>Included</td>
                </tr>

                <tr>
                  <td className="py-4 font-medium">E-Sign Documents</td>
                  <td>1 / Month</td>
                  <td>Unlimited</td>
                </tr>

                <tr>
                  <td className="py-4 font-medium">
                    Tenant Background Check
                  </td>
                  <td className="text-slate-300">—</td>
                  <td>Included</td>
                </tr>

                <tr>
                  <td className="py-4 font-medium">Auto Payment</td>
                  <td>Included</td>
                  <td>Included</td>
                </tr>

              </tbody>

            </table>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Pricing;