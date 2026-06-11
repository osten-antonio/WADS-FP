"use client"

import { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

// Renders a LaTeX string as math. Falls back to the raw string on parse errors.
export function Katex({
  expression,
  className,
}: {
  expression: string
  className?: string
}) {
  const html = useMemo(
    () => katex.renderToString(expression, { throwOnError: false }),
    [expression],
  )
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
