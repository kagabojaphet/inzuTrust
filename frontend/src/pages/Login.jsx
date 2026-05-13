import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import {
  HiMail,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi";

import { useAuth } from "../context/AuthContext";

const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required(),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      const userData = await login(data.email, data.password);

      setAlert({
        show: true,
        type: "success",
        message: `Welcome back, ${userData.firstName}`,
      });

      const role = userData.role?.toLowerCase();

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "landlord") navigate("/landlord/dashboard");
      else if (role === "tenant") navigate("/tenant/dashboard");
      else if (role === "agent") navigate("/agent/dashboard");
      else navigate("/");
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue-bright items-center justify-center px-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Rental trust starts here
          </h1>

          <p className="mt-5 text-white/80">
            Secure access for landlords, tenants, and agents.
          </p>

          <div className="mt-10 space-y-4 text-sm">
            <div className="flex gap-3 items-center">
              <HiCheckCircle />
              Verified rental ecosystem
            </div>
            <div className="flex gap-3 items-center">
              <HiCheckCircle />
              Transparent agreements
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* HEADER WITH HAND ICON */}
         {/* HEADER */}
<div className="mb-10">

  <div className="flex items-center gap-3 mb-2">

    <h2 className="text-3xl font-medium text-slate-900 flex items-center gap-2">

      Welcome back

      {/* HAND ICON */}
      <span className="text-brand-blue-bright text-2xl">
        🖐
      </span>

    </h2>

  </div>

  <p className="text-sm text-slate-500">
    Sign in to continue into your dashboard
  </p>
</div>

          {/* ALERT */}
          {alert.show && (
            <div
              className={`mb-6 p-4 border rounded-xl flex items-center gap-3 ${
                alert.type === "success"
                  ? "border-green-200 text-green-700"
                  : "border-red-200 text-red-700"
              }`}
            >
              {alert.type === "success" ? (
                <HiCheckCircle />
              ) : (
                <HiExclamationCircle />
              )}
              <p className="text-sm">{alert.message}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-xs text-slate-500">Email</label>

              <div className="relative mt-1">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  {...register("email")}
                  type="email"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand-blue-bright"
                  placeholder="you@example.com"
                />
              </div>

              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs text-slate-500">Password</label>

              <div className="relative mt-1">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-brand-blue-bright"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-brand-blue-bright text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Don’t have an account?{" "}
            <Link to="/register" className="text-brand-green-mid font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;