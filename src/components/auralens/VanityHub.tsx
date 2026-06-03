import { motion } from "framer-motion";
import { Camera, Sparkles, Clock, Droplet, Flower2 } from "lucide-react";

interface Props {
  onLaunchCamera: () => void;
}

export function VanityHub({ onLaunchCamera }: Props) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_85_/_18%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[oklch(0.82_0.13_85_/_10%)] blur-3xl" />

      {/* header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-12">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Maison</p>
          <h1 className="font-display text-3xl gold-text-gradient">AuraLens</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full glass">
          <Flower2 className="h-4 w-4 text-gold" />
        </div>
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Active State</p>
            <p className="mt-2 font-display text-xl text-foreground">Sensitive & Dry</p>
            <p className="text-xs text-muted-foreground">Skin Profile · pH 5.4</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1">
              <Droplet className="h-3 w-3 text-gold" />
              <span className="text-[10px] tracking-widest text-gold">HYDRA 62%</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] tracking-widest text-muted-foreground">GLOW 71</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* central FAB */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
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
        <p className="mt-6 font-display text-lg text-foreground">Begin the Ritual</p>
      </div>

      {/* ritual timeline */}
      <section className="relative z-10 mx-6 mb-8 rounded-3xl glass p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gold" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-foreground">Ritual Timeline</p>
          </div>
          <span className="text-[10px] text-muted-foreground">7d</span>
        </div>
        <ul className="space-y-3">
          {[
            { t: "Mon", n: "Vitamin C Serum", d: "+4% radiance" },
            { t: "Wed", n: "Niacinamide Tonic", d: "Pores refined" },
            { t: "Fri", n: "Squalane Oil", d: "Barrier restored" },
          ].map((r) => (
            <li key={r.t} className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 text-[10px] text-gold">
                {r.t}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{r.n}</p>
                <p className="text-[11px] text-muted-foreground">{r.d}</p>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
