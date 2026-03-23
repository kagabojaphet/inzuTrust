import { useState } from "react";
import logo from "../assets/logo/logo.jpeg"
export default function InzuTrustHelpCenter() {
  const [openFaq, setOpenFaq] = useState({ 0: true, 1: true, 2: true });

  const toggleFaq = (i) =>
    setOpenFaq((prev) => ({ ...prev, [i]: !prev[i] }));

  const faqs = [
    {
      q: "What if a tenant pays late?",
      a: 'Our system automatically triggers a reminder. You can also send a formal notice through the "Rent & Agreements" section using our verified templates.',
    },
    {
      q: "Is my data legally protected?",
      a: "Yes, all data is encrypted. Digital signatures comply with local electronic signature laws (e.g., eIDAS, ESIGN Act).",
    },
    {
      q: "How do I resolve a dispute?",
      a: 'Visit our "Problem Resolution" resources for a step-by-step guide on mediation and documentation retrieval.',
    },
  ];

  return (
    <div className="bg-white font-sans text-slate-900 antialiased">

      {/* ── HERO ── */}
      <header
        className="pt-16 pb-24 px-4 border-b border-blue-50"
        style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Building trust between tenants and landlords,{" "}
            <span className="text-sky-700">one agreement at a time.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Guiding you through property management, rent agreements, and everything in between.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400 group-focus-within:text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="block w-full pl-14 pr-4 py-5 bg-white border-0 rounded-2xl shadow-xl focus:ring-2 focus:ring-sky-700 text-lg placeholder-gray-400 outline-none"
              placeholder="Search for articles, guides, or troubleshooting..."
              type="text"
            />
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            {["Legal templates", "Verified payments", "24/7 Support"].map((label) => (
              <span key={label} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">

        {/* Getting Started */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Getting Started</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "For Tenants", desc: "Learn how to create your profile, find properties, and sign your first digital agreement securely.", link: "Start your journey" },
              { title: "For Landlords", desc: "Setup your property portfolio, verify tenants, and automate your rental income workflow.", link: "Onboard properties" },
              { title: "Quick Tips", desc: "Best practices for maintaining a healthy relationship and utilizing InzuTrust features efficiently.", link: "View all tips" },
            ].map((card) => (
              <div key={card.title} className="p-8 bg-white border border-gray-100 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">{card.desc}</p>
                <a className="text-sky-700 font-medium hover:underline inline-flex items-center" href="#">
                  {card.link}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Rent & Agreements */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Rent &amp; Agreements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-gray-100 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="text-lg font-semibold mb-3">Documented Agreements</h3>
              <p className="text-gray-500 mb-6">Create, edit, and e-sign legally binding rental contracts tailored to your local laws.</p>
              <button className="px-6 py-2.5 bg-sky-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Create Agreement</button>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="text-lg font-semibold mb-3">Payment Tracking</h3>
              <p className="text-gray-500 mb-6">Real-time logs for rent payments, deposits, and outstanding balances with automatic receipts.</p>
              <a className="text-sky-700 font-medium hover:underline" href="#">Track payments →</a>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="text-lg font-semibold mb-3">Guides &amp; Templates</h3>
              <p className="text-gray-500 mb-6">Downloadable notice forms, inspection checklists, and standard lease clauses.</p>
              <a className="text-sky-700 font-medium hover:underline" href="#">Browse templates →</a>
            </div>
          </div>
        </section>

        {/* Secure / Legal / Fair Banner */}
        <div className="mb-20 rounded-3xl overflow-hidden bg-sky-50 relative">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-12 md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Secure, Legal, and Fair</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We use state-of-the-art encryption and legal frameworks to ensure that every interaction between landlord and tenant is protected and transparent.
              </p>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-sky-700 shadow-sm uppercase">Secure Data</span>
                <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-sky-700 shadow-sm uppercase">Verified IDs</span>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                alt="Professional interaction"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCawg4_1SIlos4CLZcU6bh6LtddXT_oE-xxiOkp-MfdjuFPxnnrbAQJiJqXmQMskf0S2ocbKzbQ8BVpwsr54eng3cUBFZ-4H7JKHMzLTyIEpgEhVLtEfFl8lwHL2wDPV32uz6WoICpyb1_QJ-Hm9neGAT09nonxOoN_clhjD-iFM8_KsBv3ijiIug-N8YIJ76d9GgRaE-L4t1rAlB77qSCpn29QyCfsvQvBmB5Josp7tkFZA7D-uOYDwLpbNU3-racAVnrBXkeGa3Y"
              />
            </div>
          </div>
        </div>

        {/* Property Management + FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* Property Management */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Property Management</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: "Organize Properties", desc: "Manage multiple units, addresses, and tenant histories in one dashboard.", link: null },
                { title: "Maintenance Requests", desc: "Submit and track repair requests with photo evidence and status updates.", link: "Submit Request" },
                { title: "Automated Reminders", desc: "Set up notifications for rent due dates, insurance renewals, and inspections.", link: null },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                    {item.link && (
                      <button className="mt-3 text-xs font-bold text-sky-700 hover:text-slate-900">{item.link}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Troubleshooting &amp; FAQs</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl cursor-pointer" onClick={() => toggleFaq(i)}>
                  <div className="flex justify-between items-center font-medium p-4">
                    <span>{faq.q}</span>
                    <svg
                      className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                      style={{ transform: openFaq[i] ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {openFaq[i] && (
                    <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</p>
                  )}
                </div>
              ))}
              <a className="block text-center py-3 text-sky-700 font-semibold text-sm hover:underline" href="#">View All FAQs →</a>
            </div>
          </section>
        </div>

        {/* Still Need Help */}
        <section className="bg-slate-900 rounded-[2.5rem] p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-blue-100/70 mb-10 max-w-xl mx-auto">
            Our support team is here to help you resolve any issues or answer questions about the InzuTrust platform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Live Chat", sub: "Response time: ~5 mins",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
              },
              {
                title: "Email Support", sub: "help@inzutrust.com",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
              },
              {
                title: "Community", sub: "Forum & Knowledge Base",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                <svg className="w-8 h-8 mx-auto mb-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                <h4 className="font-bold mb-1">{item.title}</h4>
                <p className="text-xs text-blue-100/60">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button className="bg-emerald-500 text-slate-900 px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform">
              Contact Support Now
            </button>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-md flex items-center justify-center text-white font-bold text-sm">I</div>
              <span className="text-xl font-bold tracking-tight text-gray-500">InzuTrust</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              {["Terms", "Privacy", "Accessibility", "Security"].map((l) => (
                <a key={l} className="hover:text-sky-700" href="#">{l}</a>
              ))}
            </div>
            <div className="text-sm text-gray-400">© 2024 InzuTrust Inc. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}