import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkMath from "remark-math"
import remarkRehype from "remark-rehype"
import rehypeKatex from "rehype-katex"
import rehypeStringify from "rehype-stringify"

// Single prose pipeline: markdown (+ $inline$ / $$block$$ math) -> HTML string.
// allowDangerousHtml is left false so raw HTML in AI output is escaped, not executed.
const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  // rehype-katex renders parse errors inline (it never throws), so it takes no throwOnError option.
  .use(rehypeKatex)
  .use(rehypeStringify)

// remark-math only recognizes $...$ and $$...$$ delimiters, but the AI emits
// display math as \[ ... \] and inline math as \( ... \), which would otherwise
// render as raw text. Rewrite those to dollar delimiters before parsing.
// The (?<!\\) guard skips a backslash that is itself preceded by a backslash,
// so LaTeX line breaks like "\\[0.8ex]" inside math are left untouched.
function normalizeMathDelimiters(source: string): string {
  return source
    .replace(/(?<!\\)\\\[/g, () => "$$")
    .replace(/(?<!\\)\\\]/g, () => "$$")
    .replace(/(?<!\\)\\\(/g, () => "$")
    .replace(/(?<!\\)\\\)/g, () => "$")
}

export function markdownToHtml(markdown: string, inline = false): string {
  const source = normalizeMathDelimiters(markdown ?? "")
  if (!source) return ""

  const html = String(processor.processSync(source))
  if (!inline) return html

  // Inline callers (e.g. hints, step summaries) cannot wrap block <p> in <span>.
  // Unwrap exactly ONE enclosing paragraph. The tempered quantifier stops the
  // capture at the first </p>, so multi-paragraph output fails to match and is
  // returned untouched rather than being mis-stripped into unbalanced markup.
  const singleParagraph = html.match(/^<p>((?:(?!<\/p>)[\s\S])*)<\/p>\s*$/)
  return singleParagraph ? singleParagraph[1] : html
}
