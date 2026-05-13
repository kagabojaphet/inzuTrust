import { useState, useEffect } from "react";
import One from "../assets/image/One.jpg";

const SLIDES = [
  { src: One, alt: "Modern luxury home with pool" },
  {
    src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80",
    alt: "Classic family home",
  },
  {
    src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&q=80",
    alt: "Home keys handover",
  },
];

const INFO_CARDS = [
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "CALL US",
    lines: ["1 (234) 567-891", "1 (234) 987-654"],
    bg: "#0479b4",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "LOCATION",
    lines: ["Kigali, Rwanda", "21 Avenue, Kigali"],
    bg: "#1863c2",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "HOURS",
    lines: ["Mon – Fri: 11am – 8pm", "Sat, Sun: 6am – 8pm"],
    bg: "#03609b",
  },
];

function InfiniteSlider() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % SLIDES.length);
        setFading(false);
      }, 500);
    }, 4000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden border border-slate-200">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current ? (fading ? 0 : 1) : 0 }}
        >
          <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-white" : "w-2 bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ContactUs() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    agree: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);

  const inputStyle = (name) =>
    `w-full px-2 py-2 text-sm bg-transparent border-b ${
      focused === name ? "border-blue-600" : "border-slate-300"
    } focus:outline-none`;

  const wordCount = form.message.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || form.message.length < 50 || !form.agree) {
      alert("Complete all fields properly");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 overflow-x-hidden">
      <div className="w-full max-w-6xl border border-slate-200 rounded-xl overflow-hidden bg-white">

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* IMAGE */}
          <div className="h-64 md:h-auto border-b md:border-b-0 md:border-r border-slate-200">
            <InfiniteSlider />
          </div>

          {/* FORM */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Contact <span className="text-blue-600 font-medium">Us</span>
            </h2>

            <p className="text-sm text-slate-500 mt-2 mb-6">
              Response within 24 hours
            </p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-3 text-center py-10">
                <div className="w-12 h-12 border border-green-600 rounded-full flex items-center justify-center text-green-600">
                  ✓
                </div>

                <p className="font-medium text-base">Message Sent</p>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ firstName: "", lastName: "", email: "", message: "", agree: false });
                  }}
                  className="border border-blue-600 text-blue-600 px-4 py-2 text-sm rounded"
                >
                  Send Again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["firstName", "lastName"].map((field) => (
                    <input
                      key={field}
                      placeholder={field}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      onFocus={() => setFocused(field)}
                      onBlur={() => setFocused(null)}
                      className={inputStyle(field)}
                    />
                  ))}
                </div>

                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className={inputStyle("email")}
                />

                <textarea
                  placeholder="Message (min 50 chars)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  className={`${inputStyle("message")} min-h-[90px]`}
                />

                <p className="text-xs text-slate-400">{wordCount} words</p>

                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={() => setForm({ ...form, agree: !form.agree })}
                  />
                  Accept terms
                </label>

                <button
                  type="submit"
                  disabled={!form.agree || submitting}
                  className="w-full border border-blue-600 text-blue-600 py-2 text-sm rounded disabled:opacity-40"
                >
                  {submitting ? "Sending..." : "Submit"}
                </button>

              </form>
            )}
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-200">
          {INFO_CARDS.map((card, i) => (
            <div
              key={i}
              className="p-4 flex gap-3 border-b md:border-b-0 md:border-r last:border-r-0"
              style={{ background: card.bg }}
            >
              <div className="w-8 h-8 flex items-center justify-center border border-white/20">
                {card.icon}
              </div>

              <div>
                <p className="text-[10px] uppercase text-white/70">{card.label}</p>
                {card.lines.map((l, idx) => (
                  <p key={idx} className="text-sm text-white">
                    {l}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}