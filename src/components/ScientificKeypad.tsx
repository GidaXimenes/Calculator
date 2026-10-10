import type { CalculatorKey } from "@/types/calculator";

const keys: CalculatorKey[] = ["(", ")", "√", "xʸ", "sin", "cos", "tan", "log", "ln", "π", "e", "!"];

export default function ScientificKeypad({ onKey }: { onKey: (key: CalculatorKey) => void }) {
  return <div className="scientific-grid" aria-label="Scientific functions">
    {keys.map((key) => <button className="key scientific-key" key={key} type="button" onClick={() => onKey(key)}>{key}</button>)}
  </div>;
}
