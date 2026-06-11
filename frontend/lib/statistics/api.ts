// Client helper for the statistics calculator.
// Calculations run on the Express backend; the browser only sends already-parsed
// numeric inputs and renders the result. Requests go through the Next.js proxy
// route at /api/statistics/<operation> (the Express base URL is server-only).

import { computeLocally } from "./local";

export const STATISTICS_OPERATIONS = [
  "binomial-range",
  "binomial-normal-approx",
  "poisson-range",
  "poisson-normal-approx",
  "hypergeometric",
  "combinations",
  "permutations",
  "one-sample-t-test",
  "paired-t-test",
  "independent-t-test-data",
  "independent-t-test-stats",
  "goodness-of-fit",
  "chi-square-independence",
  "one-way-anova",
  "two-way-anova",
  "descriptive-stats",
  "linear-regression",
  "box-plot",
  "special-means",
] as const;

export type StatisticsOperation = (typeof STATISTICS_OPERATIONS)[number];

// --- Result shapes returned by the backend (mirror lib/statistics/math.ts) ---

export interface NormalApproxResult {
  probability: number;
  mean: number;
  stdDev: number;
  zLow: number;
  zHigh: number;
}

export interface DescriptiveStatsResult {
  n: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  sampleVariance: number;
  populationVariance: number;
  sampleStdDev: number;
  populationStdDev: number;
}

export interface RegressionResult {
  n: number;
  slope: number;
  intercept: number;
  r: number;
  rSquared: number;
  tStatistic: number;
  df: number;
  tCritical: number | null;
  isSignificant: boolean;
  equation: string;
}

export interface BoxPlotSummaryResult {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
}

export interface SpecialMeansResult {
  trimean: number;
  geometricMean: number;
  trimmedMean: number;
  trimPerSide: number;
  quartiles: { q1: number; median: number; q3: number };
}

export interface OneSampleTResult {
  tStatistic: number;
  df: number;
  sampleMean: number;
  sampleStdDev: number;
  tCritical: number | null;
  reject: boolean;
}

export interface PairedTResult {
  tStatistic: number;
  df: number;
  meanDiff: number;
  sdDiff: number;
  tCritical: number | null;
  reject: boolean;
}

export interface IndependentTResult {
  tStatistic: number;
  df: number;
  method: "pooled" | "welch";
  pooledVariance: number;
  tCritical: number | null;
  reject: boolean;
}

export interface GoodnessOfFitResult {
  chiSquare: number;
  df: number;
  chiCritical: number | null;
  reject: boolean;
}

export interface IndependenceResult {
  chiSquare: number;
  df: number;
  chiCritical: number | null;
  reject: boolean;
}

export interface OneWayAnovaResult {
  fStat: number;
  dfBetween: number;
  dfWithin: number;
  fCritical: number | null;
}

export interface TwoWayAnovaResult {
  fRow: number;
  fCol: number;
  fInter: number;
  dfRow: number;
  dfCol: number;
  dfInter: number;
  dfError: number;
  fCriticalRow: number | null;
  fCriticalCol: number | null;
  fCriticalInter: number | null;
}

// One step of a worked solution; shape mirrors StepBox so steps render through it.
// Supplied by the backend for inference/data ops; `expression` is a LaTeX string.
export interface SolutionStep {
  step: number | string;
  summary: string;
  expression?: string;
}

// Thrown when the backend can't be reached (network failure or proxy 502/504),
// as opposed to a genuine validation/calculation error from a live backend.
export class BackendUnreachableError extends Error {}

const UNREACHABLE_MESSAGE = "Could not reach the calculation service. Check your connection.";

// Posts to the backend and returns the `{ result, steps? }` envelope.
async function postCalculation<T>(
  operation: StatisticsOperation,
  payload: Record<string, unknown>,
): Promise<{ result: T; steps: SolutionStep[] }> {
  let res: Response;
  try {
    res = await fetch(`/api/statistics/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new BackendUnreachableError(UNREACHABLE_MESSAGE);
  }

  // 502/504 from the proxy mean the Express backend is down or timed out.
  if (res.status === 502 || res.status === 504) {
    throw new BackendUnreachableError(UNREACHABLE_MESSAGE);
  }

  const data = (await res.json().catch(() => null)) as
    | { result?: T; steps?: SolutionStep[]; message?: string }
    | null;

  if (!res.ok) {
    throw new Error(data?.message ?? `Calculation failed (status ${res.status}).`);
  }
  if (!data || !("result" in data)) {
    throw new Error("Calculation service returned an unexpected response.");
  }
  return { result: data.result as T, steps: data.steps ?? [] };
}

// Returns just the typed result (used by probability/counting/reference tools).
export async function runCalculation<T>(
  operation: StatisticsOperation,
  payload: Record<string, unknown>,
): Promise<T> {
  return (await postCalculation<T>(operation, payload)).result;
}

// Returns the result plus worked-solution steps (used by inference/data tools).
// Falls back to computing the result and steps locally when the backend is
// unreachable, so the worked solution is still shown without a backend.
export async function runCalculationWithSteps<T>(
  operation: StatisticsOperation,
  payload: Record<string, unknown>,
): Promise<{ result: T; steps: SolutionStep[] }> {
  try {
    return await postCalculation<T>(operation, payload);
  } catch (err) {
    if (err instanceof BackendUnreachableError) {
      const local = computeLocally(operation, payload);
      return { result: local.result as T, steps: local.steps };
    }
    throw err;
  }
}
