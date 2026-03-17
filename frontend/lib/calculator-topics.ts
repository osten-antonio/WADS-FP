export const CALCULATOR_TOPIC_OPTIONS = [
  { slug: "general", label: "General Math" },
  { slug: "algebra", label: "Algebra" },
  { slug: "calculus", label: "Calculus" },
  { slug: "trigonometry", label: "Trigonometry" },
  { slug: "statistics", label: "Statistics" },
  { slug: "proofs", label: "Proofs and Theorems" },
  { slug: "linalg", label: "Linear Algebra" },
  { slug: "precalc", label: "Pre-Calculus" },
] as const;

export type CalculatorTopicSlug = (typeof CALCULATOR_TOPIC_OPTIONS)[number]["slug"];

export const CALCULATOR_TOPIC_LABELS: Record<CalculatorTopicSlug, string> = CALCULATOR_TOPIC_OPTIONS.reduce(
  (accumulator, topic) => {
    accumulator[topic.slug] = topic.label;
    return accumulator;
  },
  {} as Record<CalculatorTopicSlug, string>,
);
