import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiShieldCheck } from "react-icons/hi";
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
  const location    = useLocation();
  const navigate    = useNavigate();
  const { setAuth } = useAuth();

  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const email         = location.state?.email         || '';
  const redirectTo    = location.state?.redirectTo    || null;
  const propertyId    = location.state?.propertyId    || null;
  const propertyTitle = location.state?.propertyTitle || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Verify OTP — response contains token + user
      const response = await axios.post(
        'http://localhost:5000/api/users/verify-otp',
        { email, otp }
      );

      if (response.data.success) {
        const token = response.data.data?.token;
        const user  = response.data.data?.user;

        // 2. Save token and update AuthContext so ProtectedRoute lets us through
        if (token) {
          localStorage.setItem('inzu_token', token);
          localStorage.setItem('user', JSON.stringify(user || {}));
          if (setAuth) setAuth(token, user);
        }

        // 3. Redirect based on what triggered registration:
        //    - apply-lease flow → back to property detail page, modal auto-opens
        //    - normal signup    → tenant dashboard
        if (propertyId) {
          navigate(`/properties/${propertyId}?apply=true`);
        } else {
          navigate(redirectTo || '/tenant/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <HiShieldCheck className="text-6xl text-blue-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-2">Verify Email</h2>
        <p className="text-gray-500 mb-8">Enter code sent to <b>{email}</b></p>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full text-center text-3xl font-bold tracking-widest py-4 border rounded-2xl outline-none focus:border-blue-600"
            placeholder="000000"
          />
          {error && <p className="text-red-500 font-bold text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;