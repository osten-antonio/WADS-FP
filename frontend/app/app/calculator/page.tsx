"use client"

import { GenericCalcPage } from "@/components/GenericCalcLayout"
import { Result } from "@/components/calculator/Result"
import { CalculatorProvider } from "@/lib/calculator-context"

export default function CalculatorPage() {
  return (
    <CalculatorProvider>
      <GenericCalcPage topic="General" topicSlug="general" SolutionScreen={<Result />} />
    </CalculatorProvider>
  )
}
