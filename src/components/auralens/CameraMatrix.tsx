"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { X, Scan } from "lucide-react";
import { translations, type Locale } from "@/lib/translations";

interface Props {
  onClose: () => void;
  onCapture: (base64: string) => Promise<void>;
  locale: Locale;
}

export function CameraMatrix({ onClose, onCapture, locale }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [processing, setProcessing] = useState(false);

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

    try {
      await onCapture(base64);
    } finally {
      setProcessing(false);
    }
  }, [onCapture]);

  const t = translations[locale];

  return (
    <div className="absolute inset-0 z-30 bg-black">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: { ideal: "environment" } }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* darken corners */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* close */}
      <button
        onClick={onClose}
        className="absolute right-5 top-12 z-10 flex h-10 w-10 items-center justify-center rounded-full glass"
      >
        <X className="h-4 w-4 text-foreground" />
      </button>

      {/* targeting box */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
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
          {!processing && (
            <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-[oklch(0.82_0.13_85)] to-transparent scan-line" />
          )}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-gold/90 text-center w-64">
            {t.alignLabel}
          </div>
        </div>
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
                <Scan className="h-4 w-4 text-gold animate-pulse" />
                <p className="font-display text-lg shimmer-text text-center">
                  {t.decodingMatrix}
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground text-center">
                {t.llamaScout}
              </p>
            </motion.div>
          ) : (
            <motion.button
              key="capture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCapture}
              className="w-full rounded-full gold-gradient py-4 font-display text-lg text-primary-foreground tracking-wide shadow-[0_10px_40px_oklch(0.82_0.13_85_/_30%)] text-center"
            >
              {t.analyzeFormula}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
