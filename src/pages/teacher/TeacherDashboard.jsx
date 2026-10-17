import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherDashboard, addRecentEvent } from "../../store/slices/teacherSlice.js";
import { submitReview, addLiveAlert, removeLiveAlert } from "../../store/slices/reviewSlice.js";
import { getSocket } from "../../services/socket.js";
import { RiskBadge } from "../../components/RiskBadge.jsx";
import { SnapshotModal } from "../../components/SnapshotModal.jsx";
import { getEvidenceUrl } from "../../utils/imageUrl.js";
import { getActivityDetails } from "../../utils/activityDetails.js";
import {
  FileText,
  Users,
  ShieldAlert,
  CheckCircle2,
  CheckCircle,
  AlertOctagon,
  Activity,
  PlusCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Video,
  FileCheck2,
  Clock,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const CHART_COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6"];

export const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { stats, eventDistribution, liveSessions, recentEvents, loading } = useSelector(
    (state) => state.teacher
  );
  const { liveAlerts } = useSelector((state) => state.reviews);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Audio chime for teacher when student triggers suspicious activity
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
  };

  const handleQuickReview = async (eventId, decision) => {
    try {
      await dispatch(submitReview({ eventId, decision })).unwrap();
      dispatch(fetchTeacherDashboard({ silent: true }));
    } catch (err) {
      alert("Review action failed: " + err);
    }
  };

  useEffect(() => {
    dispatch(fetchTeacherDashboard());

    // Socket.IO live notifications
    const socket = getSocket();
    socket.emit("join:teacher");

    socket.on("attempt:started", () => {
      dispatch(fetchTeacherDashboard({ silent: true }));
    });

    socket.on("attempt:submitted", () => {
      dispatch(fetchTeacherDashboard({ silent: true }));
    });

    socket.on("event:flagged", (payload) => {
      console.log("Live Socket: proctor event flagged", payload);
      playChime();

      const flaggedEvent = payload.event || {};
      const act = getActivityDetails(flaggedEvent.type);

      const alertToast = {
        id: flaggedEvent._id || Date.now().toString(),
        studentName: flaggedEvent.studentId?.name || "Student",
        studentId: flaggedEvent.studentId?.studentId || "",
        examTitle: flaggedEvent.examId?.title || "Exam Session",
        activity: act,
        time: new Date().toLocaleTimeString(),
      };

      dispatch(addLiveAlert(alertToast));
      dispatch(addRecentEvent(flaggedEvent));
      dispatch(fetchTeacherDashboard({ silent: true }));
    });

    socket.on("event:reviewed", () => {
      dispatch(fetchTeacherDashboard({ silent: true }));
    });

    return () => {
      socket.off("attempt:started");
      socket.off("attempt:submitted");
      socket.off("event:flagged");
      socket.off("event:reviewed");
    };
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
        <span>Loading Teacher Command Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Real-time Floating Proctor Alert Toasts for Teacher */}
      {liveAlerts.length > 0 && (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
          {liveAlerts.map((alert) => (
            <div
              key={alert.id}
              className="pointer-events-auto bg-slate-900/95 border-2 border-rose-500/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-rose-950/50 flex flex-col gap-2.5 animate-slide-in text-white"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{alert.activity.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                      🚨 Live Activity Alert
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {alert.studentName}{" "}
                      <span className="text-xs font-normal text-slate-400 font-mono">
                        ({alert.studentId || "Student"})
                      </span>
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(removeLiveAlert(alert.id))}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <span>Activity:</span>
                  <span>{alert.activity.name}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {alert.activity.reason}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {alert.time}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickReview(alert.id, "false_alarm")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    False Alarm
                  </button>
                  <button
                    onClick={() => handleQuickReview(alert.id, "valid")}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" />
                    Valid
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Top Banner (Adopted from Friend UI) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 -top-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Privacy-Preserving Proctoring Command</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Teacher Invigilation Dashboard
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Monitor live exam integrity, review flagged behavioral anomalies, and manage exam configurations with 100% on-device AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              to="/teacher/exams/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Exam</span>
            </Link>
            <Link
              to="/teacher/reviews"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Review Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Adopted from Friend UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Exams */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Exams</span>
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats?.totalExams || 0}</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {stats?.publishedExams || 0} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Shared with Student Dashboard
          </p>
        </div>

        {/* Card 2: Active Students */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Students</span>
            <div className="p-2 rounded-lg bg-teal-950 text-teal-400 border border-teal-800/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats?.activeAttempts || 0}</span>
            <span className="text-xs font-medium text-teal-300 bg-teal-950/60 border border-teal-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Live Stream
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats?.completedAttempts || 0} completed submissions
          </p>
        </div>

        {/* Card 3: Pending Reviews */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reviews</span>
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/60">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-300">{stats?.eventsAwaitingReview || 0}</span>
            <Link
              to="/teacher/reviews"
              className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
            >
              Review all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Out of {stats?.totalEvents || 0} total flags
          </p>
        </div>

        {/* Card 4: False Alarm Rate */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">False Alarm Rate</span>
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-300">
              {stats?.reviewedEvents > 0
                ? `${Math.round((stats.falseAlarmEvents / stats.reviewedEvents) * 100)}%`
                : "0%"}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {stats?.reviewedEvents || 0} evaluated
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats?.falseAlarmEvents || 0} dismissed benign events
          </p>
        </div>
      </div>

      {/* Middle Row: Telemetry Event Breakdown & Active Students Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Flagged Telemetry Event Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of detected incidents across monitoring categories
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-300 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded-full">
              AI Categorized
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            {eventDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventDistribution}>
                  <XAxis
                    dataKey="type"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => val.replace(/_/g, " ")}
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {eventDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No telemetry flags logged yet. Clean sessions!
              </div>
            )}
          </div>
        </div>

        {/* Live Active Students (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              Live Exam Sessions ({liveSessions.length})
            </h3>
            <span className="text-[11px] text-teal-400 font-medium">Real-time</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-60">
            {liveSessions.length > 0 ? (
              liveSessions.map((session) => (
                <div
                  key={session._id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      {session.studentId?.name || "Student"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {session.examId?.title?.slice(0, 24)}...
                    </div>
                  </div>
                  <RiskBadge score={session.riskScore || 0} />
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 p-6 text-center">
                No active students currently taking an exam.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Suspicious Activity & Snapshot Evidence */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Recent Suspicious Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect snapshot evidence from student webcams and review flagged anomalies
            </p>
          </div>
          <Link
            to="/teacher/reviews"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View Full Audit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Student</th>
                <th className="pb-3 font-semibold">Exam</th>
                <th className="pb-3 font-semibold">Observed Activity & Reason</th>
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Evidence Frame</th>
                <th className="pb-3 font-semibold">Verdict</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentEvents.length > 0 ? (
                recentEvents.map((ev) => {
                  const act = getActivityDetails(ev.type);
                  return (
                    <tr key={ev._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-medium text-slate-200">
                        {ev.studentId?.name || "Student"}
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {ev.studentId?.studentId || ""}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">
                        {ev.examId?.title?.slice(0, 26)}...
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          <span>{act.icon}</span>
                          <span className="text-indigo-300 text-xs">{act.shortName}</span>
                        </div>
                        <span className="block text-[10px] text-slate-400 line-clamp-1 max-w-[240px]">
                          {act.reason}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(ev.occurredAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3">
                        {ev.evidenceUrl ? (
                          <div
                            onClick={() => setSelectedEvent(ev)}
                            className="h-9 w-14 rounded-md overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer hover:border-indigo-500 transition-colors relative group"
                          >
                            <img
                              src={getEvidenceUrl(ev.evidenceUrl)}
                              alt="thumb"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (!e.target.dataset.fallback) {
                                  e.target.dataset.fallback = "true";
                                  e.target.src = ev.evidenceUrl;
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setSelectedEvent(ev)}
                            className="h-9 w-14 rounded-md border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-[10px] cursor-pointer hover:border-indigo-500"
                          >
                            <span>{act.icon}</span>
                            <span className="text-[8px] text-slate-500 font-mono">Log</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            ev.reviewDecision === "valid"
                              ? "bg-rose-950/70 text-rose-300 border border-rose-800"
                              : ev.reviewDecision === "false_alarm"
                              ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800"
                              : "bg-amber-950/70 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {ev.reviewDecision || "pending"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedEvent(ev)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer border border-slate-700"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No flagged events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Review Modal */}
      {selectedEvent && (
        <SnapshotModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onReviewed={() => fetchDashboardData()}
        />
      )}
    </div>
  );
};

