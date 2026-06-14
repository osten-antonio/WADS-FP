"use client"
import { useMemo } from "react"
import { Katex } from "./Katex"

function renderContent(content: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Tokenize: **$math$** | **text** | $math$ | plain text
  const re = /\*\*\$([^$*]+)\$\*\*|\*\*([^*]+)\*\*|\$([^$]+)\$/g
  let cursor = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(content)) !== null) {
    if (m.index > cursor)
      nodes.push(content.slice(cursor, m.index))

    if (m[1])      nodes.push(<strong key={m.index}><Katex expression={m[1]} /></strong>)
    else if (m[2]) nodes.push(<strong key={m.index}>{m[2]}</strong>)
    else if (m[3]) nodes.push(<Katex key={m.index} expression={m[3]} />)

    cursor = re.lastIndex
  }

  if (cursor < content.length)
    nodes.push(content.slice(cursor))

  return nodes
}

export function Markdown({ content, className, inline = false }: {
  content: string
  className?: string
  inline?: boolean
}) {
  const nodes = useMemo(() => renderContent(content ?? ""), [content])
  if (inline) return <span className={className}>{nodes}</span>
  return <div className={className}>{nodes}</div>
}