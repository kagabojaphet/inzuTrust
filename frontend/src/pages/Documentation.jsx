import { useState, useEffect } from "react";
// ─────────────────────────────────────────────────────────────
// SVG icons — data-highlight / data-outline paths
// Tailwind targets them with **:[data-highlight]:fill-* etc.
// ─────────────────────────────────────────────────────────────
const BookIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
    <path data-highlight="true"
      d="M3.5 1.5C2.4264 1.5 1.40926 1.74169 0.5 2.17363V13.1736C1.40926 12.7417 2.4264 12.5 3.5 12.5C5.21352 12.5 6.78323 13.1157 8 14.1379V3.13789C6.78323 2.11568 5.21352 1.5 3.5 1.5Z" />
    <path data-outline="true"
      d="M8 14.1379C9.21677 13.1157 10.7865 12.5 12.5 12.5C13.5736 12.5 14.5907 12.7417 15.5 13.1736V2.17363C14.5907 1.74169 13.5736 1.5 12.5 1.5C10.7865 1.5 9.21677 2.11568 8 3.13789M8 14.1379C6.78323 13.1157 5.21352 12.5 3.5 12.5C2.4264 12.5 1.40926 12.7417 0.5 13.1736V2.17363C1.40926 1.74169 2.4264 1.5 3.5 1.5C5.21352 1.5 6.78323 2.11568 8 3.13789M8 14.1379V3.13789" />
  </svg>
);
const LayersIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
    <path data-outline="true" d="m11 8 .5.25L15 10.5 8 15l-7-4.5 3.5-2.25L5 8" />
    <path data-highlight="true" d="M8 1 1 5.5 8 10l7-4.5L8 1Z" />
    <path data-outline="true" d="M8 1 1 5.5 8 10l7-4.5L8 1Z" />
  </svg>
);
const TemplatesIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
    <path data-highlight="true"
      d="M12.5 1.5H3.5C2.39543 1.5 1.5 2.39543 1.5 3.5V4.5V12.5C1.5 13.6046 2.39543 14.5 3.5 14.5H5.5V4.5H14.5V3.5C14.5 2.39543 13.6046 1.5 12.5 1.5Z" />
    <path data-outline="true"
      d="M5.5 4.5H14.5M5.5 4.5H1.5M5.5 4.5V14.5M14.5 4.5V3.5C14.5 2.39543 13.6046 1.5 12.5 1.5H3.5C2.39543 1.5 1.5 2.39543 1.5 3.5V4.5M14.5 4.5V12.5C14.5 13.6046 13.6046 14.5 12.5 14.5H5.5M1.5 4.5V12.5C1.5 13.6046 2.39543 14.5 3.5 14.5H5.5" />
  </svg>
);
const UIKitIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
    <path data-highlight="true" d="M15.5 11.5V4.5L8 8.5L0.5 4.5V11.5L8 15.5L15.5 11.5Z" />
    <path data-outline="true"
      d="M0.5 4.5V11.5L8 15.5M0.5 4.5L8 0.5L15.5 4.5M0.5 4.5L8 8.5M15.5 4.5V11.5L8 15.5M15.5 4.5L8 8.5M8 15.5V8.5" />
  </svg>
);
const PlaygroundIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
    <rect data-highlight="true" x="1.5" y="1.5" width="13" height="13" rx="2" />
    <rect data-outline="true" x="1.5" y="1.5" width="13" height="13" rx="2" />
    <path data-outline="true" d="M6.5 6L4.5 8L6.5 10" strokeLinecap="round" strokeLinejoin="round" />
    <path data-outline="true" d="M9.5 6L11.5 8L9.5 10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
    <path data-outline="true" strokeLinejoin="round"
      d="M5.5 4.5h-3a2 2 0 00-2 2v4c0 1.1.9 2 2 2h1v3l3-3h2a2 2 0 002-2v-1m0 0l2 2v-3h1a2 2 0 002-2v-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4c0 1.1.9 2 2 2h2l1 1z" />
    <path data-highlight="true"
      d="M13.5 1c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-1a.5.5 0 00-.5.5v1.8L9.85 8.14A.5.5 0 009.5 8h-2A1.5 1.5 0 016 6.5v-4C6 1.67 6.67 1 7.5 1h6z" />
  </svg>
);
// ─────────────────────────────────────────────────────────────
// The exact Tailwind docs anchor class string.
// We replicate it using Tailwind's arbitrary-variant selectors.
// [&_[data-highlight]]:fill-transparent → default highlight fill
// [&_[data-outline]]:stroke-gray-400 → default outline stroke
// hover:[&_[data-highlight]]:fill-gray-300 etc.
// ─────────────────────────────────────────────────────────────
const NAV_LINK_CLASS = [
  "group inline-flex items-center gap-3",
  "text-base/8 sm:text-sm/7",
  "text-gray-600",
  // SVG sizing
  "[&>svg]:size-5 sm:[&>svg]:size-4",
  // data-outline default
  "[&_[data-outline]]:stroke-gray-400",
  // data-highlight default
  "[&_[data-highlight]]:fill-transparent",
  // hover
  "hover:text-[#0479b4]",
  "hover:[&_[data-highlight]]:fill-gray-300",
  "hover:[&_[data-outline]]:stroke-[#0479b4]",
  // aria-current (active)
  "aria-[current]:font-semibold",
  "aria-[current]:text-[#0479b4]",
  "aria-[current]:[&_[data-highlight]]:fill-gray-300",
  "aria-[current]:[&_[data-outline]]:stroke-[#0479b4]",
  "transition-colors duration-100",
].join(" ");
// Section link — exact Tailwind classes
const SECTION_LINK_CLASS = [
  "inline-block border-l border-transparent",
  "text-base/8 sm:text-sm/6",
  "text-gray-600",
  "hover:border-[#0479b4] hover:text-[#0479b4]",
  "aria-[current]:border-[#0479b4] aria-[current]:font-semibold aria-[current]:text-[#0479b4]",
  "pl-5 sm:pl-4",
  "transition-all duration-100",
].join(" ");
// ─────────────────────────────────────────────────────────────
// Nav data
// ─────────────────────────────────────────────────────────────
const NAV_TOP = [
  { label: "Documentation", href: "#introduction", Icon: BookIcon, current: true },
  { label: "Tenant Portal", href: "#", Icon: LayersIcon },
  { label: "Landlord Dashboard", href: "#", Icon: TemplatesIcon },
  { label: "Support", href: "#", Icon: ChatIcon },
];
const NAV_GROUPS = [
  {
    title: "Overview",
    links: [
      { label: "Introduction", href: "#introduction" },
      { label: "How InzuTrust Works", href: "#how-it-works" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Platform Roles", href: "#roles" },
      { label: "Rental Agreements", href: "#agreements" },
      { label: "Transaction Tracking", href: "#transactions" },
      { label: "Property Management", href: "#properties" },
    ],
  },
  {
    title: "Trust & Security",
    links: [
      { label: "Security & Trust", href: "#security" },
      { label: "Data Protection", href: "#" },
      { label: "Verification Policy", href: "#" },
    ],
  },
  {
    title: "Getting Started",
    links: [
      { label: "Onboarding Guide", href: "#getting-started" },
      { label: "Tenant Guide", href: "#" },
      { label: "Landlord Guide", href: "#" },
      { label: "Administrator Guide", href: "#" },
    ],
  },
];
// ─────────────────────────────────────────────────────────────
// Sidebar — matches Tailwind docs HTML exactly
// ─────────────────────────────────────────────────────────────
function Sidebar({ active }) {
  return (
    <div className="relative col-start-1 row-span-full row-start-1 max-lg:hidden">
      <div className="absolute inset-0">
        <div className="sticky top-14 bottom-0 left-0 h-full max-h-[calc(100dvh-3.5rem)] w-2xs overflow-y-auto p-6">
          <nav className="flex flex-col gap-8">
            {/* ── Top-level nav links with icons ── */}
            <ul className="flex flex-col gap-2">
              {NAV_TOP.map(({ label, href, Icon, current }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={NAV_LINK_CLASS}
                  >
                    <Icon />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            {/* ── Section groups ── */}
            {NAV_GROUPS.map(({ title, links }) => (
              <div key={title} className="flex flex-col gap-3" data-autoscroll="true">
                <h3 className="font-mono text-sm/6 sm:text-xs/6 font-medium tracking-widest text-gray-500 uppercase">
                  {title}
                </h3>
                <ul
                  className="flex flex-col gap-2 border-l"
                  style={{ borderColor: "color-mix(in oklab, var(--color-gray-950, #030712), white 90%)" }}
                >
                  {links.map(({ label, href }) => {
                    const sectionId = href.replace("#", "");
                    const isCurrent = active === sectionId && href !== "#";
                    return (
                      <li key={label} className="-ml-px flex flex-col items-start gap-2">
                        <a
                          href={href}
                          aria-current={isCurrent ? "page" : undefined}
                          className={SECTION_LINK_CLASS}
                        >
                          {label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// Shared small components
// ─────────────────────────────────────────────────────────────
const Badge = ({ v, children }) => {
  const s = {
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  }[v] ?? "";
  return <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${s}`}>{children}</span>;
};
const Callout = ({ type = "info", children }) => (
  <div className={`flex gap-3 items-start rounded-xl p-4 my-5 text-[13.5px] leading-relaxed ${type === "info" ? "bg-blue-50 border border-blue-200" : "bg-emerald-50 border border-emerald-200"}`}>
    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${type === "info" ? "text-blue-500" : "text-emerald-600"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <p className="text-gray-700">{children}</p>
  </div>
);
// ─────────────────────────────────────────────────────────────
// Data constants
// ─────────────────────────────────────────────────────────────
const FLOW_STEPS = [
  { label: "Create Account", d: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  { label: "Browse & Request",d: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
  { label: "Sign Agreement", d: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></> },
  { label: "Record Payment", d: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
  { label: "History Logged", d: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
];
const ROLES = [
  { label: "Tenant", bg: "bg-blue-50 text-blue-600",
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    items: ["Browse listed properties","Submit rental requests","Sign digital agreements","Track payment history","Download receipts"] },
  { label: "Landlord", bg: "bg-emerald-50 text-emerald-600",
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    items: ["List and manage properties","Draft rental agreements","Track rental income","Monitor occupancy","Export reports"] },
  { label: "Administrator", bg: "bg-violet-50 text-violet-600",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    items: ["Manage all accounts","Verify user identities","Audit all records","Configure platform","Compliance oversight"] },
];
const OB_STEPS = [
  { n: "01", t: "Create Account", d: "Register with your national ID or business registration number." },
  { n: "02", t: "Verify Identity", d: "Upload documents — most reviews complete within 24 hours." },
  { n: "03", t: "Add Property or Profile", d: "Landlords add properties; tenants complete their rental profile." },
  { n: "04", t: "Create Agreement", d: "Draft or accept a rental agreement with full digital signatures." },
  { n: "05", t: "Start Transacting", d: "Payments are automatically logged and receipted for both parties." },
];
// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
export default function Documentation() {
  const [active, setActive] = useState("introduction");
  useEffect(() => {
    const ids = ["introduction","how-it-works","roles","agreements","transactions","properties","security","getting-started"];
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-56px 0px -65% 0px", threshold: 0 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return (
    <div className="min-h-screen bg-white text-[#0479b4] antialiased">
      {/* ── Outer page grid — exact Tailwind docs structure ── */}
      <div className="grid min-h-dvh pt-14
        grid-cols-1
        lg:grid-cols-[var(--container-2xs,16rem)_2.5rem_minmax(0,1fr)_2.5rem]
        grid-rows-[1fr_1px_auto_1px_auto]">
        {/* Col 1: sidebar */}
        <Sidebar active={active} />
        {/* Col 2: left hatched gutter */}
        <div className="hidden lg:block col-start-2 row-span-5 row-start-1
          border-x border-x-gray-950/5
          bg-[image:repeating-linear-gradient(315deg,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.04)_1px,transparent_0,transparent_50%)]
          bg-[size:10px_10px] bg-fixed" />
        {/* Col 3: main content */}
        <div className="relative row-start-1 grid grid-cols-subgrid lg:col-start-3">
          <main className="isolate mx-auto w-full max-w-2xl px-4 sm:px-6 pt-10 pb-24 xl:max-w-3xl">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-20 mb-16">
              <p className="font-mono text-xs/6 font-medium tracking-widest uppercase text-gray-500 mb-2">Documentation</p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#0479b4] mb-4">InzuTrust Platform</h1>
              <p className="text-base/7 text-gray-700 mb-3">
                A digital infrastructure for secure rental management — connecting landlords and tenants through transparent agreements, traceable payments, and verifiable records.
              </p>
              <p group inline-flex items-center gap-3className="text-base/7 text-gray-700 mb-8">It's fast, flexible, and reliable — with zero disputes.</p>
              <Callout>
                <><strong className="font-semibold text-[#0479b4]">What is InzuTrust?</strong>{" "}
                  InzuTrust creates trust between landlords and tenants by managing rental agreements, property records, and transaction histories in one secure system.</>
              </Callout>
              <h2 className="text-lg font-semibold text-[#0479b4] mt-8 mb-3">Platform Mission</h2>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
                Rental relationships have long suffered from unclear terms and missing records. InzuTrust digitizes every agreement, every payment, and every property record so{" "}
                <strong className="font-medium text-[#0479b4]">trust is built by default</strong> — not by hope.
              </p>
              <div className="rounded-xl border border-gray-inear-gradient(90deg, #0d4f8c 0%, #0a6dba 30%, #1a8fd1 55%, #3a9620 80%, #4caf28 100% overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {["Capability","Description","Status"].map(h => (
                        <th key={h} className="text-left text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Digital Agreements","Legally documented contracts stored on-platform","green","Available"],
                      ["Payment Tracking","Full transaction history with receipts and timestamps","green","Available"],
                      ["Property Records","Occupancy status, listings, and maintenance logs","green","Available"],
                      ["Identity Verification","Secure verification for tenants and landlords","green","Available"],
                      ["API Access","Programmatic access for integrations","blue","Beta"],
                    ].map(([cap, desc, color, status]) => (
                      <tr key={cap} className="border-b border-gray-100 last:border-0 hover:bg-[#0479b4]/50 transition-colors">
                        <td className="px-4 py-2.5 text-[13px] font-medium text-gray-800 whitespace-nowrap">{cap}</td>
                        <td className="px-4 py-2.5 text-[13px] text-gray-500">{desc}</td>
                        <td className="px-4 py-2.5"><Badge v={color}>{status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            {/* How it works */}
            <section id="how-it-works" className="scroll-mt-20 mb-16 pt-10 border-t border-gray-950/5">
              <h2 className="text-xl font-semibold text-[#0479b4] mb-2">How InzuTrust Works</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">From account creation to final receipt, every interaction is captured and secured.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-start min-w-max">
                  {FLOW_STEPS.map(({ label, d }, i) => (
                    <div key={label} className="flex items-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-sm">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
                        </div>
                        <span className="text-[11px] font-medium text-gray-600 text-center max-w-[72px] leading-tight">{label}</span>
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <div className="mx-3 mb-5 text-gray-300">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* Roles */}
            <section id="roles" className="scroll-mt-20 mb-16 pt-10 border-t border-gray-950/5">
              <h2 className="text-xl font-semibold text-[#0479b4] mb-2">Platform Roles</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">Three distinct roles, each with carefully scoped permissions.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ROLES.map(({ label, bg, icon, items }) => (
                  <div key={label} className="rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                    </div>
                    <h3 className="text-[14px] font-semibold text-[#0479b4] mb-3">{label}</h3>
                    <ul className="space-y-1.5">
                      {items.map(it => (
                        <li key={it} className="flex items-start gap-2 text-[12.5px] text-gray-500">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            {/* Agreements */}
            <section id="agreements" className="scroll-mt-20 mb-16 pt-10 border-t border-gray-950/5">
              <h2 className="text-xl font-semibold text-[#0479b4] mb-2">Rental Agreement System</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">Every agreement is a structured digital contract — stored securely and accessible to both parties.</p>
              <div className="rounded-xl border border-linear-gradient(160deg, rgb(13, 79, 140) 0%, rgb(10, 109, 186) 35%, rgb(26, 143, 209) 60%, rgb(13, 95, 160) 100%) overflow-hidden">
                <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-[#0479b4] flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    Agreement #INZ-2024-00124
                  </span>
                  <Badge v="green">Active</Badge>
                </div>
                <div className="bg-gray-50 p-5 grid gap-3">
                  {[["Tenant","Kagabo Jean-Pierre"],["Landlord","Uwimana Céleste"],["Property","Apt 4B, KG 11 Ave, Kigali"],["Start Date","01 March 2024"],["End Date","28 February 2025"],["Monthly Rent","RWF 280,000"]].map(([f, v]) => (
                    <div key={f} className="grid grid-cols-[130px_1fr] gap-3 items-center">
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">{f}</span>
                      <span className={`text-[13px] bg-white border rounded-lg px-3 py-1.5 ${f === "Monthly Rent" ? "border-blue-200 bg-blue-50 text-blue-700 font-medium" : "border-gray-200 text-gray-800"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* Transactions */}
            <section id="transactions" className="scroll-mt-20 mb-16 pt-10 border-t border-gray-950/5">
              <h2 className="text-xl font-semibold text-gray-950 mb-2">Transaction Tracking</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">Every payment is automatically logged with timestamp, amount, and status.</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {["Reference","Date","Amount","Method","Status"].map(h => (
                        <th key={h} className="text-left text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["TXN-00381","Mar 1, 2024","RWF 280,000","Mobile Money","Paid","green"],
                      ["TXN-00312","Feb 1, 2024","RWF 280,000","Mobile Money","Paid","green"],
                      ["TXN-00241","Jan 1, 2024","RWF 280,000","Bank Transfer","Paid","green"],
                      ["TXN-00198","Dec 1, 2023","RWF 280,000","Mobile Money","Pending","blue"],
                    ].map(([ref, date, amt, method, status, color]) => (
                      <tr key={ref} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[11.5px] text-gray-400">{ref}</td>
                        <td className="px-4 py-2.5 text-[13px] text-gray-600">{date}</td>
                        <td className="px-4 py-2.5 text-[13px] font-semibold text-gray-800">{amt}</td>
                        <td className="px-4 py-2.5 text-[13px] text-gray-500">{method}</td>
                        <td className="px-4 py-2.5"><Badge v={color}>{status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            {/* Properties */}
            <section id="properties" className="scroll-mt-20 mb-16 pt-10 border-t border-gray-950/5">
              <h2 className="text-xl font-semibold text-gray-950 mb-2">Property Management</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">Manage listings, occupancy, and maintenance from one dashboard.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { e: "🏠", t: "Property Listings", d: "Create detailed listings with photos, location, size, and pricing." },
                  { e: "📊", t: "Occupancy Tracking", d: "Real-time view of occupied, vacant, and pending units." },
                  { e: "🔧", t: "Maintenance Logs", d: "Log and track all maintenance requests and resolutions." },
                  { e: "📁", t: "Document Storage", d: "Store title deeds, permits, and inspection reports securely." },
                ].map(({ e, t, d }) => (
                  <div key={t} className="flex gap-4 rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                    <span className="text-xl shrink-0">{e}</span>
                    <div>
                      <h3 className="text-[14px] font-semibold text-gray-950 mb-1">{t}</h3>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* Security */}
            <section id="security" className="scroll-mt-20 mb-16 pt-10 border-t border-gray-950/5">
              <h2 className="text-xl font-semibold text-gray-950 mb-2">Security &amp; Trust</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">Four core pillars protect every user and every record on the platform.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { e: "🔒", t: "End-to-End Encryption", d: "All data encrypted at rest and in transit with AES-256." },
                  { e: "🪪", t: "Identity Verification", d: "Multi-factor verification required before accessing agreements." },
                  { e: "📋", t: "Immutable Records", d: "Transaction records are append-only and cannot be altered." },
                  { e: "🔍", t: "Audit Logging", d: "Every action is timestamped and stored in a tamper-evident log." },
                ].map(({ e, t, d }) => (
                  <div key={t} className="rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                    <span className="text-xl mb-3 block">{e}</span>
                    <h3 className="text-[14px] font-semibold text-gray-950 mb-1.5">{t}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
              <Callout type="success">
                <><strong className="font-semibold text-gray-950">Compliance Ready.</strong>{" "}
                  InzuTrust complies with Rwanda's data protection regulations and supports full record export for audit and legal proceedings.</>
              </Callout>
            </section>
            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-20 mb-20 pt-10 border-t border-gray-950/5">
              <h2 className="text-xl font-semibold text-gray-950 mb-2">Getting Started</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-8">Five steps to go from sign-up to active rental management.</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0">
                {OB_STEPS.map(({ n, t, d }, i) => (
                  <>
                    <div key={`n-${n}`} className="self-start mt-0.5">
                      <div className="grid size-7 place-content-center border border-gray-700/50 font-mono text-[10px]/7 font-medium text-gray-700">
                        {n}
                      </div>
                    </div>
                    <div key={`c-${n}`} className={`${i < OB_STEPS.length - 1 ? "pb-8" : "pb-0"}`}>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1.5">{t}</h4>
                      <p className="text-[13.5px] text-gray-500 leading-relaxed">{d}</p>
                    </div>
                  </>
                ))}
              </div>
              {/* Info note */}
              <div className="mt-8 grid grid-cols-[auto_1fr_auto] gap-3 items-start rounded-xl p-5 ring-1 ring-gray-950/10">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-[13.5px] text-gray-700 col-span-2 xl:col-span-1">
                  <strong className="font-semibold text-gray-950">Need help?</strong>{" "}
                  Check our Tenant or Landlord Guide for role-specific walkthroughs, or contact support.
                </span>
                <div className="col-span-full xl:col-span-1 place-self-center">
                  <a href="#" className="rounded-full bg-gray-[#0479b4]/5 px-4 py-1.5 text-sm/7 font-semibold text-gray-700 hover:bg-gray-[#0479b4] transition-colors">
                    Explore guides
                  </a>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <a href="#" className="inline-flex items-center gap-2 rounded-lg bg-gray-[#0479b4] px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-[#0479b4]/80 transition-colors">
                  Create your account
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </a>
                <a href="#" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  API Reference
                </a>
              </div>
            </section>
            {/* Prev / Next */}
            <div className="flex justify-between pt-8 border-t border-gray-950/5 text-sm">
              <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-gray-950 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
                Introduction
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-gray-950 transition-colors">
                API Reference
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </a>
            </div>
          </main>
        </div>
        {/* Col 4: right hatched gutter */}
        <div className="hidden lg:block col-start-4 row-span-5 row-start-1
          border-x border-x-gray-950/5
          bg-[image:repeating-linear-gradient(315deg,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.04)_1px,transparent_0,transparent_50%)]
          bg-[size:10px_10px] bg-fixed" />
      </div>
    </div>
  );
}