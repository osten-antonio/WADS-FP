"use client"

import * as React from "react"
import { ChevronDown, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Markdown } from "./Markdown"
import { Katex } from "./Katex"
import { generateExplanation, followUpExplanation } from "@/lib/api"
import { useCalculator } from "@/lib/calculator-context"

export type StepBoxProps = {
  step: number | string
  summary: string
  expression?: string
  expressionNode?: React.ReactNode
  defaultOpen?: boolean
  explainBody?: string
  explainPlaceholder?: string
  className?: string
  question?: string
  answer?: string
  category?: string
}

export function StepBox({
  step,
  summary,
  expression,
  expressionNode,
  defaultOpen = false,
  explainBody,
  explainPlaceholder = "Ask a follow up question",
  className,
  question: questionProp,
  answer: answerProp,
  category: categoryProp,
}: StepBoxProps) {
  const ctx = useCalculator()
  const ctxState = ctx?.state ?? { question: "", answer: "", category: "", topicSlug: "" }
  const state = {
    question: questionProp ?? ctxState.question,
    answer: answerProp ?? ctxState.answer,
    category: categoryProp ?? ctxState.category,
    topicSlug: ctxState.topicSlug,
  }
  const [explainStatus, setExplainStatus] = React.useState<
    "idle" | "loading" | "done"
  >("idle")
  const [explanationText, setExplanationText] = React.useState(explainBody ?? "")
  const [followUpQuestion, setFollowUpQuestion] = React.useState("")

  const handleExplain = async () => {
    if (explainStatus !== "idle") return
    setExplainStatus("loading")

    try {
      const stepNum = typeof step === "number" ? step : String(step).split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
      const result = await generateExplanation(state.question, state.answer, {
        step: stepNum,
        explanation: summary,
      })
      setExplanationText(result.explanation)
      setExplainStatus("done")
    } catch {
      setExplanationText("Failed to generate explanation. Please try again.")
      setExplainStatus("done")
    }
  }

  const handleFollowUp = async () => {
    if (!followUpQuestion.trim() || explainStatus !== "done") return

    try {
      const result = await followUpExplanation(
        explanationText,
        followUpQuestion,
        state.question,
        state.answer,
      )
      setExplanationText((prev) => `${prev}\n\n${result.explanation}`)
      setFollowUpQuestion("")
    } catch {
      // follow-up failed silently
    }
  }

  const handleFollowUpKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleFollowUp()
    }
  }

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn(
        "group/step rounded-2xl border border-dashed border-slate-400/70 bg-primary-light/30 text-slate-950",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-2">
        <h3 className="text-lg font-semibold">Step {step}</h3>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label={`Toggle step ${step}`}
            className="flex size-8 items-center justify-center rounded-full border border-slate-600/60 text-slate-700 transition-colors hover:bg-slate-900/5"
          >
            <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]/step:rotate-180 border-0" />
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="px-5 pb-3">
        <Markdown className="text-sm text-slate-700 text-left" content={summary} inline />
        <div className="mt-3 text-center text-lg font-semibold text-slate-900">
          {expressionNode ?? (expression ? <Katex expression={expression} className="font-mono" /> : null)}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button
            type="button"
            variant="secondary"
            size="xs"
            className="gap-2 rounded-full bg-slate-700 text-white hover:bg-slate-700/90 disabled:opacity-60"
            onClick={handleExplain}
            disabled={explainStatus !== "idle"}
          >
            <Sparkles className="size-4" />
            {explainStatus === "loading"
              ? "Explaining..."
              : explainStatus === "done"
              ? "Explained"
              : "Explain"}
          </Button>
        </div>

        {explainStatus !== "idle" ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-500/60 bg-[#B3E0D7] p-4 text-sm text-slate-800">
            <Markdown className="mt-1 text-slate-700" content={explainStatus === "loading" ? "Fetching explanation..." : explanationText} />
            <div className="mt-3">
              <div className="relative">
                <textarea
                  rows={2}
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  onKeyDown={handleFollowUpKeyDown}
                  placeholder={explainPlaceholder}
                  disabled={explainStatus !== "done"}
                  className="w-full resize-none rounded-lg border border-slate-400/70 bg-white/80 px-3 pb-9 pt-2 pr-12 text-sm leading-5 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/50 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  disabled={explainStatus !== "done" || !followUpQuestion.trim()}
                  onClick={handleFollowUp}
                  className="absolute bottom-2 right-2 size-8 rounded-full bg-transparent text-slate-600 shadow-none hover:bg-slate-900/5 hover:text-slate-800 disabled:opacity-50"
                  aria-label="Send question"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
