import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api.js";
import {
  FileText,
  Clock,
  ShieldAlert,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export const ExamInstructions = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${examId}`);
        setExam(res.data.data);
      } catch (err) {
        alert("Failed to load exam details: " + (err.response?.data?.message || err.message));
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  if (loading || !exam) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading examination instructions...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 select-none">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Student Dashboard</span>
      </Link>

      <div className="bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle top laser glow line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

        <div className="space-y-3 border-b border-white/[0.08] pb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <span>{exam.durationMinutes} Minutes • {exam.questions?.length || 0} Questions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Please read these examination and monitoring guidelines carefully before beginning.
          </p>
        </div>

        {/* Instructions Content */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          <h3 className="text-sm font-bold text-white font-heading">Instructor Guidelines:</h3>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 whitespace-pre-line font-mono text-slate-300 text-xs leading-relaxed">
            {exam.instructions || "Standard examination rules apply."}
          </div>

          <h3 className="text-sm font-bold text-white font-heading pt-2">
            AI Monitoring Checklist:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-white/5">
              <Camera className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-white">Webcam Required:</strong> Your webcam will be activated upon consent. All computer vision runs locally inside your browser; no continuous video feed is uploaded to the cloud.
              </span>
            </li>
            <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-white/5">
              <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-white">Stay in Exam Tab:</strong> Navigating away, minimizing the browser window, or switching screens will be recorded as a <code className="text-purple-300 font-mono">TAB_HIDDEN</code> telemetry event.
              </span>
            </li>
            <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-white/5">
              <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-white">Human-in-the-Loop Review:</strong> AI telemetry flags are indicators for teacher review, not automated verdicts. You will not be unfairly penalized.
              </span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">Step 1 of 2</span>
          <button
            onClick={() => navigate(`/student/exams/${examId}/consent`)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-400 hover:to-violet-400 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] transition-all cursor-pointer active:scale-95"
          >
            <span>Review Privacy Consent</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
