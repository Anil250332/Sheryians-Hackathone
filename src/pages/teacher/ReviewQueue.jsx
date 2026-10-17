import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api.js";
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
  Bell,
  X,
  Volume2,
} from "lucide-react";

export const ReviewQueue = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'valid', 'false_alarm'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]); // Real-time floating alert toasts for teacher

  // Play a gentle alert sound when student triggers an activity
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teacher/reviews?status=${filter}`);
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Failed to load review events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join:teacher");

    const handleEventFlagged = (payload) => {
      console.log("Teacher Live Socket: event flagged", payload);
      playNotificationSound();

      const flaggedEvent = payload.event || {};
      const act = getActivityDetails(flaggedEvent.type);

      const alertToast = {
        id: flaggedEvent._id || Date.now().toString(),
        studentName: flaggedEvent.studentId?.name || "Student",
        studentId: flaggedEvent.studentId?.studentId || "",
        examTitle: flaggedEvent.examId?.title || "Exam Session",
        activity: act,
        type: flaggedEvent.type,
        time: new Date().toLocaleTimeString(),
        rawEvent: flaggedEvent,
      };

      setLiveAlerts((prev) => [alertToast, ...prev.slice(0, 4)]);
      fetchReviews();
    };

    const handleEventReviewed = (payload) => {
      console.log("Teacher Live Socket: event reviewed", payload);
      fetchReviews();
    };

    socket.on("event:flagged", handleEventFlagged);
    socket.on("event:reviewed", handleEventReviewed);

    return () => {
      socket.off("event:flagged", handleEventFlagged);
      socket.off("event:reviewed", handleEventReviewed);
    };
  }, [filter, playNotificationSound]);

  const handleQuickReview = async (eventId, decision) => {
    try {
      await api.post(`/events/${eventId}/reviews`, { decision });
      // Optimistic local update
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, isReviewed: true, reviewDecision: decision }
            : ev
        )
      );

      // Dismiss live alert if present
      setLiveAlerts((prev) => prev.filter((a) => a.id !== eventId));
    } catch (err) {
      alert("Review action failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Real-Time Proctor Alert Toasts for Teacher */}
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
                  onClick={() =>
                    setLiveAlerts((prev) => prev.filter((a) => a.id !== alert.id))
                  }
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
                    Valid (Auto-Submit)
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
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Video className="h-6 w-6 text-indigo-400" />
            Snapshot Evidence & Student Activity Review
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time proctoring feed: View student violations with specific reasons (Tab Switch, Mobile Phone, Multiple Faces) and verify false alarms.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <Filter className="h-4 w-4 text-slate-500 mr-1 shrink-0" />
        {[
          { id: "all", label: "All Telemetry Events" },
          { id: "pending", label: "Pending Review" },
          { id: "false_alarm", label: "Dismissed False Alarms" },
          { id: "valid", label: "Confirmed Valid Incidents" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Evidence Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
          Loading evidence records...
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => {
            const act = getActivityDetails(ev.type);

            return (
              <div
                key={ev._id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-indigo-500/40 transition-all"
              >
                {/* Snapshot Frame */}
                <div
                  onClick={() => setSelectedEvent(ev)}
                  className="relative aspect-video bg-slate-950 border-b border-slate-800 cursor-pointer overflow-hidden flex items-center justify-center"
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
                    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex flex-col items-center justify-center p-4 text-center relative">
                      <div className="h-11 w-11 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-2xl shadow-inner mb-2">
                        {act.icon}
                      </div>
                      <p className="text-xs font-semibold text-indigo-200">
                        {act.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 max-w-[210px] line-clamp-1">
                        {act.category} • Client Telemetry Event
                      </p>
                      <div className="mt-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-slate-950/80 text-indigo-300 border border-slate-800">
                        Deterministic browser trigger
                      </div>
                    </div>
                  )}

                  {/* Activity Name Tag */}
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-200 border border-slate-800 flex items-center gap-1.5 shadow-sm">
                    <span>{act.icon}</span>
                    <span className="font-semibold text-indigo-300">{act.shortName}</span>
                  </div>

                  {/* Review Decision Overlay Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                        ev.reviewDecision === "valid"
                          ? "bg-rose-950/90 text-rose-300 border border-rose-700"
                          : ev.reviewDecision === "false_alarm"
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-700"
                          : "bg-amber-950/90 text-amber-300 border border-amber-700"
                      }`}
                    >
                      {ev.reviewDecision || "pending"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        {ev.studentId?.name || "Student"}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {ev.studentId?.studentId || "No ID"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {ev.examId?.title || "Exam Session"}
                    </p>
                  </div>

                  {/* Explicit Student Activity & Reason Box */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span>{act.icon}</span>
                        <span className="text-indigo-300">{act.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {ev.severity || "high"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-slate-400">Reason:</strong> {act.reason}
                    </p>

                    {/* Verdict status explanation */}
                    {ev.reviewDecision === "false_alarm" ? (
                      <div className="pt-1 border-t border-slate-900 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>False Alarm: Alert deducted from student warning tally</span>
                      </div>
                    ) : ev.reviewDecision === "valid" ? (
                      <div className="pt-1 border-t border-slate-900 flex items-center gap-1.5 text-[10px] text-rose-400 font-medium">
                        <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
                        <span>Confirmed Incident: Student exam auto-submitted</span>
                      </div>
                    ) : (
                      <div className="pt-1 border-t border-slate-900 flex items-center gap-1.5 text-[10px] text-amber-400 font-medium">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Awaiting Review: Warning currently penalizes student</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ev.occurredAt).toLocaleTimeString()}
                    </span>
                    <span>Confidence: {Math.round((ev.confidence || 1) * 100)}%</span>
                  </div>

                  {/* Instant Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleQuickReview(ev._id, "false_alarm")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        ev.reviewDecision === "false_alarm"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-700 hover:text-emerald-300"
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      False Alarm
                    </button>

                    <button
                      onClick={() => handleQuickReview(ev._id, "valid")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        ev.reviewDecision === "valid"
                          ? "bg-rose-950 text-rose-300 border-rose-700"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-rose-700 hover:text-rose-300"
                      }`}
                    >
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                      Valid Incident
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
          <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">Review Queue Clear</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No events match the selected filter. Students taking exams will stream
            flagged frames here in real-time.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <SnapshotModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onReviewed={(id, decision) => {
            setEvents((prev) =>
              prev.map((e) =>
                e._id === id ? { ...e, isReviewed: true, reviewDecision: decision } : e
              )
            );
          }}
        />
      )}
    </div>
  );
};
