// src/components/navbar/BecomeDropdown.jsx
import { HiChevronDown } from 'react-icons/hi';
import { MdHandshake } from 'react-icons/md';
import { BsHouseFill } from 'react-icons/bs';

export default function BecomeDropdown({ dropdown }) {
  return (
    <div className="relative hidden lg:block" ref={dropdown.ref}>
      <button
        onClick={() => dropdown.setOpen(!dropdown.open)}
        className="flex items-center gap-1.5 border border-brand-blue-mid text-brand-blue-mid hover:bg-brand-blue-bright hover:text-white bg-white px-4 py-2 rounded-lg text-[0.8rem] font-semibold transition-all whitespace-nowrap"
      >
        Become
        <HiChevronDown
          className={`transition-transform duration-200 ${
            dropdown.open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdown.open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl py-1.5 z-50">

          {/* Become Agent */}
          <a
           href="/become-agent"
            onClick={() => dropdown.setOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-[0.84rem] font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue-bright transition-colors rounded-lg"
          >
            <MdHandshake className="text-xl text-amber-500 shrink-0" />
            Become an Agent
          </a>

          {/* Become Landlord */}
          <a
            href="/become-landlord"
            onClick={() => dropdown.setOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-[0.84rem] font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue-bright transition-colors rounded-lg"
          >
            <BsHouseFill className="text-xl text-brand-blue-mid shrink-0" />
            Become a Landlord
          </a>

        </div>
      )}
    </div>
  );
}