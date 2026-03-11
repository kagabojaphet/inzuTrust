import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

// Validation schema
const schema = yup.object({
  fullName: yup.string().required('Full name is required').min(3, 'At least 3 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().required('Password is required').min(8, 'At least 8 characters'),
  terms: yup.boolean().oneOf([true], 'You must agree to the terms'),
}).required();

const TenantRegister = ({ onSwitchToLandlord }) => {
  const navigate = useNavigate(); // Hook for redirection
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  // Password strength logic
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) setPasswordStrength({ score: 1, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' });
    else if (score <= 3) setPasswordStrength({ score: 3, label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' });
    else setPasswordStrength({ score: 5, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' });
  }, [password]);

  const onSubmit = async (data) => {
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      // Split fullName into first and last
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'tenant', 
      };

      const response = await axios.post('http://localhost:5000/api/users/register', payload);

      setAlert({
        show: true,
        type: 'success',
        message: 'Registration successful! Redirecting to verification...',
      });
      
      console.log('Backend Response:', response.data);

      // Redirect to OTP page after 2 seconds, passing email in state
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: data.email } });
      }, 2000);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      setAlert({
        show: true,
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* LEFT SIDE: Visuals */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2070"
          alt="Modern apartment"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-black/65"></div>

        <div className="absolute top-8 left-10 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-800/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-3xl font-black text-white tracking-tight">
              Inzu<span className="text-blue-400">Trust</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-end h-full pb-20 pl-10 pr-10 text-left max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-8">
            Building Trust in Rwandan Rentals
          </h1>

          <div className="bg-black/70 backdrop-blur-lg p-6 rounded-2xl border border-gray-700/30 shadow-xl max-w-md">
            <div className="flex text-yellow-400 mb-4 text-2xl">★★★★★</div>
            <p className="text-white text-base lg:text-lg font-medium leading-relaxed mb-5">
              "InzuTrust made renting my first apartment in Kigali safe and paperless."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-lg">AM</div>
              <div>
                <p className="text-white font-bold text-base">Alice M.</p>
                <p className="text-gray-300 text-xs">Verified Tenant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="self-end mb-10">
          <p className="text-sm font-semibold text-gray-600">
            Are you a landlord?{' '}
            <button onClick={onSwitchToLandlord} className="text-blue-600 font-extrabold hover:underline">
              Register here
            </button>
          </p>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <h2 className="text-4xl font-black text-gray-900 mb-4 text-left">Get started as a Tenant</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed text-left">
            Create an account to browse verified listings and sign digital leases safely.
          </p>

          {/* Alert Component */}
          {alert.show && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
              alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {alert.type === 'success' ? <HiCheckCircle className="text-2xl shrink-0" /> : <HiExclamationCircle className="text-2xl shrink-0" />}
              <p className="text-sm font-bold">{alert.message}</p>
            </div>
          )}

          <button className="w-full py-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition mb-8">
            <FcGoogle className="text-2xl" /> Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or register with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
                <input
                  {...register('fullName')}
                  placeholder="Iradukunda Japhet"
                  className={`w-full pl-14 pr-5 py-4 bg-gray-50 border rounded-xl outline-none transition-all ${
                    errors.fullName ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
                <input
                  {...register('email')}
                  placeholder="japhet@gmail.com"
                  className={`w-full pl-14 pr-5 py-4 bg-gray-50 border rounded-xl outline-none transition-all ${
                    errors.email ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Phone Number</label>
              <PhoneInput
                defaultCountry="rw"
                value={watch('phone')}
                onChange={(val) => setValue('phone', val, { shouldValidate: true })}
                className="react-international-phone-input-container"
                inputClass="!w-full !pl-14 !py-4 !bg-gray-50 !border-gray-200 !rounded-xl"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-14 pr-14 py-4 bg-gray-50 border rounded-xl outline-none transition-all ${
                    errors.password ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-200 focus:border-blue-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.password.message}</p>}

              {/* Password Strength Meter */}
              <div className="mt-3">
                <div className="flex gap-1 w-full">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
                </div>
                <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-wide text-left ${passwordStrength.textColor}`}>
                  {passwordStrength.label} password
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                {...register('terms')}
                type="checkbox"
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-600 text-left leading-relaxed">
                I agree to the <span className="text-blue-600 font-bold underline cursor-pointer">Terms</span> and <span className="text-blue-600 font-bold underline cursor-pointer">Privacy Policy</span>.
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-xl font-black uppercase tracking-wider text-sm shadow-lg transition mt-6 text-white ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-gray-600">
            Already have an account?{' '}
            <span className="text-blue-600 font-bold cursor-pointer hover:underline">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantRegister;