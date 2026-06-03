/**
 * AuraLens local persistence layer.
 *
 * Designed to be drop-in compatible with Capacitor's
 * `@capacitor-community/sqlite` plugin when this app is wrapped
 * in a Capacitor shell for iOS / Android. On the web preview we
 * transparently fall back to `localStorage` so the same API works
 * in Chrome/Safari today and in the native shell tomorrow.
 *
 * To enable the real SQLite backend in the native build, install
 * the plugin (already in package.json) and rebuild — `Capacitor`
 * native platform detection below will pick it up automatically.
 */

import { Capacitor } from "@capacitor/core";

export interface ScanRecord {
  id: string;
  createdAt: number; // unix ms
  brand: string;
  productName: string;
  benefits: { name: string; description: string }[];
  hazards: { name: string; riskLevel: "High" | "Medium"; description: string }[];
}

const DB_NAME = "auralens.db";
const TABLE = "scans";
const LS_KEY = "auralens:scans";

// ─── Backend interface ─────────────────────────────────────────────
interface Backend {
  init(): Promise<void>;
  insert(rec: ScanRecord): Promise<void>;
  list(): Promise<ScanRecord[]>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

// ─── Web fallback (localStorage) ───────────────────────────────────
const webBackend: Backend = {
  async init() {},
  async insert(rec) {
    const all = await this.list();
    all.unshift(rec);
    localStorage.setItem(LS_KEY, JSON.stringify(all.slice(0, 200)));
  },
  async list() {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as ScanRecord[]) : [];
    } catch {
      return [];
    }
  },
  async remove(id) {
    const all = (await this.list()).filter((s) => s.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  },
  async clear() {
    localStorage.removeItem(LS_KEY);
  },
};

// ─── Native SQLite backend (Capacitor) ─────────────────────────────
async function makeNativeBackend(): Promise<Backend> {
  const { CapacitorSQLite, SQLiteConnection } = await import(
    "@capacitor-community/sqlite"
  );
  const sqlite = new SQLiteConnection(CapacitorSQLite);

  const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
  const db = isConn
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);

  await db.open();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER NOT NULL,
      brand TEXT,
      product_name TEXT,
      benefits TEXT,
      hazards TEXT
    );
  `);

  return {
    async init() {},
    async insert(rec) {
      await db.run(
        `INSERT OR REPLACE INTO ${TABLE} (id, created_at, brand, product_name, benefits, hazards) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          rec.id,
          rec.createdAt,
          rec.brand,
          rec.productName,
          JSON.stringify(rec.benefits),
          JSON.stringify(rec.hazards),
        ],
      );
    },
    async list() {
      const res = await db.query(
        `SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT 200`,
      );
      return (res.values ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        createdAt: Number(r.created_at),
        brand: String(r.brand ?? ""),
        productName: String(r.product_name ?? ""),
        benefits: JSON.parse(String(r.benefits ?? "[]")),
        hazards: JSON.parse(String(r.hazards ?? "[]")),
      })) as ScanRecord[];
    },
    async remove(id) {
      await db.run(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
    },
    async clear() {
      await db.execute(`DELETE FROM ${TABLE}`);
    },
  };
}

// ─── Singleton resolver ────────────────────────────────────────────
let backendPromise: Promise<Backend> | null = null;

function getBackend(): Promise<Backend> {
  if (backendPromise) return backendPromise;
  backendPromise = (async () => {
    try {
      if (
        typeof window !== "undefined" &&
        Capacitor?.isNativePlatform?.()
      ) {
        return await makeNativeBackend();
      }
    } catch (e) {
      console.warn("[db] native sqlite unavailable, using web fallback", e);
    }
    return webBackend;
  })();
  return backendPromise;
}

// ─── Public API ────────────────────────────────────────────────────
export const db = {
  async saveScan(input: Omit<ScanRecord, "id" | "createdAt">): Promise<ScanRecord> {
    const rec: ScanRecord = {
      id: (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      ...input,
    };
    const b = await getBackend();
    await b.insert(rec);
    return rec;
  },
  async listScans(): Promise<ScanRecord[]> {
    const b = await getBackend();
    return b.list();
  },
  async deleteScan(id: string): Promise<void> {
    const b = await getBackend();
    await b.remove(id);
  },
  async clearScans(): Promise<void> {
    const b = await getBackend();
    await b.clear();
  },
};
