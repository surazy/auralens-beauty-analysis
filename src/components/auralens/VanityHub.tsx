"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Camera, Sparkles, Clock, Droplet, History, CheckCircle2, Bookmark, Flame, Zap } from "lucide-react";
import { db, type ScanRecord } from "@/lib/db";

interface Props {
  skinType: string;
  age: string;
  onLaunchCamera: () => void;
}

export function VanityHub({ skinType, age, onLaunchCamera }: Props) {
  const [activeRoutine, setActiveRoutine] = useState<ScanRecord | null>(null);
  const [activeSwap, setActiveSwap] = useState<ScanRecord | null>(null);
  const [usedToday, setUsedToday] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  useEffect(() => {
    async function loadHistoryItems() {
      const scans = await db.listScans();
      const routineItem = scans.find((s) => s.hasPurchased === true);
      const swapItem = scans.find(
        (s) => s.hasPurchased === false && s.alternativeProduct !== undefined
      );

      setActiveRoutine(routineItem || null);
      setActiveSwap(swapItem || null);
    }
    loadHistoryItems();

    const checked = localStorage.getItem("auralens:used_today");
    if (checked === new Date().toDateString()) {
      setUsedToday(true);
    }

    const wishlist = localStorage.getItem("auralens:wishlist_added");
    if (wishlist === "true") {
      setWishlistAdded(true);
    }
  }, []);

  const handleToggleUsed = () => {
    if (usedToday) {
      localStorage.removeItem("auralens:used_today");
      setUsedToday(false);
    } else {
      localStorage.setItem("auralens:used_today", new Date().toDateString());
      setUsedToday(true);
    }
  };

  const handleToggleWishlist = () => {
    if (wishlistAdded) {
      localStorage.removeItem("auralens:wishlist_added");
      setWishlistAdded(false);
    } else {
      localStorage.setItem("auralens:wishlist_added", "true");
      setWishlistAdded(true);
    }
  };
  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-8">
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_85_/_18%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[oklch(0.82_0.13_85_/_10%)] blur-3xl" />

      {/* header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-12">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Maison
          </p>
          <h1 className="font-display text-3xl gold-text-gradient">AuraLens</h1>
        </div>
        <Link
          href="/history"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Open archive"
        >
          <History className="h-4 w-4 text-gold" />
        </Link>
      </header>

      {/* profile card */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-6 mt-8 rounded-3xl glass p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Active State
              </p>
              <Link
                href="/onboarding"
                className="text-[10px] uppercase tracking-wider text-gold hover:underline"
              >
                Edit
              </Link>
            </div>
            <p className="mt-2 font-display text-xl text-foreground">
              {skinType} Skin
            </p>
            <p className="text-xs text-muted-foreground">
              Age {age} · pH 5.4
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1">
              <Droplet className="h-3 w-3 text-gold" />
              <span className="text-[10px] tracking-widest text-gold">
                HYDRA 62%
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] tracking-widest text-muted-foreground">
                GLOW 71
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* central FAB */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10">
        <p className="mb-5 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Tap to scan a formula
        </p>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onLaunchCamera}
          className="pulse-gold relative flex h-32 w-32 items-center justify-center rounded-full gold-gradient text-primary-foreground"
        >
          <div className="absolute inset-2 rounded-full border border-[oklch(0.1_0_0_/_15%)]" />
          <Camera className="h-12 w-12" strokeWidth={1.5} />
        </motion.button>
        <p className="mt-6 font-display text-lg text-foreground">
          Begin the Ritual
        </p>
      </div>

      {/* ritual timeline & reminder */}
      <section className="relative z-10 mx-6 mb-8 rounded-3xl glass p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gold" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-foreground font-semibold">
              Ritual Timeline
            </p>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-gold font-medium">
            Active Tracker
          </span>
        </div>

        <div className="space-y-4">
          {!activeRoutine && !activeSwap && (
            // Default timeline view if there are no scans yet
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/35 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    AuraLens Ritual
                  </p>
                  <p className="font-display text-base text-foreground font-medium">
                    Scan a product to begin
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                    Complete onboarding and scan your cosmetics formula label.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeRoutine && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/35 mt-0.5">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Active Routine · {activeRoutine.brand}
                  </p>
                  <p className="font-display text-base text-foreground font-medium truncate">
                    {activeRoutine.productName}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                    Suggested: {activeRoutine.usageDetails?.whenToUse || "Once daily"}
                  </p>
                </div>
              </div>

              {/* interactive reminder checklist */}
              <div className="mt-1 border-t border-border/50 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-foreground font-medium">
                    Did you use this today?
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    Track your daily application consistency.
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleToggleUsed}
                  className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all border ${
                    usedToday
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                      : "border-gold/40 bg-secondary/35 text-gold hover:bg-secondary/60"
                  }`}
                >
                  {usedToday ? "Applied ✓" : "Log Use"}
                </motion.button>
              </div>
            </div>
          )}

          {activeRoutine && activeSwap && (
            <div className="border-t border-border/50 my-2" />
          )}

          {activeSwap && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/35 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-gold font-medium">
                    Swap Alert · {activeSwap.alternativeProduct?.brand || "Botanical Swap"}
                  </p>
                  <p className="font-display text-base text-foreground font-medium truncate">
                    {activeSwap.alternativeProduct?.name || "Natural Recovery Serum"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-normal mt-0.5 line-clamp-2">
                    {activeSwap.alternativeProduct?.reason}
                  </p>
                </div>
              </div>

              {/* wishlist/reminder trigger */}
              <div className="mt-1 border-t border-border/50 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-foreground font-medium">
                    Intend to try this swap?
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    Save to your routine wishlist logs.
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleToggleWishlist}
                  className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all border ${
                    wishlistAdded
                      ? "border-gold/40 bg-secondary/35 text-gold"
                      : "border-border bg-card text-muted-foreground hover:text-foreground font-medium"
                  }`}
                >
                  {wishlistAdded ? "Wishlisted ✓" : "Add Log"}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
