"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Sparkles, ShieldAlert, Zap, ArrowRight, ArrowLeft } from "lucide-react";

type SkinType = "Dry" | "Oily" | "Sensitive" | "Acne-Prone";
type AgeRange = "Under 20" | "20-29" | "30-39" | "40-49" | "50+";

const skinTypesList: { type: SkinType; label: string; desc: string; icon: any }[] = [
  {
    type: "Dry",
    label: "Dry Skin",
    desc: "Feels tight, flakey, or parched. Needs hydration.",
    icon: Droplet,
  },
  {
    type: "Oily",
    label: "Oily Skin",
    desc: "Excess shine, visible pores, and sebum production.",
    icon: Zap,
  },
  {
    type: "Sensitive",
    label: "Sensitive Skin",
    desc: "Prone to redness, irritation, or reactions.",
    icon: ShieldAlert,
  },
  {
    type: "Acne-Prone",
    label: "Acne-Prone Skin",
    desc: "Frequent blemishes, breakouts, or clogged pores.",
    icon: Sparkles,
  },
];

const ageRangesList: AgeRange[] = ["Under 20", "20-29", "30-39", "40-49", "50+"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [selectedSkin, setSelectedSkin] = useState<SkinType | null>(null);
  const [selectedAge, setSelectedAge] = useState<AgeRange | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleNext = () => {
    if (step === 1 && selectedSkin) {
      setDirection(1);
      setStep(2);
    } else if (step === 2 && selectedAge) {
      // Save profile and redirect
      localStorage.setItem(
        "auralens:profile",
        JSON.stringify({
          skinType: selectedSkin,
          age: selectedAge,
        })
      );
      router.push("/");
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setDirection(-1);
      setStep(1);
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

  return (
    <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background flex flex-col justify-between px-6 py-10">
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_85_/_15%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[oklch(0.82_0.13_85_/_8%)] blur-3xl" />

      {/* header */}
      <header className="relative z-10 text-center mt-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Aesthetic Profile
        </p>
        <h1 className="font-display text-3xl gold-text-gradient mt-1">AuraLens</h1>
      </header>

      {/* stepper progress indicator */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 mt-4">
        <div
          className={`h-1.5 rounded-full transition-all duration-350 ${
            step === 1 ? "w-8 bg-gold" : "w-4 bg-border"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-350 ${
            step === 2 ? "w-8 bg-gold" : "w-4 bg-border"
          }`}
        />
      </div>

      {/* cards container */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-6">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full flex flex-col gap-4"
            >
              <div className="text-center mb-2">
                <h2 className="font-display text-xl text-foreground">
                  Select Your Skin Type
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  We customize hazard levels to match your profile.
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
                      className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all border ${
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
          ) : (
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
              <div className="text-center mb-4">
                <h2 className="font-display text-xl text-foreground">
                  What is Your Age Group?
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Helps target relevant anti-aging or youth-preserving ingredients.
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
                      className={`w-full py-4 px-6 rounded-2xl font-display text-center transition-all border text-base ${
                        isSelected
                          ? "border-gold bg-secondary/30 text-gold font-medium shadow-md"
                          : "border-border bg-card/60 text-foreground hover:bg-card"
                      }`}
                    >
                      {age}
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
        {step === 2 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border bg-card text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        ) : (
          <div /> // empty space to keep alignment
        )}

        <button
          onClick={handleNext}
          disabled={step === 1 ? !selectedSkin : !selectedAge}
          className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest text-primary-foreground font-medium shadow-md transition-all ${
            (step === 1 && !selectedSkin) || (step === 2 && !selectedAge)
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-55"
              : "gold-gradient hover:opacity-90"
          }`}
        >
          {step === 2 ? "Complete" : "Continue"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </div>
  );
}
