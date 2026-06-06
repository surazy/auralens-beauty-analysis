"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Sliders, Camera, History } from "lucide-react";

import { VanityHub } from "@/components/auralens/VanityHub";
import { CameraMatrix } from "@/components/auralens/CameraMatrix";
import { DashboardHub } from "@/components/auralens/DashboardHub";
import HistoryPage from "@/app/history/page";
import {
  SynergySheet,
  type AnalysisResult,
} from "@/components/auralens/SynergySheet";
import { db } from "@/lib/db";
import { type Locale } from "@/lib/translations";

type View = "hub" | "camera";
type Tab = "dashboard" | "hub" | "history";

const mockEnglishPayload: AnalysisResult = {
  brand: "Head & Shoulders",
  productName: "Classic Clean Anti-Dandruff Shampoo",
  isProductSafe: false,
  benefits: [
    {
      name: "Zinc Pyrithione",
      description: "Controls scalp flaking, itching, and irritation associated with dandruff.",
      details: "An active antimicrobial agent that targets Malassezia yeast, restoring balance to the scalp microbiome and preventing flakiness."
    },
    {
      name: "Citric Acid",
      description: "Balances pH levels and enhances natural hair shine.",
      details: "Acts as a mild chelating agent and pH adjuster, ensuring the formula aligns with the natural acidity of the scalp."
    }
  ],
  hazards: [
    {
      name: "Sodium Laureth Sulfate",
      riskLevel: "Medium",
      description: "A harsh cleansing agent that can strip natural moisture and irritate dry skin.",
      details: "An anionic surfactant that creates thick lather but can severely compromise the lipid barrier of sensitive or dry skin."
    },
    {
      name: "Methylisothiazolinone",
      riskLevel: "High",
      description: "A synthetic preservative known to cause contact dermatitis and skin allergies.",
      details: "Frequently flagged as a skin sensitizer, which can lead to eczema flares, redness, and itching with repeated use."
    }
  ],
  alternativeProduct: {
    brand: "Kuriftu",
    name: "Kuriftu Soothing Herbal Shampoo",
    reason: "This locally sourced, botanical shampoo uses gentle plant-derived surfactants and local tea tree oil to naturally soothe the scalp and prevent dandruff without stripping skin barriers."
  },
  usageDetails: {
    howToUse: "Apply to wet hair, massage gently into the scalp for 2 minutes, then rinse thoroughly. Follow with a light botanical conditioner.",
    whenToUse: "Use 2-3 times per week, alternating with a gentle hydrating wash.",
    timeline: {
      day3: "Initial reduction in scalp itching and surface flaking.",
      day14: "Dandruff significantly clears, and skin barrier pH begins to stabilize.",
      day30: "Scalp environment is fully balanced, leaving hair strong, soft, and flakes-free."
    }
  }
};

