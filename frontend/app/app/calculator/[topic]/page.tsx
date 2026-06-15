"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Result } from "@/components/calculator/Result"
import { GenericCalcPage } from "@/components/GenericCalcLayout"
import { CalculatorProvider } from "@/lib/calculator-context"
import { CALCULATOR_TOPIC_LABELS, CALCULATOR_TOPIC_OPTIONS } from "@/lib/calculator-topics"

export default function TopicCalculatorPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = use(params)
  const router = useRouter()

  const availableTopics = CALCULATOR_TOPIC_OPTIONS.map((item) => item.slug)
  const isValid = topic && availableTopics.includes(topic as (typeof availableTopics)[number])
  const isGeneral = topic === "general"

  useEffect(() => {
    if (isGeneral) {
      router.replace("/app/calculator")
    }
  }, [isGeneral, router])

  if (isGeneral) return null

  if (!isValid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl">Invalid topic: {topic}</p>
      </div>
    )
  }

  return (
    <CalculatorProvider>
      <GenericCalcPage
        topic={CALCULATOR_TOPIC_LABELS[topic as keyof typeof CALCULATOR_TOPIC_LABELS]}
        topicSlug={topic}
        SolutionScreen={<Result />}
      />
    </CalculatorProvider>
  )
}
