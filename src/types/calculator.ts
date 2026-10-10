export type HistoryEntry = {
  id: string;
  expression: string;
  result: string;
  value: number;
  createdAt: number;
};

export type CalculatorKey = "(" | ")" | "√" | "xʸ" | "sin" | "cos" | "tan" | "log" | "ln" | "π" | "e" | "!";
