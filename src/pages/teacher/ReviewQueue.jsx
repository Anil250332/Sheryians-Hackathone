import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReviews,
  submitReview,
  setFilter,
  setSelectedEvent,
  eventFlagged,
  eventReviewed,
  addLiveAlert,
  removeLiveAlert,
} from "../../store/slices/reviewSlice.js";
import { getSocket } from "../../services/socket.js";
import { SnapshotModal } from "../../components/SnapshotModal.jsx";
import { getEvidenceUrl } from "../../utils/imageUrl.js";
import { getActivityDetails } from "../../utils/activityDetails.js";
import {
  Eye,
  CheckCircle,
  AlertOctagon,
  Filter,
  Camera,
  RefreshCw,
  Video,
  Clock,
  X,
  Sparkles,
} from "lucide-react";

export const ReviewQueue = () => {
  const dispatch = useDispatch();
  const { events, loading, filter, selectedEvent, liveAlerts } = useSelector(
    (state) => state.reviews
  );

  // Play an alert sound when student triggers an activity
  const playNotificationSound = useCallback(() => {
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
    } catch (e) {
      // Audio fallback
    }
  }, []);

  // Fetch reviews whenever filter changes
  useEffect(() => {
    dispatch(fetchReviews(filter));
  }, [dispatch, filter]);

  // Real-time socket integration with Redux: smooth in-place updates, NO page reload!
  useEffect(() => {
    const socket = getSocket();
    socket.emit("join:teacher");

    const handleEventFlagged = (payload) => {
      console.log("Teacher Live Socket: event flagged", payload);
      playNotificationSound();

      const flaggedEvent = payload.event || {};
      const act = getActivityDetails(flaggedEvent.type);

      // 1. Smoothly update Redux state in-place (no loading spinner, no page reload!)
      dispatch(eventFlagged(flaggedEvent));

      // 2. Add floating live alert toast
      const alertToast = {
        id: flaggedEvent._id || Date.now().toString(),
        studentName: flaggedEvent.studentId?.name || "Student",
        studentId: flaggedEvent.studentId?.studentId || "",
        examTitle: flaggedEvent.examId?.title || "Exam Session",
        activity: act,
        type: flaggedEvent.type,
        time: new Date().toLocaleTimeString(),
      };
      dispatch(addLiveAlert(alertToast));
    };

    const handleEventReviewed = (payload) => {
      console.log("Teacher Live Socket: event reviewed", payload);
      dispatch(eventReviewed(payload));
    };

    socket.on("event:flagged", handleEventFlagged);
    socket.on("event:reviewed", handleEventReviewed);

    return () => {
      socket.off("event:flagged", handleEventFlagged);
      socket.off("event:reviewed", handleEventReviewed);
    };
  }, [dispatch, playNotificationSound]);

  const handleQuickReview = async (eventId, decision) => {
    try {
      await dispatch(submitReview({ eventId, decision })).unwrap();
    } catch (err) {
      alert("Review action failed: " + err);
    }
  };

  return (
    <div className="space-y-6 relative select-none">
      {/* Floating Real-Time Proctor Alert Toasts for Teacher */}
      {liveAlerts.length > 0 && (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
          {liveAlerts.map((alert) => (
            <div
              key={alert.id}
              className="pointer-events-auto bg-[#090d18]/95 border-2 border-rose-500/80 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_0_35px_rgba(244,63,94,0.35)] flex flex-col gap-3 animate-slide-in text-white"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{alert.activity.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                      🚨 Live Telemetry Incident Alert
                    </span>
                    <h4 className="text-sm font-bold text-white font-heading">
                      {alert.studentName}{" "}
                      <span className="text-xs font-normal text-slate-400 font-mono">
                        ({alert.studentId || "Student"})
                      </span>
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(removeLiveAlert(alert.id))}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 space-y-1">
                <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 font-mono">
                  <span>Activity:</span>
                  <span>{alert.activity.name}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {alert.activity.reason}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3 text-purple-400" /> {alert.time}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickReview(alert.id, "false_alarm")}
                    className="px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>False Alarm</span>
                  </button>
                  <button
                    onClick={() => handleQuickReview(alert.id, "valid")}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" />
                    <span>Confirm Valid</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-2 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>Human-in-the-Loop Review</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Snapshot Evidence & Student Activity Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Real-time proctoring feed: View student violations with specific reasons and audit flagged frames
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchReviews(filter))}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-purple-400/40 text-slate-300 hover:text-white text-xs font-mono font-medium transition-all cursor-pointer self-start sm:self-auto active:scale-95 shadow-md"
        >
          <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        <Filter className="h-4 w-4 text-purple-400 mr-1 shrink-0" />
        {[
          { id: "all", label: "All Telemetry Events" },
          { id: "pending", label: "Pending Review" },
          { id: "false_alarm", label: "Dismissed False Alarms" },
          { id: "valid", label: "Confirmed Valid Incidents" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch(setFilter(tab.id))}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.id
                ? "bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Evidence Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl">
          <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
          <span className="font-mono text-xs">Loading incident evidence frames...</span>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const act = getActivityDetails(ev.type);

            return (
              <div
                key={ev._id}
                className="bg-slate-950/70 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.18)] flex flex-col group transition-all relative"
              >
                {/* Subtle top laser glow line */}
                <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

                {/* Snapshot Frame */}
                <div
                  onClick={() => dispatch(setSelectedEvent(ev))}
                  className="relative aspect-video bg-slate-950 border-b border-white/[0.08] cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {ev.evidenceUrl ? (
                    <img
                      src={getEvidenceUrl(ev.evidenceUrl)}
                      alt="Proctor evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        if (!e.target.dataset.fallback) {
                          e.target.dataset.fallback = "true";
                          e.target.src = ev.evidenceUrl;
                        }
                      }}
                    />
                  ) : (
                    /* High-tech telemetry card for events like tab-switch */
                    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 flex flex-col items-center justify-center p-4 text-center relative">
                      <div className="h-11 w-11 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(168,85,247,0.2)] mb-2">
                        {act.icon}
                      </div>
                      <p className="text-xs font-bold text-purple-200 font-heading">
                        {act.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 max-w-[210px] line-clamp-1">
                        {act.category} • Client Telemetry Event
                      </p>
                      <div className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/30">
                        Browser Telemetry Trigger
                      </div>
                    </div>
                  )}

                  {/* Activity Name Tag */}
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-200 border border-white/10 flex items-center gap-1.5 shadow-md">
                    <span>{act.icon}</span>
                    <span className="font-semibold text-purple-300 font-mono">{act.shortName}</span>
                  </div>

                  {/* Review Decision Overlay Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase shadow-sm ${
                        ev.reviewDecision === "valid"
                          ? "bg-rose-950/90 text-rose-300 border border-rose-500/40"
                          : ev.reviewDecision === "false_alarm"
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-950/90 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {ev.reviewDecision || "pending"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white font-heading">
                        {ev.studentId?.name || "Student"}
                      </h4>
                      <span className="text-[11px] font-mono text-purple-300">
                        {ev.studentId?.studentId || "No ID"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {ev.examId?.title || "Exam Session"}
                    </p>
                  </div>

                  {/* Explicit Student Activity & Reason Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 font-mono">
                      <span className="flex items-center gap-1.5">
                        <span>{act.icon}</span>
                        <span className="text-purple-300 font-heading">{act.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {ev.severity || "high"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      <strong className="text-slate-400">Reason:</strong> {act.reason}
                    </p>

                    {/* Verdict status explanation */}
                    {ev.reviewDecision === "false_alarm" ? (
                      <div className="pt-1.5 border-t border-white/[0.08] flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>False Alarm: Alert deducted from student warning tally</span>
                      </div>
                    ) : ev.reviewDecision === "valid" ? (
                      <div className="pt-1.5 border-t border-white/[0.08] flex items-center gap-1.5 text-[10px] text-rose-400 font-mono">
                        <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
                        <span>Confirmed Incident: Student exam auto-submitted</span>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-white/[0.08] flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Awaiting Review: Warning active in telemetry log</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-white/[0.08]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-purple-400" />
                      {new Date(ev.occurredAt).toLocaleTimeString()}
                    </span>
                    <span>Confidence: {Math.round((ev.confidence || 1) * 100)}%</span>
                  </div>

                  {/* Instant Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleQuickReview(ev._id, "false_alarm")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                        ev.reviewDecision === "false_alarm"
                          ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
                          : "bg-slate-900/80 text-slate-300 border-white/10 hover:border-emerald-500/40 hover:text-emerald-300"
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>False Alarm</span>
                    </button>

                    <button
                      onClick={() => handleQuickReview(ev._id, "valid")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                        ev.reviewDecision === "valid"
                          ? "bg-rose-950/90 text-rose-300 border-rose-500/50"
                          : "bg-slate-900/80 text-slate-300 border-white/10 hover:border-rose-500/40 hover:text-rose-300"
                      }`}
                    >
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                      <span>Valid Incident</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-dashed border-white/10 text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white font-heading">Review Queue All Clear</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No incidents match the selected filter. Students taking exams will stream flagged frames here in real-time.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <SnapshotModal
          event={selectedEvent}
          onClose={() => dispatch(setSelectedEvent(null))}
          onReviewed={(id, decision) => {
            dispatch(eventReviewed({ eventId: id, decision }));
          }}
        />
      )}
    </div>
  );
};

export default ReviewQueue;
