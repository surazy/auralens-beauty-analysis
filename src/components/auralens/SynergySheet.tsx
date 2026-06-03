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
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 240 }}
      className="absolute inset-x-0 bottom-0 z-40 max-h-[88%] overflow-y-auto rounded-t-[2rem] glass px-6 pb-10 pt-4"
    >
      <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Synergy Reveal</p>
          <h2 className="mt-1 font-display text-2xl gold-text-gradient">
            {data?.brand || "Unknown House"}
          </h2>
          <p className="text-sm text-muted-foreground">{data?.productName || "Untitled Formula"}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
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
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-gold/25 bg-[oklch(0.82_0.13_85_/_6%)] p-4"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-gold" />
                    <p className="text-sm font-medium text-gold">{b.name}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{b.description}</p>
                </motion.div>
              ))}
              {(data.benefits ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No benefits detected.</p>
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.78_0.16_65)]" />
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
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className={`rounded-2xl border p-4 ${
                      high
                        ? "border-[oklch(0.7_0.2_40_/_50%)] bg-[oklch(0.7_0.2_40_/_8%)]"
                        : "border-[oklch(0.78_0.16_65_/_40%)] bg-[oklch(0.78_0.16_65_/_6%)]"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          high ? "text-[oklch(0.78_0.18_45)]" : "text-[oklch(0.82_0.14_65)]"
                        }`}
                      >
                        {h.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${
                          high
                            ? "bg-[oklch(0.7_0.2_40_/_20%)] text-[oklch(0.85_0.18_45)]"
                            : "bg-[oklch(0.78_0.16_65_/_20%)] text-[oklch(0.85_0.14_65)]"
                        }`}
                      >
                        {h.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{h.description}</p>
                  </motion.div>
                );
              })}
              {(data.hazards ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No hazards detected.</p>
              )}
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}
