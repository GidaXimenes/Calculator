import type { HistoryEntry } from "@/types/calculator";

export const HISTORY_STORAGE_KEY = "calculator-history-v1";
export const HISTORY_LIMIT = 100;

export function readHistory(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function addHistoryEntry(items: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const withoutDuplicate = items.filter((item) => !(item.expression === entry.expression && item.result === entry.result));
  return [entry, ...withoutDuplicate].slice(0, HISTORY_LIMIT);
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<HistoryEntry>;
  return typeof item.id === "string" && typeof item.expression === "string" && typeof item.result === "string" && typeof item.value === "number" && typeof item.createdAt === "number";
}
