"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { type ScanRecord } from "@/lib/db";
import { type Locale } from "@/lib/translations";

interface NutritionInsightsProps {
  locale: Locale;
  profile: { skinType: string; age: string } | null;
  ownedProducts: ScanRecord[];
  isSandbox: boolean;
}

interface NutritionData {
  focus: string;
  nutrients: Array<{ name: string; why: string; foods?: string[] }>;
  superfoods: Array<{ name: string; localName: string; prep: string }>;
  outerBodySynergy: string;
}

const mockEnglishPayload: NutritionData = {
  focus: "Targeting cellular barrier repair and sebum modulation internally to calm sensitive/oily skin.",
  nutrients: [
    { name: "Omega-3 & Omega-6 Fatty Acids", why: "Reduces skin inflammation, strengthens the lipid barrier, and improves dermal moisture retention.", foods: ["Walnuts", "Chia Seeds", "Flaxseed", "Salmon"] },
    { name: "Zinc & Silica", why: "Assists in cellular repair, balances excess sebum production, and fortifies nail plates against peeling.", foods: ["Pumpkin Seeds", "Oats", "Lentils", "Cucumber"] }
  ],
  superfoods: [
    { name: "Flaxseed (Omega-rich)", localName: "Telba (ተልባ)", prep: "Lightly roast and grind. Mix 1-2 tablespoons into warm water or juices, drinking daily on an empty stomach." },
    { name: "Black Seed / Tikur Azmud", localName: "Habba Soda (ሃባ ሶዳ)", prep: "Crush seeds slightly. Consume 1/2 teaspoon daily mixed with organic raw honey to stimulate scalp repair." }
  ],
  outerBodySynergy: "Traditional flaxseed and black seed extracts deliver internal lipids that fortify the hair follicle matrix and increase nail tensile strength."
};

const mockAmharicPayload: NutritionData = {
  focus: "በውስጥ በኩል የሴል መከላከያ ሽፋንን ለመጠገን እና የቅባት መጠንን ለማስተካከል ያለመ የአመጋገብ መመሪያ።",
  nutrients: [
    { name: "ኦሜጋ-3 እና ኦሜጋ-6 ፋቲ አሲድ", why: "የቆዳ መቆጣትን ይቀንሳል፣ የሊፒድ መከላከያ ሽፋንን ያጠናክራል እንዲሁም የቆዳ እርጥበትን ይጨምራል።", foods: ["አክሩት (ዋለንት)", "ቺያ ፍሬ", "ተልባ", "ሳልሞን አሳ"] },
    { name: "ዚንክ እና ሲሊካ", why: "የሴሎችን ጥገና ያፋጥናል፣ ከመጠን በላይ የቅባት መመንጨትን ያስተካክላል እንዲሁም የጥፍር ጥንካሬን ይጨምራል።", foods: ["የዱባ ፍሬ", "አጃ", "ምስር", "ኪያር"] }
  ],
  superfoods: [
    { name: "ተልባ (Flaxseed)", localName: "ተልባ (Telba)", prep: "ትንሽ አብስሎ መፍጨት። በቀን 1-2 የሾርባ ማንኪያ ተልባ በሙቅ ውሃ ወይም ጭማቂ በመቀላቀል በባዶ ሆድ ይጠጡ።" },
    { name: "ጥቁር አዝሙድ (Black Seed)", localName: "ሃባ ሶዳ (Habba Soda)", prep: "ዘሩን በጥቂቱ መፍጨት። የራስ ቅልን ጤንነት ለማሻሻል ግማሽ የሻይ ማንኪያ ጥቁር አዝሙድ ከተፈጥሮ ማር ጋር በመቀላቀል በየቀኑ ይውሰዱ።" }
  ],
  outerBodySynergy: "የተልባ እና ጥቁር አዝሙድ ንጥረ ነገሮች በጥፍር ጥንካሬ እና በራስ ቅል ጤንነት ላይ ፈጣን ለውጥ ያመጣሉ።"
};

