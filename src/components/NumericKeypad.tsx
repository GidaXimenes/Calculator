const rows = [["7", "8", "9", "÷"], ["4", "5", "6", "×"], ["1", "2", "3", "−"], ["±", "0", ".", "+"]];

export default function NumericKeypad({ onKey }: { onKey: (key: string) => void }) {
  return <div className="number-grid" aria-label="Number pad">
    {rows.flat().map((key) => <button className={`key number-key${["÷", "×", "−", "+"].includes(key) ? " operator-key" : ""}`} key={key} type="button" onClick={() => onKey(key)}>{key}</button>)}
  </div>;
}
