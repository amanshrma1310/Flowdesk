"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  Sparkles,
  SwitchCamera,
  Image as ImageIcon,
  AlertCircle,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { recognizeCardInBrowser } from "@/lib/clientOcr";

export interface ExtractedLeadData {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  notes?: string;
  title?: string;
  rawText?: string;
  confidence?: number;
}

interface LeadPhotoCaptureProps {
  currentPhotoUrl?: string;
  onPhotoCaptured: (dataUrl: string, autoFields?: ExtractedLeadData) => void;
  onRemovePhoto?: () => void;
  className?: string;
  autoCreateOnScan?: boolean;
  onAutoCreate?: (dataUrl: string, autoFields: ExtractedLeadData) => void;
}

export function LeadPhotoCapture({
  currentPhotoUrl,
  onPhotoCaptured,
  onRemovePhoto,
  className = "",
  autoCreateOnScan = false,
  onAutoCreate,
}: LeadPhotoCaptureProps) {
  const [mode, setMode] = useState<"IDLE" | "CAMERA" | "PREVIEW">("IDLE");
  const [photoPreview, setPhotoPreview] = useState<string>(currentPhotoUrl || "");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractStatus, setExtractStatus] = useState<string>("");
  const [autoExtractSuccess, setAutoExtractSuccess] = useState(false);
  const [lastExtracted, setLastExtracted] = useState<ExtractedLeadData | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (currentPhotoUrl) {
      setPhotoPreview(currentPhotoUrl);
      setMode("PREVIEW");
    }
  }, [currentPhotoUrl]);

  // Clean up camera stream when unmounted or exiting camera mode
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (targetFacing = facingMode) => {
    stopCamera();
    setCameraError(null);
    setMode("CAMERA");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam API not supported in this browser. Please use the mobile camera upload button.");
      }

      // Request high resolution for sharp OCR text recognition
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in browser settings, or tap 'Open Native Camera' below."
          : "Could not open camera stream. You can still snap a photo using the native camera button."
      );
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const snapPicture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Capture at full native resolution of camera stream
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // High quality JPEG output for OCR text clarity
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    stopCamera();
    setPhotoPreview(dataUrl);
    setMode("PREVIEW");
    analyzePhotoAndNotify(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setPhotoPreview(dataUrl);
        setMode("PREVIEW");
        analyzePhotoAndNotify(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Extract contact text from picture with AI OCR API (Client-side first, Server fallback)
  const analyzePhotoAndNotify = async (dataUrl: string) => {
    setIsAnalyzing(true);
    setAutoExtractSuccess(false);
    setExtractStatus("Scanning card with high-speed AI OCR...");

    let clientResult: any = null;

    // 1. Try Browser Client-Side OCR first (fastest, 0 network latency, bypasses Hostinger 504 timeouts!)
    try {
      console.log("[LeadPhotoCapture] Running client-side browser OCR...");
      clientResult = await recognizeCardInBrowser(dataUrl, (msg) => {
        setExtractStatus(msg);
      });

      if (clientResult && clientResult.success && clientResult.data) {
        console.log("[LeadPhotoCapture] Client OCR succeeded:", clientResult.data);
        const parsed = clientResult.data;
        const hasContact = Boolean(parsed.name || parsed.phone || parsed.email);

        if (hasContact) {
          const extracted: ExtractedLeadData = {
            name: parsed.name,
            company: parsed.company,
            phone: parsed.phone || parsed.whatsApp,
            email: parsed.email,
            notes: parsed.notes || `Scanned via AI OCR (Confidence: ${clientResult.confidence || 85}%)`,
            title: parsed.title,
            rawText: clientResult.rawText,
            confidence: clientResult.confidence,
          };

          setLastExtracted(extracted);
          setIsAnalyzing(false);
          setAutoExtractSuccess(true);
          setExtractStatus(
            `✨ Extracted: ${extracted.name || "Contact"}${extracted.phone ? ` • ${extracted.phone}` : ""}${extracted.email ? ` • ${extracted.email}` : ""}`
          );

          onPhotoCaptured(dataUrl, extracted);

          if (autoCreateOnScan && onAutoCreate && (extracted.name || extracted.phone || extracted.email)) {
            onAutoCreate(dataUrl, extracted);
          }

          setTimeout(() => setAutoExtractSuccess(false), 8000);
          return;
        }
      }
    } catch (clientErr) {
      console.warn("[LeadPhotoCapture] Client OCR warning, trying server fallback:", clientErr);
    }

    // 2. Fallback to Server OCR API if client-side did not find complete contact details
    try {
      console.log("[LeadPhotoCapture] Sending image to /api/v1/ocr/scan fallback...");
      setExtractStatus("Checking server recognition fallback...");
      const res = await fetch("/api/v1/ocr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const parsed = json.data;
          const hasContact = Boolean(parsed.name || parsed.phone || parsed.email);
          if (hasContact) {
            const extracted: ExtractedLeadData = {
              name: parsed.name,
              company: parsed.company,
              phone: parsed.phone || parsed.whatsApp,
              email: parsed.email,
              notes: parsed.notes || `Scanned from business card (Confidence: ${json.confidence || 75}%)`,
              title: parsed.title,
              rawText: json.rawText,
              confidence: json.confidence,
            };

            setLastExtracted(extracted);
            setIsAnalyzing(false);
            setAutoExtractSuccess(true);
            setExtractStatus(
              `✨ Extracted: ${extracted.name || "Contact"}${extracted.phone ? ` • ${extracted.phone}` : ""}${extracted.email ? ` • ${extracted.email}` : ""}`
            );

            onPhotoCaptured(dataUrl, extracted);

            if (autoCreateOnScan && onAutoCreate && (extracted.name || extracted.phone || extracted.email)) {
              onAutoCreate(dataUrl, extracted);
            }

            setTimeout(() => setAutoExtractSuccess(false), 8000);
            return;
          }
        }
      }
    } catch (err) {
      console.warn("[LeadPhotoCapture] Server OCR fallback skipped/error:", err);
    }

    // 3. If neither found contact information, report cleanly to user without fake dummy names!
    setIsAnalyzing(false);
    setAutoExtractSuccess(false);
    setLastExtracted(null);
    setExtractStatus(
      "⚠️ No contact text detected. Card may be blurry or out of focus. Hold card steady 8-10 inches from camera, or enter details below."
    );
    onPhotoCaptured(dataUrl, {
      name: "",
      phone: "",
      email: "",
      company: "",
      notes: clientResult?.rawText ? `Unparsed card text:\n${clientResult.rawText}` : "",
    });
  };

  const handleClear = () => {
    stopCamera();
    setPhotoPreview("");
    setLastExtracted(null);
    setMode("IDLE");
    if (onRemovePhoto) onRemovePhoto();
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      {/* Native Mobile Camera trigger (Works on iOS Safari, Android Chrome, and all webviews) */}
      <input
        type="file"
        ref={nativeCameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* STATE 1: IDLE / NO PHOTO */}
      {mode === "IDLE" && !photoPreview && (
        <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded-2xl text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400 shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Snap or Upload Business Card / Contact Photo
              </h4>
              <p className="text-xs text-slate-500">
                AI will scan the photo, read name, phone, email & create a lead
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={() => startCamera("environment")}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-2 py-2 px-4 shadow-sm cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Click Picture (Camera)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="w-full sm:w-auto text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 sm:hidden cursor-pointer"
            >
              <SwitchCamera className="h-3.5 w-3.5" />
              <span>Phone Camera App</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Upload Card / Image</span>
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: LIVE CAMERA STREAM */}
      {mode === "CAMERA" && (
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl p-2 space-y-2 animate-in zoom-in-95 duration-200">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder Target Guide Overlay */}
            <div className="absolute inset-4 sm:inset-10 border-2 border-white/80 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white bg-indigo-600/85 px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1.5">
                  <ScanLine className="h-3 w-3" />
                  <span>Align card here</span>
                </span>
                <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  Hold steady for clear focus
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                  AI will auto-extract Name, Phone & Company
                </span>
              </div>
            </div>

            {/* Camera Error Fallback */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-center space-y-2 z-10">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <p className="text-xs text-white max-w-xs">{cameraError}</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Use Native Phone Camera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={stopCamera}
                    className="text-xs text-slate-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls Bar */}
          <div className="flex items-center justify-between px-3 py-1">
            <button
              type="button"
              onClick={stopCamera}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            {/* Shutter Snap Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={snapPicture}
                className="h-14 w-14 rounded-full bg-white border-4 border-indigo-600 hover:scale-105 active:scale-95 shadow-xl transition-all flex items-center justify-center cursor-pointer"
                title="Snap Picture & Scan Card"
              >
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Camera className="h-5 w-5" />
                </div>
              </button>
            </div>

            {/* Flip Camera (Front/Back) */}
            <button
              type="button"
              onClick={flipCamera}
              className="h-9 w-9 rounded-xl bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer"
              title="Flip Camera"
            >
              <SwitchCamera className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: PHOTO PREVIEW & RETAKE */}
      {(mode === "PREVIEW" || photoPreview) && (
        <div className="relative p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-3.5">
          <div className="relative h-24 w-32 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Lead Card or Photo"
              className="w-full h-full object-cover"
            />
            {/* Animated Laser Scanning Bar when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-2xs flex flex-col justify-center items-center">
                <div className="w-full h-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse" />
                <span className="text-[9px] font-bold text-white bg-indigo-600/90 px-1.5 py-0.5 rounded mt-1">
                  AI OCR...
                </span>
              </div>
            )}
            <div className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-md backdrop-blur-xs">
              <ImageIcon className="h-3 w-3" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Contact Photo Attached
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>

            {isAnalyzing ? (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Reading card text with AI OCR... (less than 1 sec)</span>
              </p>
            ) : autoExtractSuccess ? (
              <div className="space-y-0.5">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Card details extracted successfully! ✓</span>
                </p>
                {lastExtracted && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
                    {lastExtracted.name}
                    {lastExtracted.company ? ` • ${lastExtracted.company}` : ""}
                    {lastExtracted.phone ? ` • ${lastExtracted.phone}` : ""}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 truncate">
                {extractStatus || "Saved with lead profile • Visible in CRM & card view"}
              </p>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => startCamera("environment")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Retake</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Change Image</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
