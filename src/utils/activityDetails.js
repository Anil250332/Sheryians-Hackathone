/**
 * ProctorVision Activity Definitions & Human-Readable Explanations
 * Maps raw telemetry codes (e.g. TAB_HIDDEN, PHONE_DETECTED) to crystal-clear
 * activity titles, icons, and reasons for both teachers and students.
 */

export const ACTIVITY_DEFINITIONS = {
  TAB_HIDDEN: {
    code: "TAB_HIDDEN",
    name: "Browser Tab Switched / Window Minimized",
    shortName: "Tab Switch Detected",
    icon: "📑",
    category: "Browser Navigation",
    severity: "high",
    reason: "Student navigated away from the active exam tab, switched browser windows, or minimized the browser during the exam.",
    studentReason: "Exam window lost focus or you switched to another tab/window. Unfocusing the exam is strictly prohibited.",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-700/60",
    glowClass: "from-amber-500/20 to-orange-500/20",
  },
  PHONE_DETECTED: {
    code: "PHONE_DETECTED",
    name: "Mobile Phone / Electronic Device Detected",
    shortName: "Mobile Phone Detected",
    icon: "📱",
    category: "Prohibited Hardware",
    severity: "critical",
    reason: "AI computer vision detected a smartphone or mobile electronic device held up in the student's camera frame.",
    studentReason: "A smartphone or unauthorized device was detected in front of the camera.",
    badgeClass: "bg-rose-950/80 text-rose-300 border-rose-700/60",
    glowClass: "from-rose-500/20 to-red-500/20",
  },
  MULTIPLE_FACES: {
    code: "MULTIPLE_FACES",
    name: "Multiple People in Camera View",
    shortName: "Multiple Faces Detected",
    icon: "👥",
    category: "Unauthorized Assistance",
    severity: "high",
    reason: "AI detected 2 or more individuals in the student's webcam stream, indicating potential external assistance.",
    studentReason: "Multiple people were detected in your camera frame. Secondary persons are not allowed in the test room.",
    badgeClass: "bg-purple-950/80 text-purple-300 border-purple-700/60",
    glowClass: "from-purple-500/20 to-indigo-500/20",
  },
  LOOKING_AWAY: {
    code: "LOOKING_AWAY",
    name: "Gaze Distracted / Looking Away",
    shortName: "Looking Away",
    icon: "👀",
    category: "Gaze Anomaly",
    severity: "medium",
    reason: "Student continuously turned their head or diverted gaze away from the screen toward off-screen materials.",
    studentReason: "Continuous head turning or looking away from the exam questions was flagged.",
    badgeClass: "bg-yellow-950/80 text-yellow-300 border-yellow-700/60",
    glowClass: "from-yellow-500/20 to-amber-500/20",
  },
  NO_FACE: {
    code: "NO_FACE",
    name: "Student Absent / Face Not Visible",
    shortName: "Face Missing",
    icon: "🚫",
    category: "Absence Anomaly",
    severity: "high",
    reason: "Student stepped out of webcam view, ducked below the desk, or physically obscured the camera lens.",
    studentReason: "Your face was completely missing from the webcam frame. Please stay directly centered in front of the camera.",
    badgeClass: "bg-orange-950/80 text-orange-300 border-orange-700/60",
    glowClass: "from-orange-500/20 to-red-500/20",
  },
  CAMERA_INTERRUPTED: {
    code: "CAMERA_INTERRUPTED",
    name: "Webcam Stream Interrupted / Covered",
    shortName: "Webcam Interrupted",
    icon: "⚠️",
    category: "Hardware Tampering",
    severity: "high",
    reason: "Webcam stream stopped transmitting video frames, screen became completely dark, or camera permission was altered.",
    studentReason: "Webcam feed was cut or covered during the exam.",
    badgeClass: "bg-red-950/80 text-red-300 border-red-700/60",
    glowClass: "from-red-500/20 to-rose-500/20",
  },
  KEY_RESTRICTION: {
    code: "KEY_RESTRICTION",
    name: "Copy / Paste / Dev Shortcut Blocked",
    shortName: "Copy/Paste Shortcut",
    icon: "⌨️",
    category: "Keyboard Restriction",
    severity: "high",
    reason: "Student attempted forbidden keystroke combinations (Ctrl+C, Ctrl+V, Cut, or DevTools shortcut).",
    studentReason: "Clipboard shortcut (Copy/Paste) was detected and blocked by security rules.",
    badgeClass: "bg-rose-950/80 text-rose-300 border-rose-700/60",
    glowClass: "from-rose-500/20 to-pink-500/20",
  },
  PROHIBITED_ACTION: {
    code: "PROHIBITED_ACTION",
    name: "Prohibited Action / Right-Click Attempt",
    shortName: "Prohibited Action",
    icon: "⛔",
    category: "Security Policy",
    severity: "medium",
    reason: "Student attempted inspect element, right-click context menu, or browser developer toolbar.",
    studentReason: "Right-click or inspection tool shortcut was blocked.",
    badgeClass: "bg-rose-950/80 text-rose-300 border-rose-700/60",
    glowClass: "from-rose-500/20 to-purple-500/20",
  },
};

/**
 * Returns activity details with clean fallbacks
 */
export const getActivityDetails = (type) => {
  if (!type) {
    return {
      code: "UNKNOWN",
      name: "Suspicious Activity",
      shortName: "Anomaly Detected",
      icon: "⚠️",
      category: "Telemetry Incident",
      severity: "medium",
      reason: "Suspicious student behavior was logged by the local proctoring engine.",
      studentReason: "Suspicious activity was detected during your test.",
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
      glowClass: "from-slate-700/20 to-slate-800/20",
    };
  }

  const normalized = type.toUpperCase().trim();
  return (
    ACTIVITY_DEFINITIONS[normalized] || {
      code: normalized,
      name: normalized.replace(/_/g, " "),
      shortName: normalized.replace(/_/g, " "),
      icon: "⚠️",
      category: "Proctor Alert",
      severity: "medium",
      reason: `Flagged proctoring activity: ${normalized.replace(/_/g, " ")}.`,
      studentReason: `Suspicious activity flagged: ${normalized.replace(/_/g, " ")}.`,
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
      glowClass: "from-slate-700/20 to-slate-800/20",
    }
  );
};
