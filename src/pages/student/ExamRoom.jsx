import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { getSocket } from "../../services/socket.js";
import { useCameraStream } from "../../hooks/useCameraStream.js";
import { useTabVisibility } from "../../hooks/useTabVisibility.js";
import { initAIVisionModel, analyzeWebcamFrame } from "../../services/aiVision.service.js";
import { getActivityDetails } from "../../utils/activityDetails.js";
import confetti from "canvas-confetti";
import {
  Clock,
  Camera,
  CameraOff,
  AlertTriangle,
  CheckCircle2,
  Send,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Lock,
  AlertOctagon,
  Eye,
  X,
} from "lucide-react";

export const ExamRoom = () => {
  const { id: attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [exam, setExam] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // map questionId -> selectedOptionIndex
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3-Alert Violation System State
  const [violationCount, setViolationCount] = useState(() => {
    const saved = sessionStorage.getItem(`exam_violations_${attemptId}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const violationCountRef = useRef(violationCount);
  const [activeAlert, setActiveAlert] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(null);
  const [teacherVerdictToast, setTeacherVerdictToast] = useState(null);
  const lastViolationTimeRef = useRef(0);

  // Keep ref synchronized
  useEffect(() => {
    violationCountRef.current = violationCount;
  }, [violationCount]);

  // Dual-tone urgent security chime via Web Audio API
  const playAlertSound = useCallback((isFinal = false) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = isFinal ? "sawtooth" : "square";
      osc.frequency.setValueAtTime(isFinal ? 880 : 587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(isFinal ? 440 : 880, audioCtx.currentTime + 0.15);
      osc.frequency.setValueAtTime(isFinal ? 987 : 587.33, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, []);

  // 1. Camera Stream hook
  const {
    videoRef,
    isCameraActive,
    cameraError,
    startCamera,
    captureSnapshot,
  } = useCameraStream(true);

  const getAlertMessage = (type) => {
    switch (type) {
      case "TAB_HIDDEN":
        return "You have navigated away, minimized, or switched windows! Leaving the exam screen is strictly prohibited.";
      case "PHONE_DETECTED":
        return "Potential mobile phone or unauthorized electronic device detected in camera frame!";
      case "LOOKING_AWAY":
        return "Prolonged gaze deviation detected! Please keep your attention focused on the exam screen.";
      case "MULTIPLE_FACES":
        return "Multiple individuals detected in webcam view! Secondary persons are not permitted.";
      case "NO_FACE":
        return "Face not visible in camera frame! Please remain seated directly facing your webcam.";
      case "CAMERA_INTERRUPTED":
        return "Webcam feed obstructed, blacked out, or disconnected!";
      case "KEY_RESTRICTION":
        return "Unauthorized keyboard shortcut (Copy/Paste/Shortcut) detected and blocked!";
      case "PROHIBITED_ACTION":
        return "Prohibited browser action or inspection tool detected!";
      default:
        return "Unauthorized activity detected! Incident snapshot has been archived for proctor verification.";
    }
  };

  // 2. Core Violation Handler with strict 3-Alert auto-submit enforcement
  const handleTriggerViolation = useCallback(
    async ({ type, message = "", confidence = 1.0, severity = "high" }) => {
      if (isLocked) return;

      const now = Date.now();
      // Debounce rapid events by 2.5 seconds
      if (now - lastViolationTimeRef.current < 2500) {
        return;
      }
      lastViolationTimeRef.current = now;

      // 1. Immediately capture snapshot evidence from live webcam or telemetry canvas
      const snapshot = captureSnapshot ? captureSnapshot(type) : null;

      // 2. Increment violation count
      const nextCount = violationCountRef.current + 1;
      violationCountRef.current = nextCount;
      setViolationCount(nextCount);
      sessionStorage.setItem(`exam_violations_${attemptId}`, nextCount.toString());

      // 3. Audio alarm sound
      playAlertSound(nextCount >= 3);

      const alertMsg = message || getAlertMessage(type);

      // 4. Instantly show prominent Alert Modal
      setActiveAlert({
        violationNumber: nextCount,
        maxViolations: 3,
        type,
        message: alertMsg,
        snapshot,
        isFinal: nextCount >= 3,
        timestamp: new Date(),
      });

      // 5. Asynchronously log telemetry event and snapshot to backend video archive
      try {
        api.post(`/attempts/${attemptId}/events`, {
          type,
          durationMs: 1200,
          confidence,
          severity: nextCount >= 3 ? "critical" : severity,
          snapshotBase64: snapshot,
          metadata: {
            violationNumber: nextCount,
            isAutoSubmitTrigger: nextCount >= 3,
          },
        }).catch((err) => console.warn("Telemetry log failed:", err));
      } catch (err) {
        console.warn("Event dispatch error:", err);
      }

      // 6. Enforce 3-alert limit: Lock exam and begin auto-submit countdown
      if (nextCount >= 3) {
        setIsLocked(true);
        setAutoSubmitCountdown(3);
      }
    },
    [attemptId, captureSnapshot, isLocked, playAlertSound]
  );

  // 3. Automated Tab Visibility & Window Blur & Shortcut Monitoring
  useTabVisibility(
    useCallback(
      (violation) => {
        handleTriggerViolation(violation);
      },
      [handleTriggerViolation]
    )
  );

  // Pre-load on-device AI vision model
  useEffect(() => {
    initAIVisionModel();
  }, []);

  // 4. On-Device AI Computer Vision Loop (Auto-detects Multiple Persons, Phones, and Absence)
  useEffect(() => {
    if (!isCameraActive || isLocked) return;

    let consecutiveAbsenceCount = 0;
    let isAnalyzing = false;

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isAnalyzing) return;

      try {
        isAnalyzing = true;
        const analysis = await analyzeWebcamFrame(videoRef.current);

        if (!analysis || analysis.status === "video_not_ready") return;

        // 1. Automatic Multiple Persons / Students Detected
        if (analysis.hasMultipleFaces || analysis.personCount >= 2) {
          handleTriggerViolation({
            type: "MULTIPLE_FACES",
            confidence: 0.94,
            severity: "high",
            message: "Multiple individuals detected in webcam frame! Secondary persons are strictly prohibited.",
          });
          return;
        }

        // 2. Automatic Mobile Phone / Device Detected
        if (analysis.hasPhone) {
          handleTriggerViolation({
            type: "PHONE_DETECTED",
            confidence: 0.91,
            severity: "high",
            message: "Mobile phone or unauthorized electronic device detected in camera frame!",
          });
          return;
        }

        // 3. Camera Covered / Obscured / Pitch Black
        if (analysis.isCameraCovered) {
          handleTriggerViolation({
            type: "CAMERA_INTERRUPTED",
            confidence: 0.95,
            severity: "high",
            message: "Webcam lens appears covered, pitch black, or blocked! Maintain full lighting and visibility.",
          });
          return;
        }

        // 4. No Face / Student Stepped Away (Requires 2 consecutive frame checks to prevent blink false alarms)
        if (analysis.hasNoFace || (analysis.modelReady && analysis.personCount === 0)) {
          consecutiveAbsenceCount++;
          if (consecutiveAbsenceCount >= 2) {
            handleTriggerViolation({
              type: "NO_FACE",
              confidence: 0.96,
              severity: "high",
              message: "Face not detected in camera frame! Please remain seated facing your webcam.",
            });
            consecutiveAbsenceCount = 0;
          }
        } else {
          consecutiveAbsenceCount = 0;
        }
      } catch (err) {
        console.warn("AI frame inference warning:", err);
      } finally {
        isAnalyzing = false;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isCameraActive, isLocked, handleTriggerViolation]);

  // 5. Auto-submit Countdown Clock on 3rd Violation
  useEffect(() => {
    if (autoSubmitCountdown === null) return;

    if (autoSubmitCountdown <= 0) {
      handleAutoSubmit("violation_limit_exceeded");
      return;
    }

    const timer = setTimeout(() => {
      setAutoSubmitCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoSubmitCountdown]);

  // 5b. Socket.IO: Live sync with Teacher Review Queue (Accept/Reject Alarm in real-time)
  useEffect(() => {
    if (!attemptId) return;

    const socket = getSocket();
    socket.emit("join:attempt", attemptId);

    const handleEventReviewed = (data) => {
      console.log("Student live socket: teacher reviewed event", data);

      if (data.decision === "false_alarm") {
        // Teacher marked alert as FALSE ALARM! (Alarm dismissed / NOT counted)
        // If student had 1 warning, it drops back to 0, so student still has 3 warnings remaining!
        const newCount = Math.max(0, violationCountRef.current - 1);
        violationCountRef.current = newCount;
        setViolationCount(newCount);
        sessionStorage.setItem(`exam_violations_${attemptId}`, newCount.toString());

        // Cancel lock and auto-submit countdown if active!
        setIsLocked(false);
        setAutoSubmitCountdown(null);
        setActiveAlert(null);

        setTeacherVerdictToast({
          type: "false_alarm",
          title: "Alert Cleared by Teacher (False Alarm)",
          message: `The invigilator marked this alert as a False Alarm. It will NOT be counted! You have ${3 - newCount} warnings remaining.`,
          count: newCount,
          timestamp: Date.now(),
        });
      } else if (data.decision === "valid" || data.forceSubmitted) {
        // Teacher marked alert as VALID INCIDENT!
        // User requirement: "ajb teacher kisis student ko valid invidence krta h to us student ka test turan apne aap se submit ho jaye"
        console.warn("Teacher verified valid violation - Auto-submitting student exam immediately!");
        setIsLocked(true);
        setActiveAlert(null);
        setAutoSubmitCountdown(null);
        handleAutoSubmit("teacher_confirmed_violation");
      }
    };

    const handleForceSubmit = (payload) => {
      console.warn("Student received force submit from teacher:", payload);
      setIsLocked(true);
      setActiveAlert(null);
      setAutoSubmitCountdown(null);
      handleAutoSubmit(payload.reason || "teacher_confirmed_violation");
    };

    socket.on("event:reviewed", handleEventReviewed);
    socket.on("attempt:force_submit", handleForceSubmit);

    return () => {
      socket.off("event:reviewed", handleEventReviewed);
      socket.off("attempt:force_submit", handleForceSubmit);
    };
  }, [attemptId]);

  // Auto-dismiss verdict toast after 8 seconds
  useEffect(() => {
    if (!teacherVerdictToast) return;
    const timer = setTimeout(() => {
      setTeacherVerdictToast(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [teacherVerdictToast]);

  // 6. Fetch Attempt & Initialize state
  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/attempts/${attemptId}`);
        const { attempt: att, exam: ex, remainingSeconds } = res.data.data;

        if (att.status === "submitted" || att.status === "auto_submitted") {
          navigate(`/student/results?attemptId=${att._id}`);
          return;
        }

        setAttempt(att);
        setExam(ex);
        setSecondsRemaining(remainingSeconds);

        // Populate existing answers
        const existingAnswers = {};
        att.answers?.forEach((a) => {
          existingAnswers[a.questionId] = a.selectedOptionIndex;
        });
        setAnswers(existingAnswers);
      } catch (err) {
        alert("Failed to load active exam session: " + (err.response?.data?.message || err.message));
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptData();
  }, [attemptId, navigate]);

  // 7. Server-controlled Countdown Timer
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0 || isLocked) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit("time_expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isLocked]);

  // 8. Select & Auto-save Answer
  const handleSelectOption = async (optionIndex) => {
    if (isLocked) return;

    const currentQ = exam.questions[currentQIndex];
    const newAnswers = { ...answers, [currentQ._id]: optionIndex };
    setAnswers(newAnswers);

    try {
      setSavingAnswer(true);
      await api.put(`/attempts/${attemptId}/answers/${currentQ._id}`, {
        selectedOptionIndex: optionIndex,
      });
    } catch (err) {
      console.warn("Failed to save answer:", err);
    } finally {
      setSavingAnswer(false);
    }
  };

  // 9. Submit Handlers
  const handleSubmitExam = async () => {
    try {
      setSubmitting(true);
      await api.post(`/attempts/${attemptId}/submit`, { autoSubmitted: false });
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      navigate(`/student/results?attemptId=${attemptId}`);
    } catch (err) {
      alert("Submission error: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async (reason = "violation_limit_exceeded") => {
    try {
      setSubmitting(true);
      await api.post(`/attempts/${attemptId}/submit`, {
        autoSubmitted: true,
        reason,
      });
    } catch (err) {
      console.warn("Auto-submit warning:", err);
    } finally {
      navigate(`/student/results?attemptId=${attemptId}&autoSubmitted=true&reason=${reason}`);
    }
  };

  if (loading || !exam) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        Initiating Secure Examination Environment...
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;

  const formatTimer = (sec) => {
    if (sec === null) return "--:--";
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col pb-8 select-none">
      {/* Top Examination HUD Bar */}
      <div className="bg-[#060911]/95 border-b border-white/10 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md font-heading">
            {exam.title}
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>

        {/* Violations Counter HUD Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-semibold ${
            violationCount === 0
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              : violationCount === 1
              ? "bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              : "bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              violationCount === 0
                ? "bg-emerald-400"
                : violationCount === 1
                ? "bg-amber-400"
                : "bg-rose-500"
            }`}
          />
          Proctor Alerts: {violationCount} / 3
        </div>

        {/* Center Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono font-bold text-sm sm:text-base ${
            secondsRemaining < 300
              ? "bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
              : "bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          }`}
        >
          <Clock className="h-4 w-4 text-purple-400" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>

        {/* Submit Action */}
        <button
          disabled={isLocked || submitting}
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer transition-all active:scale-95"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Finish &</span> Submit
        </button>
      </div>

      {/* Main Content: Left Questions, Right Webcam & Telemetry */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Cols: Question Area */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.6)] min-h-[500px] relative overflow-hidden">
          {/* Subtle top laser glow line */}
          <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

          <div>
            {/* Question Progress Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 border border-purple-500/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                Question {currentQIndex + 1} of {totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Marks: {currentQuestion.marks || 1}
                </span>
                {savingAnswer && (
                  <span className="text-[10px] text-purple-400 font-mono animate-pulse">
                    Saving...
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-6 font-heading">
              {currentQuestion.questionText}
            </h3>

            {/* MCQ Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, oIdx) => {
                const isSelected = answers[currentQuestion._id] === oIdx;
                return (
                  <div
                    key={oIdx}
                    onClick={() => !isLocked && handleSelectOption(oIdx)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border text-sm font-medium transition-all ${
                      isLocked
                        ? "opacity-50 cursor-not-allowed bg-slate-950/40 border-white/5 text-slate-500"
                        : isSelected
                        ? "bg-purple-950/40 border-purple-500/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
                        : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-purple-500/30 hover:bg-slate-900 cursor-pointer"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-purple-400 bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                          : "border-slate-700 bg-slate-950"
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between mt-6">
            <button
              disabled={currentQIndex === 0 || isLocked}
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Question Number Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {exam.questions.map((q, idx) => (
                <button
                  key={idx}
                  disabled={isLocked}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`h-7 w-7 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    currentQIndex === idx
                      ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white ring-2 ring-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                      : answers[q._id] !== undefined
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-900/80 text-slate-400 border border-white/10 hover:border-purple-400/30"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentQIndex === totalQuestions - 1 || isLocked}
              onClick={() =>
                setCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
              }
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-400 hover:to-violet-400 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Col: Live Webcam & Telemetry Monitor */}
        <div className="space-y-4">
          {/* Webcam Box */}
          <div className="bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] space-y-3 relative overflow-hidden">
            {/* Subtle top laser glow line */}
            <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
                <Camera className="h-4 w-4 text-purple-400" />
                Live Camera Telemetry
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Monitor
              </span>
            </div>

            {/* Video preview container */}
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-white/10 relative flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  isCameraActive ? "block" : "hidden"
                }`}
              />

              {!isCameraActive && (
                <div className="text-center p-4 space-y-2 text-slate-500">
                  <CameraOff className="h-8 w-8 mx-auto opacity-50 text-purple-400" />
                  <p className="text-xs font-mono">
                    {cameraError || "Camera feed starting..."}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95"
                  >
                    Grant Camera Access
                  </button>
                </div>
              )}

              {/* Safe on-device overlay badge */}
              <div className="absolute bottom-2 left-2 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                On-Device AI Engine (Multi-Face & Phone Auto-Detection)
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-tight font-sans">
              Privacy by Design: Frames processed locally. Violations save snapshot to <code>/video/:studentId/allvideo/</code>
            </p>
          </div>

          {/* Active Status Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5 font-heading">
                <Shield className="h-4 w-4 text-purple-400" />
                Examination Integrity Shield
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  violationCount === 0
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                    : violationCount === 1
                    ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                    : "bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse"
                }`}
              >
                {violationCount} / 3 Alerts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Window focus, tab visibility, shortcuts, and webcam are strictly monitored. Maximum allowed alerts: <strong>3</strong> before automatic submission.
            </p>
          </div>

          {/* HACKATHON LIVE DEMO SIMULATION BAR */}
          <div className="p-4 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-purple-500/30 space-y-2.5 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase tracking-wider font-mono">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Pitch Demonstration Triggers</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Click any button below to trigger real-time alert modal, capture snapshot, and test 3-alert auto-submit:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={isLocked}
                onClick={() =>
                  handleTriggerViolation({
                    type: "PHONE_DETECTED",
                    confidence: 0.92,
                    severity: "high",
                    message: "Mobile phone or unauthorized electronic device detected in camera frame!",
                  })
                }
                className="py-2 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-purple-300 text-[11px] font-semibold text-left transition-colors cursor-pointer hover:border-purple-500/40 disabled:opacity-40"
              >
                📱 Phone Detected
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={() =>
                  handleTriggerViolation({
                    type: "LOOKING_AWAY",
                    confidence: 0.95,
                    severity: "medium",
                    message: "Prolonged gaze deviation detected! Keep attention centered on screen.",
                  })
                }
                className="py-2 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-purple-300 text-[11px] font-semibold text-left transition-colors cursor-pointer hover:border-purple-500/40 disabled:opacity-40"
              >
                👀 Looking Away
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={() =>
                  handleTriggerViolation({
                    type: "MULTIPLE_FACES",
                    confidence: 0.89,
                    severity: "high",
                    message: "Multiple individuals detected in webcam view! Secondary persons are not permitted.",
                  })
                }
                className="py-2 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-purple-300 text-[11px] font-semibold text-left transition-colors cursor-pointer hover:border-purple-500/40 disabled:opacity-40"
              >
                👥 Multiple Faces
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={() =>
                  handleTriggerViolation({
                    type: "NO_FACE",
                    confidence: 0.98,
                    severity: "high",
                    message: "Face not detected in camera frame! Please remain seated facing webcam.",
                  })
                }
                className="py-2 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-purple-300 text-[11px] font-semibold text-left transition-colors cursor-pointer hover:border-purple-500/40 disabled:opacity-40"
              >
                👤 No Face in View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROCTORING ALERT MODAL (ALERTS 1, 2, AND 3 AUTO-SUBMIT) */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
          <div
            className={`bg-[#090d18]/95 border-2 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-2xl ${
              activeAlert.isFinal
                ? "border-rose-600 shadow-rose-950/80 animate-pulse"
                : activeAlert.violationNumber === 2
                ? "border-rose-500 shadow-rose-950/50"
                : "border-amber-500 shadow-amber-950/40"
            }`}
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
                activeAlert.isFinal ? "bg-rose-600/30" : "bg-amber-500/20"
              }`}
            />

            {/* Warning Icon Badge */}
            <div
              className={`h-16 w-16 rounded-full border flex items-center justify-center mx-auto ${
                activeAlert.isFinal
                  ? "bg-rose-950/90 border-rose-600 text-rose-400 animate-bounce"
                  : activeAlert.violationNumber === 2
                  ? "bg-rose-950/80 border-rose-500 text-rose-300"
                  : "bg-amber-950/80 border-amber-500 text-amber-300"
              }`}
            >
              {activeAlert.isFinal ? (
                <Lock className="h-8 w-8 text-rose-400" />
              ) : (
                <AlertTriangle className="h-8 w-8" />
              )}
            </div>

            {/* Header and Step Indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      step <= activeAlert.violationNumber
                        ? step === 3
                          ? "w-8 bg-rose-600"
                          : "w-8 bg-amber-500"
                        : "w-5 bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              <span
                className={`inline-block text-[11px] font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                  activeAlert.isFinal
                    ? "bg-rose-950 text-rose-300 border-rose-700"
                    : activeAlert.violationNumber === 2
                    ? "bg-rose-950/80 text-rose-300 border-rose-800"
                    : "bg-amber-950 text-amber-300 border-amber-800"
                }`}
              >
                {activeAlert.isFinal
                  ? "⛔ FINAL LIMIT EXCEEDED (ALERT 3 OF 3)"
                  : `🚨 PROCTOR WARNING (${activeAlert.violationNumber} OF 3)`}
              </span>

              <h3 className="text-xl font-extrabold text-white font-heading">
                {activeAlert.isFinal
                  ? "Test Locked & Auto-Submitting"
                  : activeAlert.violationNumber === 2
                  ? "Critical Warning (Final Chance)"
                  : "Unauthorized Activity Detected"}
              </h3>

              {/* Explicit Activity & Reason Box */}
              {(() => {
                const act = getActivityDetails(activeAlert.type);
                return (
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-left space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-sm text-white font-heading">
                      <span className="text-lg">{act.icon}</span>
                      <span className="text-purple-300">{act.name}</span>
                    </div>
                    <p className="text-xs text-rose-200 font-medium leading-relaxed font-sans">
                      {act.studentReason || activeAlert.message}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Snapshot Evidence Thumbnail */}
            {activeAlert.snapshot && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-white/10 text-left space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-purple-400" />
                    Evidence Snapshot Captured
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Saved to Video Archive
                  </span>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img
                    src={activeAlert.snapshot}
                    alt="Violation snapshot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight font-sans">
                  Frame has been securely saved to <code>/video/:studentId/allvideo/</code> and notified to the teacher review queue.
                </p>
              </div>
            )}

            {/* Rule Notice */}
            <div className="text-[11px] text-slate-400 leading-snug">
              {activeAlert.isFinal ? (
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 font-bold space-y-1">
                  <p>Maximum of 3 alerts reached. Test is now auto-submitting...</p>
                  <div className="text-lg font-mono text-white animate-pulse">
                    Auto-submitting in {autoSubmitCountdown ?? 3}s
                  </div>
                </div>
              ) : activeAlert.violationNumber === 2 ? (
                <p className="text-rose-300 font-semibold font-sans">
                  ⚠️ <strong>LAST WARNING!</strong> You have <strong>1 warning left</strong>. A 3rd violation will immediately terminate and submit your exam automatically.
                </p>
              ) : (
                <p className="text-amber-300 font-semibold font-sans">
                  ⚠️ You have <strong>2 warnings remaining</strong> before automatic test submission.
                </p>
              )}
            </div>

            {/* Action Button */}
            {!activeAlert.isFinal && (
              <button
                onClick={() => setActiveAlert(null)}
                className={`w-full py-3 px-4 rounded-full text-white font-bold text-xs shadow-lg transition-all cursor-pointer active:scale-95 ${
                  activeAlert.violationNumber === 2
                    ? "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-600/30"
                    : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-600/30"
                }`}
              >
                {activeAlert.violationNumber === 2
                  ? "I Understand (Final Warning) — Return to Exam"
                  : "I Understand — Resume Exam"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-[#090d18]/95 border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-2xl">
            {/* Top laser accent line */}
            <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent pointer-events-none" />

            <h3 className="text-lg font-bold text-white font-heading">
              Confirm Final Submission
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              You have answered <strong className="text-purple-300 font-mono">{answeredCount}</strong> of{" "}
              <strong className="text-purple-300 font-mono">{totalQuestions}</strong> questions. Once submitted, your answers
              will be permanently locked and graded.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 active:scale-95 transition-all"
              >
                Review Answers
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmitExam}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50 active:scale-95 transition-all"
              >
                {submitting ? "Submitting..." : "Yes, Submit Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Teacher Review Verdict Notification */}
      {teacherVerdictToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full shadow-[0_0_35px_rgba(0,0,0,0.8)] animate-fade-in select-none">
          <div
            className={`p-5 rounded-3xl border-2 flex items-start gap-3.5 backdrop-blur-2xl bg-[#090d18]/95 ${
              teacherVerdictToast.type === "false_alarm"
                ? "border-emerald-500/80 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30"
                : "border-rose-500/80 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/30"
            }`}
          >
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${
                teacherVerdictToast.type === "false_alarm"
                  ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/80 border border-rose-500/40 text-rose-300"
              }`}
            >
              {teacherVerdictToast.type === "false_alarm" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                  {teacherVerdictToast.title}
                </h4>
                <button
                  onClick={() => setTeacherVerdictToast(null)}
                  className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-snug font-sans">
                {teacherVerdictToast.message}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    teacherVerdictToast.type === "false_alarm"
                      ? "bg-emerald-900/60 border-emerald-500/50 text-emerald-200"
                      : "bg-rose-900/60 border-rose-500/50 text-rose-200"
                  }`}
                >
                  Active Warnings: {teacherVerdictToast.count} / 3
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live synced with console</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
