import { all, create, type ConstantNode, type FunctionNode, type MathNode, type OperatorNode, type ParenthesisNode, type SymbolNode } from "mathjs";

const math = create(all, { number: "number", precision: 14 });
const allowedSymbols = new Set(["pi", "e", "sin", "cos", "tan", "sqrt", "log", "log10", "ln", "factorial"]);
const allowedOperators = new Set(["+", "-", "*", "/", "^", "%", "mod", "!"]);

export class CalculationError extends Error {
  constructor(message = "Check the expression and try again.") {
    super(message);
    this.name = "CalculationError";
  }
}

function validateNode(node: MathNode, depth = 0): void {
  if (depth > 40) throw new CalculationError("This expression is too complex.");
  if (node.type === "ConstantNode") {
    const value = Number((node as ConstantNode).value);
    if (!Number.isFinite(value)) throw new CalculationError();
    return;
  }
  if (node.type === "ParenthesisNode") return validateNode((node as ParenthesisNode).content, depth + 1);
  if (node.type === "SymbolNode") {
    if (!allowedSymbols.has((node as SymbolNode).name)) throw new CalculationError("Only supported math functions and constants are allowed.");
    return;
  }
  if (node.type === "OperatorNode") {
    const operator = node as OperatorNode;
    if (!allowedOperators.has(operator.op)) throw new CalculationError("That operator is not supported.");
    for (const arg of operator.args) validateNode(arg, depth + 1);
    if (operator.op === "!" && operator.args.length === 1 && operator.args[0].type === "ConstantNode") {
      const n = Number((operator.args[0] as ConstantNode).value);
      if (!Number.isInteger(n) || n < 0 || n > 170) throw new CalculationError("Factorial requires an integer from 0 to 170.");
    }
    return;
  }
  if (node.type === "FunctionNode") {
    const func = node as FunctionNode<SymbolNode>;
    if (func.fn.type !== "SymbolNode" || !allowedSymbols.has(func.fn.name) || !["sin", "cos", "tan", "sqrt", "log", "log10", "ln", "factorial"].includes(func.fn.name)) {
      throw new CalculationError("Only supported math functions and constants are allowed.");
    }
    for (const arg of func.args) validateNode(arg, depth + 1);
    if (func.fn.name === "factorial" && func.args.length === 1 && func.args[0].type === "ConstantNode") {
      const n = Number((func.args[0] as ConstantNode).value);
      if (!Number.isInteger(n) || n < 0 || n > 170) throw new CalculationError("Factorial requires an integer from 0 to 170.");
    }
    return;
  }
  throw new CalculationError("That expression is not supported.");
}

export function evaluateExpression(expression: string): number {
  const source = normalizeExpressionForMath(expression.trim());
  if (!source || source.length > 200) throw new CalculationError(source ? "Expression is too long." : "Enter an expression first.");
  try {
    const node = math.parse(source);
    validateNode(node);
    const result = node.compile().evaluate();
    if (typeof result !== "number" || !Number.isFinite(result)) throw new CalculationError("The result is outside the valid number range.");
    return result;
  } catch (error) {
    if (error instanceof CalculationError) throw error;
    throw new CalculationError("Check the expression and try again.");
  }
}

export function formatResult(value: number): string {
  if (!Number.isFinite(value)) throw new CalculationError("The result is outside the valid number range.");
  if (Object.is(value, -0) || Math.abs(value) < 1e-14) return "0";
  return math.format(value, { precision: 12, lowerExp: -9, upperExp: 12 });
}

export function normalizeExpressionForMath(expression: string): string {
  return expression
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("√(", "sqrt(")
    .replaceAll("π", "pi")
    .replace(/\bln\s*\(/g, "log(");
}
