import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸", name: "US" },
  { code: "+44", flag: "🇬🇧", name: "GB" },
  { code: "+250", flag: "🇷🇼", name: "RW" },
  { code: "+33", flag: "🇫🇷", name: "FR" },
  { code: "+49", flag: "🇩🇪", name: "DE" },
  { code: "+254", flag: "🇰🇪", name: "KE" },
  { code: "+27", flag: "🇿🇦", name: "ZA" },
  { code: "+91", flag: "🇮🇳", name: "IN" },
  { code: "+86", flag: "🇨🇳", name: "CN" },
  { code: "+81", flag: "🇯🇵", name: "JP" },
];

const PORTRAIT_IMAGES = [
  "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=380&h=580&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=380&h=580&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=380&h=580&fit=crop&crop=face",
];

/* ── Icons ── */
const PhoneIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 12 19.79 19.79 0 01.22 3.37 2 2 0 012.2 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09A16 16 0 0015.91 17l.62-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* Spinner */
const Loader = () => (
  <svg width="20" height="20" className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* Reusable bottom-border input wrapper */
const FieldWrap = ({ icon, children, focused }) => (
  <div className={`flex items-center gap-2 bg-transparent border-b-2 pb-1 transition-colors duration-200 ${focused ? "border-[#0479b4]" : "border-gray-300"}`}>
    <span className={`flex-shrink-0 transition-colors duration-200 ${focused ? "text-[#0479b4]" : "text-gray-400"}`}>
      {icon}
    </span>
    {children}
  </div>
);

export default function ContactUs() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "", terms: false });
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[2]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [focused, setFocused] = useState("");

  const wordCount = form.message.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");

    setTimeout(() => {
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "", message: "", terms: false });
      setCountryCode(COUNTRY_CODES[2]);
      setTimeout(() => setStatus("idle"), 2800);
    }, 1500);
  };

  const allImages = [...PORTRAIT_IMAGES, ...PORTRAIT_IMAGES];

  const inputCls = "w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 py-2 font-[inherit]";

  return (
    <div className="min-h-screen bg-[#f0f5ff] p-6 md:p-8" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        .slide-track {
          display: flex;
          width: 600%;
          height: 100%;
          animation: slideLeft 9s linear infinite;
        }
        .slide-track:hover { animation-play-state: paused; }
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cc-dropdown::-webkit-scrollbar { width: 4px; }
        .cc-dropdown::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
      `}</style>

      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* Upper section */}
        <div className="flex flex-col md:flex-row">

          {/* Sliding image strip with top padding */}
          <div className="w-full md:w-[320px] h-[220px] md:h-[420px] flex-shrink-0 overflow-hidden bg-[#e6ecf7]">
            <div className="slide-track pt-8 md:pt-12">
              {allImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`person ${(i % 3) + 1}`}
                  loading="lazy"
                  className="flex-shrink-0 w-1/6 md:w-[320px] h-[calc(100%-32px)] md:h-[calc(100%-48px)] object-cover object-top border-r border-[#f0f5ff]"
                />
              ))}
            </div>
          </div>

          {/* Form panel */}
          <div className="flex-1 px-8 py-10 md:px-14 md:py-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">Contact Us</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name fields */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <FieldWrap icon={<UserIcon />} focused={focused === "firstName"}>
                    <input
                      name="firstName" type="text" placeholder="First name"
                      value={form.firstName} onChange={handleChange} required
                      className={inputCls}
                      onFocus={() => setFocused("firstName")}
                      onBlur={() => setFocused("")}
                    />
                  </FieldWrap>
                </div>
                <div className="flex-1">
                  <FieldWrap icon={<UserIcon />} focused={focused === "lastName"}>
                    <input
                      name="lastName" type="text" placeholder="Last name"
                      value={form.lastName} onChange={handleChange} required
                      className={inputCls}
                      onFocus={() => setFocused("lastName")}
                      onBlur={() => setFocused("")}
                    />
                  </FieldWrap>
                </div>
              </div>

              {/* Email */}
              <FieldWrap icon={<MailIcon />} focused={focused === "email"}>
                <input
                  name="email" type="email" placeholder="Enter a valid email address"
                  value={form.email} onChange={handleChange} required
                  className={inputCls}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                />
              </FieldWrap>

              {/* Phone */}
              <div className="flex gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(o => !o)}
                    className={`flex items-center gap-1.5 bg-transparent border-b-2 pb-1 h-full pt-2 px-3 text-sm font-semibold text-gray-700 cursor-pointer transition-colors whitespace-nowrap outline-none ${dropdownOpen ? "border-[#0479b4]" : "border-gray-300"}`}
                  >
                    <span className="text-xl leading-none">{countryCode.flag}</span>
                    <span>{countryCode.code}</span>
                    <ChevronDown />
                  </button>

                  {dropdownOpen && (
                    <div className="cc-dropdown absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto w-40">
                      {COUNTRY_CODES.map(cc => (
                        <div
                          key={cc.code}
                          onClick={() => { setCountryCode(cc); setDropdownOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f0f5ff] text-sm font-medium"
                        >
                          <span className="text-lg">{cc.flag}</span>
                          <span className="text-gray-800">{cc.code}</span>
                          <span className="text-gray-400 text-xs ml-auto">{cc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <FieldWrap icon={<PhoneIcon size={17} />} focused={focused === "phone"}>
                    <input
                      name="phone" type="tel" placeholder="Enter your number"
                      value={form.phone} onChange={handleChange} required
                      className={inputCls}
                      onFocus={() => setFocused("phone")}
                      onBlur={() => setFocused("")}
                    />
                  </FieldWrap>
                </div>
              </div>

              {/* Message + word count */}
              <div>
                <FieldWrap icon={<MessageIcon />} focused={focused === "message"}>
                  <textarea
                    name="message" placeholder="Type your message here..."
                    value={form.message} onChange={handleChange} required
                    rows={4}
                    className={`${inputCls} resize-y pt-2`}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused("")}
                  />
                </FieldWrap>
                <div className="text-right text-xs text-gray-400 mt-1.5 pr-1">
                  {wordCount} word{wordCount !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox" name="terms" checked={form.terms} onChange={handleChange} required
                  className="mt-0.5 w-5 h-5 accent-[#0479b4] cursor-pointer"
                />
                <span className="text-sm text-gray-500 leading-tight">
                  I accept the{" "}
                  <a href="#" className="text-[#0479b4] font-semibold hover:underline">Terms of Service</a>
                </span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={status !== "idle"}
                className={`w-full py-4 rounded-2xl text-white text-base font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.985] shadow-lg ${
                  status === "success"
                    ? "bg-emerald-600"
                    : "bg-[#1863c2] hover:bg-[#0f4a9c]"
                } ${status !== "idle" ? "cursor-not-allowed opacity-90" : ""}`}
              >
                {status === "loading" && <Loader />}
                {status === "loading"
                  ? "Sending message..."
                  : status === "success"
                  ? "✓ Message Sent!"
                  : "Submit Message"}
              </button>
            </form>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {[
            { icon: <PhoneIcon />, title: "Call Us", body: <>1 (234) 567-891<br />1 (234) 987-654</> },
            { icon: <MapPinIcon />, title: "Location", body: <>121 Rock Street, 21 Avenue,<br />New York, NY 92103-9000</> },
            { icon: <ClockIcon />, title: "Hours", body: <>Mon – Fri: 11 am – 8 pm<br />Sat, Sun: 6 am – 8 pm</> },
          ].map(({ icon, title, body }, i, arr) => (
            <div
              key={title}
              className={`bg-[#1863c2] px-8 py-7 text-white transition-colors hover:bg-[#0f4a9c] ${i < arr.length - 1 ? "border-r border-white/10 md:border-r" : ""}`}
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[1.5px] text-white/90 mb-3">
                {icon} {title}
              </div>
              <div className="text-[15px] text-white/90 leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}