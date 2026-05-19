// Client helper for the statistics calculator.
// Calculations run on the Express backend; the browser only sends already-parsed
// numeric inputs and renders the result. Requests go through the Next.js proxy
// route at /api/statistics/<operation> (the Express base URL is server-only).

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

/**
 * Sends a calculation request to the backend and returns the typed result.
 * Throws an Error carrying the backend's message on any failure.
 */
export async function runCalculation<T>(
  operation: StatisticsOperation,
  payload: Record<string, unknown>,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/statistics/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Could not reach the calculation service. Check your connection.");
  }

  const data = (await res.json().catch(() => null)) as
    | { result?: T; message?: string }
    | null;

  if (!res.ok) {
    throw new Error(data?.message ?? `Calculation failed (status ${res.status}).`);
  }
  if (!data || !("result" in data)) {
    throw new Error("Calculation service returned an unexpected response.");
  }
  return data.result as T;
}
