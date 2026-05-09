import { HiChevronDown, HiCheck } from 'react-icons/hi';
import FlagImg from './FlagImg';
import { LANGUAGES } from './constants';

export default function LanguageDropdown({ language, setLanguage, scrolled, dropdown }) {
  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdown.ref}>
      <button
        onClick={() => dropdown.setOpen(!dropdown.open)}
        className="flex items-center gap-1.5 border border-gray-200 hover:border-brand-blue-mid bg-white px-3 py-2 rounded-lg text-[0.8rem] font-semibold transition-all hover:shadow-sm"
      >
        <FlagImg src={activeLang.flagSrc} alt={activeLang.label} size="md" />
        <span className={scrolled ? 'hidden' : 'hidden sm:inline'}>
          {activeLang.label}
        </span>
        <HiChevronDown
          className={`text-gray-500 text-sm transition-transform duration-200 ${dropdown.open ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdown.open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-lg shadow-xl py-1.5 z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); dropdown.setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-[0.84rem] transition-colors rounded-lg ${
                language === l.code
                  ? 'bg-blue-50 text-brand-blue-dark font-bold'
                  : 'text-gray-700 hover:bg-gray-50 font-medium'
              }`}
            >
              <span className="flex items-center gap-3">
                <FlagImg src={l.flagSrc} alt={l.label} size="lg" />
                <span>{l.label}</span>
              </span>
              {language === l.code && (
                <HiCheck className="text-brand-blue-dark text-base shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}