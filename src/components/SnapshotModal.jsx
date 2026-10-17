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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#090d18]/95 border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] relative">
        {/* Top laser accent line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{act.icon}</span>
            <div>
              <h3 className="font-bold text-white text-base leading-tight font-heading">
                {act.name}
              </h3>
              <p className="text-[11px] text-purple-300/70 font-mono mt-0.5">
                {act.category} • Telemetry Incident Audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Snapshot image container */}
          <div className="rounded-2xl overflow-hidden bg-slate-950 border border-white/10 relative aspect-video flex items-center justify-center">
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
              className={`flex-col items-center justify-center p-8 text-center gap-2.5 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30 ${
                event.evidenceUrl ? "hidden" : "flex"
              }`}
            >
              <div className="h-14 w-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                {act.icon}
              </div>
              <p className="text-sm font-bold text-white font-heading">{act.name}</p>
              <p className="text-xs text-slate-300 max-w-sm">
                {act.reason}
              </p>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/30">
                Deterministic Client Window Event Listener
              </span>
            </div>

            {/* Snapshot badge overlay */}
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-purple-300 border border-white/10 flex items-center gap-1.5 shadow-md">
              <span>{act.icon}</span>
              <span>{act.shortName}</span>
              <span>•</span>
              <span>{event.durationMs ? `${Math.round(event.durationMs / 100) / 10}s` : "Instant"}</span>
            </div>
          </div>

          {/* Student Activity & Specific Reason Explanation Box */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-purple-400" />
              Observed Activity & Telemetry Trigger
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {act.reason}
            </p>
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Event Code: <code className="text-purple-300">{event.type}</code></span>
              <span>Severity: <span className="capitalize text-amber-300 font-semibold">{event.severity || "high"}</span></span>
            </div>
          </div>

          {/* Incident Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Student</span>
              <span className="text-white font-medium">
                {event.studentId?.name || "Student"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Roll / Student ID</span>
              <span className="text-purple-300">
                {event.studentId?.studentId || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Timestamp</span>
              <span className="text-slate-300">
                {new Date(event.occurredAt).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Severity</span>
              <span className="capitalize font-semibold text-amber-300">
                {event.severity}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Model Confidence</span>
              <span className="text-slate-200">
                {Math.round((event.confidence || 1) * 100)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Review Status</span>
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
            <label className="text-xs font-mono font-medium text-slate-300">
              Reviewer Audit Notes (Optional explanation for permanent log):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Student adjusted spectacles / benign camera lighting reflection..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 hidden sm:block leading-tight font-sans">
            <p><strong className="text-emerald-300">False Alarm:</strong> Deducts alert, refunds warning count to student.</p>
            <p><strong className="text-rose-300">Valid Incident:</strong> Confirms violation and terminates student exam.</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              disabled={submitting}
              onClick={() => handleDecision("false_alarm")}
              className="flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
            >
              <Check className="h-4 w-4 text-emerald-400" />
              <span>False Alarm (Refund)</span>
            </button>
            <button
              disabled={submitting}
              onClick={() => handleDecision("valid")}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Confirm Valid Incident</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotModal;
