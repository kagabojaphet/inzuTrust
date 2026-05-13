import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiShieldCheck } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = location.state?.email || "";
  const redirectTo = location.state?.redirectTo || null;
  const propertyId = location.state?.propertyId || null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://inzutrust-api.onrender.com/api/users/verify-otp",
        { email, otp }
      );

      if (response.data.success) {
        const token = response.data.data?.token;
        const user = response.data.data?.user;

        if (token) {
          localStorage.setItem("inzu_token", token);
          localStorage.setItem("user", JSON.stringify(user || {}));
          if (setAuth) setAuth(token, user);
        }

        if (propertyId) {
          navigate(`/properties/${propertyId}?apply=true`);
        } else {
          navigate(redirectTo || "/tenant/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm border border-gray-200 bg-white rounded-2xl p-6 sm:p-8 text-center">

        <HiShieldCheck className="text-4xl text-blue-600 mx-auto mb-4" />

        <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">
          Verify Email
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Code sent to <span className="font-medium text-gray-700">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-5">

          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full text-center text-lg tracking-widest py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
            placeholder="000000"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-blue-600 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;