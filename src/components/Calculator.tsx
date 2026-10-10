"use client";

import { useCallback, useEffect, useState } from "react";
import { Calculator as CalculatorIcon } from "lucide-react";
import CalculatorControls from "@/components/CalculatorControls";
import CalculatorDisplay from "@/components/CalculatorDisplay";
import HistoryPanel from "@/components/HistoryPanel";
import NumericKeypad from "@/components/NumericKeypad";
import ScientificKeypad from "@/components/ScientificKeypad";
import { evaluateExpression, formatResult, normalizeExpressionForMath } from "@/lib/calculator";
import { addHistoryEntry, HISTORY_STORAGE_KEY, readHistory } from "@/lib/history";
import type { CalculatorKey, HistoryEntry } from "@/types/calculator";

const functionNames: Record<string, string> = { sin: "sin(", cos: "cos(", tan: "tan(", log: "log10(", ln: "log(" };

export default function Calculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHistory(readHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY)));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history, ready]);

  const append = useCallback((input: string) => {
    setError("");
    setExpression((current) => {
      const base = evaluated ? (/^[+−×÷*/^%!)]/.test(input) ? result : "") : current;
      if (base.length + input.length > 200) return base;
      if (input === ".") {
        const token = base.split(/[+−×÷*/^()%\s]/).at(-1) ?? "";
        if (token.includes(".")) return base;
        if (!token || /[a-zπ]/i.test(token)) return `${base}0.`;
      }
      if (/^[+−×÷*/^%]$/.test(input) && /[+−×÷*/^%]$/.test(base)) return `${base.slice(0, -1)}${input}`;
      return `${base}${input}`;
    });
    setEvaluated(false);
  }, [evaluated, result]);

  const onScientific = (key: CalculatorKey) => {
    if (key === "(") append("(");
    else if (key === ")") append(")");
    else if (key === "√") append("sqrt(");
    else if (key === "xʸ") append("^");
    else if (key === "π") append("pi");
    else if (key === "e") append("e");
    else if (key === "!") append("!");
      else append(functionNames[key]);
  };

  const onNumeric = (key: string) => {
    if (key !== "±") { append(key); return; }
    setError("");
    setExpression((current) => {
      const base = evaluated ? result : current;
      const match = base.match(/(\d*\.?\d+|pi|e)$/i);
      if (match?.index !== undefined) {
        const start = match.index;
        const before = base.slice(0, start);
        const token = match[0];
        if (before.endsWith("-") && (before.length === 1 || /[+−×÷*/^(]$/.test(before.slice(0, -1)))) return `${before.slice(0, -1)}${token}`;
        return `${before}-(${token})`;
      }
      return base ? `-(${base})` : "-";
    });
    setEvaluated(false);
  };

  const calculate = useCallback(() => {
    const source = expression || result;
    try {
      const value = evaluateExpression(normalizeExpressionForMath(source));
      const formatted = formatResult(value);
      setResult(formatted);
      setError("");
      if (expression.trim()) {
        const entry: HistoryEntry = { id: crypto.randomUUID(), expression, result: formatted, value, createdAt: Date.now() };
        setHistory((items) => addHistoryEntry(items, entry));
      }
      setEvaluated(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Check the expression and try again.");
      setEvaluated(false);
    }
  }, [expression, result]);

  const clear = () => { setExpression(""); setResult("0"); setError(""); setEvaluated(false); };
  const backspace = () => {
    setError("");
    setExpression((current) => {
      const withoutFunction = current.replace(/(?:sqrt|sin|cos|tan|log10|log)\($/, "");
      return withoutFunction === current ? current.slice(0, -1) : withoutFunction;
    });
    setEvaluated(false);
  };

  const reuseExpression = (item: HistoryEntry) => { setExpression(item.expression); setResult(item.result); setError(""); setEvaluated(false); };
  const reuseResult = (item: HistoryEntry) => { setExpression(formatResult(item.value)); setResult(item.result); setError(""); setEvaluated(false); };
  const deleteHistoryItem = (id: string) => setHistory((items) => items.filter((item) => item.id !== id));
  const clearHistory = () => { if (window.confirm("Clear all calculation history?")) setHistory([]); };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const { key } = event;
      if (/^[0-9.]$/.test(key) || ["(", ")", "^"].includes(key)) { event.preventDefault(); append(key); }
      else if (["+", "-", "*", "/", "%"].includes(key)) { event.preventDefault(); append(key === "-" ? "−" : key === "*" ? "×" : key === "/" ? "÷" : key); }
      else if (key === "Enter" || key === "=") { event.preventDefault(); calculate(); }
      else if (key === "Backspace") { event.preventDefault(); backspace(); }
      else if (key === "Escape") { event.preventDefault(); clear(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [append, calculate]);

  return <main className="calculator-shell">
    <section className="calculator-panel" aria-label="Calculator">
      <header className="calculator-heading"><div className="app-icon" aria-hidden="true"><CalculatorIcon /></div><h1>Calculator</h1></header>
      <CalculatorDisplay expression={expression} result={result} error={error} />
      <ScientificKeypad onKey={onScientific} />
      <NumericKeypad onKey={onNumeric} />
      <CalculatorControls onClear={clear} onBackspace={backspace} onEquals={calculate} />
    </section>
    <HistoryPanel items={history} onClear={clearHistory} onDelete={deleteHistoryItem} onExpression={reuseExpression} onResult={reuseResult} />
  </main>;
}
