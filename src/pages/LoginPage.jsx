import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LogIn,
  Sparkles,
  User,
  GraduationCap,
  X,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoCard, setShowDemoCard] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === "teacher" || loggedUser.role === "admin") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError("");
    try {
      const loggedUser = await login(demoEmail, demoPassword);
      if (loggedUser.role === "teacher" || loggedUser.role === "admin") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Cyber Ambient Lights matching Landing Page */}
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[45rem] h-[30rem] bg-gradient-to-b from-purple-500/20 via-violet-500/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-violet-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Outer Card Wrapper with Glow */}
      <div className="relative w-full max-w-md my-8">
        {/* Ambient Glow behind Card */}
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-500/30 via-violet-500/20 to-fuchsia-500/20 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

        {/* Glassmorphism Card Container */}
        <div className="relative w-full bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] space-y-6">
          {/* Top Cyber Laser Accent Line */}
          <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/70 to-transparent pointer-events-none" />

          {/* Card Close Button (Navigates Back to Landing Page) */}
          <Link
            to="/"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 hover:border-purple-400/50 transition-all cursor-pointer group"
            title="Close and return to Home"
            aria-label="Close"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </Link>

          {/* Header & Brand */}
          <div className="text-center space-y-2 pt-1">
            <Link to="/" className="inline-block group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.35)] bg-slate-950 flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                <img
                  src="/logo.jpg"
                  alt="ProctorVision"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
            </Link>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Proctor<span className="text-purple-400">Vision</span>
            </h2>
            <p className="text-xs text-slate-300/80 max-w-xs mx-auto">
              Sign in to access your AI proctored examinations or teacher monitoring console
            </p>
          </div>

          {/* Quick Demo Credentials Pop Card with Dismiss Button */}
          {showDemoCard && (
            <div className="relative p-3.5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-950/70 border border-purple-500/30 backdrop-blur-md space-y-2.5 shadow-[0_0_20px_rgba(168,85,247,0.12)]">
              {/* Pop Card Close Button */}
              <button
                type="button"
                onClick={() => setShowDemoCard(false)}
                className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Hide demo credentials card"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-purple-300 uppercase tracking-wider pr-6">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>1-Click Hackathon Demo Credentials</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemoLogin(
                      "teacher@proctorvision.com",
                      "Teacher@123"
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/90 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer active:scale-95"
                >
                  <User className="h-3.5 w-3.5 text-purple-300" />
                  <span>Teacher Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemoLogin(
                      "rahul@proctorvision.com",
                      "Student@123"
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-violet-950/70 hover:bg-violet-900/90 border border-violet-500/40 text-violet-200 text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer active:scale-95"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-violet-300" />
                  <span>Student Demo</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. teacher@proctorvision.com"
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Password</span>
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-violet-400 to-purple-400 hover:from-purple-400 hover:to-violet-300 text-white font-bold py-3 px-4 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] mt-2"
            >
              <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span>{loading ? "Authenticating..." : "Sign In to Console"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Register Footer */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
