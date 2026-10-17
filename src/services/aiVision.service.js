import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

let modelPromise = null;
let modelInstance = null;
let isModelLoading = false;

/**
 * Initializes and caches Coco-SSD on-device computer vision model
 */
export const initAIVisionModel = async () => {
  if (modelInstance) return modelInstance;
  if (modelPromise) return modelPromise;

  try {
    isModelLoading = true;
    modelPromise = cocoSsd.load({ base: "lite_mobilenet_v2" });
    modelInstance = await modelPromise;
    isModelLoading = false;
    return modelInstance;
  } catch (err) {
    console.warn("Coco-SSD on-device model load failed:", err);
    isModelLoading = false;
    return null;
  }
};

/**
 * Analyzes video frame using dual detection:
 * 1. Coco-SSD Deep Neural Network (person count, cell phone detection)
 * 2. Canvas Spatial Skin-Cluster Heuristic (instant dual-person & covered camera detection)
 */
export const analyzeWebcamFrame = async (videoElement) => {
  if (!videoElement || videoElement.readyState < 2) {
    return { status: "video_not_ready" };
  }

  const result = {
    personCount: 0,
    hasPhone: false,
    hasMultipleFaces: false,
    hasNoFace: false,
    isCameraCovered: false,
    predictions: [],
    modelReady: false,
  };

  // 1. Run Coco-SSD Neural Network if available
  try {
    if (!modelInstance && !isModelLoading) {
      initAIVisionModel();
    }

    if (modelInstance) {
      result.modelReady = true;
      const predictions = await modelInstance.detect(videoElement);
      result.predictions = predictions;

      // Detect persons
      const detectedPersons = predictions.filter(
        (p) => p.class === "person" && p.score >= 0.45
      );
      result.personCount = detectedPersons.length;

      // Detect mobile phone / unauthorized devices
      const detectedPhones = predictions.filter(
        (p) =>
          (p.class === "cell phone" || p.class === "remote") &&
          p.score >= 0.40
      );
      if (detectedPhones.length > 0) {
        result.hasPhone = true;
      }

      if (detectedPersons.length >= 2) {
        result.hasMultipleFaces = true;
      }
    }
  } catch (err) {
    console.warn("Neural frame inference warning:", err);
  }

  // 2. High-speed Spatial Skin & Cluster Heuristic on offscreen canvas
  try {
    const width = 120;
    const height = 90;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(videoElement, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;

    let totalBrightness = 0;
    let leftSkinPixels = 0;
    let rightSkinPixels = 0;
    let centerSkinPixels = 0;
    let totalSkinPixels = 0;
    const totalPixels = width * height;

    const midX = width / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;

        // Human skin tone standard range in RGB color space
        const isSkin =
          r > 55 &&
          g > 35 &&
          b > 20 &&
          r > g &&
          r > b &&
          r - g > 8 &&
          r - b > 8 &&
          Math.abs(r - g) > 5;

        if (isSkin) {
          totalSkinPixels++;
          if (x < midX - 10) {
            leftSkinPixels++;
          } else if (x > midX + 10) {
            rightSkinPixels++;
          } else {
            centerSkinPixels++;
          }
        }
      }
    }

    const avgBrightness = totalBrightness / totalPixels;
    const leftSkinRatio = (leftSkinPixels / (totalPixels / 2)) * 100;
    const rightSkinRatio = (rightSkinPixels / (totalPixels / 2)) * 100;
    const totalSkinRatio = (totalSkinPixels / totalPixels) * 100;

    // Pitch dark or covered camera
    if (avgBrightness < 12) {
      result.isCameraCovered = true;
    }

    // Dual-face spatial presence: distinct person on left AND distinct person on right
    if (leftSkinRatio > 5.5 && rightSkinRatio > 5.5) {
      result.hasMultipleFaces = true;
      if (result.personCount < 2) {
        result.personCount = 2;
      }
    }

    // Complete absence of human presence in frame
    if (totalSkinRatio < 0.8 && !result.isCameraCovered && result.personCount === 0) {
      result.hasNoFace = true;
    }
  } catch (err) {
    // Canvas read fallback
  }

  return result;
};
