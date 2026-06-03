/**
 * AuraLens local persistence layer.
 *
 * Uses localStorage on the web for on-device scan history.
 * Designed to be extensible for native backends (e.g. Capacitor SQLite).
 */

export interface ScanRecord {
  id: string;
  createdAt: number; // unix ms
  brand: string;
  productName: string;
  benefits: { name: string; description: string }[];
  hazards: { name: string; riskLevel: "High" | "Medium"; description: string }[];
}

const LS_KEY = "auralens:scans";

export const db = {
  async saveScan(
    input: Omit<ScanRecord, "id" | "createdAt">
  ): Promise<ScanRecord> {
    const rec: ScanRecord = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      ...input,
    };
    const all = await this.listScans();
    all.unshift(rec);
    localStorage.setItem(LS_KEY, JSON.stringify(all.slice(0, 200)));
    return rec;
  },

  async listScans(): Promise<ScanRecord[]> {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as ScanRecord[]) : [];
    } catch {
      return [];
    }
  },

  async deleteScan(id: string): Promise<void> {
    const all = (await this.listScans()).filter((s) => s.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  },

  async clearScans(): Promise<void> {
    localStorage.removeItem(LS_KEY);
  },
};
