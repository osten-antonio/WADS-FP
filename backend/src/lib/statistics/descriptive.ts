import { mean, median, sampleVariance, populationVariance } from "./helpers";

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

export function descriptiveStats(values: number[]): DescriptiveStatsResult {
  if (values.length < 2) throw new Error("Need at least 2 data points.");
  const sorted = [...values].sort((a, b) => a - b);
  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  const mode =
    maxFreq === 1
      ? []
      : [...freq.entries()]
          .filter(([, c]) => c === maxFreq)
          .map(([v]) => v)
          .sort((a, b) => a - b);

  const sVar = sampleVariance(values);
  const pVar = populationVariance(values);

  return {
    n: values.length,
    mean: mean(values),
    median: median(values),
    mode,
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    range: sorted[sorted.length - 1]! - sorted[0]!,
    sampleVariance: sVar,
    populationVariance: pVar,
    sampleStdDev: Math.sqrt(sVar),
    populationStdDev: Math.sqrt(pVar),
  };
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

function quartiles(values: number[]): { q1: number; median: number; q3: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const med = median(sorted);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
  return { q1: median(lower), median: med, q3: median(upper) };
}

export function boxPlotSummary(values: number[]): BoxPlotSummaryResult {
  if (values.length < 2) throw new Error("Need at least 2 data points.");
  const sorted = [...values].sort((a, b) => a - b);
  const { q1, median: med, q3 } = quartiles(sorted);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
  return {
    min: sorted[0]!,
    q1,
    median: med,
    q3,
    max: sorted[sorted.length - 1]!,
    iqr,
    lowerFence,
    upperFence,
    outliers,
  };
}

export interface SpecialMeansResult {
  trimean: number;
  geometricMean: number;
  trimmedMean: number;
  trimPerSide: number;
  quartiles: { q1: number; median: number; q3: number };
}

export function specialMeans(
  values: number[],
  trimPercent?: number,
  trimCount?: number,
): SpecialMeansResult {
  if (values.length < 2) throw new Error("Need at least 2 data points.");
  const sorted = [...values].sort((a, b) => a - b);
  const q = quartiles(sorted);
  const trimean = (q.q1 + 2 * q.median + q.q3) / 4;

  const geometricMean =
    sorted.some((v) => v <= 0)
      ? Number.NaN
      : Math.exp(sorted.reduce((s, v) => s + Math.log(v), 0) / sorted.length);

  let trimPerSide = 0;
  if (typeof trimCount === "number" && Number.isFinite(trimCount)) {
    trimPerSide = Math.max(0, Math.floor(trimCount));
  } else if (typeof trimPercent === "number" && Number.isFinite(trimPercent)) {
    const clamped = Math.max(0, Math.min(50, trimPercent));
    trimPerSide = Math.floor((clamped / 100) * sorted.length);
  }

  const trimmed =
    trimPerSide > 0 ? sorted.slice(trimPerSide, sorted.length - trimPerSide) : sorted;
  if (trimmed.length === 0) throw new Error("Trim settings remove all values.");
  const trimmedMean = mean(trimmed);

  return { trimean, geometricMean, trimmedMean, trimPerSide, quartiles: q };
}
