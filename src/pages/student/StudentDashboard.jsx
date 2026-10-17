import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentDashboard } from "../../store/slices/studentSlice.js";
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
} from "lucide-react";

export const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { exams, myAttempts, loading } = useSelector((state) => state.student);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchStudentDashboard());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchStudentDashboard());
  };

  return (
    <div className="space-y-8 select-none">
      {/* Student Welcome Banner with Cyber Ambient Lights */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-950/90 to-slate-900/80 rounded-3xl p-6 sm:p-8 text-white border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.12)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-3 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Zero-Knowledge On-Device AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Student Assessment Portal
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-sans">
              Take scheduled academic examinations with transparent, on-device AI invigilation. Your biometric camera data is analyzed entirely within your browser and is never uploaded to the cloud.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-purple-400/50 text-xs font-mono font-medium cursor-pointer transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
            <span>Refresh Portal</span>
          </button>
        </div>
      </div>

      {/* Available Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Available Examinations ({exams.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Teacher-created exams automatically synchronized with your portal
            </p>
          </div>

          <span className="text-xs text-purple-300 flex items-center gap-1.5 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full font-mono text-[11px] shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Real-time Sync
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl">
            <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
            <span className="text-xs font-mono">Loading examinations and live telemetry...</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-dashed border-white/10 text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No Exams Available Right Now</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your instructors will publish new examinations soon. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const completedAttempt =
                exam.studentAttempts?.find(
                  (a) => a.status === "submitted" || a.status === "auto_submitted"
                ) || exam.studentAttempts?.[exam.studentAttempts.length - 1];

              return (
                <div
                  key={exam._id}
                  className="bg-slate-950/70 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-purple-500/40 p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.18)] transition-all group relative overflow-hidden"
                >
                  {/* Subtle top laser line */}
                  <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-base sm:text-lg text-white line-clamp-1 group-hover:text-purple-300 transition-colors font-heading">
                        {exam.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                        {(exam.status || "PUBLISHED").toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {exam.description || "No specific instructions provided for this exam."}
                    </p>

                    {/* 3-Column Stats Strip */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-[11px] mb-5 backdrop-blur-md">
                      <div>
                        <span className="block text-slate-500 text-[10px] font-mono font-medium uppercase tracking-wider">Duration</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-purple-400" /> {exam.durationMinutes}m
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] font-mono font-medium uppercase tracking-wider">Questions</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5 font-mono">
                          <HelpCircle className="w-3 h-3 text-violet-400" /> {exam.questions?.length || 0} Qs
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] font-mono font-medium uppercase tracking-wider">Total Marks</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5 font-mono">
                          <Award className="w-3 h-3 text-amber-400" /> {exam.totalMarks} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Instructor info & CTA button with SCORE */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-white/[0.08] text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" /> By {exam.createdBy?.name || "Faculty"}
                    </span>

                    {exam.hasActiveAttempt ? (
                      <button
                        onClick={() => navigate(`/student/attempts/${exam.activeAttemptId}`)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Exam</span>
                      </button>
                    ) : completedAttempt ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs font-mono">
                          Score: {completedAttempt.score ?? 0} / {completedAttempt.totalMarks || exam.totalMarks}
                        </span>
                        <Link
                          to={`/student/results?attemptId=${completedAttempt._id}`}
                          className="px-3.5 py-1.5 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-semibold text-xs transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>Result</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ) : exam.canAttempt ? (
                      <Link
                        to={`/student/exams/${exam._id}/instructions`}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 via-violet-400 to-purple-400 hover:from-purple-400 hover:to-violet-300 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Start Exam</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] font-mono">
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

      {/* My Assessment Results & History Section */}
      <div className="bg-slate-950/70 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-5 shadow-xl relative overflow-hidden">
        {/* Subtle top laser line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-950/70 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Assessment History & Integrity Results
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
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                  <th className="pb-3 font-semibold">Exam Title</th>
                  <th className="pb-3 font-semibold">Submission Status</th>
                  <th className="pb-3 font-semibold">Score Earned</th>
                  <th className="pb-3 font-semibold">Percentage</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {myAttempts.map((att) => {
                  const total = att.totalMarks || att.examId?.totalMarks || 1;
                  const pct = Math.round(((att.score || 0) / total) * 100);
                  const isAuto = att.status === "auto_submitted";

                  return (
                    <tr key={att._id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 font-medium text-white">
                        {att.examId?.title || "Exam"}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                            isAuto
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {isAuto ? "Auto-Submitted (3 Warnings)" : "Standard Submission"}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-purple-300 font-mono text-sm">
                        {att.score ?? 0} / {att.totalMarks || att.examId?.totalMarks || 0} pts
                      </td>
                      <td className="py-3.5">
                        <span className="text-xs font-semibold text-slate-200 font-mono">{pct}%</span>
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(att.submittedAt || att.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/student/results?attemptId=${att._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-semibold text-xs transition-all shadow-sm active:scale-95"
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

export default StudentDashboard;
