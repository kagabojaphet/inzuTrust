// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { HiSearch } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';

import useDropdown from './navbar/useDropdown';
import SearchModal from './navbar/SearchModal';
import LanguageDropdown from './navbar/LanguageDropdown';
import BecomeDropdown from './navbar/BecomeDropdown';
import MobileMenu from './navbar/MobileMenu';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langDropdown = useDropdown();
  const becomeDropdown = useDropdown();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const showSearchBar = !scrolled;
  const showSearchIcon = scrolled;

  const getStartedClasses = [
    'bg-brand-blue-bright',
    'hover:bg-brand-blue-bright',
    'text-white',
    'rounded-lg',
    'font-bold',
    'transition-all',
    'shadow-sm',
    'active:scale-95',
    'whitespace-nowrap',
    'hidden',
    'sm:inline-flex',
    'items-center',
    scrolled ? 'px-4 py-2 text-[0.78rem]' : 'px-5 py-2.5 text-[0.84rem]',
  ].join(' ');

  return (
    <>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="px-4 md:px-10 max-w-7xl mx-auto">

          {/* Top row */}
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? 'py-2.5' : 'py-3.5'
            }`}
          >

            {/* ✅ LOGO (UPDATED COLORS) */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span
                className={`font-bold tracking-tight transition-all duration-300 ${
                  scrolled ? 'text-[1.3rem]' : 'text-[1.5rem]'
                }`}
              >
                {/* Blue part */}
                <span className="text-brand-blue-dark">
                  Inzu
                  {/* Green T */}
                <span className="text-green-500">T</span>
                  rust
                </span>

               
              </span>
            </a>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6 text-[0.875rem] font-medium text-gray-700">
              <a href="/" className="hover:text-brand-blue-bright transition-colors py-1">Home</a>
              <a href="/properties" className="hover:text-brand-blue-bright transition-colors py-1">Properties</a>
              <a href="/prices" className="hover:text-brand-blue-bright transition-colors py-1">Prices</a>
              <a href="/contact" className="hover:text-brand-blue-bright transition-colors py-1">Contact</a>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">

              {/* Search icon */}
              {showSearchIcon && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 hover:border-brand-blue-mid text-gray-500 hover:text-brand-blue-dark rounded-lg transition-all"
                >
                  <HiSearch className="text-[1.1rem]" />
                </button>
              )}

              {/* Language */}
              <LanguageDropdown
                language={language}
                setLanguage={setLanguage}
                scrolled={scrolled}
                dropdown={langDropdown}
              />

              {/* Become */}
              <BecomeDropdown
                t={t}
                dropdown={becomeDropdown}
              />

              {/* Get Started */}
              <a href="/login" className={getStartedClasses}>
                Login
              </a>

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg border border-gray-200 gap-1.5 transition-all"
              >
                <span className={`w-[18px] h-0.5 bg-gray-600 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`} />
                <span className={`w-[18px] h-0.5 bg-gray-600 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`} />
                <span className={`w-[18px] h-0.5 bg-gray-600 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`} />
              </button>

            </div>
          </div>

          {/* Search bar */}
          {showSearchBar && (
            <div className="hidden md:flex justify-center pb-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full max-w-xl flex items-center gap-3 bg-white border border-gray-200 hover:border-brand-blue-mid rounded-lg px-4 py-2.5"
              >
                <HiSearch className="text-gray-400" />
                <span className="flex-1 text-[0.78rem] text-gray-400">
                  Search properties by location, type, or price...
                </span>
                <span className="hidden lg:flex text-[0.7rem] text-gray-300 border border-gray-200 rounded px-1.5 py-0.5">
                  Ctrl K
                </span>
              </button>
            </div>
          )}

        </div>

        <MobileMenu
          open={mobileMenuOpen}
          t={t}
          onClose={() => setMobileMenuOpen(false)}
        />
      </nav>
    </>
  );
}