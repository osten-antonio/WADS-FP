"use client"

/*
HOW TO USE THIS COMPONENT
Because this component is originally spanning the entire page, to implement into a page, implement
the following or similar code:

<StepBox 
  ...props
  className="mx-auto max-w-2xl"
/>

For the "Explain", "Explained", and "Explaining..." text, that would depend on whether the 
explanation already exists in the database or not on top of everything else.
*/


import * as React from "react"
import { ChevronDown, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type StepBoxProps = {
  step: number | string
  summary: string
  expression?: string
  defaultOpen?: boolean
  explainBody?: string
  explainPlaceholder?: string
  className?: string
}

export function StepBox({
  step,
  summary,
  expression,
  defaultOpen = false,
  explainBody =
    "This is a placeholder for the explain feature. It will call the backend when it is ready.",
  explainPlaceholder = "Ask a follow up question",
  className,
}: StepBoxProps) {
  const [explainStatus, setExplainStatus] = React.useState<
    "idle" | "loading" | "done"
  >("idle")
  const explainTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  React.useEffect(() => {
    return () => {
      if (explainTimeoutRef.current) {
        clearTimeout(explainTimeoutRef.current)
      }
    }
  }, [])

  const handleExplain = () => {
    if (explainStatus !== "idle") return
    setExplainStatus("loading")
    explainTimeoutRef.current = setTimeout(() => {
      setExplainStatus("done")
    }, 900)
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
        <p className="text-sm text-slate-700 text-left">{summary}</p>
        <div className="mt-3 text-center text-lg font-semibold text-slate-900">
          <span className="font-mono">{expression}</span>
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
            <p className="mt-1 text-slate-700">
              {explainStatus === "loading"
                ? "Fetching explanation..."
                : explainBody}
            </p>
            <div className="mt-3">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder={explainPlaceholder}
                  disabled={explainStatus !== "done"}
                  className="w-full resize-none rounded-lg border border-slate-400/70 bg-white/80 px-3 pb-9 pt-2 pr-12 text-sm leading-5 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/50 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  disabled={explainStatus !== "done"}
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