const mockAmharicPayload: AnalysisResult = {
  brand: "ሄድ ኤንድ ሾልደርስ",
  productName: "ክላሲክ ክሊን ፎረፎር ማጥፊያ ሻምፑ",
  isProductSafe: false,
  benefits: [
    {
      name: "ዚንክ ፒሪቲዮን",
      description: "ከፎረፎር ጋር የተያያዘ የራስ ቅል መላጥን፣ ማሳከክን እና መቆጣትን ይቆጣጠራል።",
      details: "የፎረፎር ዋነኛ መንስኤ የሆኑትን ረቂቅ ተሕዋስያን የሚያጠፋ እና የራስ ቅልን ጤንነት የሚጠብቅ ንቁ የህክምና ውህድ ነው።"
    },
    {
      name: "ሲትሪክ አሲድ",
      description: "የፒኤች (pH) ደረጃን ያስተካክላል እንዲሁም የፀጉርን የተፈጥሮ ብርሃን ይጨምራል።",
      details: "የራስ ቅልን ተፈጥሯዊ አሲዳማነት በመጠበቅ ፀጉር ጤናማና አንጸባራቂ እንዲሆን ይረዳል።"
    }
  ],
  hazards: [
    {
      name: "ሶዲየም ላውሬት ሰልፌት",
      riskLevel: "Medium",
      description: "የራስ ቅልን የተፈጥሮ እርጥበት የሚነጥቅና ስሜታዊ ቆዳን የሚያበሳጭ ጠንካራ ማጽጃ ነው።",
      details: "ከፍተኛ አረፋ ለመፍጠር የሚረዳ ኬሚካል ሲሆን፣ በተደጋጋሚ ጥቅም ላይ ሲውል የቆዳን የተፈጥሮ መከላከያ ንብርብር ይጎዳል።"
    },
    {
      name: "ሜቲሊሶቲያዞሊኖን",
      riskLevel: "High",
      description: "ለቆዳ አለርጂ እና ለከፍተኛ የራስ ቅል ብስጭት መንስኤ የሚሆን ሰው ሰራሽ መከላከያ ኬሚካል ነው።",
      details: "በቆዳ ላይ ጠንካራ አለርጂዎችን የሚያስከትል በመሆኑ በተለይ ለስሜታዊ ቆዳ ተጠቃሚዎች የቆዳ መቅላትና መቆጥቆጥን ያስከትላል።"
    }
  ],
  alternativeProduct: {
    brand: "ኩሪፍቱ",
    name: "ኩሪፍቱ እፅዋት ሻምፑ",
    reason: "ይህ ሙሉ በሙሉ ከተፈጥሯዊ እፅዋት የተቀመመ ሻምፑ የቆዳን እርጥበት ሳይነጥቅ ፎረፎርን ለማጥፋት እና ፀጉርን ለማለስለስ ይረዳል። ለስሜታዊ ቆዳ እጅግ በጣም ጥሩ አማራጭ ነው።"
  },
  usageDetails: {
    howToUse: "ፀጉርዎን ካራሱ በኋላ ሻምፑውን በመቀባት ለ 2 ደቂቃዎች የራስ ቅልዎን ማሸት፤ ከዚያም በንጹህ ውሃ መታጠብ።",
    whenToUse: "በሳምንት 2-3 ጊዜ በሻወር ወቅት ይጠቀሙ።",
    timeline: {
      day3: "የራስ ቅል ማሳከክ ይቀንሳል፣ የደረቀ ቆዳ መላጥ መሻሻል ማሳየት ይጀምራል።",
      day14: "የፎረፎር መበራከት በከጨማሪ ሁኔታ ይቀንሳል፣ የራስ ቅል ጤንነት ይመለሳል።",
      day30: "የራስ ቅል ጤናማና ሙሉ በሙሉ ከፎረፎር ነፃ ይሆናል፣ የፀጉር ጥንካሬ ይጨምራል።"
    }
  }
};

