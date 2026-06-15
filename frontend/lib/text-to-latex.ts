/**
 * Best-effort conversion of common plain-text math notation into LaTeX.
 * Detects word problems vs math expressions and handles each appropriately.
 */
export function textToLatex(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  // If it already contains LaTeX commands, leave it alone
  if (/\\[a-zA-Z]+/.test(trimmed)) return trimmed;

  const isWordProblem = detectWordProblem(trimmed);
  const hasMath = containsMath(trimmed);

  if (isWordProblem || !hasMath) {
    // Escape LaTeX special characters for text mode, strip $ signs
    const text = trimmed
      .replace(/\$/g, "")
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/[&%#_{}]/g, (m) => `\\${m}`)
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}");
    return `\\text{${text}}`;
  }

  // Otherwise treat as a math expression
  let result = trimmed;

  // Square root: sqrt(...) or sqrt x
  result = result.replace(/\bsqrt\(([^)]+)\)/g, "\\sqrt{$1}");
  result = result.replace(/\bsqrt\s+(\w+)/g, "\\sqrt{$1}");

  // Fractions: a/b (only simple single-token numerator/denominator)
  result = result.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, "\\frac{$1}{$2}");

  // Powers: x^2, x^{...}, x^n  (already LaTeX-ish, but ensure braces)
  result = result.replace(/\^(\d+)/g, "^{$1}");

  // Greek letters (word form → command)
  const greekMap: Record<string, string> = {
    alpha: "alpha", beta: "beta", gamma: "gamma", delta: "delta",
    epsilon: "epsilon", zeta: "zeta", eta: "eta", theta: "theta",
    iota: "iota", kappa: "kappa", lambda: "lambda", mu: "mu",
    nu: "nu", xi: "xi", pi: "pi", rho: "rho",
    sigma: "sigma", tau: "tau", phi: "phi", chi: "chi",
    psi: "psi", omega: "omega",
    Alpha: "Alpha", Beta: "Beta", Gamma: "Gamma", Delta: "Delta",
    Theta: "Theta", Lambda: "Lambda", Xi: "Xi", Pi: "Pi",
    Sigma: "Sigma", Phi: "Phi", Psi: "Psi", Omega: "Omega",
  };
  for (const [word, cmd] of Object.entries(greekMap)) {
    const re = new RegExp(`\\b${word}\\b`, "g");
    result = result.replace(re, `\\${cmd}`);
  }

  // Common operators / functions
  result = result.replace(/\bsin\b/g, "\\sin");
  result = result.replace(/\bcos\b/g, "\\cos");
  result = result.replace(/\btan\b/g, "\\tan");
  result = result.replace(/\blog\b/g, "\\log");
  result = result.replace(/\bln\b/g, "\\ln");
  result = result.replace(/\bexp\b/g, "\\exp");
  result = result.replace(/\babs\b/g, "\\lvert");

  // Multiplication: * or × or · → \times or \cdot
  result = result.replace(/\s*\*\s*/g, " \\times ");
  result = result.replace(/\s*×\s*/g, " \\times ");
  result = result.replace(/\s*·\s*/g, " \\cdot ");

  // Inequality shortcuts
  result = result.replace(/>=/g, "\\geq");
  result = result.replace(/<=/g, "\\leq");
  result = result.replace(/!=/g, "\\neq");

  // Sum / product / integral keywords
  result = result.replace(/\bsum\b/g, "\\sum");
  result = result.replace(/\bprod\b/g, "\\prod");
  result = result.replace(/\bint\b/g, "\\int");
  result = result.replace(/\binf\b/g, "\\infty");

  return result;
}

/**
 * Detect whether input contains recognizable math structure
 * (operators, equations, expressions with numbers and symbols).
 */
function containsMath(text: string): boolean {
  // Contains equation-like patterns: =, +, -, *, /, ^, parentheses with numbers
  if (/[=+\-*/^]/.test(text) && /\d/.test(text)) return true;

  // Contains math function calls: sin(...), cos(...), sqrt(...)
  if (/\b(sin|cos|tan|log|ln|sqrt|exp|abs)\s*\(/.test(text)) return true;

  // Contains fraction-like pattern: digits/digits
  if (/\d+\s*\/\s*\d+/.test(text)) return true;

  // Contains Greek letter names as words
  if (/\b(alpha|beta|gamma|delta|epsilon|theta|lambda|sigma|omega|phi|psi|pi|mu|sigma)\b/i.test(text)) return true;

  // Contains mostly digits and math symbols, little alphabetic text
  const digits = (text.match(/\d/g) || []).length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const mathSymbols = (text.match(/[=+\-*/^()×·√∫∑]/g) || []).length;
  if (digits >= 2 && mathSymbols >= 1 && letters < digits + mathSymbols) return true;

  // Single variable with operators: x + 1, 2y - 3, etc.
  if (/^[a-zA-Z]\s*[=+\-*/^]\s*\d/.test(text)) return true;
  if (/\d\s*[=+\-*/^]\s*[a-zA-Z]/.test(text)) return true;

  return false;
}

/**
 * Detect whether input is a word problem (natural language) vs a math expression.
 * Uses multiple heuristics for robust detection.
 */
function detectWordProblem(text: string): boolean {
  // Has dollar signs → word problem (e.g. "$80")
  if (/\$/.test(text)) return true;

  // Has sentence-ending punctuation → word problem
  if (/[.!?]\s*[A-Z]/.test(text)) return true;

  // Has spaces between words AND long letter sequences → word problem
  const hasSpaces = /\s{2,}/.test(text) || /\b[a-zA-Z]{4,}\b/.test(text);
  if (hasSpaces) {
    // Count letters vs total non-space characters
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const nonSpace = text.replace(/\s/g, "").length;
    if (letters / Math.max(nonSpace, 1) > 0.5) return true;

    // Has common English words → word problem
    const englishWords = /\b(the|is|was|for|and|but|not|you|all|can|had|her|was|one|our|out|are|has|his|how|its|may|new|now|old|see|way|who|did|get|let|say|she|too|use|what|when|your|them|than|that|this|with|have|from|they|been|said|each|make|like|just|over|such|take|year|them|some|time|very|when|come|could|made|find|back|long|make|many|most|over|such|take|than|them|time|very|what|when|more|also|been|have|from|into|just|than|them|this|will|with|each|make|like|over|such|take|that|them|this|time|upon|very|what|when|your|been|have|just|made|take|them|this|what|with|back|come|each|find|from|have|into|like|long|make|more|most|over|same|some|take|than|that|them|then|this|upon|very|what|when|your|also|been|have|made|take|them|this|will|with)/i.test(text);
    if (englishWords) return true;
  }

  // Mostly letters (no math operators) → word problem
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const mathChars = (text.match(/[0-9+\-*/=^(){}[\]|\\<>!&%,;:]/g) || []).length;
  if (letters > 10 && letters > mathChars * 3) return true;

  return false;
}
