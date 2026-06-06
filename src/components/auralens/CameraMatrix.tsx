"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { X, Scan, Upload } from "lucide-react";
import { translations, type Locale } from "@/lib/translations";

interface Props {
  onClose: () => void;
  onCapture: (base64: string, mode: "bottle" | "skin") => Promise<void>;
  locale: Locale;
}

export function CameraMatrix({ onClose, onCapture, locale }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<"bottle" | "skin">("bottle");

  const handleCapture = useCallback(async () => {
    const video = webcamRef.current?.video as HTMLVideoElement | null;
    if (!video || video.readyState < 2) return;
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setProcessing(false);
      return;
    }
    // center crop to square then scale to 512
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const side = Math.min(vw, vh);
    const sx = (vw - side) / 2;
    const sy = (vh - side) / 2;
    ctx.drawImage(video, sx, sy, side, side, 0, 0, 512, 512);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const base64 = dataUrl.split(",")[1] ?? "";
    setCapturedImage(dataUrl);

    try {
      await onCapture(base64, cameraMode);
    } finally {
      setProcessing(false);
      setCapturedImage(null);
    }
  }, [onCapture, cameraMode]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        
        // Control resolution for less token usage by scaling down to max dimension of 512px
        const maxDim = 512;
        let w = img.width;
        let h = img.height;
        
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setProcessing(false);
          return;
        }
        
        ctx.drawImage(img, 0, 0, w, h);
        
        // Quality 0.7 to minimize file size / token footprint further
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const base64 = dataUrl.split(",")[1] ?? "";
        setCapturedImage(dataUrl);
        
        try {
          await onCapture(base64, cameraMode);
        } finally {
          setProcessing(false);
          setCapturedImage(null);
          // Reset file input value so same file can be uploaded again if needed
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [onCapture, cameraMode]);

  const t = translations[locale];

  return (
    <div className="absolute inset-0 z-30 bg-black">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: cameraMode === "skin" ? "user" : { ideal: "environment" } }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* frozen image overlay */}
      <AnimatePresence>
        {capturedImage && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={capturedImage}
            alt="Captured frame"
            className="absolute inset-0 h-full w-full object-cover z-10"
          />
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* darken corners */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Scanner Mode Toggle */}
      {!processing && (
        <div className="absolute top-12 left-6 z-15 bg-black/50 border border-white/10 rounded-full p-1 flex items-center gap-1">
          <button
            onClick={() => setCameraMode("bottle")}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
              cameraMode === "bottle"
                ? "bg-gold text-neutral-950"
                : "text-white/60 hover:text-white"
            }`}
          >
            {locale === "en" ? "Bottle" : "ምርት"}
          </button>
          <button
            onClick={() => setCameraMode("skin")}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
              cameraMode === "skin"
                ? "bg-emerald-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            {locale === "en" ? "Skin" : "ቆዳ"}
          </button>
        </div>
      )}

      {/* close */}
      {!processing && (
        <button
          onClick={onClose}
          className="absolute right-5 top-12 z-10 flex h-10 w-10 items-center justify-center rounded-full glass cursor-pointer"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>
      )}

      {/* targeting box or skin oval */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {cameraMode === "skin" ? (
          <div className="relative h-[300px] w-[220px] flex items-center justify-center">
            {/* Oval Mask Frame */}
            <div className="absolute inset-0 rounded-[50%/40%] border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            <div className="absolute inset-2 rounded-[50%/40%] border border-white/20" />
            
            {/* pulse oval effect */}
            <div className="absolute inset-0 rounded-[50%/40%] border border-emerald-400 animate-pulse opacity-40" />

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-emerald-400 text-center w-64 font-semibold">
              {locale === "en" ? "Align Face Within Oval" : "ፊትዎን በኦቫሉ ውስጥ ያስተካክሉ"}
            </div>
          </div>
        ) : (
          <div className="relative h-72 w-64">
            {/* corners */}
            {(["tl", "tr", "bl", "br"] as const).map((c) => (
              <span
                key={c}
                className={`absolute h-7 w-7 border-gold ${
                  c === "tl" ? "left-0 top-0 border-l-2 border-t-2" : ""
                } ${c === "tr" ? "right-0 top-0 border-r-2 border-t-2" : ""} ${
                  c === "bl" ? "bottom-0 left-0 border-b-2 border-l-2" : ""
                } ${c === "br" ? "bottom-0 right-0 border-b-2 border-r-2" : ""}`}
              />
            ))}
            {/* scan line */}
            <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-[oklch(0.82_0.13_85)] to-transparent scan-line" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-gold/90 text-center w-64">
              {t.alignLabel}
            </div>
          </div>
        )}
      </div>

      {/* bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <Scan className={`h-4 w-4 animate-pulse ${cameraMode === "skin" ? "text-emerald-400" : "text-gold"}`} />
                <p className="font-display text-lg shimmer-text text-center">
                  {cameraMode === "skin" 
                    ? (locale === "en" ? "Analyzing skin structure…" : "የቆዳ ህዋሳትን በመተንተን ላይ…")
                    : t.decodingMatrix}
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground text-center">
                {t.llamaScout}
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              <motion.button
                key="capture"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCapture}
                className={`w-full rounded-full py-4 font-display text-lg text-primary-foreground tracking-wide text-center cursor-pointer ${
                  cameraMode === "skin"
                    ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_10px_40px_rgba(34,197,94,0.3)]"
                    : "gold-gradient shadow-[0_10px_40px_oklch(0.82_0.13_85_/_30%)]"
                }`}
              >
                {cameraMode === "skin"
                  ? (locale === "en" ? "Analyze Skin Profile" : "የቆዳ ሁኔታን መርምር")
                  : t.analyzeFormula}
              </motion.button>
              
              <motion.button
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleUploadTrigger}
                className={`w-full rounded-full border py-3.5 font-display text-base tracking-wide text-center flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  cameraMode === "skin"
                    ? "border-emerald-500/30 bg-white/5 text-emerald-400 hover:bg-white/10"
                    : "border-gold/30 bg-white/5 text-gold hover:text-gold-soft hover:bg-white/10"
                }`}
              >
                <Upload className="h-4 w-4" />
                {t.uploadImage}
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
