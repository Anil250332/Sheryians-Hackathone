import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import {
  Lock,
  ShieldCheck,
  Check,
  ArrowRight,
  EyeOff,
  Video,
  FileCheck,
} from "lucide-react";

export const ExamConsent = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [acceptedWebcam, setAcceptedWebcam] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartExam = async () => {
    if (!acceptedPolicy || !acceptedWebcam) {
      alert("Please accept the monitoring and privacy terms to continue.");
      return;
    }

    try {
      setLoading(true);

      // 1. Record formal consent in backend
      await api.post(`/exams/${examId}/consent`, {
        accepted: true,
        policyVersion: "1.0.0",
        monitoringOptions: {
          faceMonitoring: true,
          phoneDetection: true,
          tabMonitoring: true,
          snapshots: true,
        },
      });

      // 2. Start official attempt in backend (calculates official server-side deadline)
      const res = await api.post(`/exams/${examId}/start`);
      const attemptId = res.data.data.attempt._id;

      navigate(`/student/attempts/${attemptId}`);
    } catch (err) {
      alert(
        "Could not initiate exam session: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none">
      <div className="bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle top laser glow line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

        <div className="text-center space-y-2 border-b border-white/[0.08] pb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-950/80 text-purple-400 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] mb-1">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Proctoring & Privacy Consent
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            ProctorVision is committed to student dignity and transparent, on-device privacy-first monitoring.
          </p>
        </div>

        {/* Privacy Guarantees */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start gap-3 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block font-heading">
                Local On-Device Computer Vision
              </span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Facial landmarks and gaze calculations run on your device. Video frames are not continuously sent over the internet.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start gap-3 text-xs">
            <EyeOff className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block font-heading">
                Zero Audio or Microphone Surveillance
              </span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Microphone access is never requested or recorded by default, respecting your environment.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start gap-3 text-xs">
            <Video className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block font-heading">
                Evidence Archiving Exclusively On-Anomaly
              </span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Still snapshot frames are archived exclusively when an anomaly (e.g. secondary person) occurs, so the teacher can review for false alarms.
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox Agreements */}
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3 text-xs">
          <label className="flex items-start gap-3 text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              className="rounded border-slate-700 text-purple-600 focus:ring-0 accent-purple-500 mt-0.5 cursor-pointer"
            />
            <span className="leading-relaxed">
              I understand that my exam will be monitored by on-device computer vision and I agree to the telemetry recording terms.
            </span>
          </label>

          <label className="flex items-start gap-3 text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedWebcam}
              onChange={(e) => setAcceptedWebcam(e.target.checked)}
              className="rounded border-slate-700 text-purple-600 focus:ring-0 accent-purple-500 mt-0.5 cursor-pointer"
            />
            <span className="leading-relaxed">
              I agree to grant temporary webcam permissions to enable centering and incident snapshot verification.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => navigate(`/student/exams/${examId}/instructions`)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back to Instructions
          </button>

          <button
            disabled={!acceptedPolicy || !acceptedWebcam || loading}
            onClick={handleStartExam}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-400 hover:to-violet-400 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] transition-all cursor-pointer disabled:opacity-40 active:scale-95"
          >
            <span>{loading ? "Starting Monitored Session..." : "Begin Monitored Exam"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamConsent;
