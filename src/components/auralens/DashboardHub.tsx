"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Droplet, 
  Clock, 
  Send, 
  AlertTriangle, 
  HeartHandshake, 
  Leaf, 
  CheckCircle, 
  Bot, 
  User, 
  ChevronRight,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { db, type ScanRecord } from "@/lib/db";
import { type Locale } from "@/lib/translations";
import { NutritionInsights } from "@/components/auralens/NutritionInsights";

interface DashboardHubProps {
  locale: Locale;
  onToggleLocale: () => void;
  onSwitchTab: (tab: "dashboard" | "hub" | "history") => void;
  onLaunchCamera?: () => void;
}

interface SkinScanPayload {
  skinType: string;
  hydra: number;
  glow: number;
  createdAt: number;
}

// Internal Localized Translations for DashboardHub
const localTranslations = {
  en: {
    dashboardTitle: "Dashboard Hub",
    managementTab: "Vanity Management",
    welcomeTitle: "Welcome to Bloomy",
    onboardingText: "Scan your face or a product bottle to unlock your personalized vanity workspace.",
    scanFaceBtn: "Scan Face (Simulate)",
    scanProductBtn: "Scan Product Bottle",
    activeState: "Active State",
    skinProfile: "Skin Profile",
    hydraLabel: "HYDRA LEVEL",
    glowLabel: "GLOW INDEX",
    vanityShelf: "Vanity Shelf",
    ownedProducts: "Owned Routine Products",
    clickToProject: "Click a product below to project its 30-day skin timeline.",
    timelineProjector: "Active Timeline Projection",
    day3Milestone: "Day 3 milestone",
    day14Milestone: "Day 14 milestone",
    day30Milestone: "Day 30 milestone",
    ritualSwapTitle: "Ritual Swap Recommendation",
    ritualSwapDesc: "We flagged an unsafe product in your scan history. Consider swapping it for this botanical alternative:",
    swapReasonLabel: "Why swap?",
    unifiedScanLog: "Unified Scan Log",
    chronologicalHistory: "Chronological Scan History & Progress Chats",
    safeBadge: "Safe & Clean ✓",
    harmfulBadge: "Contains Hazards ⚠",
    chatTitle: "Bloomy Coach Log",
    chatPlaceholder: "Type your progress note or ask coach...",
    chatOffline: "Simulating offline assistant response...",
    emptyVanity: "No owned products in shelf yet. Scan a product and mark 'YES' to owning it.",
    emptyLog: "No scans found in history yet.",
    removeScan: "Delete Scan Log",
    successScan: "Simulated Skin Scan successfully saved!",
    skinAnalysisTitle: "Skin Scan Completed",
    skinTypeLabel: "Analyzed Skin Type",
    hydraScore: "Hydration Score",
    glowScore: "Radiance Score",
    dismiss: "Dismiss",
  },
  am: {
    dashboardTitle: "ዳሽቦርድ ማዕከል",
    managementTab: "የውበት መደርደሪያ አስተዳደር",
    welcomeTitle: "እንኳን ወደ Bloomy በደህና መጡ",
    onboardingText: "ግላዊነት የተላበሰውን የውበት መደርደሪያዎን ለመክፈት ፊትዎን ወይም የምርት ጠርሙስዎን ይፈትሹ።",
    scanFaceBtn: "ፊት መርምር (አስመስል)",
    scanProductBtn: "የምርት ጠርሙስ መርምር",
    activeState: "ንቁ ሁኔታ",
    skinProfile: "የቆዳ መገለጫ",
    hydraLabel: "የእርጥበት መጠን",
    glowLabel: "የቆዳ ውበት መለኪያ",
    vanityShelf: "የውበት መደርደሪያ",
    ownedProducts: "የእርስዎ የዕለት ተዕለት ምርቶች",
    clickToProject: "የ 30 ቀን የቆዳ ለውጥ ሂደቱን ለማየት ከታች ምርት ላይ ይጫኑ።",
    timelineProjector: "የሂደት የጊዜ ሰሌዳ ትንበያ",
    day3Milestone: "ቀን 3 ግብ",
    day14Milestone: "ቀን 14 ግብ",
    day30Milestone: "ቀን 30 ግብ",
    ritualSwapTitle: "የልምምድ መለዋወጫ ምክረ ሃሳብ",
    ritualSwapDesc: "በታሪክዎ ውስጥ ጎጂ ምርት አግኝተናል። በምትኩ ይህንን የተፈጥሮ አማራጭ እንዲጠቀሙ እንመክራለን፡",
    swapReasonLabel: "ለምን ይለወጣል?",
    unifiedScanLog: "የተዋሃደ የፍተሻ መዝገብ",
    chronologicalHistory: "የፍተሻ ታሪክ እና የውይይት መዝገቦች",
    safeBadge: "አስተማማኝ እና ንጹህ ✓",
    harmfulBadge: "ጎጂ ኬሚካሎች አሉት ⚠",
    chatTitle: "የብሉሚ አማካሪ ውይይት",
    chatPlaceholder: "ስለ ምርቱ ጥያቄ ወይም የቆዳ ሁኔታዎን እዚህ ይጻፉ...",
    chatOffline: "የብሉሚ አማካሪ መልስ እየጻፈ ነው...",
    emptyVanity: "በመደርደሪያዎ ላይ እስካሁን ምንም ምርት የለም። ምርት ይፈትሹና የእርስዎ መሆኑን ይመዝግቡ።",
    emptyLog: "በታሪክ ውስጥ እስካሁን ምንም ፍተሻ አልተገኘም።",
    removeScan: "የፍተሻ መዝገብ አጥፋ",
    successScan: "የቆዳ ፍተሻ በአሸናፊነት ተጠናቋል!",
    skinAnalysisTitle: "የቆዳ ፍተሻ ተጠናቋል",
    skinTypeLabel: "የተተነተነ የቆዳ አይነት",
    hydraScore: "የእርጥበት ውጤት",
    glowScore: "የብርሃንነት ውጤት",
    dismiss: "ዝጋ",
  }
};

