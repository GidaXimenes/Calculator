type Props = { expression: string; result: string; error: string };

export default function CalculatorDisplay({ expression, result, error }: Props) {
  return <div className="display" aria-live="polite" aria-atomic="true">
    <div className="display-expression" title={expression}>{expression || "0"}</div>
    <div className={`display-result${error ? " display-error" : ""}`}>{error || result}</div>
  </div>;
}
