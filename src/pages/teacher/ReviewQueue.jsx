import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { getSocket } from "../../services/socket.js";
import { SnapshotModal } from "../../components/SnapshotModal.jsx";
import { getEvidenceUrl } from "../../utils/imageUrl.js";
import {
  Eye,
  CheckCircle,
  AlertOctagon,
  Filter,
  Camera,
  RefreshCw,
  Video,
  Clock,
  Sparkles,
} from "lucide-react";

export const ReviewQueue = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'valid', 'false_alarm'
  const [selectedEvent, setSelectedEvent] = useState(null);

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

    socket.on("event:flagged", (payload) => {
      console.log("Teacher Live Socket: event flagged", payload);
      fetchReviews();
    });

    socket.on("event:reviewed", (payload) => {
      console.log("Teacher Live Socket: event reviewed", payload);
      fetchReviews();
    });

    return () => {
      socket.off("event:flagged");
      socket.off("event:reviewed");
    };
  }, [filter]);

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
    } catch (err) {
      alert("Review action failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Video className="h-6 w-6 text-indigo-400" />
            Snapshot Evidence Review Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse on-device proctoring frames stored in the video archive (
            <code className="text-indigo-300">/video/:studentId/allvideo/</code>)
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
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Filter className="h-4 w-4 text-slate-500 mr-1" />
        {[
          { id: "all", label: "All Telemetry Events" },
          { id: "pending", label: "Pending Review" },
          { id: "false_alarm", label: "Dismissed False Alarms" },
          { id: "valid", label: "Confirmed Valid" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
          {events.map((ev) => (
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
                  <div className="text-center p-4 text-slate-600 space-y-1">
                    <Camera className="h-8 w-8 mx-auto opacity-40" />
                    <p className="text-[11px]">No camera snapshot captured</p>
                  </div>
                )}

                {/* Event Type & Confidence Tag */}
                <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-indigo-300 border border-slate-800">
                  {ev.type}
                </div>

                {/* Review Decision Overlay Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
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
                    <span className="text-[11px] font-mono text-slate-500">
                      {ev.studentId?.studentId || "No ID"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {ev.examId?.title || "Exam Session"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(ev.occurredAt).toLocaleTimeString()}
                  </span>
                  <span>Confidence: {Math.round((ev.confidence || 1) * 100)}%</span>
                </div>

                {/* Instant Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleQuickReview(ev._id, "false_alarm")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
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
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
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
          ))}
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
