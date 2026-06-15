/**
 * Repairs LaTeX-in-JSON backslash escaping in raw LLM output before JSON.parse.
 *
 * The model writes LaTeX with single backslashes inside JSON string values
 * (e.g. "\frac"), which is invalid JSON. JSON.parse then silently mis-decodes the
 * valid-escape letters (\f -> form-feed, \b -> backspace, \t -> tab), so "\frac"
 * becomes "rac" and "\begin" becomes "egin"; and it throws outright on others
 * (e.g. "\int" -> "Bad escaped character").
 *
 * This doubles any backslash that is not a valid JSON escape we want to keep,
 * turning "\frac" into "\\frac" so JSON.parse restores the literal LaTeX. Every
 * backslash in a JSON document lives inside a string value, so a flat left-to-right
 * scan is safe. A correctly escaped pair ("\\frac") is preserved untouched, so this
 * is a no-op on already-valid input.
 *
 * The one unavoidable ambiguity is `\` + a letter that is BOTH a valid JSON escape
 * AND a LaTeX command prefix. We resolve it by frequency in this math-prose domain:
 *   - `\n` is PRESERVED, because the model uses it constantly for real line breaks.
 *     The cost is that `\n`-prefixed commands (\neq, \nabla, \nu) decode as a newline
 *     — but those were already broken before this fix, so nothing regresses.
 *   - `\t`, `\b`, `\f`, `\r` are DOUBLED (treated as LaTeX: \text, \beta, \frac,
 *     \right). Their whitespace meanings (tab, backspace, form-feed, CR) are never
 *     intended in this content.
 */
export function repairJsonEscapes(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw.charAt(i);
    if (ch !== "\\") {
      out += ch;
      continue;
    }

    const next = raw.charAt(i + 1);
    // Valid JSON escapes we preserve as-is: structural (\\ \" \/), real line
    // breaks (\n), and unicode (\uXXXX).
    if (next === "\\" || next === '"' || next === "/" || next === "n") {
      out += ch + next;
      i += 1;
      continue;
    }
    if (next === "u" && /^[0-9a-fA-F]{4}$/.test(raw.slice(i + 2, i + 6))) {
      out += raw.slice(i, i + 6);
      i += 5;
      continue;
    }

    // Lone backslash (a LaTeX command or otherwise invalid escape): double it.
    out += "\\\\";
  }
  return out;
}
