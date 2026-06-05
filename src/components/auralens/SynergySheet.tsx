"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  AlertTriangle,
  Leaf,
  CheckCircle2,
  ShoppingBag,
  TrendingUp,
  HeartHandshake,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/db";
import { translations, type Locale } from "@/lib/translations";

export interface AnalysisResult {
  brand?: string;
  productName?: string;
  isProductSafe?: boolean;
  benefits?: { name: string; description: string; details?: string }[];
  hazards?: {
    name: string;
    riskLevel: "High" | "Medium";
    description: string;
    details?: string;
  }[];
  alternativeProduct?: {
    name: string;
    brand: string;
    reason: string;
  };
  usageDetails?: {
    howToUse: string;
    whenToUse: string;
    timeline: {
      day3: string;
      day14: string;
      day30: string;
    };
  };
}

interface Props {
  data: AnalysisResult | null;
  error?: string | null;
  onClose: () => void;
  locale: Locale;
}

type ViewState = "results" | "purchase_check" | "usage" | "recommendation";

export function SynergySheet({ data, error, onClose, locale }: Props) {
  const [viewState, setViewState] = useState<ViewState>("results");
  const [expandedBenefitIdx, setExpandedBenefitIdx] = useState<number | null>(null);
  const [expandedHazardIdx, setExpandedHazardIdx] = useState<number | null>(null);

  const handlePurchaseChoice = async (choice: boolean) => {
    if (!data) return;

    try {
      await db.saveScan({
        brand: data.brand ?? "",
        productName: data.productName ?? "",
        isProductSafe: data.isProductSafe ?? true,
        benefits: data.benefits ?? [],
        hazards: data.hazards ?? [],
        alternativeProduct: data.alternativeProduct,
        usageDetails: data.usageDetails,
        hasPurchased: choice,
        progressChatLog: [], // Empty progress log initially
      });
    } catch (err) {
      console.error("[db] Failed to save scan with branching decision", err);
    }

    if (choice) {
      setViewState("usage");
    } else {
      setViewState("recommendation");
    }
  };

  const t = translations[locale];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-30 bg-foreground/40"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        className="absolute inset-x-0 bottom-0 z-40 max-h-[90%] overflow-y-auto rounded-t-[2rem] border border-border bg-card px-6 pb-10 pt-4 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
              {viewState === "results"
                ? t.synergyReveal
                : viewState === "purchase_check"
                  ? t.routineAssessment
                  : viewState === "usage"
                    ? t.routineCoaching
                    : t.scanSwap}
            </p>
            <h2 className="mt-1 font-display text-2xl gold-text-gradient">
              {data?.brand || t.unknownHouse}
            </h2>
            <p className="text-sm text-muted-foreground">
              {data?.productName || t.untitledFormula}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {data && (
          <AnimatePresence mode="wait">
            {viewState === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <section className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Leaf className="h-3.5 w-3.5 text-gold" />
                    <h3 className="text-[11px] uppercase tracking-[0.35em] text-foreground">
                      {t.skinBenefits}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(data.benefits ?? []).map((b, i) => {
                      const isExpanded = expandedBenefitIdx === i;
                      return (
                        <div
                          key={i}
                          onClick={() => setExpandedBenefitIdx(isExpanded ? null : i)}
                          className="rounded-2xl border border-gold/30 bg-secondary p-4 cursor-pointer hover:bg-secondary/45 transition-colors select-none"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3 w-3 text-gold" />
                              <p className="text-sm font-medium text-gold">
                                {b.name}
                              </p>
                            </div>
                            <span className="text-[9px] text-gold/60 uppercase tracking-widest font-medium">
                              {isExpanded ? t.hide : t.detail}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/80">
                            {b.description}
                          </p>
                          <AnimatePresence initial={false}>
                            {isExpanded && b.details && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-2 pt-2 border-t border-gold/15 text-[11px] text-foreground/75 leading-relaxed"
                              >
                                {b.details}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    {(data.benefits ?? []).length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        {t.noBenefits}
                      </p>
                    )}
                  </div>
                </section>

                <section className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.62_0.22_27)]" />
                    <h3 className="text-[11px] uppercase tracking-[0.35em] text-foreground">
                      {t.materialHazards}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(data.hazards ?? []).map((h, i) => {
                      const high = h.riskLevel === "High";
                      const isExpanded = expandedHazardIdx === i;
                      return (
                        <div
                          key={i}
                          onClick={() => setExpandedHazardIdx(isExpanded ? null : i)}
                          className={`rounded-2xl border p-4 cursor-pointer transition-colors select-none ${high
                              ? "border-[oklch(0.62_0.22_27_/_50%)] bg-[oklch(0.95_0.05_30)] hover:bg-[oklch(0.95_0.05_30)/85]"
                              : "border-[oklch(0.72_0.17_60_/_50%)] bg-[oklch(0.97_0.04_70)] hover:bg-[oklch(0.97_0.04_70)/85]"
                            }`}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${high
                                  ? "text-[oklch(0.45_0.2_27)]"
                                  : "text-[oklch(0.5_0.15_60)]"
                                }`}
                            >
                              {h.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest text-white ${high
                                    ? "bg-[oklch(0.62_0.22_27)]"
                                    : "bg-[oklch(0.72_0.17_60)]"
                                  }`}
                              >
                                {h.riskLevel === "High" ? (locale === "en" ? "High" : "ከፍተኛ") : (locale === "en" ? "Medium" : "መካከለኛ")}
                              </span>
                              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
                                {isExpanded ? t.hide : t.detail}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/80">
                            {h.description}
                          </p>
                          <AnimatePresence initial={false}>
                            {isExpanded && h.details && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`overflow-hidden mt-2 pt-2 border-t text-[11px] leading-relaxed ${high
                                    ? "border-[oklch(0.62_0.22_27_/_20%)] text-[oklch(0.45_0.2_27)]/90"
                                    : "border-[oklch(0.72_0.17_60_/_20%)] text-[oklch(0.5_0.15_60)]/90"
                                  }`}
                              >
                                {h.details}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    {(data.hazards ?? []).length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        {t.noHazards}
                      </p>
                    )}
                  </div>
                </section>

                <button
                  onClick={() => setViewState("purchase_check")}
                  className="mt-6 w-full py-3.5 rounded-full gold-gradient text-xs uppercase tracking-widest text-primary-foreground font-medium shadow-md flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  {t.analyzeRoutine}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}

            {viewState === "purchase_check" && (
              <motion.div
                key="purchase_check"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-gold mb-6 border border-gold/20">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl text-foreground mb-2 px-2 leading-tight">
                  {t.doYouOwn}
                </h3>
                <p className="text-xs text-muted-foreground mb-8 px-4">
                  {t.buildGuide}
                </p>

                <div className="flex w-full gap-4">
                  <button
                    onClick={() => handlePurchaseChoice(true)}
                    className="flex-1 py-4 rounded-2xl border border-gold bg-secondary/35 text-gold font-display font-medium text-lg hover:bg-secondary/50 transition-all shadow-sm"
                  >
                    {t.yes}
                  </button>
                  <button
                    onClick={() => handlePurchaseChoice(false)}
                    className="flex-1 py-4 rounded-2xl border border-border bg-card text-foreground font-display text-lg hover:bg-muted/40 transition-all"
                  >
                    {t.no}
                  </button>
                </div>
              </motion.div>
            )}

            {viewState === "recommendation" && (
              <motion.div
                key="recommendation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="py-4"
              >
                {data.isProductSafe ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-500/20">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl text-foreground mb-3">
                      {t.cleanSafeFormula}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground/80 px-4 bg-secondary/30 border border-gold/20 rounded-2xl p-5 mb-8">
                      {t.clearOfToxic}
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full py-3.5 rounded-full gold-gradient text-xs uppercase tracking-widest text-primary-foreground font-medium shadow-md"
                    >
                      {t.done}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <HeartHandshake className="h-5 w-5 text-gold" />
                      <h3 className="font-display text-lg text-foreground">
                        {t.recommendedSwap}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      {t.formulaHarmful}
                    </p>

                    <div className="rounded-2xl border border-gold bg-secondary/20 p-5 mb-8 relative overflow-hidden">
                      <div className="absolute right-3 top-3 rounded-full border border-gold/30 bg-card px-2 py-0.5 text-[8px] uppercase tracking-widest text-gold font-medium">
                        {t.pureBotanic}
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        {data.alternativeProduct?.brand || "Botanical Organics"}
                      </p>
                      <h4 className="font-display text-xl text-gold mt-1">
                        {data.alternativeProduct?.name || "Natural Hydration Elixir"}
                      </h4>
                      <p className="mt-3 text-xs leading-relaxed text-foreground/80">
                        {data.alternativeProduct?.reason ||
                          (locale === "en"
                            ? "A cleaner alternative curated specifically to soothe your skin profile."
                            : "የቆዳዎን ሁኔታ ለማረጋጋት በተለይ የተዘጋጀ ንጹህ አማራጭ ምርት።")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <a
                        href="https://abi-cosmetics.com/shop-2/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 rounded-full gold-gradient text-xs uppercase tracking-widest text-primary-foreground font-medium shadow-md flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity text-center font-sans"
                      >
                        {t.shopAlternative}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-full border border-border bg-card text-xs uppercase tracking-widest text-muted-foreground font-medium hover:bg-muted/40 transition-colors"
                      >
                        {t.returnToHub}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {viewState === "usage" && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* routine schedule banner */}
                <div className="rounded-2xl border border-gold/30 bg-secondary/30 p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-gold" />
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        {t.suggestedIntegration}
                      </p>
                      <p className="text-xs text-foreground font-medium">
                        {data.usageDetails?.whenToUse || (locale === "en" ? "Morning / Night routine" : "የጠዋት / ማታ ልምምድ")}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full border border-gold/40 px-3 py-0.5 text-[9px] uppercase tracking-widest text-gold font-medium">
                    {t.routineActive}
                  </div>
                </div>

                {/* how to use */}
                <section className="mb-6">
                  <h4 className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground mb-2">
                    {t.applicationGuide}
                  </h4>
                  <p className="text-xs leading-relaxed text-foreground/80 bg-card border border-border rounded-2xl p-4">
                    {data.usageDetails?.howToUse ||
                      (locale === "en"
                        ? "Apply a small pea-sized amount onto dry skin. Smooth outward and tap lightly until absorbed."
                        : "በጥቂቱ ወስደው በደረቅ ቆዳ ላይ ይቀቡት። ሙሉ በሙሉ እስኪመጠጥ ድረስ ቀስ እያደረጉ ማሸት።")}
                  </p>
                </section>

                {/* timeline details */}
                <section className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-gold" />
                    <h4 className="text-[11px] uppercase tracking-[0.35em] text-foreground">
                      {t.timeline30Day}
                    </h4>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                    {/* Day 3 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border border-gold bg-background" />
                      <h5 className="font-display text-sm text-gold font-medium">
                        {t.day3Calming}
                      </h5>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-1">
                        {data.usageDetails?.timeline?.day3 ||
                          (locale === "en" ? "Assess early reactions. Minor redness should begin calming." : "የመጀመሪያ ደረጃ የቆዳ ምላሽን ይከታተሉ። መጠነኛ መቅላት መረጋጋት ይጀምራል።")}
                      </p>
                    </div>
                    {/* Day 14 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border border-gold bg-background" />
                      <h5 className="font-display text-sm text-gold font-medium">
                        {t.day14Reset}
                      </h5>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-1">
                        {data.usageDetails?.timeline?.day14 ||
                          (locale === "en" ? "Skin cellular turnover increases. Textural refinement and hydration levels adjust." : "የቆዳ ሴሎች መታደስ ይጨምራል። የቆዳ ገጽታ ልስላሴ እና የእርጥበት መጠን ይስተካከላል።")}
                      </p>
                    </div>
                    {/* Day 30 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border border-gold bg-gold" />
                      <h5 className="font-display text-sm text-gold font-medium">
                        {t.day30Trans}
                      </h5>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-1">
                        {data.usageDetails?.timeline?.day30 ||
                          (locale === "en" ? "Deep dermal benefits lock in. Noticeable structural glow and elasticity returns." : "የውስጠኛው ቆዳ ጥቅሞች ይረጋጋሉ። የሚታይ የተፈጥሮ ውበትና የመለጠጥ ኃይል ይመለሳል።")}
                      </p>
                    </div>
                  </div>
                </section>

                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-full gold-gradient text-xs uppercase tracking-widest text-primary-foreground font-medium shadow-md hover:opacity-90 transition-opacity"
                >
                  {t.startCoaching}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </>
  );
}

