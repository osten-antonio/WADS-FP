// `category` is the canonical value persisted on submissions (see
// backend/src/lib/categories.ts). The account history filter matches against it,
// so it must stay in sync with the backend list even when `label` differs.
export const CALCULATOR_TOPIC_OPTIONS = [
  { slug: "general", label: "General", category: "General" },
  { slug: "algebra", label: "Algebra", category: "Algebra" },
  { slug: "calculus", label: "Calculus", category: "Calculus" },
  { slug: "trigonometry", label: "Trigonometry", category: "Trigonometry" },
  { slug: "statistics", label: "Statistics", category: "Statistics" },
  { slug: "proofs", label: "Proofs and Theorems", category: "Proofs and theorem" },
  { slug: "linalg", label: "Linear Algebra", category: "Linear algebra" },
  { slug: "precalc", label: "Pre-Calculus", category: "Pre-calculus" },
] as const;

export type CalculatorTopicSlug = (typeof CALCULATOR_TOPIC_OPTIONS)[number]["slug"];

export const CALCULATOR_TOPIC_LABELS: Record<CalculatorTopicSlug, string> = CALCULATOR_TOPIC_OPTIONS.reduce(
  (accumulator, topic) => {
    accumulator[topic.slug] = topic.label;
    return accumulator;
  },
  {} as Record<CalculatorTopicSlug, string>,
);
