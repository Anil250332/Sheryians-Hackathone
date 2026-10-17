import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api.js";
import {
  Award,
  Clock,
  ArrowRight,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Calendar,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";

export const ExamResult = () => {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const isAuto = searchParams.get("autoSubmitted") === "true";
  const reason = searchParams.get("reason");
  const isTeacherConfirmed = reason === "teacher_confirmed_violation";

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attempts/my");
      const list = res.data.data || [];
      const completedList = list.filter(
        (a) => a.status === "submitted" || a.status === "auto_submitted"
      );
      setAttempts(completedList);
    } catch (err) {
      console.warn("Could not load test results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId && !isAuto) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
    }
    fetchResults();
  }, [attemptId, isAuto]);

  // Aggregate stats
  const totalCompleted = attempts.length;
  const avgPercentage =
    totalCompleted > 0
      ? Math.round(
          attempts.reduce((acc, curr) => {
            const max = curr.totalMarks || curr.examId?.totalMarks || 1;
            return acc + ((curr.score || 0) / max) * 100;
          }, 0) / totalCompleted
        )
      : 0;

  const highestScore =
    totalCompleted > 0
      ? Math.max(...attempts.map((a) => a.score || 0))
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Top Submission Notification Banner (Shown when arriving right after exam submit) */}
      {attemptId && (
        <div
          className={`p-5 rounded-3xl border backdrop-blur-xl flex items-center justify-between gap-4 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
            isAuto
              ? "bg-rose-950/70 border-rose-500/50 text-rose-200"
              : "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3.5">
            {isAuto ? (
              <div className="p-2.5 rounded-2xl bg-rose-900/60 text-rose-400 border border-rose-500/40">
                <AlertOctagon className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-emerald-900/60 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold font-heading">
                {isTeacherConfirmed
                  ? "Examination Terminated by Teacher (Confirmed Cheating Evidence)"
                  : isAuto
                  ? "Examination Auto-Submitted (3 Warnings Reached)"
                  : "Examination Successfully Submitted!"}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                {isTeacherConfirmed
                  ? "The teacher invigilator reviewed camera evidence and verified an unauthorized misconduct violation. The exam was immediately finalized."
                  : isAuto
                  ? "Your session reached the maximum violation limit (3 warnings). Your score has been recorded in the scorecard list below."
                  : "Your answers have been graded and recorded in your official assessment scorecard."}
              </p>
            </div>
          </div>
          <Link
            to="/student/dashboard"
            className="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 border border-white/10 active:scale-95 transition-all"
          >
            Dashboard &rarr;
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-2 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Academic Performance Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            My Examination Results & Scorecard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Comprehensive history of all examinations you have completed along with academic scores and integrity logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchResults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-purple-400/40 text-slate-300 hover:text-white text-xs font-mono font-medium cursor-pointer transition-all active:scale-95 shadow-md"
          >
            <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
            <span>Refresh</span>
          </button>
          <Link
            to="/student/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-400 hover:to-violet-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all active:scale-95"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Available Exams</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-950/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Completed Tests</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalCompleted}</div>
          <p className="text-[11px] text-slate-400 mt-1">Evaluated submissions</p>
        </div>

        <div className="bg-slate-950/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Average Performance</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300 font-mono">{avgPercentage}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all completed assessments</p>
        </div>

        <div className="bg-slate-950/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Top Score Earned</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-mono">{highestScore} pts</div>
          <p className="text-[11px] text-slate-400 mt-1">Highest individual score achieved</p>
        </div>
      </div>

      {/* List of All Test Scores */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
          <BookOpen className="w-4 h-4 text-purple-400" />
          All Completed Test Scores ({attempts.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3 bg-slate-950/60 rounded-3xl border border-white/10 backdrop-blur-xl">
            <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
            <span className="font-mono text-xs">Loading your test score history...</span>
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-dashed border-white/10 text-slate-400 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white font-heading">No Test Scores Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You haven't submitted any examinations yet. Choose a published exam from your portal to get started.
            </p>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all active:scale-95"
            >
              <span>Take an Exam Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((att, idx) => {
              const maxMarks = att.totalMarks || att.examId?.totalMarks || 1;
              const earned = att.score ?? 0;
              const pct = Math.round((earned / maxMarks) * 100);
              const isAutoSubmitted = att.status === "auto_submitted";
              const isJustSubmitted = attemptId === att._id;

              return (
                <div
                  key={att._id}
                  className={`bg-slate-950/70 backdrop-blur-xl rounded-3xl border p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all space-y-5 relative overflow-hidden ${
                    isJustSubmitted
                      ? "border-purple-500/80 ring-1 ring-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                      : "border-white/10 hover:border-purple-500/40"
                  }`}
                >
                  {/* Subtle top laser glow line */}
                  <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

                  {/* Top Bar: Title + Status Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300 font-mono">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-heading">
                          {att.examId?.title || "Academic Examination"}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            {att.examId?.durationMinutes || 25} mins
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            {new Date(att.submittedAt || att.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                          isAutoSubmitted
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {isAutoSubmitted ? (
                          <>
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                            Auto-Submitted (3 Warnings)
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Standard Submission
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Score Showcase & Reason */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Score Box */}
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">
                        Academic Score Earned
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-purple-300 font-mono">
                          {earned}
                        </span>
                        <span className="text-slate-400 text-sm font-mono">/ {maxMarks} pts</span>
                        <span className="ml-auto text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300">
                          {pct}%
                        </span>
                      </div>
                      {/* Mini visual progress bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 60 ? "bg-purple-500" : pct >= 35 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Reason Box */}
                    <div
                      className={`md:col-span-2 p-4 rounded-2xl border text-xs space-y-1 ${
                        isAutoSubmitted
                          ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                          : "bg-slate-900/70 border-white/10 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] font-mono">
                        {isAutoSubmitted ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-rose-300">
                              {isJustSubmitted && isTeacherConfirmed
                                ? "Submission Reason: Terminated by Invigilator (Confirmed Misconduct)"
                                : "Submission Reason: Violation Limit Exceeded (3 Warnings)"}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Submission Reason: Normal Student Hand-in</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-400 font-sans">
                        {isAutoSubmitted
                          ? isJustSubmitted && isTeacherConfirmed
                            ? "The exam was terminated and submitted by the invigilator after reviewing camera evidence and confirming unauthorized activity."
                            : "Reached the threshold of 3 on-device computer vision warnings (multiple faces, mobile phone, or window switch). The exam was automatically finalized."
                          : "Student completed all questions and successfully clicked submit within the allocated deadline."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResult;
