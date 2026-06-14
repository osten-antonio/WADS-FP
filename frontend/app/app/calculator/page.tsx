"use client"

import { GenericCalcPage } from "@/components/GenericCalcLayout"
import { Result } from "@/components/calculator/Result"

export default function CalculatorPage() {
  return <GenericCalcPage topic="General" topicSlug="general" SolutionScreen={<Result />} />
}
