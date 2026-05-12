import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  HiUser,
  HiHome,
  HiArrowRight
} from "react-icons/hi";

import { MdHandshake } from "react-icons/md";

import TenantRegister from './TenantRegister';
import LandlordRegister from './LandlordRegister';
import AgentRegister from './AgentRegister';

const Register = () => {
  const navigate = useNavigate();

  /* =========================
     Selection Screen
  ========================== */
  const SelectionScreen = () => (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-5 sm:px-6 py-12">

      {/* HEADER */}
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#203482] tracking-tight mb-4 leading-tight">
          Join InzuTrust
        </h1>

        <p className="text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed">
          Select your account type to continue
        </p>
      </div>

      {/* CARDS */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* TENANT */}
        <RoleCard
          title="I am a Tenant"
          desc="I'm looking for a verified home and want to build my rental trust score."
          icon={<HiUser className="text-2xl text-brand-blue-bright" />}
          iconBg="bg-blue-50"
          btnColor="bg-brand-blue-bright"
          onClick={() => navigate('tenant')}
        />

        {/* LANDLORD */}
        <RoleCard
          title="I am a Landlord"
          desc="I want to list my properties and manage tenants with verified digital history."
          icon={<HiHome className="text-2xl text-brand-green-mid" />}
          iconBg="bg-green-50"
          btnColor="bg-brand-green-mid"
          onClick={() => navigate('landlord')}
        />

        {/* AGENT */}
        <RoleCard
          title="I am an Agent"
          desc="I help clients find properties and manage rental opportunities professionally."
          icon={<MdHandshake className="text-2xl text-slate-700" />}
          iconBg="bg-slate-100"
          btnColor="bg-slate-800"
          onClick={() => navigate('/register/agent')}
        />

      </div>
    </div>
  );

  return (
    <Routes>

      {/* /register */}
      <Route
        index
        element={<SelectionScreen />}
      />

      {/* /register/tenant */}
      <Route
        path="tenant"
        element={
          <TenantRegister onBack={() => navigate('/register')} />
        }
      />

      {/* /register/landlord */}
      <Route
        path="landlord"
        element={
          <LandlordRegister onBack={() => navigate('/register')} />
        }
      />

      {/* /register/agent */}
      <Route
        path="agent"
        element={
          <AgentRegister onBack={() => navigate('/register')} />
        }
      />

    </Routes>
  );
};

/* =========================
   ROLE CARD
========================== */
const RoleCard = ({
  title,
  desc,
  icon,
  iconBg,
  btnColor,
  onClick
}) => (
  <div
    onClick={onClick}
    className="
      bg-white
      border border-slate-200
      rounded-2xl
      p-6 sm:p-8
      flex flex-col
      items-start
      text-left
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-slate-300
      cursor-pointer
    "
  >

    {/* ICON */}
    <div
      className={`
        w-14 h-14 rounded-xl
        ${iconBg}
        flex items-center justify-center
        mb-6
      `}
    >
      {icon}
    </div>

    {/* TITLE */}
    <h3 className="text-xl sm:text-2xl font-semibold text-[#203482] mb-3 leading-tight">
      {title}
    </h3>

    {/* DESCRIPTION */}
    <p className="text-slate-600 text-sm sm:text-[15px] leading-7 mb-8 flex-1">
      {desc}
    </p>

    {/* BUTTON */}
    <button
      className={`
        w-full
        ${btnColor}
        text-white
        font-medium
        px-6 py-3.5
        rounded-xl
        flex items-center justify-center gap-2
        transition-all
        hover:opacity-95
      `}
    >
      Get Started

      <HiArrowRight className="text-lg" />
    </button>

  </div>
);

export default Register;