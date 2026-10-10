import { useState } from "react";
import { MoreHorizontal, Play, Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/types/calculator";

type Props = { item: HistoryEntry; onExpression: (item: HistoryEntry) => void; onResult: (item: HistoryEntry) => void; onDelete: (id: string) => void };
export default function HistoryItem({ item, onExpression, onResult, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  return <div className="history-row">
    <button type="button" className="history-select" onClick={() => onExpression(item)} aria-label={`Reuse expression ${item.expression}`}>
      <span className="history-expression">{item.expression}</span><span className="history-result">{item.result}</span>
    </button>
    <button className="more-button" aria-label={`Options for ${item.expression}`} aria-expanded={open} onClick={() => setOpen((value) => !value)}><MoreHorizontal size={21} /></button>
    {open && <div className="history-menu">
      <button type="button" onClick={() => { onExpression(item); setOpen(false); }}><Play size={15} /> Reuse expression</button>
      <button type="button" onClick={() => { onResult(item); setOpen(false); }}><Play size={15} /> Reuse result</button>
      <button type="button" onClick={() => onDelete(item.id)}><Trash2 size={15} /> Delete</button>
    </div>}
  </div>;
}
