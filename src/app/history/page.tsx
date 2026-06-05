"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Leaf,
  AlertTriangle,
  Sparkles,
  X,
  Send,
  Bot,
  HeartHandshake,
  ExternalLink,
  Clock,
} from "lucide-react";
import { db, type ScanRecord } from "@/lib/db";
import { translations, type Locale } from "@/lib/translations";

function fmt(ts: number, locale: Locale) {
  return new Date(ts).toLocaleString(locale === "en" ? "en-US" : "am-ET", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [items, setItems] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScanRecord | null>(null);
  const [locale, setLocale] = useState<Locale>("en");

  async function refresh() {
    setItems(await db.listScans());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const savedLocale = localStorage.getItem("bloomy:locale") as Locale;
    if (savedLocale === "en" || savedLocale === "am") {
      setLocale(savedLocale);
    }
  }, []);

  const handleToggleLocale = () => {
    const next = locale === "en" ? "am" : "en";
    setLocale(next);
    localStorage.setItem("bloomy:locale", next);
  };

  async function handleDelete(id: string) {
    await db.deleteScan(id);
    refresh();
  }

  async function handleClear() {
    const confirmMsg = locale === "en" ? "Clear all archived scans?" : "ሁሉንም የታቀፉ ምርቶች ያጥፉ?";
    if (!confirm(confirmMsg)) return;
    await db.clearScans();
    refresh();
  }

  const t = translations[locale];

  return (
    <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_85_/_18%)] blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 pt-12">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            {t.archive}
          </p>
          <h1 className="font-display text-2xl gold-text-gradient">
            {t.scanLog}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleLocale}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-card hover:border-gold/50 transition-colors text-gold"
          >
            {locale === "en" ? "አማርኛ" : "English"}
          </button>
          <button
            onClick={handleClear}
            disabled={items.length === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card disabled:opacity-40"
            aria-label="Clear all"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="relative z-10 mt-6 h-[calc(100%-7rem)] overflow-y-auto px-6 pb-10">
        {loading ? (
          <p className="mt-20 text-center text-sm text-muted-foreground">
            {t.loading}
          </p>
        ) : items.length === 0 ? (
          <div className="mt-24 text-center">
            <Leaf className="mx-auto mb-4 h-10 w-10 text-gold opacity-60" />
            <p className="font-display text-lg">{t.noScansYet}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {locale === "en" ? "Capture a formula to begin your archive." : "የመጀመሪያ ምርትዎን ለመመዝገብ መለያውን ይፈትሹ።"}
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full gold-gradient px-6 py-2 text-xs uppercase tracking-widest text-primary-foreground"
            >
              {t.beginscanAction}
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
                        {it.brand || (locale === "en" ? "Unknown" : "ያልታወቀ")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {it.productName || (locale === "en" ? "Untitled formula" : "ያልተሰየመ ፎርሙላ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {fmt(it.createdAt, locale)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2 py-0.5 text-gold">
                      <Sparkles className="h-3 w-3" /> {it.benefits.length}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.62_0.22_27_/_40%)] px-2 py-0.5 text-[oklch(0.5_0.2_27)]">
                      <AlertTriangle className="h-3 w-3" />{" "}
                      {it.hazards.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(it.id)}
                  className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
                >
                  {t.remove}
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailSheet
            record={selected}
            locale={locale}
            onClose={() => {
              setSelected(null);
              refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailSheet({
  record,
  locale,
  onClose,
}: {
  record: ScanRecord;
  locale: Locale;
  onClose: () => void;
}) {
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; text: string; date: string }>>(
    record.progressChatLog || []
  );
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [expandedBenefitIdx, setExpandedBenefitIdx] = useState<number | null>(null);
  const [expandedHazardIdx, setExpandedHazardIdx] = useState<number | null>(null);

  const t = translations[locale];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText("");

    const newUserMessage = { sender: "user" as const, text: userText, date: locale === "en" ? "Today" : "ዛሬ" };
    const updatedLog = [...chatLog, newUserMessage];
    setChatLog(updatedLog);
    setIsSending(true);

    // Save user message to DB
    const intermediateRecord: ScanRecord = {
      ...record,
      progressChatLog: updatedLog,
    };
    await db.updateScan(intermediateRecord);

    let profile = { skinType: "Sensitive", age: "30-39" };
    try {
      const saved = localStorage.getItem("bloomy:profile");
      if (saved) profile = JSON.parse(saved);
    } catch (err) {
      console.error("[chat] failed to read profile from storage", err);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedLog,
          profile,
          product: record,
          locale,
        }),
      });

      const res = await response.json();

      if (res.ok && res.reply) {
        const updatedLogWithAi = [
          ...updatedLog,
          { sender: "ai" as const, text: res.reply, date: locale === "en" ? "Just now" : "አሁን" },
        ];
        setChatLog(updatedLogWithAi);

        // Save complete log with AI response to DB
        const updatedRecord: ScanRecord = {
          ...record,
          progressChatLog: updatedLogWithAi,
        };
        await db.updateScan(updatedRecord);
      } else {
        throw new Error(res.error || "Failed to generate reply");
      }
    } catch (err: any) {
      console.error("[chat] AI reply failed, using offline fallback", err);
      const fallbackText = t.coachOfflineFallback;
      const updatedLogWithAi = [
        ...updatedLog,
        { sender: "ai" as const, text: fallbackText, date: locale === "en" ? "Just now" : "አሁን" },
      ];
      setChatLog(updatedLogWithAi);
    } finally {
      setIsSending(false);
    }
  };

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
              {t.archivedReveal}
            </p>
            <h2 className="mt-1 font-display text-2xl gold-text-gradient">
              {record.brand || t.unknownHouse}
            </h2>
            <p className="text-sm text-muted-foreground">
              {record.productName || t.untitledFormula}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Safety Status Banner */}
        {record.isProductSafe !== undefined && (
          <div
            className={`mb-5 rounded-xl border p-3 flex items-center justify-between text-xs ${record.isProductSafe
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                : "bg-amber-500/10 border-amber-500/30 text-amber-700"
              }`}
          >
            <span>{t.formulaAssessment}</span>
            <span className="font-medium uppercase tracking-wider">
              {record.isProductSafe ? t.safeAndClean : t.harmfulFlagged}
            </span>
          </div>
        )}

        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-gold" />
            <h3 className="text-[11px] uppercase tracking-[0.35em]">
              {t.skinBenefits}
            </h3>
          </div>
          <div className="space-y-2">
            {record.benefits.map((b, i) => {
              const isExpanded = expandedBenefitIdx === i;
              return (
                <div
                  key={i}
                  onClick={() => setExpandedBenefitIdx(isExpanded ? null : i)}
                  className="rounded-2xl border border-gold/30 bg-secondary p-4 cursor-pointer hover:bg-secondary/45 transition-colors select-none"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium text-gold">{b.name}</p>
                    <span className="text-[9px] text-gold/60 uppercase tracking-widest font-medium">
                      {isExpanded ? t.hide : t.detail}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">
                    {b.description}
                  </p>
                  <AnimatePresence initial={false}>
                    {isExpanded && b.details && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2 pt-2 border-t border-gold/15 text-[11px] text-foreground/75 leading-relaxed"
                      >
                        {b.details}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.62_0.22_27)]" />
            <h3 className="text-[11px] uppercase tracking-[0.35em]">
              {t.materialHazards}
            </h3>
          </div>
          <div className="space-y-2">
            {record.hazards.map((h, i) => {
              const high = h.riskLevel === "High";
              const isExpanded = expandedHazardIdx === i;
              return (
                <div
                  key={i}
                  onClick={() => setExpandedHazardIdx(isExpanded ? null : i)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-colors select-none ${high
                      ? "border-[oklch(0.62_0.22_27_/_50%)] bg-[oklch(0.95_0.05_30)] hover:bg-[oklch(0.95_0.05_30)/85]"
                      : "border-[oklch(0.72_0.17_60_/_50%)] bg-[oklch(0.97_0.04_70)] hover:bg-[oklch(0.97_0.04_70)/85]"
                    }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p
                      className={`text-sm font-medium ${high
                          ? "text-[oklch(0.45_0.2_27)]"
                          : "text-[oklch(0.5_0.15_60)]"
                        }`}
                    >
                      {h.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest text-white ${high
                            ? "bg-[oklch(0.62_0.22_27)]"
                            : "bg-[oklch(0.72_0.17_60)]"
                          }`}
                      >
                        {h.riskLevel === "High" ? (locale === "en" ? "High" : "ከፍተኛ") : (locale === "en" ? "Medium" : "መካከለኛ")}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
                        {isExpanded ? t.hide : t.detail}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">
                    {h.description}
                  </p>
                  <AnimatePresence initial={false}>
                    {isExpanded && h.details && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`overflow-hidden mt-2 pt-2 border-t text-[11px] leading-relaxed ${high
                            ? "border-[oklch(0.62_0.22_27_/_20%)] text-[oklch(0.45_0.2_27)]/90"
                            : "border-[oklch(0.72_0.17_60_/_20%)] text-[oklch(0.5_0.15_60)]/90"
                          }`}
                      >
                        {h.details}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Botanical recommendation swap */}
        {record.alternativeProduct && !record.isProductSafe && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <HeartHandshake className="h-3.5 w-3.5 text-gold" />
              <h3 className="text-[11px] uppercase tracking-[0.35em] text-foreground">
                {t.botanicalRec}
              </h3>
            </div>
            <div className="rounded-2xl border border-gold bg-secondary/30 p-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {record.alternativeProduct.brand}
              </p>
              <h4 className="font-display text-lg text-gold mt-0.5">
                {record.alternativeProduct.name}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                {record.alternativeProduct.reason}
              </p>
              <a
                href="https://abi-cosmetics.com/shop-2/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold font-medium hover:underline"
              >
                {t.exploreMarketplace} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>
        )}

        {/* Skincare Routine Timeline */}
        {record.usageDetails && record.hasPurchased && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-gold" />
              <h3 className="text-[11px] uppercase tracking-[0.35em] text-foreground">
                {t.routineGuide}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{t.whenToUse}</p>
                <p className="font-medium text-foreground">{record.usageDetails.whenToUse}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 mb-1">{t.howToApply}</p>
                <p className="text-foreground/80 leading-relaxed">{record.usageDetails.howToUse}</p>
              </div>

              {/* Timeline */}
              <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                <div className="relative">
                  <div className="absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border border-gold bg-background flex items-center justify-center text-[7px] text-gold font-bold">3</div>
                  <h5 className="text-xs font-semibold text-gold pl-1">{t.day3Expectation}</h5>
                  <p className="text-xs text-muted-foreground pl-1 mt-0.5">{record.usageDetails.timeline.day3}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border border-gold bg-background flex items-center justify-center text-[7px] text-gold font-bold">14</div>
                  <h5 className="text-xs font-semibold text-gold pl-1">{t.day14Expectation}</h5>
                  <p className="text-xs text-muted-foreground pl-1 mt-0.5">{record.usageDetails.timeline.day14}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border border-gold bg-gold flex items-center justify-center text-[7px] text-primary-foreground font-bold">30</div>
                  <h5 className="text-xs font-semibold text-gold pl-1">{t.day30Results}</h5>
                  <p className="text-xs text-muted-foreground pl-1 mt-0.5">{record.usageDetails.timeline.day30}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Bloomy Coach Progress Log */}
        <section className="mt-8 border-t border-border pt-6">
          <div className="rounded-3xl bg-neutral-950 text-neutral-100 p-4 border border-gold/30 shadow-lg flex flex-col gap-3">
            {/* Coach Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
              <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center text-gold border border-gold/40">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-display font-medium text-gold">{t.auraCoachConsult}</h4>
                <p className="text-[9px] text-muted-foreground">{t.consistencyLog}</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 max-h-48 overflow-y-auto p-1 scrollbar-thin">
              {chatLog.length === 0 && (
                <p className="text-[10px] text-neutral-500 text-center py-4 italic">
                  {t.coachWelcome}
                </p>
              )}
              {chatLog.map((msg, i) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                  >
                    <div
                      className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${isUser
                          ? "bg-gold/15 text-gold border border-gold/25"
                          : "bg-neutral-900 text-neutral-200 border border-neutral-800"
                        }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-neutral-500 mt-1 px-1">
                      {msg.date}
                    </span>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-1.5 text-[10px] text-gold/70 italic px-1 animate-pulse">
                  <span>{t.coachWriting}</span>
                </div>
              )}
            </div>

            {/* Send Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.coachPlaceholder}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="gold-gradient text-neutral-950 font-medium px-3 rounded-xl hover:opacity-95 transition-opacity disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5 text-neutral-950" />
              </button>
            </form>
          </div>
        </section>
      </motion.div>
    </>
  );
}
