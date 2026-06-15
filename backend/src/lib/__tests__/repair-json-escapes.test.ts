import { repairJsonEscapes } from "../repair-json-escapes";

// In these tests the SOURCE string is the raw model output. A "\\" in a TS string
// literal is a single backslash at runtime, i.e. the under-escaped form the model emits.

describe("repairJsonEscapes", () => {
  it("documents the bug: JSON.parse on single-backslash LaTeX silently corrupts", () => {
    const raw = '{"e":"\\frac"}'; // runtime: {"e":"\frac"}  (single backslash)
    const broken = JSON.parse(raw) as { e: string };
    expect(broken.e).not.toBe("\\frac"); // it became form-feed + "rac"
    expect(broken.e.charCodeAt(0)).toBe(12); // \f -> form-feed
  });

  it("repairs single-backslash LaTeX so JSON.parse restores it", () => {
    const raw = '{"e":"\\frac{a}{b}"}';
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { e: string };
    expect(parsed.e).toBe("\\frac{a}{b}"); // runtime: \frac{a}{b}
  });

  it("fixes the commands that otherwise make JSON.parse throw", () => {
    const raw = '{"e":"\\int x \\sqrt{2}"}';
    expect(() => JSON.parse(raw)).toThrow(); // \i is not a valid JSON escape
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { e: string };
    expect(parsed.e).toBe("\\int x \\sqrt{2}");
  });

  it("fixes \\text and \\beta (\\t -> tab, \\b -> backspace)", () => {
    const raw = '{"a":"\\text{x}","b":"\\beta"}';
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { a: string; b: string };
    expect(parsed.a).toBe("\\text{x}");
    expect(parsed.b).toBe("\\beta");
  });

  it("preserves \\n so real line breaks survive", () => {
    const raw = '{"e":"line one\\nline two"}'; // \n is an intended newline
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { e: string };
    expect(parsed.e).toBe("line one\nline two"); // real newline, not literal \n
  });

  it("treats \\n-initial commands as a newline (accepted trade-off, was already broken)", () => {
    const raw = '{"e":"a \\neq b"}'; // \neq: the \n decodes to a newline
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { e: string };
    expect(parsed.e).toBe("a \neq b"); // newline before "eq b"
  });

  it("is a no-op on correctly double-escaped input", () => {
    const raw = '{"e":"\\\\frac{a}{b}"}'; // runtime: {"e":"\\frac{a}{b}"} (already valid)
    expect(repairJsonEscapes(raw)).toBe(raw);
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { e: string };
    expect(parsed.e).toBe("\\frac{a}{b}");
  });

  it("handles a doc that mixes single- and double-escaped backslashes", () => {
    const raw = '{"a":"\\frac","b":"\\\\frac"}'; // a single, b double
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { a: string; b: string };
    expect(parsed.a).toBe("\\frac");
    expect(parsed.b).toBe("\\frac");
  });

  it("preserves escaped quotes and unicode escapes", () => {
    const raw = '{"a":"say \\"hi\\"","u":"\\u00e9"}';
    const parsed = JSON.parse(repairJsonEscapes(raw)) as { a: string; u: string };
    expect(parsed.a).toBe('say "hi"');
    expect(parsed.u).toBe("é");
  });

  it("leaves plain content untouched", () => {
    const raw = '{"a":"no backslashes here","n":42}';
    expect(repairJsonEscapes(raw)).toBe(raw);
  });
});
