import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

// 1. Import the useAuth hook instead of manual axios or setAuthData helpers
import { useAuth } from '../context/AuthContext'; 

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required'),
}).required();

const Login = () => {
  const navigate = useNavigate();
  // 2. Initialize the login function from context
  const { login } = useAuth(); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

 // ... inside the Login component, update the onSubmit function:

  const onSubmit = async (formData) => {
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const userData = await login(formData.email, formData.password);

      setAlert({
        show: true,
        type: 'success',
        message: `Welcome back, ${userData.firstName}! Redirecting...`,
      });

      // Role-Based Redirection Logic
      const role = userData.role?.toLowerCase();

      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'landlord') {
        navigate('/landlord/dashboard', { replace: true });
      } else if (role === 'tenant') {
        navigate('/tenant/dashboard', { replace: true });
      } 
      
       else if (role === 'agent') {
  navigate('/agent/dashboard', { replace: true });
}
      else {
        // Fallback for general users
        navigate('/', { replace: true });
      }

    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Invalid credentials. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="relative z-10 text-white max-w-md">
          <h1 className="text-5xl font-black mb-6 leading-tight">One platform for all your rental needs.</h1>
          <p className="text-blue-100 text-lg mb-8">Whether you're looking for a home or managing properties, InzuTrust has you covered.</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="bg-white/20 p-2 rounded-lg"><HiCheckCircle className="text-xl"/></div>
              <p className="font-bold text-sm text-blue-50">Verified Listings for Tenants</p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="bg-white/20 p-2 rounded-lg"><HiCheckCircle className="text-xl"/></div>
              <p className="font-bold text-sm text-blue-50">Powerful Tools for Landlords</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-20">
        <div className="w-full max-w-md mx-auto">
          {/* <div className="flex items-center gap-3 mb-12">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">Inzu<span className="text-blue-600">Trust</span></span>
          </div> */}

          <h2 className="text-4xl font-black text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-500 mb-10 font-medium">Access your account securely.</p>

          {alert.show && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'
            }`}>
              {alert.type === 'success' ? <HiCheckCircle className="text-2xl shrink-0" /> : <HiExclamationCircle className="text-2xl shrink-0" />}
              <p className="text-xs font-bold">{alert.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xl" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xl" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
                >
                  {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]'
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In to InzuTrust'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Don't have an account yet? <br/>
              <Link to="/register" className="text-blue-600 font-black hover:underline inline-block mt-2">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;