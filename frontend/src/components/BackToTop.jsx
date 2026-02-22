import React, { useState, useEffect } from 'react';
import { HiArrowUp } from "react-icons/hi";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="fixed bottom-28 right-8 z-[50]">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-white border border-slate-200 text-brand-blue-bright rounded-full flex items-center justify-center shadow-xl hover:bg-blue-50 transition-all hover:-translate-y-1 active:scale-95 animate-in fade-in zoom-in duration-300"
          title="Back to top"
        >
          <HiArrowUp className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default BackToTop;