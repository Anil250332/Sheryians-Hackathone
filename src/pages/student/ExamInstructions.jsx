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
    return <div className="p-8 text-center text-slate-400">Loading instructions...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-2 border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            {exam.durationMinutes} Minutes • {exam.questions?.length || 0} Questions
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {exam.title}
          </h1>
          <p className="text-xs text-slate-400">
            Please read these examination and monitoring guidelines carefully before beginning.
          </p>
        </div>

        {/* Instructions Content */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-semibold text-white">General Rules:</h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 whitespace-pre-line font-mono text-slate-300">
            {exam.instructions || "Standard examination rules apply."}
          </div>

          <h3 className="text-sm font-semibold text-white pt-2">
            AI Monitoring Checklist:
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <Camera className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
              <span>
                <strong>Webcam Required:</strong> Your webcam will be activated upon consent. All computer vision runs locally inside your browser; no continuous video feed is uploaded.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong>Stay in Exam Tab:</strong> Navigating away or minimizing the browser window will be logged as a <code>TAB_HIDDEN</code> telemetry event.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong>Human-in-the-Loop Review:</strong> AI telemetry flags are indicators for teacher review, not automated verdicts. You will not be automatically penalized.
              </span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Step 1 of 2</span>
          <button
            onClick={() => navigate(`/student/exams/${examId}/consent`)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Review Monitoring Consent
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
