import React, { useState } from 'react';
import { HiUser, HiHome, HiArrowRight } from "react-icons/hi";
import TenantRegister from './TenantRegister';
import LandlordRegister from './LandlordRegister';

const Register = () => {
  const [role, setRole] = useState(null);

  const resetSelection = () => setRole(null);

  if (!role) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 py-12 font-sans">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#203482] mb-3 tracking-tight">
            Join InzuTrust
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Select your account type to continue
          </p>
        </div>

        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
          <RoleCard 
            title="I am a Tenant" 
            desc="I'm looking for a verified home and want to build my rental trust score."
            icon={<HiUser className="text-2xl text-[#2563eb]" />}
            iconBg="bg-[#eff6ff]"
            btnColor="bg-[#2563eb]"
            onClick={() => setRole('tenant')}
          />
          <RoleCard 
            title="I am a Landlord" 
            desc="I want to list my properties and manage tenants with verified digital history."
            icon={<HiHome className="text-2xl text-[#27a376]" />}
            iconBg="bg-[#ecfdf5]"
            btnColor="bg-[#27a376]"
            onClick={() => setRole('landlord')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {role === 'tenant' ? (
        <TenantRegister onBack={resetSelection} />
      ) : (
        <LandlordRegister onBack={resetSelection} />
      )}
    </div>
  );
};

const RoleCard = ({ title, desc, icon, iconBg, btnColor, onClick }) => (
  /* Applied your exact styling string here */
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-start text-left group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
  >
    <div className={`w-14 h-14 rounded-lg ${iconBg} flex items-center justify-center mb-6 transition-colors group-hover:bg-slate-900 group-hover:text-white`}>
      {icon}
    </div>
    
    <h3 className="text-2xl font-bold text-[#203482] mb-4">
      {title}
    </h3>
    
    <p className="text-slate-600 text-[1rem] leading-relaxed mb-10 min-h-[60px]">
      {desc}
    </p>
    
    <button 
      className={`w-full ${btnColor} text-white font-bold px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95`}
    >
      GET STARTED <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

export default Register;