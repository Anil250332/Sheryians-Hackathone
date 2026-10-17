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
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2 border-b border-slate-800 pb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-1">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Proctoring & Privacy Consent
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            ProctorVision is committed to student dignity and transparent, privacy-first monitoring.
          </p>
        </div>

        {/* Privacy Guarantees */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">
                Local Computer Vision Processing
              </span>
              <p className="text-slate-400 mt-0.5">
                Facial landmarks and gaze calculations run on your device. Video frames are not continuously sent over the internet.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
            <EyeOff className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">
                No Audio or Microphone Surveillance
              </span>
              <p className="text-slate-400 mt-0.5">
                Microphone access is never requested or recorded by default.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
            <Video className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">
                Incident Snapshot Archiving Only
              </span>
              <p className="text-slate-400 mt-0.5">
                Still snapshot frames are archived exclusively when an anomaly (e.g. secondary person) occurs, so the teacher can review for false alarms.
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox Agreements */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-3 text-xs">
          <label className="flex items-start gap-2.5 text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0 mt-0.5"
            />
            <span>
              I understand that my exam will be monitored by on-device computer vision and I agree to the telemetry recording terms.
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedWebcam}
              onChange={(e) => setAcceptedWebcam(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0 mt-0.5"
            />
            <span>
              I agree to grant temporary webcam permissions to enable centering and incident snapshot verification.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => navigate(`/student/exams/${examId}/instructions`)}
            className="text-xs text-slate-400 hover:text-white"
          >
            &larr; Back to Instructions
          </button>

          <button
            disabled={!acceptedPolicy || !acceptedWebcam || loading}
            onClick={handleStartExam}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40"
          >
            {loading ? "Starting Session..." : "Begin Monitored Exam"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
