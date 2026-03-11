import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiShieldCheck, HiArrowLeft } from "react-icons/hi";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const email = location.state?.email || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/verify-otp', {
        email,
        otp
      });

      if (response.data.success) {
        // Store token for future requests
        localStorage.setItem('token', response.data.data.token);
        alert('Account verified successfully!');
        navigate('/dashboard'); // Or wherever your landing page is
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 text-blue-600">
          <HiShieldCheck className="text-4xl" />
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-2">Verify your email</h2>
        <p className="text-gray-500 mb-8">
          We've sent a 6-digit code to <span className="font-bold text-gray-900">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="0 0 0 0 0 0"
            className="w-full text-center text-3xl font-bold tracking-[1em] py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            required
          />

          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition ${
              loading || otp.length < 6 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <button 
          onClick={() => navigate(-1)}
          className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mx-auto transition"
        >
          <HiArrowLeft /> Back to registration
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;