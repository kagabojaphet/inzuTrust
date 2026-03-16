// src/components/landlord/LDAddProperty.jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { 
  HiCheck, HiCloudUpload, HiArrowRight, HiArrowLeft, 
  HiLightningBolt, HiWifi, HiHome, HiX
} from "react-icons/hi";
import { 
  MdWaterDrop, MdCleaningServices, MdLocalParking, 
  MdOutlineBed, MdOutlineBathtub 
} from "react-icons/md";
import { API_BASE } from "../../config";

const STEPS = ["Basic Info", "Location", "Media", "Review"];

export default function LDAddProperty() {
  const { token } = useAuth(); 
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Apartment",
    rent: "",
    description: "",
    bedrooms: "1",
    bathrooms: "1",
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleFinish = async () => {
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // 1. Map frontend state to Backend expected keys
      formData.append("title", form.name);
      formData.append("type", form.type.toLowerCase());
      formData.append("rentAmount", Number(form.rent)); // Ensure Number type
      formData.append("description", form.description);
      formData.append("bedrooms", Number(form.bedrooms)); // Ensure Number type
      formData.append("bathrooms", Number(form.bathrooms)); // Ensure Number type
      formData.append("district", form.district);
      formData.append("sector", form.sector);
      formData.append("address", form.address);
      
      // 2. Stringify complex objects for Multer/Body-parser
      formData.append("utilities", JSON.stringify(form.utilities));

      // 3. IMPORTANT: The key "images" must match the backend upload.array('images')
      form.photos.forEach((file) => {
        formData.append("images", file); 
      });

      const response = await axios.post(`${API_BASE}/properties`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          // Note: Do NOT set Content-Type; Axios does it automatically for FormData
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert("Property published successfully!");
        // Reset or navigate away
      }
    } catch (error) {
      console.error("Submission Error Details:", error.response?.data);
      const msg = error.response?.data?.message || "Check console for validation errors.";
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-black text-black">Add New Property</h1>
        <p className="text-sm text-slate-500 font-medium">Post your listing to InzuTrust.</p>
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
              <div key={step} className="relative z-10 flex flex-col items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isActive ? "bg-blue-600 text-white ring-4 ring-blue-50" : "bg-white border-2 border-gray-100 text-gray-300"
                }`}>
                  {isCompleted ? <HiCheck className="text-lg" /> : stepNum}
                </div>
                <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isActive ? "text-blue-600" : "text-gray-300"}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                    <label className="block text-[11px] font-black text-black uppercase mb-2">Property Name</label>
                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none"
                      value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">Type</label>
                      <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none"
                        value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                        <option>Apartment</option>
                        <option>House</option>
                        <option>Villa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">Rent (RWF)</label>
                      <input type="number" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none"
                        value={form.rent} onChange={(e) => setForm({...form, rent: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-black uppercase mb-2">Description</label>
                    <textarea className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none min-h-[100px]"
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
                    <label className="block text-[11px] font-black text-black uppercase mb-2">District</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none"
                      value={form.district} onChange={(e) => setForm({...form, district: e.target.value})}>
                      <option>Gasabo</option>
                      <option>Nyarugenge</option>
                      <option>Kicukiro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-black uppercase mb-2">Sector</label>
                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none"
                      value={form.sector} onChange={(e) => setForm({...form, sector: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-black uppercase mb-2">Street Address</label>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none"
                    value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h3 className="text-lg font-black text-black mb-8">Property Photos</h3>
                <label className="border-2 border-dashed border-blue-100 rounded-3xl p-16 flex flex-col items-center justify-center bg-blue-50/20 mb-8 cursor-pointer hover:bg-blue-50/40 transition-all">
                  <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                  <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 mb-4">
                    <HiCloudUpload size={28} />
                  </div>
                  <p className="text-sm font-black text-black">Upload property images</p>
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {form.photos.map((file, index) => (
                    <div key={index} className="aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative group">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                      <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <HiX size={12}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
               <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h3 className="text-lg font-black text-black mb-4">Review Your Listing</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
                    <p className="text-sm font-bold text-gray-700">Title: <span className="font-medium">{form.name}</span></p>
                    <p className="text-sm font-bold text-gray-700">Rent: <span className="font-medium">{form.rent} RWF</span></p>
                    <p className="text-sm font-bold text-gray-700">Type: <span className="font-medium capitalize">{form.type}</span></p>
                    <p className="text-sm font-bold text-gray-700">Location: <span className="font-medium">{form.district}, {form.sector}</span></p>
                    <p className="text-sm font-bold text-gray-700">Photos: <span className="font-medium">{form.photos.length} uploaded</span></p>
                  </div>
               </div>
            )}
          </div>

          <div className="flex items-center justify-start gap-4 pt-4">
            <button onClick={prevStep} disabled={currentStep === 1} className="px-8 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-black disabled:opacity-20 flex items-center gap-2">
              <HiArrowLeft /> Back
            </button>
            {currentStep < 4 ? (
              <button onClick={nextStep} className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100">
                Next <HiArrowRight />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading} className="px-10 py-3.5 bg-green-600 text-white rounded-2xl text-sm font-black hover:bg-green-700 shadow-lg shadow-green-100">
                {loading ? "Publishing..." : "Confirm & Publish"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-7">
            <h4 className="text-[11px] font-black text-black uppercase mb-6">Utilities</h4>
            <div className="space-y-3">
              {Object.keys(form.utilities).map((util) => (
                <label key={util} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${form.utilities[util] ? "bg-blue-50/40 border-blue-200" : "bg-white border-gray-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.utilities[util] ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400"}`}>
                      {utilityIcons[util]}
                    </div>
                    <span className={`text-xs font-black capitalize ${form.utilities[util] ? "text-blue-900" : "text-gray-500"}`}>{util}</span>
                  </div>
                  <input type="checkbox" checked={form.utilities[util]} onChange={() => handleUtilityChange(util)} className="w-5 h-5 rounded-md text-blue-600" />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}