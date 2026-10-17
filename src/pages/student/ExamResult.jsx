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
      // Filter to only completed or auto-submitted attempts
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Submission Notification Banner (Shown when coming right after exam submit) */}
      {attemptId && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-lg ${
            isAuto
              ? "bg-rose-950/50 border-rose-800 text-rose-200"
              : "bg-emerald-950/50 border-emerald-800 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {isAuto ? (
              <div className="p-2 rounded-xl bg-rose-900/60 text-rose-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold">
                {isTeacherConfirmed
                  ? "Examination Terminated by Teacher (Confirmed Cheating Evidence)"
                  : isAuto
                  ? "Examination Auto-Submitted (3 Warnings Reached)"
                  : "Examination Successfully Submitted!"}
              </h4>
              <p className="text-xs text-slate-300">
                {isTeacherConfirmed
                  ? "The teacher invigilator reviewed camera evidence and verified an unauthorized misconduct violation. The exam was immediately finalized."
                  : isAuto
                  ? "Your session reached the maximum violation limit (3 warnings). Your score has been recorded in the list below."
                  : "Your answers have been graded and recorded in your permanent scorecard list."}
              </p>
            </div>
          </div>
          <Link
            to="/student/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shrink-0"
          >
            Dashboard &rarr;
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Award className="h-6 w-6 text-teal-400" />
            My Examination Results & Scorecard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete list of all examinations you have completed along with academic scores and submission reasons
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchResults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/student/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>Available Exams</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Tests</span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCompleted}</div>
          <p className="text-[11px] text-slate-400 mt-1">Evaluated submissions</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average Performance</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300">{avgPercentage}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all completed assessments</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Top Score Earned</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{highestScore} pts</div>
          <p className="text-[11px] text-slate-400 mt-1">Highest individual score achieved</p>
        </div>
      </div>

      {/* List of All Test Scores */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-400" />
          All Completed Test Scores ({attempts.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3 bg-slate-900/40 rounded-2xl border border-slate-800">
            <RefreshCw className="h-5 w-5 animate-spin text-teal-400" />
            <span>Loading your test score history...</span>
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-slate-400 space-y-3">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-semibold text-white">No Test Scores Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You haven't submitted any examinations yet. Choose a published exam from your portal to get started.
            </p>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
            >
              Take an Exam Now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {attempts.map((att, idx) => {
              const maxMarks = att.totalMarks || att.examId?.totalMarks || 1;
              const earned = att.score ?? 0;
              const pct = Math.round((earned / maxMarks) * 100);
              const isAutoSubmitted = att.status === "auto_submitted";
              const isJustSubmitted = attemptId === att._id;

              return (
                <div
                  key={att._id}
                  className={`bg-slate-900/90 rounded-2xl border p-5 sm:p-6 shadow-md transition-all space-y-4 ${
                    isJustSubmitted
                      ? "border-teal-500/80 bg-slate-900 ring-1 ring-teal-500/30"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Top Bar: Title + Status Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 font-mono">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {att.examId?.title || "Academic Examination"}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {att.examId?.durationMinutes || 25} mins
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(att.submittedAt || att.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isAutoSubmitted
                            ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
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
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        Academic Score Earned
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-teal-300 font-mono">
                          {earned}
                        </span>
                        <span className="text-slate-400 text-sm">/ {maxMarks} pts</span>
                        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-md bg-teal-950 border border-teal-800/80 text-teal-300">
                          {pct}%
                        </span>
                      </div>
                      {/* Mini visual progress bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 60 ? "bg-teal-500" : pct >= 35 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Reason Box */}
                    <div
                      className={`md:col-span-2 p-4 rounded-xl border text-xs space-y-1 ${
                        isAutoSubmitted
                          ? "bg-rose-950/30 border-rose-800/60 text-rose-200"
                          : "bg-slate-950/80 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
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
                      <p className="text-[11px] leading-relaxed text-slate-400">
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

