'use client'
import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group"
import { CheckIcon, CopyIcon, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { StepBox } from "../widget/StepBox"
import { Separator } from "../ui/separator"
import { HintBox } from "../widget/HintBox"
import { PracticeBox } from "../widget/PracticeBox"
import { useCalculator } from "@/lib/calculator-context"
import {
  getExplanationSteps,
  getExplanationHint,
  generatePractice,
  type ExplanationStepsResult,
  type ExplanationHintResult,
  type PracticeGenerateResult,
} from "@/lib/api"

export function Result() {
  const ctx = useCalculator()
  const state = ctx?.state ?? { question: "", answer: "", category: "", topicSlug: "" }
  const [copied, setCopied] = useState(false)
  const [hidden, setHidden] = useState(true)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [loadingTabs, setLoadingTabs] = useState<Record<string, boolean>>({})

  const [stepsData, setStepsData] = useState<ExplanationStepsResult | null>(null)
  const [hintsData, setHintsData] = useState<ExplanationHintResult | null>(null)
  const [practiceData, setPracticeData] = useState<PracticeGenerateResult | null>(null)

  const resultValue = state.answer || ""
  const maskedValue = resultValue.replace(/./g, "•")

  const handleTabChange = useCallback(
    async (value: string) => {
      setActiveTab(value)

      if (value === "steps" && !stepsData) {
        setLoadingTabs((prev) => ({ ...prev, steps: true }))
        try {
          const data = await getExplanationSteps(state.question, state.answer, state.category)
          setStepsData(data)
        } catch (error) {
          console.error("Failed to load steps:", error)
        } finally {
          setLoadingTabs((prev) => ({ ...prev, steps: false }))
        }
      }

      if (value === "hints" && !hintsData) {
        setLoadingTabs((prev) => ({ ...prev, hints: true }))
        try {
          const data = await getExplanationHint(state.question, state.answer, state.category)
          setHintsData(data)
        } catch (error) {
          console.error("Failed to load hints:", error)
        } finally {
          setLoadingTabs((prev) => ({ ...prev, hints: false }))
        }
      }

      if (value === "practices" && !practiceData) {
        setLoadingTabs((prev) => ({ ...prev, practices: true }))
        try {
          const data = await generatePractice(state.question, state.category)
          setPracticeData(data)
        } catch (error) {
          console.error("Failed to load practices:", error)
        } finally {
          setLoadingTabs((prev) => ({ ...prev, practices: false }))
        }
      }
    },
    [state.question, state.answer, state.category, stepsData, hintsData, practiceData],
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard write failed
    }
  }

  const toggleHidden = () => setHidden((s) => !s)

  return (
    <div className="w-full flex flex-col gap-4 min-h-[400px]">
      <h1 className="text-xl text-left font-bold">Solution</h1>
      <InputGroup className="w-full">
        <InputGroupInput value={hidden ? maskedValue : resultValue} readOnly />
        <InputGroupAddon align="inline-end">
          <div className="flex items-center gap-1">
            <InputGroupButton aria-label="Copy" onClick={handleCopy} size="icon-xs">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </InputGroupButton>
            <InputGroupButton aria-label={hidden ? "Unhide" : "Hide"} onClick={toggleHidden} size="icon-xs">
              {hidden ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </div>
        </InputGroupAddon>
      </InputGroup>
      <Tabs className="w-full flex flex-col gap-2" value={activeTab || ""} onValueChange={handleTabChange}>
        <TabsList className="flex flex-row gap-2">
          <TabsTrigger value="steps" asChild>
            <Button className="bg-white text-black hover:bg-button-main/20 data-[state=active]:bg-[var(--color-button-main)] data-[state=active]:text-white "> Steps</Button>
          </TabsTrigger>
          <TabsTrigger value="hints" asChild>
            <Button className="bg-white text-black hover:bg-button-main/20 data-[state=active]:bg-[var(--color-button-main)] data-[state=active]:text-white ">Hints</Button>
          </TabsTrigger>
          <TabsTrigger value="practices" asChild>
            <Button className="bg-white text-black hover:bg-button-main/20 data-[state=active]:bg-[var(--color-button-main)] data-[state=active]:text-white ">Practices</Button>
          </TabsTrigger>
        </TabsList>
        <TabsContent className="flex gap-2 flex-col min-h-[100px] justify-center" value="steps">
          {loadingTabs["steps"] ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
          ) : stepsData ? (
            <>
              {stepsData.steps.map((s) => (
                <StepBox
                  key={s.step}
                  step={s.step}
                  summary={s.explanation}
                  expression={s.equation}
                />
              ))}
            </>
          ) : (
            <p className="text-sm text-slate-500">Click the Steps tab to load.</p>
          )}
        </TabsContent>
        <TabsContent className="flex gap-2 flex-col min-h-[100px] h-full justify-center" value="hints">
          {loadingTabs["hints"] ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
          ) : hintsData ? (
            <div className="rounded-2xl drop-shadow-2xl p-1 border-dashed border">
              <div className="bg-primary-light/30 rounded-xl p-2">
                <h1 className="text-left font-bold">Hints</h1>
                <Separator />
                <p className="text-justify">{hintsData.hintGeneral}</p>
              </div>
              <div className="bg-primary-light/30 rounded-xl mt-2 p-2 text-left">
                {hintsData.hints.map((h, i) => (
                  <HintBox key={i} number={i + 1} hint={h.text} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Click the Hints tab to load.</p>
          )}
        </TabsContent>
        <TabsContent className="flex gap-2 flex-col min-h-[100px] justify-center" value="practices">
          {loadingTabs["practices"] ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
          ) : practiceData ? (
            <div className="flex gap-2 flex-col">
              {practiceData.questions.map((q, i) => (
                <PracticeBox key={i} number={i + 1} question={q} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Click the Practices tab to load.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