export function NutritionInsights({ locale, profile, ownedProducts, isSandbox }: NutritionInsightsProps) {
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNutrition = async (force = false) => {
    // Generate cache keys based on parameters
    const profileKey = profile ? `${profile.skinType}:${profile.age}` : "none";
    const productsKey = ownedProducts.map((p) => p.id).sort().join(",");
    const cacheKey = "bloomy:nutrition_insights";

    // 1. Check local cache first if refresh not forced
    if (!force) {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          const cache = JSON.parse(saved);
          const cacheDate = new Date(cache.timestamp).toDateString();
          const todayDate = new Date().toDateString();

          // Validate cache matches locale, profile, products list and was created today
          if (
            cacheDate === todayDate &&
            cache.locale === locale &&
            cache.profileKey === profileKey &&
            cache.productsKey === productsKey &&
            cache.data
          ) {
            setData(cache.data);
            setError(null);
            return;
          }
        } catch (e) {
          console.error("Failed to load nutrition insights cache", e);
        }
      }
    }

    // 2. Fetch new analysis
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-nutrition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          products: ownedProducts,
          locale,
        }),
      });

      const res = await response.json();
      if (res.ok && res.result) {
        setData(res.result);
        
        // Save to cache
        const cacheObj = {
          data: res.result,
          timestamp: Date.now(),
          locale,
          profileKey,
          productsKey,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheObj));
      } else {
        setError(res.error || "Failed to load nutrition insights.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load nutrition insights.");
    } finally {
      setLoading(false);
    }
  };

  // Convert objects/arrays to primitive strings to prevent infinite loops from reference-changes
  const profileString = profile ? `${profile.skinType}:${profile.age}` : "";
  const productsString = ownedProducts.map((p) => p.id).sort().join(",");

  useEffect(() => {
    loadNutrition(false);
  }, [locale, isSandbox, profileString, productsString]);

  // UI labels based on locale
  const labels = {
    en: {
      title: "Total Vitality Matrix",
      sub: "Internal Dietary Guidance for Cellular Skin & Hair Synergy",
      blueprint: "Nutrient Blueprint",
      sources: "Sources:",
      superfoods: "Indigenous Superfoods",
      synergy: "Outer Body Synergy",
      banner: "Feed your cellular matrix. Taste custom wellness formulations at Kuriftu Resorts or source organic grains via WeVa Sphere.",
      cta: "Explore Organic Menu",
      loading: "Formulating bio-dietary matrix...",
      retry: "Retry Analysis",
      refreshTooltip: "Refresh insights",
    },
    am: {
      title: "የዕፅዋት አመጋገብ ማዕቀፍ",
      sub: "የቆዳ፣ የፀጉር እና የጥፍር ጤናን በውስጥ ለማሻሻል የሚረዳ የአመጋገብ መመሪያ",
      blueprint: "የንጥረ ነገሮች ዝርዝር",
      sources: "የሚገኙባቸው ምግቦች:",
      superfoods: "ተፈጥሯዊ የሀገር በቀል ምግቦች",
      synergy: "የውስጥና ውጭ የውህደት ግንኙነት",
      banner: "የሴሎችዎን እድገት በምግብ ይደግፉ። ልዩ የተፈጥሮ የአመጋገብ ውህዶችን በኩሪፍቱ ሪዞርት ይቅመሱ ወይም ኦርጋኒክ ምርቶችን በዌቫ ስፌር ይግዙ።",
      cta: "የተፈጥሮ ምግቦችን ያስሱ",
      loading: "የአመጋገብ መመሪያውን በማዘጋጀት ላይ...",
      retry: "ድጋሚ ሞክር",
      refreshTooltip: "ዕድገቱን አድስ",
    }
  }[locale];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-[#BBF7D0] bg-white p-5 shadow-sm shadow-emerald-50 text-left space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0FDF4]">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-emerald-600" />
          <div>
            <h3 className="font-display text-base text-emerald-950 font-bold leading-tight">
              {labels.title}
            </h3>
            <p className="text-[9px] text-neutral-400 font-medium">
              {labels.sub}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadNutrition(true)}
            disabled={loading}
            className="p-1.5 rounded-full border border-[#BBF7D0] bg-white text-emerald-700 hover:bg-[#F0FDF4] active:scale-95 transition-all shadow-sm disabled:opacity-40 select-none cursor-pointer flex items-center justify-center"
            title={labels.refreshTooltip}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 text-center flex flex-col items-center justify-center gap-3"
          >
            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
            <p className="text-xs text-neutral-500 font-medium animate-pulse">
              {labels.loading}
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 text-center space-y-3"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-xs text-neutral-600 px-4 leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => loadNutrition(true)}
              className="px-4 py-2 rounded-full border border-rose-200 text-rose-700 text-[10px] uppercase font-bold tracking-wider hover:bg-rose-50 transition-all"
            >
              {labels.retry}
            </button>
          </motion.div>
        ) : data ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Focus Focus area */}
            <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]/40 p-3.5 text-xs text-emerald-900 leading-relaxed font-medium">
              {data.focus}
            </div>

            {/* 2-column Grid layout */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Nutrient Blueprint */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {labels.blueprint}
                </h4>
                <div className="space-y-3">
                  {data.nutrients.map((n, idx) => (
                    <div key={idx} className="bg-[#F8FAF9] border border-emerald-50/60 p-2.5 rounded-xl text-left flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-emerald-950">
                          {n.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
                          {n.why}
                        </p>
                      </div>
                      {n.foods && n.foods.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-emerald-100/30">
                          <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                            {labels.sources}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {n.foods.map((food, fIdx) => (
                              <span 
                                key={fIdx} 
                                className="text-[9px] bg-emerald-100/60 text-emerald-800 border border-emerald-200/30 rounded px-1.5 py-0.5 font-medium"
                              >
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Indigenous Superfood Alternatives */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {labels.superfoods}
                </h4>
                <div className="space-y-3">
                  {data.superfoods.map((s, idx) => (
                    <div key={idx} className="bg-[#F8FAF9] border border-emerald-50/60 p-2.5 rounded-xl text-left">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-emerald-950">
                          {s.name}
                        </p>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200/50 rounded px-1.5 py-0.5 uppercase font-bold shrink-0 ml-1">
                          {s.localName.split(" ")[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
                        {s.prep}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Outer Body Synergy Section */}
            <div className="border-t border-[#F0FDF4] pt-3.5 space-y-1">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                {labels.synergy}
              </h5>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {data.outerBodySynergy}
              </p>
            </div>

            {/* Baseline Banner & Emerald CTA Button */}
            <div className="mt-2 border-t border-[#BBF7D0]/40 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-neutral-400 leading-normal max-w-xs text-center md:text-left italic">
                {labels.banner}
              </p>
              <a
                href="https://wevasphere.market"
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-[10px] font-bold uppercase tracking-widest text-white shadow-sm hover:brightness-105 active:scale-95 transition-all text-center shrink-0"
              >
                {labels.cta}
              </a>
            </div>

          </motion.div>
        ) : null}
      </AnimatePresence>

    </motion.section>
  );
}
