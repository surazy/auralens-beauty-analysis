"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { VanityHub } from "@/components/auralens/VanityHub";
import { CameraMatrix } from "@/components/auralens/CameraMatrix";
import {
  SynergySheet,
  type AnalysisResult,
} from "@/components/auralens/SynergySheet";
import { analyzeProduct } from "@/lib/actions";
import { db } from "@/lib/db";

type View = "hub" | "camera";

export default function HomePage() {
  const [view, setView] = useState<View>("hub");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleCapture = async (base64: string) => {
    setError(null);
    try {
      const res = await analyzeProduct(base64);
      if (res.ok) {
        const r = res.result as AnalysisResult;
        setResult(r);
        setError(null);
        try {
          await db.saveScan({
            brand: r.brand ?? "",
            productName: r.productName ?? "",
            benefits: r.benefits ?? [],
            hazards: r.hazards ?? [],
          });
        } catch (err) {
          console.warn("[db] failed to persist scan", err);
        }
      } else {
        setResult(null);
        setError(res.error);
      }
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setView("hub");
      setSheetOpen(true);
    }
  };

  return (
    <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background">
      <VanityHub onLaunchCamera={() => setView("camera")} />

      <AnimatePresence>
        {view === "camera" && (
          <CameraMatrix
            onClose={() => setView("hub")}
            onCapture={handleCapture}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <SynergySheet
            data={result}
            error={error}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
