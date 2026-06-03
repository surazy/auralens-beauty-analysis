import { motion } from "framer-motion";
import { X, Sparkles, AlertTriangle, Leaf } from "lucide-react";

export interface AnalysisResult {
  brand?: string;
  productName?: string;
  benefits?: { name: string; description: string }[];
  hazards?: { name: string; riskLevel: "High" | "Medium"; description: string }[];
}

interface Props {
  data: AnalysisResult | null;
  error?: string | null;
  onClose: () => void;
}

export function SynergySheet({ data, error, onClose }: Props) {
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
              Synergy Reveal
            </p>
            <h2 className="mt-1 font-display text-2xl gold-text-gradient">
              {data?.brand || "Unknown House"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {data?.productName || "Untitled Formula"}
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
          <>
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Leaf className="h-3.5 w-3.5 text-gold" />
                <h3 className="text-[11px] uppercase tracking-[0.35em] text-foreground">
                  Skin Benefits
                </h3>
              </div>
              <div className="space-y-2">
                {(data.benefits ?? []).map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-gold/30 bg-secondary p-4"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-gold" />
                      <p className="text-sm font-medium text-gold">{b.name}</p>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/80">
                      {b.description}
                    </p>
                  </motion.div>
                ))}
                {(data.benefits ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No benefits detected.
                  </p>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.62_0.22_27)]" />
                <h3 className="text-[11px] uppercase tracking-[0.35em] text-foreground">
                  Material Hazards
                </h3>
              </div>
              <div className="space-y-2">
                {(data.hazards ?? []).map((h, i) => {
                  const high = h.riskLevel === "High";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05 }}
                      className={`rounded-2xl border p-4 ${
                        high
                          ? "border-[oklch(0.62_0.22_27_/_50%)] bg-[oklch(0.95_0.05_30)]"
                          : "border-[oklch(0.72_0.17_60_/_50%)] bg-[oklch(0.97_0.04_70)]"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            high
                              ? "text-[oklch(0.45_0.2_27)]"
                              : "text-[oklch(0.5_0.15_60)]"
                          }`}
                        >
                          {h.name}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${
                            high
                              ? "bg-[oklch(0.62_0.22_27)] text-white"
                              : "bg-[oklch(0.72_0.17_60)] text-white"
                          }`}
                        >
                          {h.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground/80">
                        {h.description}
                      </p>
                    </motion.div>
                  );
                })}
                {(data.hazards ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hazards detected.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </motion.div>
    </>
  );
}
