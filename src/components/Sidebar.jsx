import React from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  Eye,
  Sliders,
  GraduationCap,
  Award,
  Sparkles,
  LogOut,
  BookOpen,
} from "lucide-react";

export const Sidebar = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 text-slate-300 hidden lg:flex flex-col sticky top-0 h-screen shrink-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1">
              Proctor<span className="text-teal-400">Vision</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Privacy-Friendly AI</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-4">
        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            {isTeacherPath ? "Teacher Invigilation" : "Student Portal"}
          </div>

          {(isTeacherPath ? teacherLinks : studentLinks).map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/teacher/dashboard" || link.to === "/student/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? isTeacherPath
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold"
                        : "bg-teal-600/15 text-teal-400 border border-teal-500/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
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
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 mt-auto">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  user.role === "teacher" ? "bg-indigo-600" : "bg-teal-600"
                }`}
              >
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user.role} {user.studentId ? `• ${user.studentId}` : ""}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
