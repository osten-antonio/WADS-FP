"use client"
import { useMemo } from "react"
import "katex/dist/katex.min.css"
import { markdownToHtml } from "@/lib/markdown"

export function Markdown({ content, className, inline = false }: {
  content: string
  className?: string
  inline?: boolean
}) {
  const html = useMemo(() => markdownToHtml(content ?? "", inline), [content, inline])
  if (inline) return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
