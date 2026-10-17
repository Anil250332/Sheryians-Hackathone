import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ShieldCheck, LogOut, LayoutDashboard, Sparkles } from "lucide-react";

export const Navbar = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show Navbar ONLY on the landing page ("/")
  if (location.pathname !== "/") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardRoute = isTeacher ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
              Proctor<span className="text-teal-400">Vision</span>
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={dashboardRoute}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </Link>

              {/* User Pill */}
              <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  isTeacher ? "bg-indigo-600" : "bg-teal-600"
                }`}>
                  {user.name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-medium text-slate-200">
                  {user.name}
                </span>
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
                className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
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
