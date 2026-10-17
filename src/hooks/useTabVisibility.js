import { useState, useEffect, useRef } from "react";

/**
 * useTabVisibility Hook
 * Detects tab switching, window blurring, unauthorized shortcuts, and context menu actions in real time.
 */
export const useTabVisibility = (onViolation) => {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const lastViolationTimeRef = useRef(0);

  useEffect(() => {
    const triggerViolationDebounced = (payload) => {
      const now = Date.now();
      // Debounce by 2.5 seconds to prevent cascade double-triggers
      if (now - lastViolationTimeRef.current < 2500) {
        return;
      }
      lastViolationTimeRef.current = now;
      if (onViolation) {
        onViolation(payload);
      }
    };

    // 1. Tab visibility changes (minimizing, switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabHidden(true);
        setTabSwitchCount((prev) => prev + 1);
        triggerViolationDebounced({
          type: "TAB_HIDDEN",
          durationMs: 1000,
          confidence: 1.0,
          severity: "high",
          message: "You navigated away or switched browser tabs! Exam tab unfocusing is strictly prohibited.",
        });
      } else {
        setIsTabHidden(false);
      }
    };

    // 2. Window Blur (Alt+Tab, clicking outside, dual monitor switch, opening another app)
    const handleWindowBlur = () => {
      setIsTabHidden(true);
      triggerViolationDebounced({
        type: "TAB_HIDDEN",
        durationMs: 1000,
        confidence: 1.0,
        severity: "high",
        message: "Exam window lost focus! You clicked outside or switched to another program.",
      });
    };

    const handleWindowFocus = () => {
      setIsTabHidden(false);
    };

    // 3. Prohibited keyboard shortcuts (Ctrl+C, Ctrl+V, F12, DevTools)
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block Copy, Paste, Cut, View Source, Print
      if (isCtrl && ["c", "v", "x", "u", "p"].includes(key)) {
        e.preventDefault();
        triggerViolationDebounced({
          type: "KEY_RESTRICTION",
          durationMs: 0,
          confidence: 1.0,
          severity: "high",
          message: `Prohibited shortcut (Ctrl+${key.toUpperCase()}) was blocked!`,
        });
        return false;
      }

      // Block F12 and DevTools shortcuts
      if (e.key === "F12" || (isCtrl && e.shiftKey && ["i", "j", "c"].includes(key))) {
        e.preventDefault();
        triggerViolationDebounced({
          type: "PROHIBITED_ACTION",
          durationMs: 0,
          confidence: 1.0,
          severity: "high",
          message: "Developer tools shortcut was detected and blocked!",
        });
        return false;
      }
    };

    // 4. Prohibited right click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolationDebounced({
        type: "PROHIBITED_ACTION",
        durationMs: 0,
        confidence: 0.9,
        severity: "medium",
        message: "Right click context menu is prohibited during the examination.",
      });
      return false;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [onViolation]);

  return { isTabHidden, tabSwitchCount };
};
