import React from "react";
import {
  HiShieldCheck,
  HiOutlineLightBulb,
  HiOutlineGlobe,
  HiUserGroup,
  HiOutlineTrendingUp,
} from "react-icons/hi";

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* HEADER */}
      <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-brand-blue-bright opacity-10 rounded-full blur-[100px] z-0" />

        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-black mb-5 leading-tight">
            The Digital Foundation <br className="hidden sm:block" />
            of Trust in Rwanda.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-black/80 leading-relaxed max-w-3xl font-normal">
            InzuTrust was founded to solve the most significant barrier in the rental market: a lack of verified information. We bridge the gap between landlords and tenants through data-driven transparency.
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">

          <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white border border-slate-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-blue-bright/10 rounded-2xl flex items-center justify-center mb-5">
              <HiOutlineTrendingUp className="text-brand-blue-bright text-2xl" />
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 text-black">
              Our Mission
            </h2>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black/80 font-normal">
              To modernize the rental experience in Rwanda through technology. We eliminate fraud, reduce payment disputes, and provide a seamless management tool for property owners while giving tenants a platform to build their financial reputation.
            </p>
          </div>

          <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white border border-slate-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-green-mid/10 rounded-2xl flex items-center justify-center mb-5">
              <HiOutlineLightBulb className="text-brand-green-mid text-2xl" />
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 text-black">
              Our Vision
            </h2>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black/80 font-normal">
              To be the most trusted rental verification ecosystem in Africa, where a person’s integrity becomes their strongest asset in accessing housing and dignity.
            </p>
          </div>

        </div>
      </section>

      {/* STORY */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black mb-5">
              Bridging the Gap
            </h2>

            <div className="space-y-4 text-sm sm:text-base md:text-lg text-black/80 font-normal">
              <p>
                Historically, the rental market in Kigali has relied on informal agreements, creating a trust gap.
              </p>

              <p>
                InzuTrust now supports over <strong>2,000+ users</strong>, building a verified rental ecosystem through digital records.
              </p>
            </div>

            <div className="flex gap-6 sm:gap-8 mt-8 sm:mt-10 flex-wrap">
              <div>
                <p className="text-2xl sm:text-3xl font-medium text-brand-blue-bright">2k+</p>
                <p className="text-xs font-medium text-black uppercase mt-1">Users</p>
              </div>

              <div className="w-px h-8 sm:h-10 bg-slate-300" />

              <div>
                <p className="text-2xl sm:text-3xl font-medium text-brand-green-mid">100%</p>
                <p className="text-xs font-medium text-black uppercase mt-1">Verified</p>
              </div>
            </div>
          </div>

          {/* IMAGE - FIXED OVERFLOW */}
          <div className="relative w-full">
            <div className="absolute -inset-2 sm:-inset-3 bg-slate-100 rounded-3xl rotate-1 z-0" />

            <div className="relative z-10 rounded-3xl overflow-hidden border border-slate-200 aspect-video">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
                alt="Rental Ecosystem"
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-xl border border-slate-200 flex items-center gap-3 max-w-[90%]">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <HiUserGroup className="text-brand-blue-bright text-base sm:text-lg" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-medium text-black/50">
                    Community
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-black truncate">
                    Kigali Focused
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black mb-8 sm:mb-10">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

            {[
              {
                icon: <HiShieldCheck />,
                title: "Transparency",
                desc: "No hidden terms. Everything is structured and visible."
              },
              {
                icon: <HiOutlineGlobe />,
                title: "Security",
                desc: "Strong protection for user data and transactions."
              },
              {
                icon: <HiUserGroup />,
                title: "Empowerment",
                desc: "Building trust-based opportunities for users."
              }
            ].map((val, i) => (
              <div
                key={i}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200"
              >
                <div className="text-brand-blue-bright text-2xl sm:text-3xl mb-4">
                  {val.icon}
                </div>

                <h4 className="text-base sm:text-lg font-medium text-black mb-2">
                  {val.title}
                </h4>

                <p className="text-sm sm:text-base text-black/80 font-normal leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;