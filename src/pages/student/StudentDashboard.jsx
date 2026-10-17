import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import {
  BookOpen,
  Clock,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Award,
  Calendar,
  RefreshCw,
  Play,
  AlertCircle,
} from "lucide-react";

export const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [examsRes, attemptsRes] = await Promise.all([
        api.get("/exams").catch(() => ({ data: { data: [] } })),
        api.get("/attempts/my").catch(() => ({ data: { data: [] } })),
      ]);
      setExams(examsRes.data.data || []);
      setMyAttempts(attemptsRes.data.data || []);
    } catch (err) {
      console.error("Failed to load student dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner (Adopted from Friend UI) */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Zero-Knowledge Privacy Guaranteed</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Student Assessment Portal
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              Take scheduled academic examinations with transparent, on-device AI invigilation. Your biometric camera data is analyzed entirely within your browser and is never uploaded to the cloud.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="self-start md:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium cursor-pointer transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Available Exams Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              Available Examinations ({exams.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Teacher-created exams automatically synchronized with your portal
            </p>
          </div>

          <span className="text-xs text-teal-400 flex items-center gap-1.5 bg-teal-950/60 border border-teal-800/60 px-2.5 py-1 rounded-full font-medium">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Real-time Sync
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-teal-400" />
            <span>Loading examinations and results...</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-sm font-semibold text-white">No Exams Available Right Now</p>
            <p className="text-xs text-slate-400">
              Your instructors will publish new examinations soon. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exams.map((exam) => {
              const completedAttempt =
                exam.studentAttempts?.find(
                  (a) => a.status === "submitted" || a.status === "auto_submitted"
                ) || exam.studentAttempts?.[exam.studentAttempts.length - 1];

              return (
                <div
                  key={exam._id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-base text-white line-clamp-1 group-hover:text-teal-300 transition-colors">
                        {exam.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-400 border border-teal-800/80">
                        {(exam.status || "PUBLISHED").toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {exam.description || "No specific instructions provided for this exam."}
                    </p>

                    {/* 3-Column Stats Strip (Friend UI pattern) */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] mb-4">
                      <div>
                        <span className="block text-slate-500 text-[10px] font-medium uppercase tracking-wider">Duration</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-teal-400" /> {exam.durationMinutes}m
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] font-medium uppercase tracking-wider">Questions</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                          <HelpCircle className="w-3 h-3 text-indigo-400" /> {exam.questions?.length || 0} Qs
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] font-medium uppercase tracking-wider">Total Marks</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                          <Award className="w-3 h-3 text-amber-400" /> {exam.totalMarks} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Instructor info & CTA button with SCORE */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> By {exam.createdBy?.name || "Faculty"}
                    </span>

                    {exam.hasActiveAttempt ? (
                      <button
                        onClick={() => navigate(`/student/attempts/${exam.activeAttemptId}`)}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Exam</span>
                      </button>
                    ) : completedAttempt ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-xs">
                          Score: {completedAttempt.score ?? 0} / {completedAttempt.totalMarks || exam.totalMarks}
                        </span>
                        <Link
                          to={`/student/results?attemptId=${completedAttempt._id}`}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>Result</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ) : exam.canAttempt ? (
                      <Link
                        to={`/student/exams/${exam._id}/instructions`}
                        className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.02]"
                      >
                        <span>Start Exam</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md text-[11px]">
                        Attempts Finished
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Assessment Results & History Section (Friend UI Design) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                My Assessment History & Integrity Results
              </h3>
              <p className="text-xs text-slate-400">
                Official scores, submission timestamps, and proctoring status
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Submissions: {myAttempts.length}
          </span>
        </div>

        {myAttempts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No completed exams recorded yet. Once you submit an examination, your scores will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Exam Title</th>
                  <th className="pb-3 font-semibold">Submission Status</th>
                  <th className="pb-3 font-semibold">Score Earned</th>
                  <th className="pb-3 font-semibold">Percentage</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myAttempts.map((att) => {
                  const total = att.totalMarks || att.examId?.totalMarks || 1;
                  const pct = Math.round(((att.score || 0) / total) * 100);
                  const isAuto = att.status === "auto_submitted";

                  return (
                    <tr key={att._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-medium text-white">
                        {att.examId?.title || "Exam"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isAuto
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {isAuto ? "Auto-Submitted (3 Warnings)" : "Standard Submission"}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-teal-300 font-mono text-sm">
                        {att.score ?? 0} / {att.totalMarks || att.examId?.totalMarks || 0} pts
                      </td>
                      <td className="py-3">
                        <span className="text-xs font-semibold text-slate-200">{pct}%</span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(att.submittedAt || att.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/student/results?attemptId=${att._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-sm"
                        >
                          <span>View Scorecard</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

