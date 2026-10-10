import { Delete } from "lucide-react";

type Props = { onClear: () => void; onBackspace: () => void; onEquals: () => void };
export default function CalculatorControls({ onClear, onBackspace, onEquals }: Props) {
  return <div className="action-grid">
    <button className="key action-key" type="button" onClick={onClear}>AC</button>
    <button className="key action-key backspace-key" type="button" onClick={onBackspace} aria-label="Delete last entry" title="Delete last entry"><Delete aria-hidden="true" /></button>
    <button className="key equals-key" type="button" onClick={onEquals} aria-label="Calculate">=</button>
  </div>;
}
