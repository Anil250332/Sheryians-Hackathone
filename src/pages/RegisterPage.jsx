import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  UserPlus,
  GraduationCap,
  School,
  X,
  ArrowRight,
  User,
  Mail,
  Lock,
  Building,
  BookOpen,
  IdCard,
  Sparkles,
} from "lucide-react";

export const RegisterPage = () => {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("Sheryians Institute of Technology");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [semester, setSemester] = useState("6th");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const newUser = await register({
        role,
        name,
        email,
        password,
        institution,
        studentId: role === "student" ? studentId : "",
        department,
        semester: role === "student" ? semester : "",
        teacherCode: role === "teacher" ? "PROCTOR_TEACHER_2026" : undefined,
      });

      if (newUser.role === "teacher" || newUser.role === "admin") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please check inputs."
      );
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
      <div className="relative w-full max-w-lg my-8">
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
              Create <span className="text-purple-400">Account</span>
            </h2>
            <p className="text-xs text-slate-300/80 max-w-xs mx-auto">
              Join the privacy-first on-device AI proctoring platform
            </p>
          </div>

          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                role === "student"
                  ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                role === "teacher"
                  ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <School className="h-4 w-4" />
              <span>Teacher Account</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
                />
              </div>

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
                  placeholder="name@institution.edu"
                  className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Password (min 6 characters)</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-400" />
                  <span>Institution</span>
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
                />
              </div>
            </div>

            {role === "student" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-purple-400" />
                    <span>Student Roll / ID</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. CS2026-099"
                    className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Semester</span>
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all backdrop-blur-md"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-violet-400 to-purple-400 hover:from-purple-400 hover:to-violet-300 text-white font-bold py-3 px-4 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] mt-2"
            >
              <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Login Footer */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
