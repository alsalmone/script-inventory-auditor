import * as acorn from "acorn";
import * as walk from "acorn-walk";

// Fetch script content
export async function fetchScriptContent(id: string): Promise<string> {
  // Inline script
  if (id.startsWith("inline@sha256:")) {
    return ""; // We'll add inline contents later if needed
  }

  // External script
  try {
    const res = await fetch(id);
    if (!res.ok) {
      return "";
    }
    return await res.text();
  } catch {
    return "";
  }
}

// Count number of functions in AST
function countFunctions(ast: any): number {
  let count = 0;

  walk.simple(ast, {
    FunctionDeclaration() {
      count++;
    },
    FunctionExpression() {
      count++;
    },
    ArrowFunctionExpression() {
      count++;
    },
  });

  return count;
}

// Compute a rough cyclomatic complexity estimate
function estimateComplexity(ast: any): number {
  let score = 1;

  walk.simple(ast, {
    IfStatement() { score++; },
    ForStatement() { score++; },
    WhileStatement() { score++; },
    DoWhileStatement() { score++; },
    SwitchCase() { score++; },
    ConditionalExpression() { score++; },
    LogicalExpression(node: any) {
      if (node.operator === "&&" || node.operator === "||") score++;
    },
  });

  return score;
}

function bucketComplexity(score: number): string {
  if (score <= 5) return "trivial";
  if (score <= 15) return "simple";
  if (score <= 30) return "moderate";
  if (score <= 60) return "complex";
  return "very-complex";
}

export interface ScriptMetrics {
  sizeBytes: number;
  linesOfCode: number;
  functionCount: number;
  complexityBucket: string;
}

export async function analyzeScript(id: string): Promise<ScriptMetrics> {
  const code = await fetchScriptContent(id);

  if (!code || code.trim() === "") {
    return {
      sizeBytes: 0,
      linesOfCode: 0,
      functionCount: 0,
      complexityBucket: "trivial",
    };
  }

  const sizeBytes = Buffer.byteLength(code, "utf8");
  const linesOfCode = code.split("\n").length;

  let functionCount = 0;
  let complexityScore = 1;

  try {
    const ast = acorn.parse(code, { ecmaVersion: "latest" });
    functionCount = countFunctions(ast);
    complexityScore = estimateComplexity(ast);
  } catch {
    // If parsing fails, treat as moderate complexity
    functionCount = 0;
    complexityScore = 15;
  }

  return {
    sizeBytes,
    linesOfCode,
    functionCount,
    complexityBucket: bucketComplexity(complexityScore),
  };
}
