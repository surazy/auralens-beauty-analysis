import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { VanityHub } from "@/components/auralens/VanityHub";
import { CameraMatrix } from "@/components/auralens/CameraMatrix";
import { SynergySheet, type AnalysisResult } from "@/components/auralens/SynergySheet";
import { analyzeProduct } from "@/lib/analyze.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AuraLens — Luxury Beauty Formula Scanner" },
      {
        name: "description",
        content:
          "Scan cosmetic labels and decode skin benefits & chemical hazards with AI vision.",
      },
      { property: "og:title", content: "AuraLens — Luxury Beauty Formula Scanner" },
      {
        property: "og:description",
        content: "Decode the botanical matrix of any beauty product in seconds.",
      },
    ],
  }),
  component: AuraLens,
});

type View = "hub" | "camera";

function AuraLens() {
  const analyze = useServerFn(analyzeProduct);
  const [view, setView] = useState<View>("hub");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleCapture = async (base64: string) => {
    setError(null);
    try {
      const res = await analyze({ data: { imageBase64: base64 } });
      if (res.ok) {
        setResult(res.result as AnalysisResult);
        setError(null);
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
          <CameraMatrix onClose={() => setView("hub")} onCapture={handleCapture} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <SynergySheet data={result} error={error} onClose={() => setSheetOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
