import { useState, useEffect } from "react";
import One from "../assets/image/One.jpg"

const SLIDES = [
  {
    src: One,
    alt: "Modern luxury home with pool",
  },
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
    label: "CALL US", lines: ["1 (234) 567-891", "1 (234) 987-654"], bg: "#0479b4",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "LOCATION", lines: ["121 Rock Street, 21 Avenue,", "New York, NY 92103-9000"], bg: "#1863c2",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "HOURS", lines: ["Mon – Fri: 11am – 8pm", "Sat, Sun: 6am – 8pm"], bg: "#03609b",
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
      }, 700);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-11/12 overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? (fading ? 0 : 1) : 0 }}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-white" : "w-2 bg-white/50"
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
    `w-full px-2 py-2 text-sm bg-transparent border-b border-b-2 ${
      focused === name ? "border-blue-600" : "border-gray-300"
    } focus:outline-none`;

  const wordCount = form.message.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      form.message.length < 50 ||
      !form.agree
    ) {
      alert("Please complete all fields (message ≥ 50 characters)");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-11/12 mx-auto max-w-7xl bg-white rounded-xl shadow overflow-hidden">

        <div className="grid md:grid-cols-2">

          <div className="h-[400px] md:h-auto">
            <InfiniteSlider />
          </div>

          <div className="p-8 flex flex-col">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Contact <span className="text-blue-600">Us</span>
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              We'll get back to you within 24 hours.
            </p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center">
                  ✓
                </div>
                <p className="font-bold text-lg">Message Sent!</p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      firstName: "",
                      lastName: "",
                      email: "",
                      message: "",
                      agree: false,
                    });
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Send Again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-gray-600">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      onFocus={() => setFocused("firstName")}
                      onBlur={() => setFocused(null)}
                      className={inputStyle("firstName")}
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-gray-600">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      onFocus={() => setFocused("lastName")}
                      onBlur={() => setFocused(null)}
                      className={inputStyle("lastName")}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className={inputStyle("email")}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    className={`${inputStyle("message")} min-h-[100px]`}
                    placeholder="Minimum 50 characters..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {wordCount} words
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={() =>
                      setForm({ ...form, agree: !form.agree })
                    }
                  />
                  <span className="text-sm text-gray-500">
                    I accept Terms of Service
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!form.agree || submitting}
                  className={`py-3 rounded-md text-white font-bold text-sm transition ${
                    form.agree
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-600 opacity-40 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Sending..." : "Submit"}
                </button>

              </form>
            )}
          </div>
        </div>

        <div
          className="info-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            columnGap: "4rem"
          }}
        >
          {INFO_CARDS.map((card, i) => (
            <div
              key={card.label}
              style={{
                background: card.bg,
                padding: "18px 22px",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.18)" : "none",
                display: "flex",
                alignItems: "flex-start",
                gap: 10
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1
                }}
              >
                {card.icon}
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 3px 0",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.72)",
                    textTransform: "uppercase"
                  }}
                >
                  {card.label}
                </p>
                {card.lines.map((line, j) => (
                  <p
                    key={j}
                    style={{
                      margin: 0,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1.65
                    }}
                  >
                    {line}
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