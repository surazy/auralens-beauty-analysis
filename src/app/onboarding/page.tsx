"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Sparkles, ShieldAlert, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { translations, type Locale } from "@/lib/translations";

type SkinType = "Dry" | "Oily" | "Sensitive" | "Acne-Prone";
type AgeRange = "Under 20" | "20-29" | "30-39" | "40-49" | "50+";

const ageRangesList: AgeRange[] = ["Under 20", "20-29", "30-39", "40-49", "50+"];

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [selectedSkin, setSelectedSkin] = useState<SkinType | null>(null);
  const [selectedAge, setSelectedAge] = useState<AgeRange | null>(null);
  const [selectedGender, setSelectedGender] = useState<"Male" | "Female" | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergyInput, setCustomAllergyInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setIsMounted(true);
    const savedLocale = localStorage.getItem("bloomy:locale") as Locale;
    if (savedLocale === "en" || savedLocale === "am") {
      setLocale(savedLocale);
    }
  }, []);

  if (!isMounted) return null;

  const handleToggleLocale = () => {
    const next = locale === "en" ? "am" : "en";
    setLocale(next);
    localStorage.setItem("bloomy:locale", next);
  };

  const handleAddCustomAllergy = () => {
    const trimmed = customAllergyInput.trim();
    if (trimmed && !selectedAllergies.includes(trimmed)) {
      setSelectedAllergies((prev) => [...prev, trimmed]);
    }
    setCustomAllergyInput("");
  };

  const handleRemoveAllergy = (allergy: string) => {
    setSelectedAllergies((prev) => prev.filter((a) => a !== allergy));
  };

  const handleToggleCommonAllergen = (allergyKey: string) => {
    if (selectedAllergies.includes(allergyKey)) {
      handleRemoveAllergy(allergyKey);
    } else {
      setSelectedAllergies((prev) => [...prev, allergyKey]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setDirection(1);
      setStep(2);
    } else if (step === 2) {
      setDirection(1);
      setStep(3);
    } else if (step === 3 && selectedSkin) {
      setDirection(1);
      setStep(4);
    } else if (step === 4 && selectedAge) {
      setDirection(1);
      setStep(5);
    } else if (step === 5 && selectedGender) {
      // Save profile and redirect
      localStorage.setItem(
        "bloomy:profile",
        JSON.stringify({
          skinType: selectedSkin,
          age: selectedAge,
          gender: selectedGender,
          allergies: selectedAllergies,
        })
      );
      router.push("/");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const t = translations[locale];

  const skinTypesList: { type: SkinType; label: string; desc: string; icon: any }[] = [
    {
      type: "Dry",
      label: t.drySkin,
      desc: t.drySkinDesc,
      icon: Droplet,
    },
    {
      type: "Oily",
      label: t.oilySkin,
      desc: t.oilySkinDesc,
      icon: Zap,
    },
    {
      type: "Sensitive",
      label: t.sensitiveSkin,
      desc: t.sensitiveSkinDesc,
      icon: ShieldAlert,
    },
    {
      type: "Acne-Prone",
      label: t.acneProneSkin,
      desc: t.acneProneSkinDesc,
      icon: Sparkles,
    },
  ];

  const translatedAgeLabel = (age: AgeRange) => {
    if (locale === "en") return age;
    switch (age) {
      case "Under 20": return "ከ 20 በታች";
      case "20-29": return "ከ 20-29";
      case "30-39": return "ከ 30-39";
      case "40-49": return "ከ 40-49";
      case "50+": return "50 በላይ";
      default: return age;
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const isNextDisabled = () => {
    if (step === 3 && !selectedSkin) return true;
    if (step === 4 && !selectedAge) return true;
    if (step === 5 && !selectedGender) return true;
    return false;
  };

  const getNextBtnLabel = () => {
    if (step === 1) return t.getStartedBtn;
    if (step === 2) return selectedAllergies.length === 0 ? t.skipBtn : t.continue;
    if (step === 5) return t.complete;
    return t.continue;
  };

  return (
    <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background flex flex-col justify-between px-6 py-10 font-sans">
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_85_/_15%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[oklch(0.82_0.13_85_/_8%)] blur-3xl" />

      {/* header */}
      <header className="relative z-10 flex items-center justify-between mt-6">
        <div className="w-10" /> {/* placeholder for balancing layout */}
        <div className="text-center flex-1">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            {locale === "en" ? "Aesthetic Profile" : "የውበት መገለጫ"}
          </p>
          <h1 className="font-display text-3xl gold-text-gradient mt-1">Bloomy</h1>
        </div>
        <button
          onClick={handleToggleLocale}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-card hover:border-gold/50 transition-colors text-gold"
        >
          {locale === "en" ? "አማርኛ" : "English"}
        </button>
      </header>

      {/* stepper progress indicator */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 mt-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-350 ${
              step === s ? "w-8 bg-gold" : "w-4 bg-border"
            }`}
          />
        ))}
      </div>

      {/* cards container */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-6">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full flex flex-col items-center gap-6 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[oklch(0.82_0.13_85_/_15%)] border border-gold/20 shadow-inner animate-pulse">
                <Sparkles className="h-10 w-10 text-gold" />
              </div>
              <div className="space-y-3">
                <h2 className="font-display text-2xl text-foreground font-bold tracking-tight">
                  {t.welcomeTitle}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed px-2">
                  {t.welcomeDesc}
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full flex flex-col gap-4"
            >
              <div className="text-center">
                <h2 className="font-display text-xl text-foreground font-bold">
                  {t.allergySelection}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.allergyDesc}
                </p>
              </div>

              {/* Prelisted Common Allergens Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {commonAllergens.map((item) => {
                  const isSelected = selectedAllergies.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleToggleCommonAllergen(item.key)}
                      className={`px-3 py-2.5 rounded-xl text-xs text-left transition-all border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-gold/10 text-gold border-gold shadow-sm font-semibold animate-pulseFast"
                          : "bg-card hover:bg-card/85 text-foreground border-border"
                      }`}
                    >
                      <span className="truncate">
                        {locale === "en" ? item.en : item.am}
                      </span>
                      {isSelected && <span className="text-gold font-bold ml-1 text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Custom Allergies Input and Tags */}
              <div className="space-y-2.5 mt-3 pt-3 border-t border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {locale === "en" ? "Other Allergens" : "ሌሎች አለርጂዎች"}
                </p>
                
                {/* Custom Tags */}
                {selectedAllergies.filter(a => !commonAllergens.some(c => c.key === a)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto">
                    {selectedAllergies
                      .filter(a => !commonAllergens.some(c => c.key === a))
                      .map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/10 text-gold border border-gold/20 text-[10px] font-semibold animate-fadeIn"
                        >
                          {allergy}
                          <button
                            onClick={() => handleRemoveAllergy(allergy)}
                            className="text-gold/60 hover:text-gold shrink-0 text-xs font-bold leading-none ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    placeholder={t.customAllergyPlaceholder}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-gold/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAllergy();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCustomAllergy}
                    className="px-4 py-2.5 rounded-xl bg-gold text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    {t.addBtn}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full flex flex-col gap-4"
            >
              <div className="text-center mb-2">
                <h2 className="font-display text-xl text-foreground font-bold">
                  {t.skinTypeSelection}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.skinTypeDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {skinTypesList.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedSkin === item.type;
                  return (
                    <motion.button
                      key={item.type}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSkin(item.type)}
                      className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                        isSelected
                          ? "border-gold bg-secondary/30 shadow-md"
                          : "border-border bg-card/60 hover:bg-card"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isSelected ? "bg-gold text-primary-foreground" : "bg-muted text-gold"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-base text-foreground font-medium">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full flex flex-col gap-4"
            >
              <div className="text-center mb-4">
                <h2 className="font-display text-xl text-foreground font-bold">
                  {t.ageSelection}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.ageDesc}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {ageRangesList.map((age) => {
                  const isSelected = selectedAge === age;
                  return (
                    <motion.button
                      key={age}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAge(age)}
                      className={`w-full py-4 px-6 rounded-2xl font-display text-center transition-all border text-base cursor-pointer ${
                        isSelected
                          ? "border-gold bg-secondary/30 text-gold font-medium shadow-md"
                          : "border-border bg-card/60 text-foreground hover:bg-card"
                      }`}
                    >
                      {translatedAgeLabel(age)}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full flex flex-col gap-4"
            >
              <div className="text-center mb-4">
                <h2 className="font-display text-xl text-foreground font-bold">
                  {t.genderSelection}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.genderDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "Female", label: t.genderFemale, icon: Sparkles },
                  { key: "Male", label: t.genderMale, icon: Zap }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedGender === item.key;
                  return (
                    <motion.button
                      key={item.key}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedGender(item.key as "Male" | "Female")}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl text-center transition-all border cursor-pointer ${
                        isSelected
                          ? "border-gold bg-secondary/30 text-gold shadow-md"
                          : "border-border bg-card/60 text-foreground hover:bg-card"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full mb-3 transition-colors ${
                          isSelected ? "bg-gold text-primary-foreground" : "bg-muted text-gold"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-display text-base font-semibold">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* footer actions */}
      <footer className="relative z-10 flex items-center justify-between mt-4">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border bg-card text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.back}
          </button>
        ) : (
          <div /> // empty space to keep alignment
        )}

        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest text-primary-foreground font-medium shadow-md transition-all cursor-pointer ${
            isNextDisabled()
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-55"
              : "gold-gradient hover:opacity-90"
          }`}
        >
          {getNextBtnLabel()}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </div>
  );
}
