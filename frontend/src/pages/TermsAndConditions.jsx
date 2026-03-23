import { useState, useRef, useEffect } from "react";

/* ─── Logo ─────────────────────────────────────────────────────────────────── */
const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="25" y1="10" x2="175" y2="190" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1863c2" />
        <stop offset="1" stopColor="#03609b" />
      </linearGradient>
    </defs>
    <path d="M100 10 L175 45 L175 120 Q175 165 100 190 Q25 165 25 120 L25 45 Z" fill="url(#logoGrad)" stroke="#1863c2" strokeWidth="2" />
    <path d="M100 10 L175 45 L175 120 Q175 165 100 190 Q25 165 25 120 L25 45 Z" fill="none" stroke="white" strokeWidth="4" strokeOpacity="0.15" />
    <polygon points="55,82 100,48 145,82" fill="white" />
    <rect x="60" y="78" width="80" height="58" rx="3" fill="white" fillOpacity="0.93" />
    <rect x="86" y="96" width="28" height="40" rx="3" fill="#0479b4" />
    <rect x="68" y="86" width="12" height="12" rx="2" fill="#d4eaf9" />
    <rect x="120" y="86" width="12" height="12" rx="2" fill="#d4eaf9" />
    <path d="M48 148 Q65 124 85 132 Q100 124 115 132 Q135 124 152 148" fill="#219967" opacity="0.9" />
    <path d="M44 158 Q68 132 100 140 Q132 132 156 158" fill="#296d18" opacity="0.72" />
  </svg>
);