export function DashboardHub({ locale, onToggleLocale, onSwitchTab, onLaunchCamera }: DashboardHubProps) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [skinScan, setSkinScan] = useState<SkinScanPayload | null>(null);
  const [profile, setProfile] = useState<{ skinType: string; age: string; gender?: string; allergies?: string[] } | null>(null);
  
  // Interactive Vanity shelf selected item
  const [selectedProduct, setSelectedProduct] = useState<ScanRecord | null>(null);
  
  // Custom alerts state
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);

  // Chat inputs
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  const t = localTranslations[locale];

  // Refresh data from localStorage
  const loadData = async () => {
    // 1. Load product scans from db
    const historyScans = await db.listScans();
    setScans(historyScans);

    // 2. Load skin scan payload from localStorage
    const savedSkinScan = localStorage.getItem("bloomy:skin_scan");
    if (savedSkinScan) {
      try {
        setSkinScan(JSON.parse(savedSkinScan));
      } catch (e) {
        console.error("Failed to parse skin scan", e);
      }
    } else {
      setSkinScan(null);
    }

    // 3. Load basic profile
    const savedProfile = localStorage.getItem("bloomy:profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }

    // Auto select first owned product if none selected
    const owned = historyScans.filter((s) => s.hasPurchased === true);
    if (owned.length > 0 && !selectedProduct) {
      setSelectedProduct(owned[0]);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen to potential changes
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [selectedProduct]);

  // Simulate a skin scan
  const handleSimulateSkinScan = () => {
    const defaultSkinType = profile?.skinType || "Sensitive";
    const newScan: SkinScanPayload = {
      skinType: defaultSkinType,
      hydra: Math.floor(Math.random() * 30) + 55, // 55% - 85%
      glow: Math.floor(Math.random() * 30) + 60,  // 60% - 90%
      createdAt: Date.now(),
    };
    localStorage.setItem("bloomy:skin_scan", JSON.stringify(newScan));
    setSkinScan(newScan);
    setAlertMsg(t.successScan);
    setShowAnalysisPopup(true);
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  // Delete simulated scan
  const handleClearSkinScan = () => {
    localStorage.removeItem("bloomy:skin_scan");
    setSkinScan(null);
  };



  // Send messaging in unified log
  const handleSendLogMessage = async (productId: string) => {
    const inputVal = chatInputs[productId] || "";
    if (!inputVal.trim()) return;

    // Clear input
    setChatInputs(prev => ({ ...prev, [productId]: "" }));

    // Find record
    const targetScan = scans.find((s) => s.id === productId);
    if (!targetScan) return;

    const userMessage = {
      sender: "user" as const,
      text: inputVal,
      date: locale === "en" ? "Today" : "ዛሬ",
    };

    const currentLog = targetScan.progressChatLog || [];
    const updatedLog = [...currentLog, userMessage];

    // Update locally
    const updatedRecord = { ...targetScan, progressChatLog: updatedLog };
    await db.updateScan(updatedRecord);
    await loadData();

    // Trigger Typing
    setTypingStatus(prev => ({ ...prev, [productId]: true }));

    // Timeout simulator (1.2s delay)
    setTimeout(async () => {
      let aiResponseText = "";
      
      const productBrand = targetScan.brand || "Bloomy Formula";
      const productName = targetScan.productName || "Cosmetics";

      if (locale === "en") {
        if (!targetScan.isProductSafe) {
          aiResponseText = `Coach Reminder: ${productName} contains flagged hazards. I strongly suggest swapping it for ${targetScan.alternativeProduct?.name || "our suggested botanical swap"} to avoid barrier irritation.`;
        } else {
          aiResponseText = `Excellent progress update! The active botanical matrix of ${productBrand} ${productName} is gentle on your ${targetScan.usageDetails?.whenToUse || "skin routine"}. Monitor for hydration peaks around Day 14.`;
        }

        // Generic response extensions based on user input
        if (inputVal.toLowerCase().includes("dry") || inputVal.toLowerCase().includes("peel")) {
          aiResponseText += " Since you mentioned dry skin feedback, lock in extra hydration with pure rosehip oil or honey balm.";
        }
      } else {
        // Amharic response
        if (!targetScan.isProductSafe) {
          aiResponseText = `የአሰልጣኝ ማሳሰቢያ፡ ${productName} ጎጂ ኬሚካሎችን ይዟል። የቆዳ ብስጭትን ለመከላከል ወደ ${targetScan.alternativeProduct?.name || "የተጠቆመው ተፈጥሯዊ መለዋወጫ"} እንዲቀይሩ በጥብቅ እመክራለሁ።`;
        } else {
          aiResponseText = `በጣም ጥሩ እድገት ነው! የ${productBrand} ${productName} የዕፅዋት ውህደት ለቆዳዎ ተስማሚ ነው። በቀን 14 አካባቢ የእርጥበት መጠን መጨመርን ያስተውላሉ።`;
        }

        if (inputVal.includes("ደረቅ") || inputVal.includes("ማቃጠል")) {
          aiResponseText += " የቆዳ መድረቅ ወይም መቆጥቆጥ ከተሰማዎት አጠቃቀሙን በመቀነስ የኩሪፍቱ እፅዋት ሻምፑ ወይም ማስታገሻ ይጠቀሙ።";
        }
      }

      const aiMessage = {
        sender: "ai" as const,
        text: aiResponseText,
        date: locale === "en" ? "Just now" : "አሁን",
      };

      const finalLog = [...updatedLog, aiMessage];
      const finalRecord = { ...targetScan, progressChatLog: finalLog };
      
      await db.updateScan(finalRecord);
      setTypingStatus(prev => ({ ...prev, [productId]: false }));
      await loadData();
    }, 1200);
  };

  const handleInputChange = (productId: string, val: string) => {
    setChatInputs(prev => ({ ...prev, [productId]: val }));
  };

  const handleDeleteScan = async (id: string) => {
    await db.deleteScan(id);
    await loadData();
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
  };

  // Format skin type to localized text
  const formatSkinType = (st: string) => {
    if (locale === "en") return `${st} Skin`;
    switch (st) {
      case "Dry": return "ደረቅ ቆዳ";
      case "Oily": return "ቅባታማ ቆዳ";
      case "Sensitive": return "ስሜታዊ ቆዳ";
      case "Acne-Prone": return "ብጉር የሚወጣበት ቆዳ";
      default: return `${st} ቆዳ`;
    }
  };

  // Filter owned products
  const ownedProducts = scans.filter((s) => s.hasPurchased === true);

  // Determine empty onboarding state
  const isWorkspaceEmpty = scans.length === 0 && !skinScan;

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-gradient-to-b from-[#F0FDF4] to-[#FFFFFF] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-24 text-neutral-800">
      
      {/* Background Mint Aura */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#DCFCE7]/75 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 right-0 h-64 w-64 rounded-full bg-[#F0FDF4]/60 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-12">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-semibold">
            {t.managementTab}
          </span>
          <h1 className="font-display text-2xl text-emerald-950 font-bold">
            {t.dashboardTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLocale}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#BBF7D0] bg-white text-emerald-700 hover:bg-[#F0FDF4] transition-all shadow-sm"
          >
            {locale === "en" ? "አማርኛ" : "English"}
          </button>
        </div>
      </header>

      {/* Alert Banner / Notification */}
      {alertMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-medium shadow-sm flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{alertMsg}</span>
        </motion.div>
      )}

      {/* 1. Onboarding Empty State */}
      {isWorkspaceEmpty ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center mt-12">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl border border-[#BBF7D0] bg-white p-8 shadow-md shadow-emerald-50/50"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] text-emerald-600">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="font-display text-xl text-emerald-950 font-bold mb-3">
              {t.welcomeTitle}
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              {t.onboardingText}
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSimulateSkinScan}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-xs font-bold uppercase tracking-widest text-white shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
              >
                {t.scanFaceBtn}
              </button>
              <button
                onClick={() => onSwitchTab("hub")}
                className="w-full py-3.5 rounded-full border border-[#BBF7D0] bg-white text-xs font-bold uppercase tracking-widest text-emerald-700 hover:bg-[#F0FDF4] active:scale-[0.98] transition-all"
              >
                {t.scanProductBtn}
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="relative z-10 px-6 mt-6 space-y-6">
          
          {/* 2. Active State Profile Card */}
          <section className="rounded-3xl border border-[#BBF7D0] bg-white p-5 shadow-sm shadow-emerald-50">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0FDF4]">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-700 font-bold">
                  {t.activeState}
                </span>
              </div>
              {skinScan ? (
                <button 
                  onClick={handleClearSkinScan}
                  className="text-[9px] uppercase tracking-wider text-rose-500 hover:underline"
                >
                  {locale === "en" ? "Reset" : "ዳግም ጀምር"}
                </button>
              ) : (
                <button
                  onClick={handleSimulateSkinScan}
                  className="text-[9px] uppercase tracking-wider text-emerald-600 hover:underline font-semibold"
                >
                  {locale === "en" ? "Scan Face" : "ፊት መርምር"}
                </button>
              )}
            </div>

            <div className="pt-3">
              <p className="text-[10px] uppercase text-neutral-400 tracking-wider">
                {t.skinProfile}
              </p>
              <h3 className="font-display text-xl text-emerald-950 font-bold mt-0.5">
                {skinScan ? formatSkinType(skinScan.skinType) : formatSkinType(profile?.skinType || "Sensitive")}
              </h3>
              
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-500 mt-1">
                <span>
                  {locale === "en" ? "Age Group:" : "የዕድሜ ክልል:"} {profile?.age || "30-39"}
                </span>
                <span>·</span>
                <span>
                  {locale === "en" ? "Gender:" : "ጾታ:"} {profile?.gender ? (locale === "en" ? profile.gender : (profile.gender === "Male" ? "ወንድ" : "ሴት")) : (locale === "en" ? "Not set" : "አልተገለጸም")}
                </span>
                <span>·</span>
                <span></span>
                <span>·</span>
                <span className="text-emerald-600 font-medium">{locale === "en" ? "Bio-Optimized" : "ለቆዳ ተስማሚ"}</span>
              </div>

              {/* Allergies tag display */}
              {profile?.allergies && profile.allergies.length > 0 && (
                <div className="mt-3.5 pt-2.5 border-t border-emerald-100/30">
                  <p className="text-[9px] uppercase tracking-wider text-emerald-800 font-bold mb-1">
                    {locale === "en" ? "Food Allergies:" : "የምግብ አለርጂዎች:"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {profile.allergies.map((allergy, idx) => {
                      const commonAllergens = [
                        { key: "Peanuts", en: "Peanuts", am: "ለውዝ (Peanuts)" },
                        { key: "Tree Nuts", en: "Tree Nuts", am: "የዛፍ ፍሬዎች (Tree Nuts)" },
                        { key: "Dairy", en: "Dairy / Milk", am: "የወተት ተዋጽኦ (Dairy)" },
                        { key: "Gluten / Wheat", en: "Gluten / Wheat", am: "ግሉተን / ስንዴ (Gluten)" },
                        { key: "Soy", en: "Soy / Soybeans", am: "አኩሪ አተር (Soy)" },
                        { key: "Seafood / Fish", en: "Seafood / Fish", am: "የባህር ምግቦች (Seafood)" },
                        { key: "Eggs", en: "Eggs", am: "እንቁላል (Eggs)" },
                        { key: "Sesame", en: "Sesame", am: "ሰሊጥ (Sesame)" }
                      ];
                      const match = commonAllergens.find(c => c.key === allergy);
                      const displayAllergy = match ? (locale === "en" ? match.en : match.am) : allergy;
                      return (
                        <span 
                          key={idx} 
                          className="text-[9px] bg-rose-50 text-rose-700 border border-rose-100/40 rounded px-1.5 py-0.5 font-medium"
                        >
                          {displayAllergy}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Progress metrics bars */}
              {skinScan && (
                <div className="mt-5 space-y-4">
                  {/* HYDRA Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] tracking-wider mb-1.5 font-bold">
                      <span className="text-emerald-800 flex items-center gap-1">
                        <Droplet className="h-3.5 w-3.5 text-emerald-500" />
                        {t.hydraLabel}
                      </span>
                      <span className="text-emerald-900 font-mono">{skinScan.hydra}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#E8FADF] overflow-hidden border border-[#BBF7D0]/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skinScan.hydra}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#16A34A]"
                      />
                    </div>
                  </div>

                  {/* GLOW Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] tracking-wider mb-1.5 font-bold">
                      <span className="text-emerald-800 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        {t.glowLabel}
                      </span>
                      <span className="text-emerald-900 font-mono">{skinScan.glow}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#E8FADF] overflow-hidden border border-[#BBF7D0]/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skinScan.glow}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#16A34A]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. The Data-Driven Vanity Shelf */}
          <section className="space-y-3">
            <div>
              <h2 className="font-display text-lg text-emerald-950 font-bold flex items-center gap-1.5">
                {t.vanityShelf}
              </h2>
              <p className="text-xs text-neutral-500">
                {ownedProducts.length > 0 ? t.clickToProject : t.emptyVanity}
              </p>
            </div>

            {ownedProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {ownedProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <motion.div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer rounded-2xl p-4 border text-left transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-[#F0FDF4] shadow-sm"
                          : "border-[#BBF7D0] bg-white hover:bg-[#F0FDF4]/30"
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-semibold">
                        {p.brand}
                      </span>
                      <h4 className="font-display text-sm text-neutral-800 font-bold line-clamp-1 mt-0.5">
                        {p.productName}
                      </h4>
                      <div className="mt-2.5 flex items-center justify-between text-[9px] text-neutral-400 uppercase font-mono">
                        <span>{p.isProductSafe ? "Safe" : "Unsafe"}</span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Dynamic Timeline Projection */}
            <AnimatePresence mode="wait">
              {selectedProduct && selectedProduct.usageDetails && (
                <motion.div
                  key={selectedProduct.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-emerald-200 bg-[#F0FDF4]/70 p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      {t.timelineProjector} · {selectedProduct.productName}
                    </span>
                  </div>

                  <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-emerald-200">
                    {/* Day 3 */}
                    <div className="relative text-left">
                      <div className="absolute -left-[23px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 bg-white text-[8px] text-emerald-600 font-bold shadow-sm">
                        3
                      </div>
                      <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        {t.day3Milestone}
                      </h5>
                      <p className="text-xs text-neutral-600 leading-normal mt-0.5">
                        {selectedProduct.usageDetails.timeline.day3}
                      </p>
                    </div>

                    {/* Day 14 */}
                    <div className="relative text-left">
                      <div className="absolute -left-[23px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 bg-white text-[8px] text-emerald-600 font-bold shadow-sm">
                        14
                      </div>
                      <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        {t.day14Milestone}
                      </h5>
                      <p className="text-xs text-neutral-600 leading-normal mt-0.5">
                        {selectedProduct.usageDetails.timeline.day14}
                      </p>
                    </div>

                    {/* Day 30 */}
                    <div className="relative text-left">
                      <div className="absolute -left-[23px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[8px] text-white font-bold shadow-sm">
                        30
                      </div>
                      <h5 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        {t.day30Milestone}
                      </h5>
                      <p className="text-xs text-neutral-700 leading-normal mt-0.5">
                        {selectedProduct.usageDetails.timeline.day30}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


          </section>

          {/* Total Vitality Matrix Nutrition Widget */}
          <NutritionInsights
            locale={locale}
            profile={profile || (skinScan ? { skinType: skinScan.skinType, age: "30-39" } : null)}
            ownedProducts={ownedProducts}
            isSandbox={typeof window !== "undefined" && localStorage.getItem("bloomy:sandbox") === "true"}
          />


        </div>
      )}

      {/* Dynamic Face Analysis Success Popup */}
      <AnimatePresence>
        {showAnalysisPopup && skinScan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnalysisPopup(false)}
              className="absolute inset-0 bg-black z-45"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xs bg-white rounded-3xl border border-[#BBF7D0] p-6 shadow-2xl z-50 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCFCE7] text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg text-emerald-950 font-bold mb-1">
                {t.skinAnalysisTitle}
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                {locale === "en" ? "Analysis completed on-device." : "የቆዳ ትንተና በስልኩ ላይ በተሳካ ሁኔታ ተጠናቋል።"}
              </p>

              <div className="space-y-2 mb-6 border-y border-[#F0FDF4] py-3 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t.skinTypeLabel}:</span>
                  <span className="font-semibold text-emerald-950">{formatSkinType(skinScan.skinType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t.hydraScore}:</span>
                  <span className="font-semibold text-emerald-700">{skinScan.hydra}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t.glowScore}:</span>
                  <span className="font-semibold text-emerald-700">{skinScan.glow}%</span>
                </div>
              </div>

              <button
                onClick={() => setShowAnalysisPopup(false)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-xs font-bold uppercase tracking-widest text-white shadow-sm"
              >
                {t.dismiss}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