export default function HomePage() {
  const router = useRouter();
  const [view, setView] = useState<View>("hub");
  const [activeTab, setActiveTab] = useState<Tab>("hub");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [profile, setProfile] = useState<{ skinType: string; age: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [locale, setLocale] = useState<Locale>("en");
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    // Sync locale state from localStorage
    const savedLocale = localStorage.getItem("bloomy:locale") as Locale;
    if (savedLocale === "en" || savedLocale === "am") {
      setLocale(savedLocale);
    }

    // Sync sandbox state
    const params = new URLSearchParams(window.location.search);
    const sandboxParam = params.get("sandbox") === "true";
    const savedSandbox = localStorage.getItem("bloomy:sandbox") === "true";
    if (sandboxParam || savedSandbox) {
      setIsSandbox(true);
      if (sandboxParam) {
        localStorage.setItem("bloomy:sandbox", "true");
      }
    }

    const saved = localStorage.getItem("bloomy:profile");
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

  const handleToggleLocale = () => {
    const next = locale === "en" ? "am" : "en";
    setLocale(next);
    localStorage.setItem("bloomy:locale", next);
  };

  const handleCapture = async (base64: string, mode: "bottle" | "skin") => {
    setError(null);

    if (mode === "skin") {
      if (isSandbox) {
        // 700 milliseconds delay for sandbox mode
        await new Promise((resolve) => setTimeout(resolve, 700));

        const skinTypeVal = locale === "am" ? "ቅባታማ ቆዳ" : "Oily Skin";
        const focusVal = locale === "am"
          ? "በግንባር እና በአፍንጫ አካባቢ መጠነኛ ቅባት ታይቷል።"
          : "Moderate oiliness observed around the T-zone and forehead.";

        const skinScanResult = {
          skinType: skinTypeVal,
          hydra: 62,
          glow: 71,
          createdAt: Date.now(),
          primaryFocus: focusVal
        };

        localStorage.setItem("bloomy:skin_scan", JSON.stringify(skinScanResult));
        setActiveTab("dashboard");
        setView("hub");
        return;
      }

      try {
        const response = await fetch("/api/analyze-skin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64: base64,
            locale: locale,
          }),
        });

        const res = await response.json();

        if (res.ok && res.result) {
          const skinScanResult = {
            skinType: res.result.skinType,
            hydra: res.result.hydraScore ?? 62,
            glow: res.result.glowScore ?? 71,
            createdAt: Date.now(),
            primaryFocus: res.result.primaryFocus || ""
          };

          localStorage.setItem("bloomy:skin_scan", JSON.stringify(skinScanResult));
          setActiveTab("dashboard");
          setView("hub");
        } else {
          setError(res.error || "Skin analysis failed");
          setView("hub");
          setSheetOpen(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Skin analysis failed");
        setView("hub");
        setSheetOpen(true);
      }
      return;
    }

    // Default "bottle" mode
    if (isSandbox) {
      setResult(null);
      setError(null);
      setView("hub");
      setSheetOpen(true);
      
      // Simulate decoding delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const payload = locale === "am" ? mockAmharicPayload : mockEnglishPayload;
      setResult(payload);
      return;
    }

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
          locale: locale,
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
        <p className="font-display text-2xl gold-text-gradient animate-pulse">Bloomy</p>
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mt-2">
          {locale === "en" ? "Loading Profile" : "መገለጫ በመጫን ላይ"}
        </p>
      </div>
    );
  }

  const getTabClass = (tab: Tab) => {
    const isActive = activeTab === tab;
    if (activeTab === "dashboard") {
      return isActive
        ? "text-emerald-600 font-bold scale-105"
        : "text-emerald-950/35 hover:text-emerald-700";
    } else {
      return isActive
        ? "text-gold font-bold scale-105"
        : "text-muted-foreground hover:text-gold";
    }
  };

  return (
    <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background flex flex-col justify-between">
      
      {/* Active Tab View */}
      <div className="h-[calc(100%-4rem)] w-full overflow-hidden relative">
        {activeTab === "dashboard" && (
          <DashboardHub
            locale={locale}
            onToggleLocale={handleToggleLocale}
            onSwitchTab={(tab) => setActiveTab(tab)}
            onLaunchCamera={() => {
              setActiveTab("hub");
              setView("camera");
            }}
          />
        )}

        {activeTab === "hub" && (
          <VanityHub
            skinType={profile?.skinType ?? "Sensitive"}
            age={profile?.age ?? "30-39"}
            onLaunchCamera={() => setView("camera")}
            locale={locale}
            onToggleLocale={handleToggleLocale}
          />
        )}

        {activeTab === "history" && (
          <HistoryPage
            isTab={true}
            onBack={() => setActiveTab("hub")}
            localeProp={locale}
            onToggleLocaleProp={handleToggleLocale}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className={`h-16 w-full flex items-center justify-around z-25 border-t transition-all duration-300 ${
        activeTab === "dashboard"
          ? "bg-white border-[#BBF7D0]"
          : "bg-card border-border"
      }`}>
        {/* Left Tab: Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center w-20 py-1 transition-all select-none cursor-pointer ${getTabClass("dashboard")}`}
        >
          <Sliders className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 tracking-wider">
            {locale === "en" ? "Manage" : "ማስተዳደሪያ"}
          </span>
        </button>

        {/* Middle Tab: Home/Scan */}
        <button
          onClick={() => setActiveTab("hub")}
          className={`flex flex-col items-center justify-center w-20 py-1 transition-all select-none cursor-pointer ${getTabClass("hub")}`}
        >
          <Camera className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 tracking-wider">
            {locale === "en" ? "AuraLens" : "መነሻ"}
          </span>
        </button>

        {/* Right Tab: History */}
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center justify-center w-20 py-1 transition-all select-none cursor-pointer ${getTabClass("history")}`}
        >
          <History className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 tracking-wider">
            {locale === "en" ? "Archive" : "ማህደር"}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {view === "camera" && (
          <CameraMatrix
            onClose={() => setView("hub")}
            onCapture={handleCapture}
            locale={locale}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <SynergySheet
            data={result}
            error={error}
            onClose={() => setSheetOpen(false)}
            locale={locale}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

