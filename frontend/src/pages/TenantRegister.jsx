import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

const schema = yup.object({
  fullName: yup.string().required('Full name is required').min(3, 'At least 3 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().required('Password is required').min(8, 'At least 8 characters'),
  terms: yup.boolean().oneOf([true], 'You must agree to the terms'),
}).required();

const TenantRegister = ({ onSwitchToLandlord }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Read URL params set by Properties.jsx "Apply Lease" button ──────────────
  const propertyId    = searchParams.get('propertyId') || '';
  const propertyTitle = searchParams.get('propertyTitle') || '';
  const isApplyFlow   = searchParams.get('action') === 'apply' && !!propertyId;

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setAlert({ show: false, type: '', message: '' });
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const payload = {
          firstName: userInfo.data.given_name || "User",
          lastName: userInfo.data.family_name || "Tenant",
          email: userInfo.data.email,
          role: 'tenant',
          authType: 'google',
        };

        const response = await axios.post('https://inzutrust-api.onrender.com/api/users/google-auth', payload);

        if (response.data.success) {
          localStorage.setItem('inzu_token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if (setAuth) setAuth(response.data.token, response.data.user);

          // If coming from "Apply Lease", submit application then go to applications tab
          if (isApplyFlow) {
            await submitLeaseApplication(response.data.token);
            navigate('/tenant/dashboard?tab=applications');
          } else {
            setAlert({ show: true, type: 'success', message: 'Welcome! Redirecting...' });
            setTimeout(() => navigate('/tenant/dashboard'), 1500);
          }
        } else {
          setAlert({ show: true, type: 'success', message: 'Account linked! Please verify your email.' });
          setTimeout(() => navigate('/verify-otp', { state: { email: userInfo.data.email } }), 1500);
        }
      } catch (error) {
        setAlert({
          show: true,
          type: 'error',
          message: error.response?.data?.message || 'Google authentication failed.',
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => setAlert({ show: true, type: 'error', message: 'Google Login failed.' })
  });

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

  // ── Helper: submit lease application after account is ready ─────────────────
  const submitLeaseApplication = async (token) => {
    if (!propertyId || !token) return;
    try {
      await axios.post(
        'http://localhost:5000/api/lease-applications',
        {
          propertyId,
          message: `Hi, I just created my InzuTrust account and I am interested in ${propertyTitle || 'this property'}. I would love to discuss the lease terms.`,
          moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          duration: 12,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // Application failed silently — tenant can apply again from dashboard
      console.warn('Auto-apply failed:', err.response?.data?.message || err.message);
    }
  };

  // ── onSubmit: register → login → (auto-apply if needed) → redirect ──────────
  const onSubmit = async (data) => {
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });
    try {
      const nameParts = data.fullName.trim().split(/\s+/);
      const payload = {
        firstName: nameParts[0],
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'N/A',
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'tenant',
        authType: 'email',
      };

      const response = await axios.post('http://localhost:5000/api/users/register', payload);

      if (response.status === 201 || response.data.success) {

        if (isApplyFlow) {
          // Must verify email first — pass property details through OTP page
          // so the application can be submitted right after verification
          setAlert({ show: true, type: 'success', message: 'Account created! Please verify your email to continue.' });
          setTimeout(() => navigate('/verify-otp', {
            state: {
              email:         data.email,
              propertyId:    propertyId,
              propertyTitle: propertyTitle,
              redirectTo:    '/tenant/dashboard?tab=applications',
            }
          }), 1500);

        } else {
          // Normal registration → OTP → tenant dashboard
          setAlert({ show: true, type: 'success', message: 'Registration successful! Please verify your email.' });
          setTimeout(() => navigate('/verify-otp', { state: { email: data.email } }), 1500);
        }
      }
    } catch (error) {
      console.error("Registration Error Details:", error.response?.data);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="hidden lg:flex lg:w-[45%] relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2070"
          alt="Modern apartment"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-black/65"></div>
        <div className="relative z-10 flex flex-col justify-end h-full pb-20 pl-10 pr-10 text-left max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-8">Building Trust in <br/> Rwandan Rentals</h1>
          <div className="bg-black/70 backdrop-blur-lg p-6 rounded-2xl border border-gray-700/30 shadow-xl max-w-md">
            <div className="flex text-yellow-400 mb-4 text-2xl">★★★★★</div>
            <p className="text-white text-base lg:text-lg font-medium leading-relaxed mb-5">"InzuTrust made renting my first apartment in Kigali safe and paperless."</p>
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

      <div className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="self-end mb-10">
          <p className="text-sm font-semibold text-gray-600">Are you a landlord?{' '}
            <button onClick={onSwitchToLandlord} className="text-blue-600 font-extrabold hover:underline">Register here</button>
          </p>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <h2 className="text-4xl font-black text-gray-900 mb-4 text-left">Get started as a Tenant</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed text-left">Create an account to browse verified listings and sign digital leases safely.</p>

          {alert.show && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
              alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {alert.type === 'success' ? <HiCheckCircle className="text-2xl shrink-0" /> : <HiExclamationCircle className="text-2xl shrink-0" />}
              <p className="text-sm font-bold">{alert.message}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full py-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition mb-8 disabled:opacity-50"
          >
            <FcGoogle className="text-2xl" /> {loading ? "Authenticating..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or register with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
                <input {...register('fullName')} placeholder="e.g. Iradukunda Japhet" className={`w-full pl-14 pr-5 py-4 bg-gray-50 border rounded-xl outline-none transition-all ${errors.fullName ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-200 focus:border-blue-600'}`} />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
                <input {...register('email')} placeholder="email@example.com" className={`w-full pl-14 pr-5 py-4 bg-gray-50 border rounded-xl outline-none transition-all ${errors.email ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-200 focus:border-blue-600'}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Phone Number</label>
              <PhoneInput defaultCountry="rw" value={watch('phone')} onChange={(val) => setValue('phone', val, { shouldValidate: true })} className="react-international-phone-input-container" inputClass="!w-full !pl-14 !py-4 !bg-gray-50 !border-gray-200 !rounded-xl" />
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 text-left">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`w-full pl-14 pr-14 py-4 bg-gray-50 border rounded-xl outline-none transition-all ${errors.password ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-200 focus:border-blue-600'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                  {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.password.message}</p>}
              <div className="mt-3">
                <div className="flex gap-1 w-full">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
                </div>
                <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-wide text-left ${passwordStrength.textColor}`}>{passwordStrength.label} password</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input {...register('terms')} type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label className="text-sm text-gray-600 text-left leading-relaxed">I agree to the <span className="text-blue-600 font-bold underline cursor-pointer">Terms</span> and <span className="text-blue-600 font-bold underline cursor-pointer">Privacy Policy</span>.</label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.terms.message}</p>}

            <button type="submit" disabled={loading} className={`w-full py-5 rounded-xl font-black uppercase tracking-wider text-sm shadow-lg transition mt-6 text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
              {loading ? "Creating Account..." : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-gray-600">Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="text-blue-600 font-bold cursor-pointer hover:underline">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantRegister;