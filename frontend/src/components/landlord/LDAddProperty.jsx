import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  HiCheck, HiCloudUpload, HiArrowRight, HiArrowLeft,
  HiLightningBolt, HiWifi, HiHome, HiX
} from "react-icons/hi";
import {
  MdWaterDrop, MdCleaningServices, MdLocalParking,
} from "react-icons/md";
import { FaShieldAlt } from "react-icons/fa";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

const STEPS = ["Basic Info", "Location", "Media", "Review"];

// ── Skeleton for a single form field ─────────────────────────────────────────
const FieldSkeleton = ({ labelWidth = 80, inputHeight = 46 }) => (
  <div>
    <Skeleton width={labelWidth} height={11} borderRadius={4} className="mb-2" />
    <Skeleton height={inputHeight} borderRadius={12} />
  </div>
);

// ── Skeleton for a utility toggle row ────────────────────────────────────────
const UtilitySkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white">
    <div className="flex items-center gap-3">
      <Skeleton width={32} height={32} borderRadius={8} />
      <Skeleton width={60} height={12} borderRadius={4} />
    </div>
    <Skeleton width={20} height={20} borderRadius={4} />
  </div>
);

export default function LDAddProperty() {
  const { token } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "house",
    rent: "",
    rentPeriod: "monthly",
    description: "",

    bedrooms: "0",
    bathrooms: "0",
    squareMeters: "",

    status: "available",

    district: "Gasabo",
    sector: "Kacyiru",
    address: "",

    latitude: "",
    longitude: "",

    upiNumber: "",
    trustScoreCheck: false,

    hasLandTitle: false,
    hasTaxProof: false,
    hasOwnerIdDoc: false,

    utilities: {
      water: true,
      electricity: true,
      internet: false,
      cleaning: false,
      parking: true,
    },

    photos: [],
  });

  // ── Transition between steps ───────────────────────────────────────────────
  const goToStep = (next) => {
    setStepLoading(true);

    setTimeout(() => {
      setCurrentStep(next);
      setStepLoading(false);
    }, 350);
  };

  const nextStep = () => goToStep(Math.min(currentStep + 1, 4));
  const prevStep = () => goToStep(Math.max(currentStep - 1, 1));

  const handleUtilityChange = (key) =>
    setForm({
      ...form,
      utilities: {
        ...form.utilities,
        [key]: !form.utilities[key],
      },
    });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));
  };

  const removePhoto = (index) =>
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));

  const handleFinish = async () => {
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("title", form.name);
      fd.append("type", form.type.toLowerCase());

      fd.append("rentAmount", parseFloat(form.rent));
      fd.append("rentPeriod", form.rentPeriod);

      fd.append("description", form.description);

      fd.append("bedrooms", parseInt(form.bedrooms));
      fd.append("bathrooms", parseInt(form.bathrooms));

      if (form.squareMeters) {
        fd.append("squareMeters", parseInt(form.squareMeters));
      }

      fd.append("status", form.status);

      fd.append("district", form.district);
      fd.append("sector", form.sector);
      fd.append("address", form.address);

      if (form.latitude) {
        fd.append("latitude", form.latitude);
      }

      if (form.longitude) {
        fd.append("longitude", form.longitude);
      }

      fd.append("upiNumber", form.upiNumber);

      fd.append("hasLandTitle", form.hasLandTitle);
      fd.append("hasTaxProof", form.hasTaxProof);
      fd.append("hasOwnerIdDoc", form.hasOwnerIdDoc);

      fd.append("utilities", JSON.stringify(form.utilities));

      form.photos.forEach((file) => fd.append("images", file));

      const res = await axios.post(`${API_BASE}/properties`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200 || res.status === 201) {
        alert("Property published successfully!");
        window.location.reload();
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Validation failed. Ensure all fields are filled correctly.";

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
    parking: <MdLocalParking className="text-lg" />,
  };

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="max-w-5xl ml-0 pb-20 pt-4 text-left">

        {/* Heading */}
        <div className="mb-8 text-left">
          <h1 className="text-2xl font-black text-black">
            Add New Property
          </h1>

          <p className="text-sm text-slate-500 font-medium">
            Post your listing to InzuTrust.
          </p>
        </div>

        {/* ── Stepper ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <div className="relative flex justify-between items-start max-w-3xl">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 z-0" />

            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = currentStep >= stepNum;
              const isComplete = currentStep > stepNum;

              return (
                <div
                  key={step}
                  className="relative z-10 flex flex-col items-start"
                >
                  {stepLoading && isActive && !isComplete ? (
                    <Skeleton circle width={40} height={40} />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-50"
                          : "bg-white border-2 border-gray-100 text-gray-300"
                      }`}
                    >
                      {isComplete ? (
                        <HiCheck className="text-lg" />
                      ) : (
                        stepNum
                      )}
                    </div>
                  )}

                  <span
                    className={`mt-3 text-[10px] font-black uppercase tracking-widest ${
                      isActive ? "text-blue-600" : "text-gray-300"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Form panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 min-h-[400px]">

              {/* ── Step skeletons ── */}
              {stepLoading && (
                <div className="space-y-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-8">
                    <Skeleton width={44} height={44} borderRadius={12} />
                    <Skeleton width={180} height={20} borderRadius={6} />
                  </div>

                  <FieldSkeleton labelWidth={110} />

                  <div className="grid grid-cols-2 gap-6">
                    <FieldSkeleton labelWidth={60} />
                    <FieldSkeleton labelWidth={90} />
                  </div>

                  <FieldSkeleton labelWidth={90} inputHeight={100} />
                </div>
              )}

              {/* ── Step 1 ── */}
              {!stepLoading && currentStep === 1 && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-500">

                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <HiHome size={20} />
                    </div>

                    <h3 className="text-lg font-black text-black">
                      Property Details
                    </h3>
                  </div>

                  <div className="space-y-6">

                    {/* Property Name */}
                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">
                        Property Name
                      </label>

                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="e.g. Modern Kacyiru Apartment"
                      />
                    </div>

                    {/* Type + Rent */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>
                        <label className="block text-[11px] font-black text-black uppercase mb-2">
                          Type
                        </label>

                        <select
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                          value={form.type}
                          onChange={(e) =>
                            setForm({ ...form, type: e.target.value })
                          }
                        >
                          {[
                            "house",
                            "apartment",
                            "room",
                            "land",
                            "commercial",
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-black uppercase mb-2">
                          Rent (RWF)
                        </label>

                        <input
                          type="number"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                          value={form.rent}
                          onChange={(e) =>
                            setForm({ ...form, rent: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Rent Period + Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>
                        <label className="block text-[11px] font-black text-black uppercase mb-2">
                          Rent Period
                        </label>

                        <select
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                          value={form.rentPeriod}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              rentPeriod: e.target.value,
                            })
                          }
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-black uppercase mb-2">
                          Status
                        </label>

                        <select
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                          value={form.status}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                        </select>
                      </div>
                    </div>

                    {/* Bedrooms + Bathrooms + Size */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      <div>
                        <label className="block text-[11px] font-black text-black uppercase mb-2">
                          Bedrooms
                        </label>

                        <input
                          type="number"
                          min="0"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                          value={form.bedrooms}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              bedrooms: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-black uppercase mb-2">
                          Bathrooms
                        </label>

                        <input
                          type="number"
                          min="0"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                          value={form.bathrooms}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              bathrooms: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-black uppercase mb-2">
                          Size (m²)
                        </label>

                        <input
                          type="number"
                          min="0"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                          value={form.squareMeters}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              squareMeters: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">
                        Description
                      </label>

                      <textarea
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none min-h-[100px] focus:ring-2 focus:ring-blue-200 transition resize-none"
                        value={form.description}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2 ── */}
              {!stepLoading && currentStep === 2 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">

                  <h3 className="text-lg font-black text-black mb-8">
                    Location
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">
                        District
                      </label>

                      <select
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                        value={form.district}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            district: e.target.value,
                          })
                        }
                      >
                        {[
                          "Gasabo",
                          "Nyarugenge",
                          "Kicukiro",
                          "Bugesera",
                          "Gatsibo",
                          "Kayonza",
                          "Kirehe",
                          "Ngoma",
                          "Rwamagana",
                        ].map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">
                        Sector
                      </label>

                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                        value={form.sector}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sector: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[11px] font-black text-black uppercase mb-2">
                      Street Address
                    </label>

                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                      value={form.address}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">
                        Latitude
                      </label>

                      <input
                        type="text"
                        placeholder="-1.9441"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                        value={form.latitude}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            latitude: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-black uppercase mb-2">
                        Longitude
                      </label>

                      <input
                        type="text"
                        placeholder="30.0619"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                        value={form.longitude}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            longitude: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* UPI */}
                  <div className="mb-6">
                    <label className="block text-[11px] font-black text-black uppercase mb-2">
                      UPI Number
                    </label>

                    <input
                      type="text"
                      placeholder="Optional"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                      value={form.upiNumber}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          upiNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-black text-black mb-4">
                      Verification Documents
                    </h4>

                    <div className="space-y-3">

                      {[
                        {
                          key: "hasLandTitle",
                          label: "Land Title Available",
                        },
                        {
                          key: "hasTaxProof",
                          label: "Tax Proof Available",
                        },
                        {
                          key: "hasOwnerIdDoc",
                          label: "Owner ID Document Available",
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white"
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            {item.label}
                          </span>

                          <input
                            type="checkbox"
                            checked={form[item.key]}
                            onChange={() =>
                              setForm({
                                ...form,
                                [item.key]: !form[item.key],
                              })
                            }
                            className="w-5 h-5 accent-blue-600"
                          />
                        </label>
                      ))}

                      {/* TrustScore Check */}
                      <label className="flex items-center justify-between p-4 rounded-2xl border border-blue-100 bg-blue-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                            <FaShieldAlt />
                          </div>

                          <div>
                            <p className="text-sm font-black text-black">
                              TrustScore Check
                            </p>

                            <p className="text-xs text-gray-500">
                              Optional verification review
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={form.trustScoreCheck}
                          onChange={() =>
                            setForm({
                              ...form,
                              trustScoreCheck: !form.trustScoreCheck,
                            })
                          }
                          className="w-5 h-5 accent-blue-600"
                        />
                      </label>

                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3 ── */}
              {!stepLoading && currentStep === 3 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">

                  <h3 className="text-lg font-black text-black mb-8">
                    Property Photos
                  </h3>

                  <label className="border-2 border-dashed border-blue-100 rounded-3xl p-16 flex flex-col items-center justify-center bg-blue-50/20 mb-8 cursor-pointer hover:bg-blue-50/40 transition-all">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />

                    <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 mb-4">
                      <HiCloudUpload size={28} />
                    </div>

                    <p className="text-sm font-black text-black">
                      Click to upload property images
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WEBP — up to 6 photos
                    </p>
                  </label>

                  {form.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">

                      {form.photos.map((file, index) => (
                        <div
                          key={index}
                          className="aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative group"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            alt="preview"
                          />

                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <HiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 4 ── */}
              {!stepLoading && currentStep === 4 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">

                  <h3 className="text-lg font-black text-black mb-4">
                    Review Your Listing
                  </h3>

                  <div className="bg-gray-50 rounded-2xl p-6 space-y-3">

                    {[
                      {
                        label: "Title",
                        value: form.name || "—",
                      },
                      {
                        label: "Rent",
                        value: form.rent
                          ? `${Number(form.rent).toLocaleString()} RWF`
                          : "—",
                      },
                      {
                        label: "Period",
                        value: form.rentPeriod,
                      },
                      {
                        label: "Type",
                        value: form.type,
                        capitalize: true,
                      },
                      {
                        label: "Status",
                        value: form.status,
                      },
                      {
                        label: "Bedrooms",
                        value: form.bedrooms,
                      },
                      {
                        label: "Bathrooms",
                        value: form.bathrooms,
                      },
                      {
                        label: "Size",
                        value: form.squareMeters
                          ? `${form.squareMeters} m²`
                          : "—",
                      },
                      {
                        label: "Location",
                        value: `${form.district}, ${form.sector}`,
                      },
                      {
                        label: "Address",
                        value: form.address || "—",
                      },
                      {
                        label: "UPI",
                        value: form.upiNumber || "—",
                      },
                      {
                        label: "Photos",
                        value: `${form.photos.length} uploaded`,
                      },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400 uppercase w-24 shrink-0">
                          {row.label}
                        </span>

                        <span
                          className={`text-sm font-semibold text-gray-800 ${
                            row.capitalize ? "capitalize" : ""
                          }`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Photo preview */}
                  {form.photos.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">

                      {form.photos.map((file, i) => (
                        <img
                          key={i}
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="h-16 w-24 rounded-xl object-cover shrink-0 border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-start gap-4 pt-2">

              <button
                onClick={prevStep}
                disabled={currentStep === 1 || stepLoading}
                className="px-8 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-black disabled:opacity-20 flex items-center gap-2 hover:bg-gray-50 transition"
              >
                <HiArrowLeft />
                Back
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={stepLoading}
                  className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition disabled:opacity-60"
                >
                  {stepLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Next
                      <HiArrowRight />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="px-10 py-3.5 bg-green-600 text-white rounded-2xl text-sm font-black hover:bg-green-700 shadow-lg shadow-green-100 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Confirm & Publish"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Utilities panel ── */}
          <div className="space-y-6">

            <div className="bg-white rounded-3xl border border-gray-200 p-7">

              <h4 className="text-[11px] font-black text-black uppercase mb-6">
                Utilities
              </h4>

              <div className="space-y-3">

                {stepLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <UtilitySkeleton key={i} />
                    ))
                  : Object.keys(form.utilities).map((util) => (
                      <label
                        key={util}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          form.utilities[util]
                            ? "bg-blue-50/40 border-blue-200"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">

                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              form.utilities[util]
                                ? "bg-blue-600 text-white"
                                : "bg-gray-50 text-gray-400"
                            }`}
                          >
                            {utilityIcons[util]}
                          </div>

                          <span
                            className={`text-xs font-black capitalize ${
                              form.utilities[util]
                                ? "text-blue-900"
                                : "text-gray-500"
                            }`}
                          >
                            {util}
                          </span>
                        </div>

                        <input
                          type="checkbox"
                          checked={form.utilities[util]}
                          onChange={() => handleUtilityChange(util)}
                          className="w-5 h-5 rounded-md accent-blue-600"
                        />
                      </label>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}