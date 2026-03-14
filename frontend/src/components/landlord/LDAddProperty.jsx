import React, { useState } from "react";
import { 
  HiCheck, HiCloudUpload, HiArrowRight, HiArrowLeft, 
  HiLightningBolt, HiWifi, HiHome
} from "react-icons/hi";
import { MdWaterDrop, MdCleaningServices, MdLocalParking } from "react-icons/md";
import { API_BASE } from "../../config";

const STEPS = ["Basic Info", "Location", "Media", "Review"];

export default function LDAddProperty({ token }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Apartment",
    rent: "",
    description: "",
    utilities: { water: true, electricity: true, internet: false, cleaning: false, parking: true },
    district: "Gasabo",
    sector: "Kacyiru",
    address: "",
    photos: []
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleUtilityChange = (key) => {
    setForm({ ...form, utilities: { ...form.utilities, [key]: !form.utilities[key] } });
  };

  const utilityIcons = {
    water: <MdWaterDrop className="text-lg" />,
    electricity: <HiLightningBolt className="text-lg" />,
    internet: <HiWifi className="text-lg" />,
    cleaning: <MdCleaningServices className="text-lg" />,
    parking: <MdLocalParking className="text-lg" />
  };

  return (
    <div className="max-w-5xl ml-0 pb-20 pt-4 text-left">
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-black text-black">Add New Property</h1>
        <p className="text-sm text-slate-500 font-medium">List your property on the InzuTrust network to find verified tenants.</p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
        <div className="relative flex justify-between items-start max-w-3xl">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 z-0" />
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isActive = currentStep >= stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <div key={step} className="relative z-10 flex flex-col items-start group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isActive ? "bg-blue-600 text-white ring-4 ring-blue-50" : "bg-white border-2 border-gray-100 text-gray-300"
                }`}>
                  {isCompleted ? <HiCheck className="text-lg" /> : stepNum}
                </div>
                <span className={`mt-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-300"
                }`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 min-h-[400px]">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><HiHome size={20}/></div>
                  <h3 className="text-lg font-black text-black">Property Details</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-2">Property Name</label>
                    <input type="text" placeholder="e.g. Sunny Heights Apartments" 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                      value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-2">Property Type</label>
                      <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none appearance-none focus:border-blue-400 transition-all cursor-pointer"
                        value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                        <option>Apartment</option>
                        <option>House</option>
                        <option>Villa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-2">Monthly Rent (RWF)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold border-r border-gray-100 pr-3">RWF</span>
                        <input type="number" placeholder="300,000" 
                          className="w-full bg-white border border-gray-200 rounded-xl pl-16 pr-4 py-3.5 text-sm outline-none focus:border-blue-400 transition-all"
                          value={form.rent} onChange={(e) => setForm({...form, rent: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-2">Description</label>
                    <textarea rows="5" placeholder="Describe key features, neighborhood, and amenities..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none resize-none focus:border-blue-400 transition-all placeholder:text-gray-300"
                      value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h3 className="text-lg font-black text-black mb-8">Location</h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-2">District</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-400">
                      <option>Gasabo</option>
                      <option>Nyarugenge</option>
                      <option>Kicukiro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-2">Sector</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-400">
                      <option>Kacyiru</option>
                      <option>Remera</option>
                      <option>Kimironko</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-2">Street Address</label>
                  <input type="text" placeholder="e.g. KG 543 St, Plot 45" 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-400 transition-all" />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black text-black">Property Photos</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Max 10MB each</span>
                </div>
                <div className="border-2 border-dashed border-blue-100 rounded-3xl p-16 flex flex-col items-start justify-center bg-blue-50/20 mb-8 group cursor-pointer hover:bg-blue-50/40 transition-all">
                  <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <HiCloudUpload size={28} />
                  </div>
                  <p className="text-sm font-black text-black">Click to upload or drag and drop</p>
                  <p className="text-[11px] text-gray-400 mt-1 font-medium">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative">
                     <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400" className="w-full h-full object-cover" alt="prev"/>
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-tighter">Cover</div>
                  </div>
                  <div className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 hover:text-blue-400 hover:border-blue-200 transition-colors">
                    <HiCloudUpload size={24}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-start gap-4 pt-4">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 1}
              className="px-8 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-black text-black hover:bg-gray-50 disabled:opacity-20 transition-all flex items-center gap-2"
            >
              <HiArrowLeft /> Back
            </button>
            {currentStep < 4 ? (
              <button 
                onClick={nextStep}
                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2 transform active:scale-95 shadow-lg shadow-blue-100"
              >
                Next Step <HiArrowRight />
              </button>
            ) : (
              <button 
                onClick={handleFinish} 
                disabled={loading}
                className="px-10 py-3.5 bg-green-600 text-white rounded-2xl text-sm font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                {loading ? "Publishing..." : "Publish Property"}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-7">
            <h4 className="text-[11px] font-black text-black uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Included Utilities</h4>
            <div className="space-y-3">
              {Object.keys(form.utilities).map((util) => (
                <label key={util} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                    form.utilities[util] ? "bg-blue-50/40 border-blue-200" : "bg-white border-gray-100 hover:border-gray-200"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                       form.utilities[util] ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                    }`}>
                      {utilityIcons[util]}
                    </div>
                    <span className={`text-xs font-black capitalize ${form.utilities[util] ? "text-blue-900" : "text-gray-500"}`}>
                      {util}
                    </span>
                  </div>
                  <input type="checkbox" checked={form.utilities[util]} onChange={() => handleUtilityChange(util)}
                    className="w-5 h-5 rounded-md text-blue-600 border-gray-200 focus:ring-0 cursor-pointer" />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-7 text-white relative overflow-hidden shadow-xl shadow-blue-100">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </div>
                <h5 className="font-black text-sm uppercase tracking-tighter">Pro Tip</h5>
              </div>
              <p className="text-[12px] leading-relaxed font-medium text-blue-50">
                Properties with more than 5 high-quality photos get <span className="text-white font-black underline decoration-blue-300">40% more inquiries</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}