import React, { useState } from 'react';
import { HiUser, HiHome, HiArrowRight, HiArrowLeft, HiShieldCheck, HiCloudUpload, HiCheckCircle } from "react-icons/hi";

const Register = () => {
  const [role, setRole] = useState(null); // 'tenant' or 'landlord'
  const [step, setStep] = useState(1);

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    // Path update logic
    window.history.pushState({}, '', `/${selectedRole}`);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // --- 1. Selection Screen (/register) ---
  if (!role) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 py-20 font-sans">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight italic">Join InzuTrust</h1>
          <p className="text-slate-500 text-lg font-medium">Select your account type to continue</p>
        </div>

        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10">
          <RoleCard 
            title="I am a Tenant" 
            desc="I'm looking for a verified home and want to build my rental trust score."
            icon={<HiUser className="text-4xl text-brand-blue-bright" />}
            onClick={() => handleRoleSelection('tenant')}
          />
          <RoleCard 
            title="I am a Landlord" 
            desc="I want to list my properties and manage tenants with verified digital history."
            icon={<HiHome className="text-4xl text-brand-green-mid" />}
            onClick={() => handleRoleSelection('landlord')}
          />
        </div>
      </div>
    );
  }

  // --- 2. Registration Forms (/tenant or /landlord) ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 relative group">
        
        {/* Step Indicator Top Right */}
        <div className="absolute top-8 right-10 flex items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {step}/3</span>
           <div className="flex gap-1">
             {[1, 2, 3].map(s => (
               <div key={s} className={`h-1.5 w-4 rounded-full ${step >= s ? 'bg-brand-blue-bright' : 'bg-slate-100'}`} />
             ))}
           </div>
        </div>

        <button 
          onClick={() => { setRole(null); setStep(1); window.history.pushState({}, '', '/register'); }}
          className="flex items-center gap-1 text-slate-400 hover:text-brand-blue-bright transition-colors font-bold text-sm mb-8"
        >
          <HiArrowLeft /> Back to selection
        </button>

        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight capitalize italic">
          {role} <span className="text-brand-blue-bright">Account</span>
        </h2>
        <p className="text-slate-500 font-medium mb-10">Please fill in your details to get started.</p>

        <div className="space-y-6">
          {role === 'tenant' ? (
            <TenantSteps step={step} nextStep={nextStep} prevStep={prevStep} />
          ) : (
            <LandlordSteps step={step} nextStep={nextStep} prevStep={prevStep} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Role Selection Card ---
const RoleCard = ({ title, desc, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-10 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-start text-left group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
  >
    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight italic">{title}</h3>
    <p className="text-black text-lg leading-relaxed mb-8">{desc}</p>
    <div className="mt-auto flex items-center gap-2 text-brand-blue-bright font-black uppercase tracking-widest text-sm">
      Get Started <HiArrowRight className="group-hover:translate-x-2 transition-transform" />
    </div>
  </div>
);

// --- Form Steps ---
const TenantSteps = ({ step, nextStep, prevStep }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    {step === 1 && (
      <>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="e.g. Mugisha Alain" />
          <Input label="Email Address" placeholder="alain@example.rw" />
        </div>
        <Input label="National ID Number" placeholder="1 199x x xxxxxxx x xx" />
        <PrimaryButton text="Next Step" onClick={nextStep} />
      </>
    )}
    {step === 2 && (
      <>
        <Input label="Desired Neighborhood" placeholder="e.g. Gacuriro, Remera" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Budget (RWF)" placeholder="150,000" />
          <Input label="Max Budget (RWF)" placeholder="400,000" />
        </div>
        <div className="flex gap-4">
          <SecondaryButton onClick={prevStep} />
          <PrimaryButton text="Verification" onClick={nextStep} />
        </div>
      </>
    )}
    {step === 3 && (
      <div className="text-center">
        <FileUpload label="Upload ID Document (Front/Back)" />
        <div className="flex gap-4 mt-8">
          <SecondaryButton onClick={prevStep} />
          <PrimaryButton text="Complete Registration" onClick={() => {}} />
        </div>
      </div>
    )}
  </div>
);

const LandlordSteps = ({ step, nextStep, prevStep }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    {step === 1 && (
      <>
        <Input label="Full Name / Company" placeholder="Inzu Properties Ltd" />
        <Input label="TIN Number" placeholder="102xxxxxx" />
        <PrimaryButton text="Portfolio Info" onClick={nextStep} />
      </>
    )}
    {step === 2 && (
      <>
        <Input label="Primary Property UPI" placeholder="1/02/03/..." />
        <Input label="Property Category" placeholder="Apartment, Studio, etc." />
        <div className="flex gap-4">
          <SecondaryButton onClick={prevStep} />
          <PrimaryButton text="Legal Uploads" onClick={nextStep} />
        </div>
      </>
    )}
    {step === 3 && (
      <>
        <FileUpload label="Copy of Land Title (Emphytotic Lease)" />
        <div className="flex gap-4 mt-8">
          <SecondaryButton onClick={prevStep} />
          <PrimaryButton text="Finish Registration" onClick={() => {}} />
        </div>
      </>
    )}
  </div>
);

// --- Shared Elements ---
const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className="text-xs font-black uppercase tracking-widest text-slate-900 ml-1">{label}</label>
    <input 
      {...props} 
      className="w-full px-6 py-4 rounded-lg border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-brand-blue-bright focus:shadow-lg focus:shadow-brand-blue-bright/5 transition-all font-bold text-slate-900" 
    />
  </div>
);

const FileUpload = ({ label }) => (
  <div className="w-full p-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center justify-center group hover:border-brand-blue-bright transition-colors cursor-pointer">
    <HiCloudUpload className="text-5xl text-slate-300 group-hover:text-brand-blue-bright transition-colors mb-4" />
    <span className="text-lg font-black text-slate-900 mb-1">{label}</span>
    <span className="text-xs font-bold text-slate-400">PDF, JPG or PNG (MAX 5MB)</span>
  </div>
);

const PrimaryButton = ({ text, onClick }) => (
  <button 
    onClick={onClick} 
    className="w-full bg-slate-900 text-white py-5 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-blue-bright transition-all shadow-xl shadow-slate-900/20 active:scale-95"
  >
    {text} <HiArrowRight className="text-xl" />
  </button>
);

const SecondaryButton = ({ onClick }) => (
  <button 
    onClick={onClick} 
    className="px-8 bg-white border border-slate-200 text-slate-900 rounded-lg font-black flex items-center justify-center hover:bg-slate-50 transition-all"
  >
    <HiArrowLeft className="text-xl" />
  </button>
);

export default Register;