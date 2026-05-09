// src/components/navbar/MobileMenu.jsx
import { MdHandshake } from 'react-icons/md';
import { BsHouseFill } from 'react-icons/bs';
import { HiHome, HiOfficeBuilding, HiTag, HiPhone } from 'react-icons/hi';

export default function MobileMenu({ open, onClose }) {
  if (!open) return null;

  const links = [
    {
      href: '/',
      label: 'Home',
      icon: <HiHome className="text-brand-blue-mid text-lg shrink-0" />,
    },
    {
      href: '/properties',
      label: 'Properties',
      icon: <HiOfficeBuilding className="text-brand-blue-mid text-lg shrink-0" />,
    },
    {
      href: '/prices',
      label: 'Prices',
      icon: <HiTag className="text-brand-blue-mid text-lg shrink-0" />,
    },
    {
      href: '/contact',
      label: 'Contact Us',
      icon: <HiPhone className="text-brand-blue-mid text-lg shrink-0" />,
    },
    {
      href: '/become-agent',
      label: 'Become an Agent',
      icon: <MdHandshake className="text-amber-500 text-lg shrink-0" />,
    },
    {
      href: '/become-landlord',
      label: 'Become a Landlord',
      icon: <BsHouseFill className="text-brand-blue-mid text-lg shrink-0" />,
    },
  ];

  return (
    <div className="md:hidden border-t border-gray-100 bg-white">
      <div className="px-4 py-3 flex flex-col gap-1">

        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.88rem] font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue-bright transition-colors"
          >
            {link.icon}
            {link.label}
          </a>
        ))}

        {/* Get Started */}
        <a
          href="/register"
          onClick={onClose}
          className="mt-2 bg-brand-blue-dark hover:bg-brand-blue-bright text-white px-4 py-2.5 rounded-lg text-[0.88rem] font-bold text-center transition-all"
        >
          Get Started
        </a>

      </div>
    </div>
  );
}