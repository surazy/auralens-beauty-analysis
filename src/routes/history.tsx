import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Leaf, AlertTriangle, Sparkles, X } from "lucide-react";
import { db, type ScanRecord } from "@/lib/db";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Ritual Archive — AuraLens" },
      { name: "description", content: "Your scanned beauty formulas, stored on-device." },
    ],
  }),
  component: HistoryPage,
});

function fmt(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function HistoryPage() {
  const [items, setItems] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  async function refresh() {
    setItems(await db.listScans());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function handleDelete(id: string) {
    await db.deleteScan(id);
    refresh();
  }
  async function handleClear() {
    if (!confirm("Clear all archived scans?")) return;
    await db.clearScans();
    refresh();
  }

  return (
    <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_85_/_18%)] blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 pt-12">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Archive
          </p>
          <h1 className="font-display text-2xl gold-text-gradient">Ritual Log</h1>
        </div>
        <button
          onClick={handleClear}
          disabled={items.length === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card disabled:opacity-40"
          aria-label="Clear all"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </header>

      <div className="relative z-10 mt-6 h-[calc(100%-7rem)] overflow-y-auto px-6 pb-10">
        {loading ? (
          <p className="mt-20 text-center text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-24 text-center">
            <Leaf className="mx-auto mb-4 h-10 w-10 text-gold opacity-60" />
            <p className="font-display text-lg">No scans yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Capture a formula to begin your archive.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full gold-gradient px-6 py-2 text-xs uppercase tracking-widest text-primary-foreground"
            >
              Begin a Ritual
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <button
                  onClick={() => setSelected(it)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-base text-foreground">
                        {it.brand || "Unknown"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {it.productName || "Untitled formula"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {fmt(it.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2 py-0.5 text-gold">
                      <Sparkles className="h-3 w-3" /> {it.benefits.length}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.62_0.22_27_/_40%)] px-2 py-0.5 text-[oklch(0.5_0.2_27)]">
                      <AlertTriangle className="h-3 w-3" /> {it.hazards.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(it.id)}
                  className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailSheet record={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailSheet({ record, onClose }: { record: ScanRecord; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-30 bg-foreground/40"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        className="absolute inset-x-0 bottom-0 z-40 max-h-[90%] overflow-y-auto rounded-t-[2rem] border border-border bg-card px-6 pb-10 pt-4 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
              Archived Reveal
            </p>
            <h2 className="mt-1 font-display text-2xl gold-text-gradient">
              {record.brand || "Unknown House"}
            </h2>
            <p className="text-sm text-muted-foreground">{record.productName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-gold" />
            <h3 className="text-[11px] uppercase tracking-[0.35em]">Skin Benefits</h3>
          </div>
          <div className="space-y-2">
            {record.benefits.map((b, i) => (
              <div key={i} className="rounded-2xl border border-gold/30 bg-secondary p-4">
                <p className="text-sm font-medium text-gold">{b.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/80">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.62_0.22_27)]" />
            <h3 className="text-[11px] uppercase tracking-[0.35em]">Material Hazards</h3>
          </div>
          <div className="space-y-2">
            {record.hazards.map((h, i) => {
              const high = h.riskLevel === "High";
              return (
                <div
                  key={i}
                  className={`rounded-2xl border p-4 ${
                    high
                      ? "border-[oklch(0.62_0.22_27_/_50%)] bg-[oklch(0.95_0.05_30)]"
                      : "border-[oklch(0.72_0.17_60_/_50%)] bg-[oklch(0.97_0.04_70)]"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className={`text-sm font-medium ${high ? "text-[oklch(0.45_0.2_27)]" : "text-[oklch(0.5_0.15_60)]"}`}>
                      {h.name}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest text-white ${high ? "bg-[oklch(0.62_0.22_27)]" : "bg-[oklch(0.72_0.17_60)]"}`}>
                      {h.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">{h.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </motion.div>
    </>
  );
}
