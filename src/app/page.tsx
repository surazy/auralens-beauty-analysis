"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import { VanityHub } from "@/components/auralens/VanityHub";
import { CameraMatrix } from "@/components/auralens/CameraMatrix";
import {
  SynergySheet,
  type AnalysisResult,
} from "@/components/auralens/SynergySheet";
import { db } from "@/lib/db";

type View = "hub" | "camera";

export default function HomePage() {
  const router = useRouter();
  const [view, setView] = useState<View>("hub");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [profile, setProfile] = useState<{ skinType: string; age: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auralens:profile");
    if (!saved) {
      router.push("/onboarding");
    } else {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse profile", e);
        router.push("/onboarding");
      }
      setLoadingProfile(false);
    }
  }, [router]);

  const handleCapture = async (base64: string) => {
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64,
          skinType: profile?.skinType ?? "Sensitive",
          age: profile?.age ?? "30-39",
        }),
      });

      const res = await response.json();

      if (res.ok) {
        const r = res.result as AnalysisResult;
        setResult(r);
        setError(null);
      } else {
        setResult(null);
        setError(res.error || "Analysis failed");
      }
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setView("hub");
      setSheetOpen(true);
    }
  };

  if (loadingProfile) {
    return (
      <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background flex flex-col items-center justify-center">
        {/* ambient gold glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_85_/_18%)] blur-3xl" />
        <p className="font-display text-2xl gold-text-gradient animate-pulse">AuraLens</p>
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mt-2">Loading Profile</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background">
      <VanityHub
        skinType={profile?.skinType ?? "Sensitive"}
        age={profile?.age ?? "30-39"}
        onLaunchCamera={() => setView("camera")}
      />

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

