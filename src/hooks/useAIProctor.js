import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api.js";
import { useTabVisibility } from "./useTabVisibility.js";

export const useAIProctor = ({
  attemptId,
  isCameraActive,
  captureSnapshot,
  settings = {},
  onEventLogged,
}) => {
  const [activeWarnings, setActiveWarnings] = useState([]);
  const [loggedEvents, setLoggedEvents] = useState([]);
  const [currentRiskScore, setCurrentRiskScore] = useState(0);
  const [monitoringStatus, setMonitoringStatus] = useState("initializing");
  const lastEventTimeRef = useRef({});

  // 1. Core Event Dispatcher to Backend
  const reportEvent = useCallback(
    async ({ type, durationMs = 0, confidence = 1.0, severity = "medium", metadata = {} }) => {
      if (!attemptId) return;

      // Throttle client-side if same type fired in last 5 seconds
      const now = Date.now();
      const lastFired = lastEventTimeRef.current[type] || 0;
      if (now - lastFired < 4000) {
        return;
      }
      lastEventTimeRef.current[type] = now;

      try {
        // Capture evidence frame if webcam is running
        let snapshotBase64 = null;
        if (captureSnapshot) {
          snapshotBase64 = captureSnapshot();
        }

        const payload = {
          type,
          durationMs,
          confidence,
          severity,
          metadata,
          snapshotBase64,
          occurredAt: new Date(),
        };

        const { data } = await api.post(`/attempts/${attemptId}/events`, payload);
        if (data?.data) {
          const { event, newRiskScore } = data.data;
          setLoggedEvents((prev) => [event, ...prev]);
          if (newRiskScore !== undefined) {
            setCurrentRiskScore(newRiskScore);
          }
          if (onEventLogged) onEventLogged(event);
        }

        // Add temporary gentle warning in student UI
        addWarning(type);
      } catch (err) {
        console.warn("Telemetry reporting error:", err);
      }
    },
    [attemptId, captureSnapshot, onEventLogged]
  );

  const addWarning = (type) => {
    const warningMap = {
      NO_FACE: "Face not detected in frame. Please reposition towards the camera.",
      MULTIPLE_FACES: "Multiple persons detected in camera view.",
      LOOKING_AWAY: "Please keep your focus centered on the exam screen.",
      PHONE_DETECTED: "Mobile phone or unauthorized device detected in camera frame.",
      TAB_HIDDEN: "Exam tab was minimized or lost focus. Please remain in this window.",
      CAMERA_INTERRUPTED: "Camera stream was disconnected or interrupted.",
    };

    const text = warningMap[type] || `Monitoring notification: ${type}`;
    setActiveWarnings((prev) => [
      { id: Date.now(), text, type, timestamp: new Date() },
      ...prev.slice(0, 4),
    ]);
  };

  // 2. Tab Visibility Listener
  useTabVisibility(
    useCallback(
      ({ durationMs }) => {
        reportEvent({
          type: "TAB_HIDDEN",
          durationMs,
          confidence: 1.0,
          severity: durationMs > 5000 ? "high" : "medium",
          metadata: { reason: "window_focus_lost", durationSeconds: Math.round(durationMs / 1000) },
        });
      },
      [reportEvent]
    )
  );

  // 3. Periodic Telemetry Heartbeat / Computer Vision Check
  useEffect(() => {
    if (!isCameraActive) {
      setMonitoringStatus("camera_pending");
      return;
    }

    setMonitoringStatus("active");

    // Periodic gentle telemetry check every 15s to keep attempt state synced
    const interval = setInterval(() => {
      // Normal continuous monitoring state
    }, 15000);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  return {
    monitoringStatus,
    activeWarnings,
    loggedEvents,
    currentRiskScore,
    reportEvent,
  };
};
