import React, { useState } from "react";
import { X, Check, AlertOctagon, User, Clock, ShieldAlert, Sparkles } from "lucide-react";
import api from "../services/api.js";
import { getEvidenceUrl } from "../utils/imageUrl.js";
import { getActivityDetails } from "../utils/activityDetails.js";

export const SnapshotModal = ({ event, onClose, onReviewed }) => {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  if (!event) return null;

  const act = getActivityDetails(event.type);

  const handleDecision = async (decision) => {
    try {
      setSubmitting(true);
      await api.post(`/events/${event._id}/reviews`, {
        decision,
        notes,
      });
      if (onReviewed) onReviewed(event._id, decision);
      onClose();
    } catch (err) {
      alert("Failed to record review decision: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{act.icon}</span>
            <div>
              <h3 className="font-semibold text-white text-base leading-tight">
                {act.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {act.category} • Telemetry Incident Review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Snapshot image container */}
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative aspect-video flex items-center justify-center">
            {event.evidenceUrl ? (
              <img
                src={getEvidenceUrl(event.evidenceUrl)}
                alt="Proctor incident snapshot"
                className="w-full h-full object-contain"
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = "true";
                    e.target.src = event.evidenceUrl;
                  } else {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}

            {/* High-tech fallback if no webcam frame captured (e.g. tab switch) */}
            <div
              className={`flex-col items-center justify-center p-8 text-center gap-2.5 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 ${
                event.evidenceUrl ? "hidden" : "flex"
              }`}
            >
              <div className="h-14 w-14 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-3xl shadow-inner">
                {act.icon}
              </div>
              <p className="text-sm font-semibold text-white">{act.name}</p>
              <p className="text-xs text-slate-400 max-w-sm">
                {act.reason}
              </p>
              <span className="text-[10px] font-mono text-indigo-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                Deterministic Browser Event Listener
              </span>
            </div>

            {/* Snapshot badge overlay */}
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-indigo-300 border border-slate-800 flex items-center gap-1.5">
              <span>{act.icon}</span>
              <span>{act.shortName}</span>
              <span>•</span>
              <span>{event.durationMs ? `${Math.round(event.durationMs / 100) / 10}s` : "Instant"}</span>
            </div>
          </div>

          {/* Student Activity & Specific Reason Explanation Box */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              Observed Activity & Reasoning
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {act.reason}
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Event Code: <code className="text-indigo-300">{event.type}</code></span>
              <span>Severity: <span className="capitalize text-amber-300 font-semibold">{event.severity || "high"}</span></span>
            </div>
          </div>

          {/* Incident Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
            <div>
              <span className="text-slate-500 block">Student</span>
              <span className="text-slate-200 font-medium">
                {event.studentId?.name || "Student"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Roll / Student ID</span>
              <span className="text-slate-200 font-mono">
                {event.studentId?.studentId || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Timestamp</span>
              <span className="text-slate-200">
                {new Date(event.occurredAt).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Severity</span>
              <span className="capitalize font-medium text-amber-300">
                {event.severity}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Model Confidence</span>
              <span className="text-slate-200 font-mono">
                {Math.round((event.confidence || 1) * 100)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Status</span>
              <span className={`capitalize font-semibold ${
                event.reviewDecision === "valid"
                  ? "text-rose-400"
                  : event.reviewDecision === "false_alarm"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}>
                {event.reviewDecision || "pending"}
              </span>
            </div>
          </div>

          {/* Teacher Reviewer Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Reviewer Notes (Optional explanation for audit log):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Student adjusted spectacles / benign camera reflection..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 hidden sm:block leading-tight">
            <p><strong>False Alarm:</strong> Deducts alert, refunds warning count to student.</p>
            <p><strong>Valid Incident:</strong> Confirms violation and terminates student exam.</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              disabled={submitting}
              onClick={() => handleDecision("false_alarm")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="h-4 w-4 text-emerald-400" />
              False Alarm (Refund Alert)
            </button>
            <button
              disabled={submitting}
              onClick={() => handleDecision("valid")}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <AlertOctagon className="h-4 w-4" />
              Confirm Valid Incident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
