import { useState, useRef, useEffect, useCallback } from "react";

export const useCameraStream = (autoStart = false) => {
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false, // Privacy by design: no microphone recording
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (err) {
      console.error("Camera access error:", err);
      let message = "Unable to access camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message = "Camera permission was denied. Please allow camera access in browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "No webcam device found on this system.";
      }
      setCameraError(message);
      setIsCameraActive(false);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Capture frame as JPEG base64 string with guaranteed telemetry fallback
  const captureSnapshot = useCallback((eventLabel = "TELEMETRY") => {
    try {
      const canvas = document.createElement("canvas");
      const width = 640;
      const height = 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      let videoDrawn = false;
      if (videoRef.current && isCameraActive) {
        try {
          const video = videoRef.current;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            ctx.drawImage(video, 0, 0, width, height);
            videoDrawn = true;
          }
        } catch (e) {
          console.warn("Failed drawing video frame:", e);
        }
      }

      if (!videoDrawn) {
        // High-tech proctoring telemetry evidence banner
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, width, height);

        // Tech grid lines
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Center telemetry card
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        if (ctx.roundRect) {
          ctx.roundRect(60, 110, width - 120, height - 220, 12);
        } else {
          ctx.rect(60, 110, width - 120, height - 220);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PROCTORVISION TELEMETRY SNAPSHOT", width / 2, 160);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(
          eventLabel === "TAB_HIDDEN"
            ? "BROWSER TAB SWITCH / UNFOCUS DETECTED"
            : eventLabel.toUpperCase().replace(/_/g, " "),
          width / 2,
          205
        );

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px monospace";
        ctx.fillText(
          `TIME: ${new Date().toLocaleTimeString()} • ${new Date().toLocaleDateString()}`,
          width / 2,
          245
        );

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "13px sans-serif";
        ctx.fillText(
          "Student navigated away from active test or minimized browser window",
          width / 2,
          280
        );
      }

      return canvas.toDataURL("image/jpeg", 0.7);
    } catch (err) {
      console.warn("Snapshot capture failed:", err);
      return null;
    }
  }, [isCameraActive]);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [autoStart]);

  return {
    videoRef,
    stream,
    isCameraActive,
    cameraError,
    startCamera,
    stopCamera,
    captureSnapshot,
  };
};
