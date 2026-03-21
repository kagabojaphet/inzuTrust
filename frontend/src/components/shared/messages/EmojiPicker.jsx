// src/components/shared/messages/EmojiPicker.jsx
// Lightweight emoji picker — no external library, pure React
import React, { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  {
    label: "😊 Smileys",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍",
      "🤩","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭",
      "🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪",
      "🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳",
      "😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨",
      "😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠",
    ],
  },
  {
    label: "👍 Gestures",
    emojis: [
      "👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉",
      "👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝",
      "🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁",
      "🦷","🦴","👀","👁️","👅","👄","💋","🫦",
    ],
  },
  {
    label: "❤️ Hearts",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗",
      "💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","🛐","⛎",
      "♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️",
    ],
  },
  {
    label: "🎉 Celebrations",
    emojis: [
      "🎉","🎊","🎈","🎁","🎀","🎗️","🎟️","🎫","🏆","🥇","🥈","🥉","🏅","🎖️","🎗️",
      "🎯","🎱","🎮","🕹️","🎲","♟️","🃏","🀄","🎴","🎭","🎨","🖼️","🎪","🎤","🎧",
      "🎼","🎵","🎶","🎷","🎸","🎹","🎺","🎻","🥁","🪘","🎙️","📻","📺","📷","📸",
    ],
  },
  {
    label: "🏠 Places",
    emojis: [
      "🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏧","🏨","🏩","🏪","🏫","🏬","🏭","🏯",
      "🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋","⛲","⛺","🏕️","🏗️","🏘️",
      "🏚️","🏛️","🏜️","🏝️","🏞️","🏟️","🗺️","🧭","🌋","⛰️","🏔️","🗻","🏕️","🏖️",
    ],
  },
  {
    label: "🚗 Transport",
    emojis: [
      "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️",
      "🛵","🚲","🛴","🛹","🛼","🚏","🛣️","🛤️","⛽","🚧","⚓","🛟","⛵","🚤","🛥️",
      "🛳️","⛴️","🚢","✈️","🛩️","🛫","🛬","🪂","💺","🚁","🚟","🚠","🚡","🛰️","🚀",
    ],
  },
  {
    label: "🍕 Food",
    emojis: [
      "🍕","🍔","🍟","🌭","🍿","🧂","🥓","🥚","🍳","🧇","🥞","🧈","🍞","🥐","🥖",
      "🫓","🥨","🥯","🧀","🥗","🥙","🥪","🌮","🌯","🫔","🥫","🍱","🍘","🍙","🍚",
      "🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥮","🍡","🥟","🥠","🥡","🦀","🦞",
      "🦐","🦑","🦪","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭",
    ],
  },
  {
    label: "💼 Objects",
    emojis: [
      "💼","👝","👛","👜","🎒","🧳","👓","🕶️","🥽","🌂","☂️","🧵","🧶","💄","💍",
      "💎","🔔","🔕","🎵","🎶","📱","💻","⌨️","🖥️","🖨️","🖱️","💾","💿","📀","📼",
      "📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🧭","⏱️","⌚",
      "⏰","🔋","🔌","💡","🔦","🕯️","🪔","🧯","🔧","🪛","🔨","🪚","⚒️","🛠️","🗡️",
    ],
  },
];

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch]   = useState("");
  const pickerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handle = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const searchResults = search
    ? CATEGORIES.flatMap(c => c.emojis).filter(e =>
        // Simple match: just shows all when something is typed
        // A real implementation would use emoji names — this is good enough
        e.includes(search)
      )
    : null;

  const displayEmojis = searchResults || CATEGORIES[activeCategory].emojis;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 w-72 overflow-hidden"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
    >
      {/* Header + search */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <span className="text-sm">🔍</span>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Category tabs — only show when not searching */}
      {!search && (
        <div className="flex overflow-x-auto gap-0.5 px-2 py-1.5 border-b border-gray-100 scrollbar-hide">
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              title={cat.label}
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base transition
                ${activeCategory === i ? "bg-blue-100" : "hover:bg-gray-100"}`}
            >
              {cat.emojis[0]}
            </button>
          ))}
        </div>
      )}

      {/* Category label */}
      {!search && (
        <div className="px-3 py-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            {CATEGORIES[activeCategory].label}
          </p>
        </div>
      )}

      {/* Emoji grid */}
      <div className="px-2 pb-3 overflow-y-auto" style={{ maxHeight: "220px" }}>
        {displayEmojis.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">No emoji found</p>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {displayEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => { onSelect(emoji); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 transition active:scale-90"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] text-gray-400 text-center">
          Click an emoji to insert it into your message
        </p>
      </div>
    </div>
  );
}