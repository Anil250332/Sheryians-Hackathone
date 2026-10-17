import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ShieldCheck, LogOut, Cpu, ArrowRightLeft, Sparkles } from "lucide-react";

export const Navbar = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path.includes("/teacher/dashboard")) return "Teacher Overview Console";
    if (path.includes("/teacher/exams/create")) return "Create New Examination";
    if (path.includes("/teacher/reviews")) return "Flagged Telemetry Reviews";
    if (path.includes("/student/dashboard")) return "Student Assessment Portal";
    if (path.includes("/student/exams") && path.includes("/instructions")) return "Pre-Exam Integrity Consent";
    if (path.includes("/student/attempts")) return "Secure Examination Session";
    if (path.includes("/student/results")) return "Examination Results & Scorecard";
    return "ProctorVision Command";
  };

  const isTeacherView = location.pathname.startsWith("/teacher");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform ${
              isTeacherView 
                ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" 
                : "bg-teal-600/20 text-teal-400 border-teal-500/30"
            }`}>
              <ShieldCheck className={`h-5 w-5 ${isTeacherView ? "text-indigo-400" : "text-teal-400"}`} />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Proctor<span className={isTeacherView ? "text-indigo-400" : "text-teal-400"}>Vision</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:block h-6 w-px bg-slate-800" />

          {/* Current Page Context */}
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-slate-400 hidden lg:block">
              {isTeacherView
                ? "Teacher Console • Real-Time Integrity & Review Queue"
                : "Student Mode • 100% On-Device Biometric Integrity"}
            </p>
          </div>
        </div>

        {/* Right Actions & Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* On-device AI Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-950/60 border border-teal-800/60 text-teal-300 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>Local Engine Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>

          {/* Zero Cloud Streaming Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zero-Stream Mode</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {/* User Pill */}
              <div className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  isTeacherView ? "bg-indigo-600" : "bg-teal-600"
                }`}>
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] capitalize text-slate-400">
                    {user.role} {user.studentId ? `(${user.studentId})` : ""}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