/* ─── Tooltip ──────────────────────────────────────────────────────────────── */
const Tip = ({ w, t }) => (
  <span className="relative inline group cursor-help">
    <span className="border-b border-dashed border-[#0479b4] text-[#0479b4]">{w}</span>
    <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-[120%] left-1/2 -translate-x-1/2 bg-[#03609b] text-white text-[12.5px] leading-snug px-2.5 py-1.5 rounded-md whitespace-nowrap z-[400] pointer-events-none shadow-lg">
      {t}
    </span>
  </span>
);

/* ─── Accordion ────────────────────────────────────────────────────────────── */
const Acc = ({ label, children }) => {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);
  return (
    <div className="border border-gray-200 rounded-lg my-2.5 overflow-hidden bg-white hover:shadow-md transition-shadow duration-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left font-semibold text-[13.5px] ${open ? "text-[#0479b4]" : "text-gray-800"}`}
      >
        <span>{label}</span>
        <span
          className="text-[#0479b4] text-lg leading-none flex-shrink-0 transition-transform duration-250"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        ref={bodyRef}
        className={`overflow-hidden transition-all duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        style={{ maxHeight: open ? (bodyRef.current ? bodyRef.current.scrollHeight + "px" : "800px") : "0" }}
      >
        <div className="px-4 pb-4 pt-0.5 border-t border-gray-50">{children}</div>
      </div>
    </div>
  );
};

/* ─── Flowchart ────────────────────────────────────────────────────────────── */
const Flow = ({ steps }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-2.5">
    {steps.map((s, i) => (
      <div key={i}>
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm" style={{ background: "linear-gradient(135deg,#1863c2,#03609b)" }}>
            {i + 1}
          </div>
          <div className="pt-0.5">
            <div className="text-[13px] font-semibold text-gray-800 leading-tight">{s.t}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{s.d}</div>
          </div>
        </div>
        {i < steps.length - 1 && <div className="w-0.5 h-3.5 bg-gray-200 ml-3.5" />}
      </div>
    ))}
  </div>
);

/* ─── Callout ──────────────────────────────────────────────────────────────── */
const Callout = ({ type = "info", children }) => {
  const styles = {
    info: "bg-blue-50 border-l-4 border-[#0479b4] text-[#03609b]",
    tip:  "bg-[#219967] border-l-4 border-[#296d18] text-white",
    warn: "bg-amber-50 border-l-4 border-amber-400 text-gray-900 font-semibold",
  };
  return (
    <div className={`${styles[type]} text-[13.5px] leading-relaxed px-4 py-3 my-3 rounded-r-xl`}>
      {children}
    </div>
  );
};

/* ─── TOC sections ─────────────────────────────────────────────────────────── */
const NAV = [
  { id: "s1",  l: "1. Introduction" },
  { id: "s2",  l: "2. Definitions" },
  { id: "s3",  l: "3. Account & Responsibilities" },
  { id: "s4",  l: "4. Property Listings" },
  { id: "s5",  l: "5. Rental Agreements" },
  { id: "s6",  l: "6. Transactions & Payments" },
  { id: "s7",  l: "7. Privacy & Data" },
  { id: "s8",  l: "8. Platform Usage" },
  { id: "s9",  l: "9. Disputes & Liability" },
  { id: "s10", l: "10. Termination & Amendments" },
];

/* ─── Main ─────────────────────────────────────────────────────────────────── */
const TermsAndConditions = () => {
  const [active, setActive] = useState("s1");
  const [accepted, setAccepted] = useState(false);
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-25% 0px -65% 0px" }
    );
    Object.values(refs.current).forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) =>
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800" style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>

      {/* ── Google Font ── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ══════════════════════════════════════════════════════════════════
          BANNER — colors & visuals taken directly from the InzuTrust logo:
          • Deep blue shield gradient background  (#0d4f8c → #0a6dba → #1a8fd1)
          • Radial "light ray" glow from top-center (as in the logo)
          • Green leaf shapes at bottom-left/right  (#4caf28 → #296d18)
          • White house silhouette SVG on the right
          • Title text left-aligned in white
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden flex items-center min-h-[150px] px-10 py-12"
        style={{
          /* Main shield gradient: dark navy → mid blue → bright blue, matching logo */
          background: "linear-gradient(160deg, #0d4f8c 0%, #0a6dba 35%, #1a8fd1 60%, #0d5fa0 100%)",
        }}
      >
        {/* ── Radial glow from top-center — mimics the logo's inner light rays ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 80% at 50% -10%, rgba(100,185,255,0.45) 0%, rgba(26,143,209,0.2) 40%, transparent 70%)",
          }}
        />

        {/* ── Concentric arc lines — the subtle "signal/shield" rings in the logo ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {[0.35, 0.55, 0.75, 0.95].map((r, i) => (
            <ellipse
              key={i}
              cx="50%" cy="0"
              rx={`${r * 55}%`} ry={`${r * 200}%`}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* ── Green leaf shape — bottom-left, mirrors logo left leaf ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-18px",
            left: "-10px",
            width: "220px",
            height: "110px",
            background: "linear-gradient(135deg, #4caf28 0%, #3a9620 40%, #296d18 100%)",
            clipPath: "ellipse(60% 55% at 35% 80%)",
            opacity: 0.88,
            transform: "rotate(-12deg)",
          }}
        />
        {/* ── Green leaf shape — bottom-right, mirrors logo right leaf ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-18px",
            right: "-10px",
            width: "220px",
            height: "110px",
            background: "linear-gradient(225deg, #4caf28 0%, #3a9620 40%, #296d18 100%)",
            clipPath: "ellipse(60% 55% at 65% 80%)",
            opacity: 0.88,
            transform: "rotate(12deg)",
          }}
        />
        {/* ── Extra leaf highlight — center bottom, the V-shape between leaves ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "160px",
            height: "60px",
            background: "linear-gradient(180deg, #296d18 0%, #219967 60%, #4caf28 100%)",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            opacity: 0.6,
          }}
        />

        {/* ── White house silhouette — right side, matching the logo's house ── */}
        <svg
          className="absolute pointer-events-none"
          style={{ right: "80px", top: "50%", transform: "translateY(-50%)", opacity: 0.12 }}
          width="160"
          height="130"
          viewBox="0 0 160 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Roof */}
          <polygon points="10,65 80,5 150,65" fill="white" />
          {/* Chimney */}
          <rect x="105" y="18" width="16" height="28" fill="white" />
          {/* House body */}
          <rect x="22" y="62" width="116" height="68" rx="3" fill="white" />
          {/* Door */}
          <rect x="65" y="88" width="30" height="42" rx="3" fill="rgba(10,109,186,0.6)" />
          {/* Window arch */}
          <rect x="68" y="91" width="24" height="20" rx="12" fill="rgba(200,235,255,0.7)" />
          {/* Left window */}
          <rect x="32" y="74" width="24" height="20" rx="3" fill="rgba(200,235,255,0.5)" />
          {/* Right window */}
          <rect x="104" y="74" width="24" height="20" rx="3" fill="rgba(200,235,255,0.5)" />
        </svg>

        {/* ── Shield outline — right side, the shield border from the logo ── */}
        <svg
          className="absolute pointer-events-none"
          style={{ right: "40px", top: "50%", transform: "translateY(-52%)", opacity: 0.1 }}
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 8 L178 44 L178 118 Q178 168 100 192 Q22 168 22 118 L22 44 Z"
            stroke="white"
            strokeWidth="5"
            fill="none"
          />
        </svg>

        {/* ── Banner text content ── */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-5">
            {/* Full-color logo mark */}
            <div className="drop-shadow-xl">
              <Logo size={56} />
            </div>
            <h1
              className="text-white font-extrabold leading-tight tracking-tight drop-shadow-md"
              style={{ fontSize: "clamp(28px, 4.5vw, 50px)" }}
            >
              Terms and Conditions
            </h1>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-white/15 hover:bg-white/25 border border-white/40 text-white text-[13px] font-medium px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors flex-shrink-0 print:hidden backdrop-blur-sm"
          >
            ↑ Share
          </button>
        </div>
      </div>

      {/* ── Accent bar — matches the logo's blue-to-green color story ── */}
      <div
        className="h-1"
        style={{ background: "linear-gradient(90deg, #0d4f8c 0%, #0a6dba 30%, #1a8fd1 55%, #3a9620 80%, #4caf28 100%" }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          BODY  (unchanged from previous version)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1100px] mx-auto px-10 pb-20 flex gap-12 items-start">

        {/* ── Sidebar TOC ── */}
        <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-[72px] pt-10 self-start max-h-[calc(100vh-80px)] overflow-y-auto print:hidden">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.09em] mb-2 pl-0.5">
            On this page
          </p>
          {NAV.map((n) => (
            <div
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`block py-1.5 px-2.5 text-[13px] font-medium cursor-pointer border-l-2 rounded-r-md transition-all duration-150 leading-snug mb-0.5
                ${active === n.id
                  ? "text-[#0479b4] border-[#0479b4] bg-[#e8f4fd] font-semibold"
                  : "text-gray-500 border-transparent hover:text-[#1863c2] hover:bg-blue-50"
                }`}
            >
              {n.l}
            </div>
          ))}
          <div className="mt-4 p-2.5 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-[11.5px] text-green-700 font-semibold leading-snug m-0">
              🛡 GDPR Compliant<br />Encrypted · Secure
            </p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 pt-9">

          {/* Thin purple rule */}
          <div
            className="h-[3px] w-full rounded-sm mb-6"
            style={{ background: "linear-gradient(160deg, rgb(13, 79, 140) 0%, rgb(10, 109, 186) 35%, rgb(26, 143, 209) 60%, rgb(13, 95, 160) 100%)" }}
          />

          {/* ── 1. INTRODUCTION ── */}
          <section id="s1" ref={(r) => (refs.current["s1"] = r)} className="pb-7">
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              In these Terms of Use, any use of the words <strong>"you"</strong>, <strong>"yours"</strong> or similar expressions shall mean any user of this platform whatsoever. Terms such as <strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong> or similar expressions shall mean <strong>InzuTrust</strong>.
            </p>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              The InzuTrust platform (the <strong>"Platform"</strong>), including our website and mobile application, is operated to facilitate property listings, rental agreement documentation, and transaction tracking between landlords and tenants. InzuTrust is registered in Rwanda. Our mission is to bridge trust between tenants and landlords through transparent, documented, and secure property management.
            </p>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              Please read this page carefully as it sets out the terms that apply to your use of the Platform and any part of its content and all materials appearing on it. By using the Platform you confirm that you accept these Terms of Use and you agree to comply with them. If you do not agree to these Terms of Use, please refrain from using the Platform.
            </p>

            <span className="block text-[13px] font-bold text-gray-900 uppercase tracking-[0.02em] mt-5 mb-2">
              YOUR USE OF THE PLATFORM IF YOU ARE UNDER 18
            </span>

            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              If you are under 18, you may need your parent/guardian to help you with your use of the Platform and with reading these Terms and Conditions. If anything is hard to understand, please ask your parent/guardian to explain. If you still have any questions, you or your parent/guardian can contact us at:{" "}
              <span className="text-[#0479b4] hover:underline cursor-pointer">support@inzutrust.com</span>.
            </p>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              If you are aged 13 or under, you cannot register for an InzuTrust account (<strong>"Account"</strong>) without the permission of your parent/guardian. You do not need to register to browse the Platform.
            </p>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              We may collect your personal information when you use the Platform. You can find out more about how we use your personal information in our{" "}
              <span className="text-[#0479b4] hover:underline cursor-pointer">Privacy Policy</span>. You can find a link to our Privacy Policy at the bottom of this page.
            </p>
            <Callout type="info">
              <strong>ℹ What InzuTrust provides:</strong> InzuTrust ensures all rental agreements are documented and transparent, tracks transactions securely, and provides tools for property management and dispute resolution — giving both tenants and landlords complete peace of mind.
            </Callout>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 2. DEFINITIONS ── */}
          <section id="s2" ref={(r) => (refs.current["s2"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">2. Definitions</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              The following key terms are used throughout these Terms and Conditions.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2.5 mb-3.5">
              {[
                ["Tenant",           "Any individual or entity using InzuTrust to search for, rent, or manage a rented property."],
                ["Landlord",          "Any individual or entity that lists, manages, or rents property through InzuTrust."],
                ["Property",          "Any residential, commercial, or mixed-use space listed on the InzuTrust platform."],
                ["Rental Agreement",  "A legally binding document between Tenant and Landlord, created and stored via InzuTrust."],
                ["Transaction",       "Any financial exchange — rent, deposits, or fees — tracked within InzuTrust."],
                ["Platform",          "The InzuTrust website, mobile application, and all associated digital services."],
              ].map(([term, desc]) => (
                <div key={term} className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
                  <div className="font-bold text-[12.5px] text-[#0479b4] mb-1">{term}</div>
                  <div className="text-[12px] text-gray-500 leading-snug">{desc}</div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 3. ACCOUNT ── */}
          <section id="s3" ref={(r) => (refs.current["s3"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">3. Account Creation &amp; User Responsibilities</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              To access InzuTrust's full range of services, you must create a verified account. All information provided during registration must be accurate, current, and complete. You are wholly responsible for all activity that occurs under your account.
            </p>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              InzuTrust may use a{" "}
              <Tip w="third-party identity verification service" t="Confirms government-issued ID documents" />{" "}
              to confirm the identity of landlords listing properties on the Platform.
            </p>
            <Acc label="View full account requirements and obligations">
              <ul className="list-none p-0 mt-2 space-y-1.5">
                {[
                  "You must be at least 18 years of age to create an account.",
                  "You are responsible for maintaining the confidentiality of your login credentials.",
                  "You agree to notify InzuTrust immediately of any unauthorized account access.",
                  "One person or legal entity may maintain only one active account.",
                  "InzuTrust reserves the right to verify your identity at any time.",
                  "Account credentials must not be shared with or transferred to any other party.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] leading-relaxed text-[#2d2d2d]">
                    <span className="text-[#219967] font-bold flex-shrink-0 mt-0.5">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </Acc>
            <Callout type="warn">
              ⚠ IMPORTANT: Providing false or misleading information during registration may result in immediate account suspension and potential legal action under applicable law.
            </Callout>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 4. LISTINGS ── */}
          <section id="s4" ref={(r) => (refs.current["s4"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">4. Property Listings &amp; Management Rules</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              All property listings on InzuTrust must comply with our quality and accuracy standards to ensure an honest and transparent marketplace. Landlords are solely responsible for the accuracy and completeness of their listings.
            </p>
            <Acc label="View full listing requirements">
              <ul className="list-none p-0 mt-2 space-y-1.5">
                {[
                  "Photos must accurately reflect the current condition of the property. Stock images are strictly prohibited.",
                  "Advertised rental prices must be final and inclusive of all mandatory fees.",
                  "Property location must be accurate and verifiable. Misrepresentation is grounds for immediate removal.",
                  "Properties under active legal disputes, condemned status, or lacking occupancy permits may not be listed.",
                  "Landlords must disclose any known defects that may affect the tenant's safe use of the property.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] leading-relaxed text-[#2d2d2d]">
                    <span className="text-[#219967] font-bold flex-shrink-0 mt-0.5">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </Acc>
            <Callout type="tip">
              💡 <strong>Tip:</strong> High-quality listings with verified photos and accurate descriptions receive significantly more tenant interest. Use the listing quality checker in your landlord dashboard.
            </Callout>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3 mt-1">
              InzuTrust reserves the right to remove, suspend, or modify any listing that does not comply with these standards without prior notice.
            </p>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 5. RENTAL AGREEMENTS ── */}
          <section id="s5" ref={(r) => (refs.current["s5"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">5. Rental Agreements &amp; Documentation Process</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              InzuTrust facilitates the creation, digital signing, and secure storage of{" "}
              <Tip w="rental agreements" t="Legally binding document between Tenant and Landlord" />.
              {" "}All agreements must be processed through the Platform to be recognised as valid InzuTrust-documented contracts.
            </p>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              <strong>Example:</strong> A tenant applies for a listed property; the landlord accepts. Both parties digitally review and sign the agreement via InzuTrust. The signed agreement is then stored securely and remains accessible by both parties at any time via their account dashboard.
            </p>

            <div className="grid grid-cols-2 gap-5 mt-2.5">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.07em] mb-2">Documented Agreement Process</p>
                <Flow steps={[
                  { t: "Listing Property",   d: "Landlord creates a verified, InzuTrust-approved listing" },
                  { t: "Tenant Application", d: "Tenant submits a formal application through the Platform" },
                  { t: "Agreement Signing",  d: "Both parties review and digitally sign the rental agreement" },
                  { t: "Secure Storage",     d: "A tamper-proof, time-stamped copy is archived for both parties" },
                ]} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.07em] mb-2">What Your Agreement Covers</p>
                <ul className="list-none p-0 space-y-1.5">
                  {[
                    "Rent amount, due date, and payment method",
                    "Lease duration and renewal terms",
                    "Security deposit amount and refund conditions",
                    "Maintenance and repair responsibilities",
                    "Permitted use of the property",
                    "Termination and eviction procedures",
                  ].map((t, i) => (
                    <li key={i} className="flex gap-2 items-start text-[13px] leading-relaxed text-[#2d2d2d]">
                      <span className="text-[#219967] font-bold flex-shrink-0 mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Callout type="tip">
              💡 <strong>Tip:</strong> Always review all rental terms thoroughly before signing. Once signed by both parties, the agreement is legally binding and cannot be unilaterally altered.
            </Callout>
            <Callout type="info">
              <strong>✅ Your Agreement is Protected:</strong> All InzuTrust-documented rental agreements are encrypted, time-stamped, and stored securely. Both parties retain permanent access to their certified copy.
            </Callout>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 6. TRANSACTIONS ── */}
          <section id="s6" ref={(r) => (refs.current["s6"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">6. Transaction Tracking &amp; Payment Terms</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              InzuTrust tracks all rental transactions to provide a transparent and verifiable financial record for both tenants and landlords. All payments must be processed through InzuTrust's secure payment infrastructure.
            </p>
            <div className="grid grid-cols-2 gap-2 my-2.5">
              {[
                ["🏦", "Rent Payments",     "All rent must be paid via InzuTrust's gateway. Off-platform cash transactions are not recognised."],
                ["🔐", "Security Deposits", "Deposits are held in escrow until tenancy ends. Deduction conditions are documented in the rental agreement."],
                ["⏰", "Late Fees",         "Late payment penalties are specified in the rental agreement and calculated automatically."],
                ["↩️", "Refunds",           "Approved refunds are processed within 7 business days. Eligible conditions must be stated in the agreement."],
              ].map(([ico, lbl, dsc]) => (
                <div key={lbl} className="bg-white border border-gray-200 rounded-lg px-3.5 py-3 flex gap-2.5 items-start hover:border-[#1863c2] transition-colors">
                  <span className="text-[17px] flex-shrink-0 mt-0.5">{ico}</span>
                  <div>
                    <div className="font-bold text-[12.5px] text-[#03609b]">{lbl}</div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5 leading-snug">{dsc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-2">
              InzuTrust charges a platform service fee on transactions. The applicable fee is clearly disclosed before any payment is processed. All platform fees are non-refundable unless InzuTrust determines otherwise.
            </p>
            <p className="text-[12.5px] text-gray-500">
              Transaction records are retained for a minimum of 7 years in accordance with applicable financial regulations.
            </p>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 7. PRIVACY ── */}
          <section id="s7" ref={(r) => (refs.current["s7"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">7. Privacy &amp; Data Handling</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              InzuTrust is committed to protecting your personal data in accordance with applicable data protection regulations, including the GDPR where applicable. We collect your name, contact details, identification documents, property information, and transaction records solely to operate the Platform safely and in compliance with applicable law.
            </p>
            <Acc label="View our full data practices and commitments">
              <ul className="list-none p-0 mt-2 space-y-1.5">
                {[
                  "Your personal data is never sold to third parties for marketing or commercial purposes.",
                  "All data is encrypted in transit and at rest using industry-standard protocols (AES-256, TLS 1.3).",
                  "You may request a complete copy of your data or full deletion of your account at any time.",
                  "Transaction records are retained for 7 years as required by financial regulations.",
                  "Cookies are used exclusively for authentication and anonymised platform analytics.",
                  "InzuTrust will notify you within 72 hours of any confirmed data breach affecting your information.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] leading-relaxed text-[#2d2d2d]">
                    <span className="text-[#219967] font-bold flex-shrink-0 mt-0.5">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </Acc>
            <p className="text-[12.5px] text-gray-500 mt-2.5">
              For full details, refer to our{" "}
              <span className="text-[#1863c2] underline cursor-pointer hover:text-[#0479b4]">Privacy Policy</span>.
            </p>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 8. PLATFORM USAGE ── */}
          <section id="s8" ref={(r) => (refs.current["s8"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">8. Platform Usage &amp; Restrictions</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              By using InzuTrust, you agree not to engage in any activity that could harm the Platform, other users, or the integrity of the service. The following activities are strictly prohibited:
            </p>
            <div className="grid grid-cols-2 gap-1.5 bg-red-50 border border-red-200 rounded-xl p-3 my-2.5">
              {[
                "Posting fraudulent or misleading listings",
                "Bypassing payment systems to transact off-platform",
                "Harassing or intimidating other users",
                "Attempting to reverse-engineer the Platform",
                "Creating multiple accounts to circumvent bans",
                "Using InzuTrust for illegal subletting",
                "Scraping platform data without written consent",
                "Sharing account credentials with third parties",
              ].map((t, i) => (
                <div key={i} className="flex gap-1.5 items-start text-[12.5px] text-red-700 leading-snug">
                  <span className="font-bold flex-shrink-0">✗</span>
                  {t}
                </div>
              ))}
            </div>
            <Callout type="warn">
              ⚠ IMPORTANT: Violations of Platform usage rules will result in immediate account suspension, permanent removal from the Platform, and may be reported to the relevant national authorities.
            </Callout>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 9. DISPUTES ── */}
          <section id="s9" ref={(r) => (refs.current["s9"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">9. Dispute Resolution &amp; Liability</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              InzuTrust provides a structured dispute resolution mechanism to help tenants and landlords resolve disagreements fairly and efficiently within the Platform. InzuTrust is a technology intermediary and is not a party to any rental agreement.
            </p>
            <div className="grid grid-cols-2 gap-5 mt-2.5">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.07em] mb-2">Dispute Process</p>
                <Flow steps={[
                  { t: "Open a Dispute",      d: "Either party submits a formal dispute via the dashboard" },
                  { t: "Evidence Submission", d: "Both parties upload supporting documents and communications" },
                  { t: "Mediator Review",     d: "An InzuTrust mediator reviews the case within 5 business days" },
                  { t: "Resolution Issued",   d: "A binding decision is issued; any held funds are released" },
                ]} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.07em] mb-2">Scope of Liability</p>
                <ul className="list-none p-0 space-y-1.5">
                  {[
                    "We are not liable for damages beyond the scope of our documented platform services.",
                    "InzuTrust's total liability shall not exceed the platform fees paid in the preceding 3 months.",
                    "We do not guarantee uninterrupted access to the Platform at all times.",
                    "We are not liable for physical property damage or personal injury.",
                  ].map((t, i) => (
                    <li key={i} className="flex gap-2 items-start text-[13px] leading-relaxed text-[#2d2d2d]">
                      <span className="text-[#0479b4] flex-shrink-0 mt-0.5">→</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Callout type="warn">
              ⚠ LIMITATION OF LIABILITY: InzuTrust is not liable for physical property damage, personal injury, or consequential losses arising from disputes between tenants and landlords.
            </Callout>
          </section>

          <hr className="border-gray-200 my-6" />

          {/* ── 10. TERMINATION ── */}
          <section id="s10" ref={(r) => (refs.current["s10"] = r)} className="pb-7">
            <h2 className="text-[22px] font-bold text-[#03609b] mb-2.5 leading-tight">10. Termination &amp; Amendments</h2>
            <p className="text-[13.5px] leading-[1.72] text-[#2d2d2d] mb-3">
              InzuTrust reserves the right to terminate or suspend access to the Platform for any user who violates these Terms, with or without prior notice, at our sole discretion.
            </p>
            <ul className="list-none p-0 space-y-1.5 mb-3">
              {[
                "Users may terminate their account at any time by contacting InzuTrust support.",
                "Termination of your account does not cancel or invalidate any existing active rental agreements.",
                "Personal data may be retained following account termination as required by applicable law.",
                "InzuTrust may update these Terms at any time with a minimum of 30 days written notice to registered users.",
                "Continued use of the Platform after any amendments constitutes your acceptance of the revised Terms.",
                "These Terms are governed by the laws of the jurisdiction in which InzuTrust is registered.",
              ].map((t, i) => (
                <li key={i} className="flex gap-2 items-start text-[13.5px] leading-relaxed text-[#2d2d2d]">
                  <span className="text-[#0479b4] flex-shrink-0 mt-0.5">→</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-[12.5px] text-gray-500">
              Any legal action arising from these Terms must be brought in the courts of the jurisdiction in which InzuTrust is registered. Effective date: March 19, 2026.
            </p>
          </section>

          {/* ── ACCEPTANCE CTA ── */}
          <div
            className="rounded-xl p-8 mt-9 text-white"
            style={{ background: "linear-gradient(120deg,#03609b 0%,#1863c2 100%)" }}
          >
            <div className="flex items-center gap-3.5 mb-3 flex-wrap">
              <div className="bg-white/15 rounded-xl p-2.5">
                <Logo size={38} />
              </div>
              <div>
                <p className="text-[18px] font-bold text-white mb-1">Your Agreement with InzuTrust</p>
                <p className="text-[13.5px] text-white/80 leading-relaxed m-0">
                  By using InzuTrust, you confirm that you have read, understood, and agree to be bound by these Terms in full.
                </p>
              </div>
            </div>
            <div
              className="flex gap-3 items-start mt-4 mb-6 cursor-pointer select-none"
              onClick={() => setAccepted((a) => !a)}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                  accepted ? "bg-[#219967] border-[#219967]" : "border-white/45 bg-transparent"
                }`}
              >
                {accepted && <span className="text-white text-[11px] font-extrabold">✓</span>}
              </div>
              <span className="text-[13.5px] text-white/90 leading-relaxed">
                I have read and agree to the Terms &amp; Conditions, including the Privacy Policy and Platform Usage rules.
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                disabled={!accepted}
                className="bg-white text-[#03609b] font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors hover:bg-blue-50 disabled:bg-white/20 disabled:text-white/35 disabled:cursor-not-allowed"
              >
                ✓ I Accept These Terms
              </button>
              <button
                onClick={() => window.print()}
                className="bg-transparent text-white border border-white/40 font-semibold text-[14px] px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors print:hidden"
              >
                ⬇ Download PDF
              </button>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer className="border-t border-gray-200 pt-6 mt-11">
            <div className="flex gap-5 flex-wrap mb-2.5">
              {["Privacy Policy", "FAQ", "Support", "Contact Us"].map((l) => (
                <a key={l} className="text-[13px] text-[#1863c2] underline underline-offset-4 cursor-pointer hover:text-[#0479b4]">
                  {l}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-2">
              <Logo size={16} />
              InzuTrust – Ensuring transparency and safety in rental agreements
            </div>
            <p className="text-[12px] text-gray-400">
              © 2026 InzuTrust. All rights reserved. Registered in Rwanda. Last updated: March 19, 2026.
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
};

export default TermsAndConditions;