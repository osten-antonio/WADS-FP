import { lookupTValue, lookupFValue } from "./tables";
import { mean, sampleVariance } from "./helpers";

export interface OneSampleTResult {
  tStatistic: number;
  df: number;
  sampleMean: number;
  sampleStdDev: number;
  tCritical: number | null;
  reject: boolean;
}

export function oneSampleTTest(values: number[], mu0: number, alpha = 0.05): OneSampleTResult {
  if (values.length < 2) throw new Error("Need at least 2 values.");
  const m = mean(values);
  const s = Math.sqrt(sampleVariance(values));
  const n = values.length;
  const se = s / Math.sqrt(n);
  const tStatistic = (m - mu0) / se;
  const df = n - 1;
  const tCritical = lookupTValue(df, alpha / 2);
  const reject = tCritical !== null && Math.abs(tStatistic) > tCritical;
  return { tStatistic, df, sampleMean: m, sampleStdDev: s, tCritical, reject };
}

export interface PairedTResult {
  tStatistic: number;
  df: number;
  meanDiff: number;
  sdDiff: number;
  tCritical: number | null;
  reject: boolean;
}

export function pairedTTest(
  before: number[],
  after: number[],
  alpha = 0.05,
): PairedTResult {
  if (before.length !== after.length || before.length < 2) {
    throw new Error("Need paired before/after values with at least 2 pairs.");
  }
  const diffs = before.map((b, i) => after[i]! - b);
  const m = mean(diffs);
  const sd = Math.sqrt(sampleVariance(diffs));
  const se = sd / Math.sqrt(diffs.length);
  const tStatistic = m / se;
  const df = diffs.length - 1;
  const tCritical = lookupTValue(df, alpha / 2);
  const reject = tCritical !== null && Math.abs(tStatistic) > tCritical;
  return { tStatistic, df, meanDiff: m, sdDiff: sd, tCritical, reject };
}

export interface IndependentTResult {
  tStatistic: number;
  df: number;
  method: "pooled" | "welch";
  pooledVariance: number;
  tCritical: number | null;
  reject: boolean;
}

export function independentTTestFromStats(
  group1: { n: number; mean: number; sd: number },
  group2: { n: number; mean: number; sd: number },
  alpha = 0.05,
  tails: 1 | 2 = 2,
): IndependentTResult {
  const { n: n1, mean: m1, sd: s1 } = group1;
  const { n: n2, mean: m2, sd: s2 } = group2;
  if (n1 < 2 || n2 < 2) throw new Error("Sample sizes must be at least 2.");
  if (s1 < 0 || s2 < 0) throw new Error("Standard deviations cannot be negative.");

  const v1 = s1 * s1;
  const v2 = s2 * s2;
  const [largerVar, smallerVar, dfNum, dfDen] =
    v1 >= v2 ? [v1, v2, n1 - 1, n2 - 1] : [v2, v1, n2 - 1, n1 - 1];
  const f = largerVar / smallerVar;
  const fCritical = lookupFValue(dfNum, dfDen, 0.05);
  const useWelch = fCritical !== null && f > fCritical;

  let tStatistic = 0;
  let df = 0;
  let pooledVariance = 0;

  if (useWelch) {
    const v1n = v1 / n1;
    const v2n = v2 / n2;
    const se = Math.sqrt(v1n + v2n);
    tStatistic = (m1 - m2) / se;
    df = (v1n + v2n) ** 2 / (v1n ** 2 / (n1 - 1) + v2n ** 2 / (n2 - 1));
  } else {
    df = n1 + n2 - 2;
    pooledVariance = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
    const se = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2));
    tStatistic = (m1 - m2) / se;
  }

  const lookupAlpha = tails === 2 ? alpha / 2 : alpha;
  const tCritical = lookupTValue(df, lookupAlpha);
  const reject = tCritical !== null && Math.abs(tStatistic) > tCritical;
  return {
    tStatistic,
    df,
    method: useWelch ? "welch" : "pooled",
    pooledVariance,
    tCritical,
    reject,
  };
}

export function independentTTestFromData(
  sample1: number[],
  sample2: number[],
  alpha = 0.05,
  tails: 1 | 2 = 2,
): IndependentTResult {
  if (sample1.length < 2 || sample2.length < 2) {
    throw new Error("Each sample needs at least 2 values.");
  }
  return independentTTestFromStats(
    {
      n: sample1.length,
      mean: mean(sample1),
      sd: Math.sqrt(sampleVariance(sample1)),
    },
    {
      n: sample2.length,
      mean: mean(sample2),
      sd: Math.sqrt(sampleVariance(sample2)),
    },
    alpha,
    tails,
  );
}
