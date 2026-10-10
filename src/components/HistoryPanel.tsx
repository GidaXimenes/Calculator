import { Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/types/calculator";
import HistoryItem from "@/components/HistoryItem";

type Props = { items: HistoryEntry[]; onClear: () => void; onDelete: (id: string) => void; onExpression: (item: HistoryEntry) => void; onResult: (item: HistoryEntry) => void };
export default function HistoryPanel({ items, onClear, onDelete, onExpression, onResult }: Props) {
  return <aside className="history-panel" aria-label="Calculation history">
    <header className="history-heading"><h2>Histórico</h2><button aria-label="Clear history" onClick={onClear} className="trash-button" type="button" disabled={!items.length}><Trash2 aria-hidden="true" /></button></header>
    <div className="history-list">{items.length ? items.map((item) => <HistoryItem key={item.id} item={item} onExpression={onExpression} onResult={onResult} onDelete={onDelete} />) : <p className="history-empty">Suas contas aparecerão aqui.</p>}</div>
  </aside>;
}
