import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  Lock,
  Cpu,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Sheryians Hackathon 2026 • AI Proctoring Platform
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Smarter Exams. Fairer Monitoring. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Privacy by Design.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
          ProctorVision runs real-time computer vision monitoring locally in the
          student's browser. No continuous video is uploaded to remote servers.
          Teachers review explainable indicators with human-in-the-loop fairness.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Launch Platform Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-3.5 rounded-xl transition-all"
          >
            Create Free Account
          </Link>
        </div>

        {/* Key Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              On-Device AI Inference
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              MediaPipe Face Landmarker & Phone detection run locally in the browser tab.
              Telemetry metadata only; raw webcam streams never leave the machine.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center mb-4">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Explainable Risk & Evidence
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Teachers inspect timestamped incident frames in the Video Archive.
              One-click False Alarm resolution instantly updates calibrated risk scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Human-in-the-Loop Ethics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI flags are assistive indicators, never automated verdicts. Academic
              integrity is safeguarded while protecting students from biased false positives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
