import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { Sliders, Save, CheckCircle, Shield, RefreshCw, Sparkles, Activity } from "lucide-react";

export const MonitoringSettings = () => {
  const [settings, setSettings] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/teacher/monitoring-settings");
      setSettings(res.data.data.settings);
      setAnalytics(res.data.data.analytics);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch("/teacher/monitoring-settings", settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save settings: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl">
        <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
        <span className="font-mono text-xs">Loading AI monitoring configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-2 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Rule Calibration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
          AI Telemetry & False-Alarm Calibration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
          Calibrate detection sensitivity, cooldown periods, and violation threshold parameters
        </p>
      </div>

      {/* Analytics KPI banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle top laser glow line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Total Telemetry Flags</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-1 block">{analytics?.totalEvents || 0}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Events Reviewed</span>
          <span className="text-2xl font-extrabold text-purple-300 font-mono mt-1 block">{analytics?.reviewedEvents || 0}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">False Alarms Resolved</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">{analytics?.falseAlarms || 0}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">False Alarm Rate</span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono mt-1 block">{analytics?.falseAlarmRate || 0}%</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Settings updated successfully! Active examinations will automatically use these calibrated thresholds.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle top laser glow line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <Activity className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white font-heading">
            Detection Persistence Thresholds (Seconds)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* No Face threshold */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-200 font-medium">No-Face Trigger Duration</span>
              <span className="font-mono text-purple-300 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[11px] font-bold">
                {settings.noFaceThresholdSec}s
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              value={settings.noFaceThresholdSec}
              onChange={(e) =>
                setSettings({ ...settings, noFaceThresholdSec: Number(e.target.value) })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Flags only if no face is detected continuously for this period.
            </p>
          </div>

          {/* Looking Away threshold */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-200 font-medium">Looking-Away Duration</span>
              <span className="font-mono text-purple-300 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[11px] font-bold">
                {settings.lookingAwayThresholdSec}s
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              value={settings.lookingAwayThresholdSec}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  lookingAwayThresholdSec: Number(e.target.value),
                })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Gaze deviation sustained before recording a potential flag.
            </p>
          </div>

          {/* Multiple Faces threshold */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-200 font-medium">Multiple-Faces Trigger</span>
              <span className="font-mono text-purple-300 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[11px] font-bold">
                {settings.multipleFacesThresholdSec}s
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={settings.multipleFacesThresholdSec}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  multipleFacesThresholdSec: Number(e.target.value),
                })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Duration of secondary faces in view before flagging.
            </p>
          </div>

          {/* Phone Detection Confidence */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-200 font-medium">Phone Confidence Threshold</span>
              <span className="font-mono text-purple-300 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[11px] font-bold">
                {Math.round(settings.phoneConfidenceThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={0.9}
              step={0.05}
              value={settings.phoneConfidenceThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  phoneConfidenceThreshold: Number(e.target.value),
                })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Minimum AI probability required before flagging a mobile device.
            </p>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="pt-4 border-t border-white/[0.08] space-y-3">
          <h3 className="text-sm font-bold text-white font-heading">Privacy & Evidence Collection</h3>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs text-slate-200 cursor-pointer hover:border-purple-500/30 transition-colors">
              <input
                type="checkbox"
                checked={settings.enableSnapshots}
                onChange={(e) =>
                  setSettings({ ...settings, enableSnapshots: e.target.checked })
                }
                className="rounded border-slate-700 text-purple-600 focus:ring-0 accent-purple-500"
              />
              <div>
                <span className="font-semibold block text-white font-heading">
                  Store Incident Snapshot Evidence (/video/:studentId/allvideo/)
                </span>
                <span className="text-[11px] text-slate-400">
                  Captures a single photographic frame only when a potential anomaly is triggered.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 ml-auto px-6 py-2.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-400 hover:to-violet-400 text-white font-bold rounded-full text-xs shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] cursor-pointer transition-all disabled:opacity-50 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Tuning Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MonitoringSettings;
