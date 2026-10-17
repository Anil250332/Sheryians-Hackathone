import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { Sliders, Save, CheckCircle, Shield, RefreshCw } from "lucide-react";

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
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
        Loading AI monitoring configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="h-6 w-6 text-indigo-400" />
          AI Monitoring & False-Alarm Tuning
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Calibrate detection sensitivity, cooldown periods, and inspection thresholds
        </p>
      </div>

      {/* Analytics KPI banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div>
          <span className="text-[11px] text-slate-500 block">Total Telemetry Flags</span>
          <span className="text-xl font-bold text-white">{analytics?.totalEvents || 0}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Events Reviewed</span>
          <span className="text-xl font-bold text-indigo-300">{analytics?.reviewedEvents || 0}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">False Alarms Resolved</span>
          <span className="text-xl font-bold text-emerald-400">{analytics?.falseAlarms || 0}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">False Alarm Rate</span>
          <span className="text-xl font-bold text-amber-300">{analytics?.falseAlarmRate || 0}%</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Settings updated successfully! Active examinations will use these calibrated thresholds.
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
          Detection Persistence Thresholds (Seconds)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* No Face threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">No-Face Trigger Duration</span>
              <span className="font-mono text-indigo-400">{settings.noFaceThresholdSec}s</span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              value={settings.noFaceThresholdSec}
              onChange={(e) =>
                setSettings({ ...settings, noFaceThresholdSec: Number(e.target.value) })
              }
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Flags only if no face is detected continuously for this period.
            </p>
          </div>

          {/* Looking Away threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Looking-Away Duration</span>
              <span className="font-mono text-indigo-400">{settings.lookingAwayThresholdSec}s</span>
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
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Gaze deviation sustained before recording a potential flag.
            </p>
          </div>

          {/* Multiple Faces threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Multiple-Faces Trigger</span>
              <span className="font-mono text-indigo-400">{settings.multipleFacesThresholdSec}s</span>
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
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Duration of secondary faces in view before flagging.
            </p>
          </div>

          {/* Phone Detection Confidence */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Phone Confidence Threshold</span>
              <span className="font-mono text-indigo-400">
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
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Minimum AI probability required before flagging a mobile device.
            </p>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-white">Privacy & Evidence Collection</h3>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSnapshots}
                onChange={(e) =>
                  setSettings({ ...settings, enableSnapshots: e.target.checked })
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <div>
                <span className="font-medium block">
                  Store Incident Snapshot Evidence (/video/:studentId/allvideo/)
                </span>
                <span className="text-[11px] text-slate-500">
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
            className="flex items-center gap-2 ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Tuning Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
};
