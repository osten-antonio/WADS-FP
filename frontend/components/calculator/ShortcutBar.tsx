"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import type { MathFieldElement } from "@/lib/mathlive-types"

interface ShortcutItem {
  label: string
  latex: string
  className?: string
}

interface ShortcutBarProps {
  shortcuts: ShortcutItem[]
  onInsert: (latex: string) => void
  mathFieldRef?: React.RefObject<MathFieldElement | null>
  onOpenFunctions?: () => void
  showFunctionsButton?: boolean
  variant?: "default" | "keyboard"
}

const SHORTCUT_CATEGORIES: Record<string, ShortcutItem[]> = {
  general: [
    { label: "x²", latex: "x^{2}" },
    { label: "xⁿ", latex: "x^{#?}" },
    { label: "√", latex: "\\sqrt{#?}" },
    { label: "frac", latex: "\\frac{#?}{#?}" },
    { label: "π", latex: "\\pi" },
    { label: "e", latex: "e" },
    { label: "ln", latex: "\\ln(#?)" },
    { label: "log", latex: "\\log(#?)" },
    { label: "|x|", latex: "\\left|#?\\right|" },
    { label: "±", latex: "\\pm" },
    { label: "∞", latex: "\\infty" },
    { label: "≠", latex: "\\neq" },
    { label: "≤", latex: "\\le" },
    { label: "≥", latex: "\\ge" },
  ],
  algebra: [
    { label: "x²", latex: "x^{2}" },
    { label: "xⁿ", latex: "x^{#?}" },
    { label: "√", latex: "\\sqrt{#?}" },
    { label: "frac", latex: "\\frac{#?}{#?}" },
    { label: "±", latex: "\\pm" },
    { label: "|x|", latex: "\\left|#?\\right|" },
    { label: "⌊x⌋", latex: "\\lfloor#?\\rfloor" },
    { label: "⌈x⌉", latex: "\\lceil#?\\rceil" },
    { label: "x!", latex: "#?!" },
    { label: "∑", latex: "\\sum_{#?}^{#?}" },
    { label: "∏", latex: "\\prod_{#?}^{#?}" },
    { label: "→", latex: "\\to" },
    { label: "∈", latex: "\\in" },
    { label: "∉", latex: "\\notin" },
  ],
  calculus: [
    { label: "d/dx", latex: "\\frac{d}{dx}" },
    { label: "∫", latex: "\\int" },
    { label: "∫ₐᵇ", latex: "\\int_{#?}^{#?}" },
    { label: "∂", latex: "\\partial" },
    { label: "lim", latex: "\\lim_{x\\to#?}" },
    { label: "∑", latex: "\\sum_{#?}^{#?}" },
    { label: "∏", latex: "\\prod_{#?}^{#?}" },
    { label: "∞", latex: "\\infty" },
    { label: "∇", latex: "\\nabla" },
    { label: "dx", latex: "\\,dx" },
    { label: "f'(x)", latex: "f'(x)" },
    { label: "f''(x)", latex: "f''(x)" },
    { label: "→", latex: "\\to" },
    { label: "≈", latex: "\\approx" },
  ],
  trigonometry: [
    { label: "sin", latex: "\\sin(#?)" },
    { label: "cos", latex: "\\cos(#?)" },
    { label: "tan", latex: "\\tan(#?)" },
    { label: "asin", latex: "\\arcsin(#?)" },
    { label: "acos", latex: "\\arccos(#?)" },
    { label: "atan", latex: "\\arctan(#?)" },
    { label: "sec", latex: "\\sec(#?)" },
    { label: "csc", latex: "\\csc(#?)" },
    { label: "cot", latex: "\\cot(#?)" },
    { label: "π", latex: "\\pi" },
    { label: "°", latex: "^\\circ" },
    { label: "rad", latex: "\\text{ rad}" },
    { label: "sin²", latex: "\\sin^{2}(#?)" },
    { label: "cos²", latex: "\\cos^{2}(#?)" },
  ],
  statistics: [
    { label: "x̄", latex: "\\bar{x}" },
    { label: "σ", latex: "\\sigma" },
    { label: "μ", latex: "\\mu" },
    { label: "Σ", latex: "\\sum" },
    { label: "√", latex: "\\sqrt{#?}" },
    { label: "frac", latex: "\\frac{#?}{#?}" },
    { label: "n!", latex: "#?!" },
    { label: "nCr", latex: "\\binom{#?}{#?}" },
    { label: "nPr", latex: "P(#?,#?)" },
    { label: "x̄", latex: "\\bar{x}" },
    { label: "s²", latex: "s^{2}" },
    { label: "σ²", latex: "\\sigma^{2}" },
    { label: "r", latex: "r" },
    { label: "p", latex: "p" },
  ],
  proofs: [
    { label: "∀", latex: "\\forall" },
    { label: "∃", latex: "\\exists" },
    { label: "⇒", latex: "\\Rightarrow" },
    { label: "⇔", latex: "\\Leftrightarrow" },
    { label: "∧", latex: "\\land" },
    { label: "∨", latex: "\\lor" },
    { label: "¬", latex: "\\lnot" },
    { label: "∈", latex: "\\in" },
    { label: "∉", latex: "\\notin" },
    { label: "⊆", latex: "\\subseteq" },
    { label: "∪", latex: "\\cup" },
    { label: "∩", latex: "\\cap" },
    { label: "∅", latex: "\\emptyset" },
    { label: "≡", latex: "\\equiv" },
  ],
  linalg: [
    { label: "Aᵀ", latex: "A^{T}" },
    { label: "A⁻¹", latex: "A^{-1}" },
    { label: "det", latex: "\\det(#?)" },
    { label: "tr", latex: "\\operatorname{tr}(#?)" },
    { label: "·", latex: "\\cdot" },
    { label: "×", latex: "\\times" },
    { label: "⊗", latex: "\\otimes" },
    { label: "||v||", latex: "\\|#?\\|" },
    { label: "⟨u,v⟩", latex: "\\langle#?,#?\\rangle" },
    { label: "λ", latex: "\\lambda" },
    { label: "I", latex: "I" },
    { label: "0", latex: "0" },
    { label: "ℝⁿ", latex: "\\mathbb{R}^{n}" },
    { label: "span", latex: "\\operatorname{span}" },
  ],
  precalc: [
    { label: "x²", latex: "x^{2}" },
    { label: "xⁿ", latex: "x^{#?}" },
    { label: "√", latex: "\\sqrt{#?}" },
    { label: "frac", latex: "\\frac{#?}{#?}" },
    { label: "π", latex: "\\pi" },
    { label: "e", latex: "e" },
    { label: "ln", latex: "\\ln(#?)" },
    { label: "log", latex: "\\log(#?)" },
    { label: "|x|", latex: "\\left|#?\\right|" },
    { label: "sin", latex: "\\sin(#?)" },
    { label: "cos", latex: "\\cos(#?)" },
    { label: "tan", latex: "\\tan(#?)" },
    { label: "→", latex: "\\to" },
    { label: "∞", latex: "\\infty" },
  ],
}
export function ShortcutBar({ shortcuts, onInsert, mathFieldRef, onOpenFunctions, showFunctionsButton, variant = "default" }: ShortcutBarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = React.useState(false)

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      setHasOverflow(containerRef.current.scrollWidth > containerRef.current.clientWidth)
    }
  }, [shortcuts])

  const handleInsert = (latex: string) => {
    onInsert(latex)
    if (mathFieldRef?.current) {
      mathFieldRef.current.focus()
    }
  }

  const isKeyboard = variant === "keyboard"

  return (
    <div data-shortcut-bar className={`relative px-2 py-1.5 bg-[#2F4457] rounded-md" : "bg-slate-50 bg-[#2F4457] rounded-md mb-2"}`}>
      <div
        ref={containerRef}
        className="flex gap-1.5 overflow-x-auto pb-2"
      >
        {showFunctionsButton && onOpenFunctions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-8 px-3 py-0 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${isKeyboard ? "bg-[#4C9DB3] text-white border-none hover:bg-[#3d8a9e]" : "hover:bg-slate-100"}`}
            onPointerDown={(e) => { e.preventDefault() }}
            onClick={onOpenFunctions}
          >
            f(x)
          </Button>
        )}
        {shortcuts.map((item, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="sm"
            className={`h-8 px-3 py-0 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${isKeyboard ? "bg-[#4C9DB3] text-white border-none hover:bg-[#3d8a9e]" : "hover:bg-slate-100"} ${item.className || ""}`}
            onPointerDown={(e) => { e.preventDefault() }}
            onClick={() => handleInsert(item.latex)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {hasOverflow && (
        <div className={`absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none bg-gradient-to-l ${isKeyboard ? "from-[#2F4457] to-transparent" : "from-slate-50 to-transparent"}`} />
      )}
    </div>
  )
}

export function getShortcutsForTopic(topic: string): ShortcutItem[] {
  const topicLower = topic.toLowerCase()
  if (topicLower.includes("algebra")) return SHORTCUT_CATEGORIES.algebra
  if (topicLower.includes("calculus")) return SHORTCUT_CATEGORIES.calculus
  if (topicLower.includes("trigonometry") || topicLower.includes("trig")) return SHORTCUT_CATEGORIES.trigonometry
  if (topicLower.includes("statistics") || topicLower.includes("stats")) return SHORTCUT_CATEGORIES.statistics
  if (topicLower.includes("proof")) return SHORTCUT_CATEGORIES.proofs
  if (topicLower.includes("linear") || topicLower.includes("linalg")) return SHORTCUT_CATEGORIES.linalg
  if (topicLower.includes("precalc") || topicLower.includes("pre-calc")) return SHORTCUT_CATEGORIES.precalc
  return SHORTCUT_CATEGORIES.general
}