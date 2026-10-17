import React, { useState } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  Eye,
  Sliders,
  Award,
  Sparkles,
  LogOut,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

export const Sidebar = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTeacherPath = location.pathname.startsWith("/teacher") || location.pathname === "/";
  const isStudentPath = location.pathname.startsWith("/student");

  const teacherLinks = [
    { to: "/teacher/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/teacher/exams", label: "Manage Exams", icon: FileText },
    { to: "/teacher/exams/create", label: "Create Exam", icon: PlusCircle },
    { to: "/teacher/attempts", label: "Student Attempts", icon: Users },
    { to: "/teacher/reviews", label: "Review Queue", icon: Eye, badge: "Live" },
    { to: "/teacher/settings", label: "Rule Tuning", icon: Sliders },
  ];

  const studentLinks = [
    { to: "/student/dashboard", label: "My Exams", icon: BookOpen },
    { to: "/student/results", label: "My Results", icon: Award },
  ];

  const activeLinks = isTeacherPath ? teacherLinks : studentLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Top Header (Visible on screens < lg) */}
      <div className="lg:hidden w-full h-16 bg-[#060911]/95 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-40 select-none">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] bg-slate-950 shrink-0">
            <img
              src="/logo.jpg"
              alt="ProctorVision"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white font-heading">
              Proctor<span className="text-purple-400">Vision</span>
            </div>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-[#060911]/98 backdrop-blur-2xl border-r border-white/10 h-full flex flex-col p-4 shadow-2xl z-10 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] bg-slate-950 shrink-0">
                  <img
                    src="/logo.jpg"
                    alt="ProctorVision"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
                <div className="font-bold text-sm tracking-tight text-white font-heading">
                  Proctor<span className="text-purple-400">Vision</span>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1 flex-1 overflow-y-auto">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>{isTeacherPath ? "Teacher Console" : "Student Portal"}</span>
              </div>
              {activeLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/teacher/dashboard" || link.to === "/student/dashboard"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-purple-500/20 via-violet-500/15 to-purple-500/10 text-purple-200 border border-purple-500/40 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.18)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 text-purple-400" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-500/40">
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {user && (
              <div className="pt-3 border-t border-white/[0.08] mt-auto">
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize font-mono">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#060911]/95 backdrop-blur-2xl text-slate-300 hidden lg:flex flex-col fixed inset-y-0 left-0 h-screen shrink-0 z-30 select-none">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.08] bg-slate-950/40 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] group-hover:border-purple-300 transition-all bg-slate-950 shrink-0">
              <img
                src="/logo.jpg"
                alt="ProctorVision"
                className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white font-heading flex items-center gap-0.5">
                Proctor<span className="text-purple-400">Vision</span>
              </div>
              <p className="text-[10px] text-purple-300/70 font-mono tracking-tight">AI Invigilation</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-4">
          {/* Navigation Section */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>{isTeacherPath ? "Teacher Console" : "Student Portal"}</span>
            </div>

            {activeLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/teacher/dashboard" || link.to === "/student/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 via-violet-500/15 to-purple-500/10 text-purple-200 border border-purple-500/40 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.18)]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0 text-purple-400" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout at Bottom */}
        {user && (
          <div className="p-3 border-t border-white/[0.08] bg-slate-950/60 mt-auto">
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize font-mono">
                    {user.role} {user.studentId ? `• ${user.studentId}` : ""}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
