import {
  lookupChiSquare,
  lookupFValue,
  lookupTValue,
  normalCdf as standardNormalCdf,
} from "@/lib/statistics/tables";

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("Factorial is only defined for non-negative integers.");
  }
  if (n > 170) {
    throw new Error("Input too large for factorial (max 170).");
  }
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

function logFactorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) return Number.NaN;
  let sum = 0;
  for (let i = 2; i <= n; i += 1) {
    sum += Math.log(i);
  }
  return sum;
}

export function combinations(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
    throw new Error("n and r must be non-negative integers.");
  }
  if (r > n) return 0;
  if (n > 170) {
    throw new Error("n is too large for exact combinations (max 170).");
  }
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function permutations(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
    throw new Error("n and r must be non-negative integers.");
  }
  if (r > n) return 0;
  if (n > 170) {
    throw new Error("n is too large for exact permutations (max 170).");
  }
  return factorial(n) / factorial(n - r);
}

export function normalCdf(x: number, mean = 0, stdDev = 1): number {
  return standardNormalCdf((x - mean) / stdDev);
}

export function binomialPmf(n: number, k: number, p: number): number {
  if (k < 0 || k > n) return 0;
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function binomialRangeProbability(
  n: number,
  min: number,
  max: number,
  p: number,
): number {
  if (!Number.isInteger(n) || n < 0) throw new Error("n must be a non-negative integer.");
  if (!Number.isInteger(min) || !Number.isInteger(max)) throw new Error("min and max must be integers.");
  if (p < 0 || p > 1) throw new Error("Probability must be between 0 and 1.");
  if (min < 0 || max > n || min > max) throw new Error("Invalid min/max range.");
  if (n > 170) throw new Error("n too large for exact binomial. Use normal approximation.");

  let total = 0;
  for (let k = min; k <= max; k += 1) {
    total += binomialPmf(n, k, p);
  }
  return total;
}

export function binomialNormalApproxProbability(
  n: number,
  min: number,
  max: number,
  p: number,
): { probability: number; mean: number; stdDev: number; zLow: number; zHigh: number } {
  if (!Number.isInteger(n) || n < 0) throw new Error("n must be a non-negative integer.");
  if (!Number.isInteger(min) || !Number.isInteger(max)) throw new Error("min and max must be integers.");
  if (p < 0 || p > 1) throw new Error("Probability must be between 0 and 1.");
  if (min < 0 || max > n || min > max) throw new Error("Invalid min/max range.");

  const q = 1 - p;
  const mean = n * p;
  const variance = n * p * q;
  const stdDev = Math.sqrt(variance);
  if (!Number.isFinite(stdDev) || stdDev === 0) {
    throw new Error("Normal approximation is not valid for these inputs.");
  }

  const lower = min - 0.5;
  const upper = max + 0.5;
  const zLow = (lower - mean) / stdDev;
  const zHigh = (upper - mean) / stdDev;
  const probability = standardNormalCdf(zHigh) - standardNormalCdf(zLow);

  return { probability, mean, stdDev, zLow, zHigh };
}

export function poissonPmf(lambda: number, k: number): number {
  if (lambda <= 0) throw new Error("lambda must be positive.");
  if (!Number.isInteger(k) || k < 0) return 0;
  const exponent = k * Math.log(lambda) - lambda - logFactorial(k);
  return Math.exp(exponent);
}

export function poissonRangeProbability(lambda: number, min: number, max: number): number {
  if (lambda <= 0) throw new Error("lambda must be positive.");
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
    throw new Error("Invalid min/max range.");
  }
  let total = 0;
  for (let k = min; k <= max; k += 1) {
    total += poissonPmf(lambda, k);
  }
  return total;
}

export function poissonNormalApproxProbability(
  lambda: number,
  min: number,
  max: number,
): { probability: number; mean: number; stdDev: number; zLow: number; zHigh: number } {
  if (lambda <= 0) throw new Error("lambda must be positive.");
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
    throw new Error("Invalid min/max range.");
  }

  const mean = lambda;
  const stdDev = Math.sqrt(lambda);
  const lower = min - 0.5;
  const upper = max + 0.5;
  const zLow = (lower - mean) / stdDev;
  const zHigh = (upper - mean) / stdDev;
  const probability = standardNormalCdf(zHigh) - standardNormalCdf(zLow);
  return { probability, mean, stdDev, zLow, zHigh };
}

export function hypergeometricProbability(
  N: number,
  K: number,
  n: number,
  k: number,
): number {
  if (![N, K, n, k].every(Number.isInteger)) throw new Error("All values must be integers.");
  if (N < 0 || K < 0 || n < 0 || k < 0) throw new Error("All values must be non-negative.");
  if (K > N) throw new Error("K cannot exceed N.");
  if (n > N) throw new Error("n cannot exceed N.");
  if (N > 170) throw new Error("N is too large for exact hypergeometric (max 170).");

  const minK = Math.max(0, n - (N - K));
  const maxK = Math.min(n, K);
  if (k < minK || k > maxK) return 0;

  const numerator = combinations(K, k) * combinations(N - K, n - k);
  const denominator = combinations(N, n);
  return numerator / denominator;
}

export function parseNumberList(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
}

export function parseMatrixRows(input: string): number[][] {
  return input
    .split("\n")
    .map((line) =>
      line
        .split(/[\s,]+/)
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isFinite(v)),
    )
    .filter((row) => row.length > 0);
}

export function parseTwoWayAnovaGrid(input: string): number[][][] {
  const rows = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    throw new Error("Need at least 2 row lines.");
  }

  const parsed = rows.map((row) =>
    row
      .split("|")
      .map((cell) => parseNumberList(cell))
      .filter((cell) => cell.length > 0),
  );

  const colCount = parsed[0].length;
  if (colCount < 2) {
    throw new Error("Need at least 2 columns.");
  }
  for (const row of parsed) {
    if (row.length !== colCount) {
      throw new Error("All rows must have the same number of columns.");
    }
  }

  const reps = parsed[0][0].length;
  if (reps < 2) {
    throw new Error("Each cell must have at least 2 replications.");
  }
  for (const row of parsed) {
    for (const cell of row) {
      if (cell.length !== reps) {
        throw new Error("All cells must have the same replication count.");
      }
    }
  }

  return parsed;
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

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  if (n % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function sampleVariance(values: number[]): number {
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
}

function populationVariance(values: number[]): number {
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
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
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
    sampleVariance: sVar,
    populationVariance: pVar,
    sampleStdDev: Math.sqrt(sVar),
    populationStdDev: Math.sqrt(pVar),
  };
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

export function linearRegression(
  xValues: number[],
  yValues: number[],
  alpha = 0.05,
): RegressionResult {
  if (xValues.length !== yValues.length || xValues.length < 2) {
    throw new Error("Need paired x/y values with at least 2 data points.");
  }

  const n = xValues.length;
  const sumX = xValues.reduce((s, v) => s + v, 0);
  const sumY = yValues.reduce((s, v) => s + v, 0);
  const sumXY = xValues.reduce((s, x, i) => s + x * yValues[i], 0);
  const sumX2 = xValues.reduce((s, x) => s + x * x, 0);
  const sumY2 = yValues.reduce((s, y) => s + y * y, 0);

  const slopeNum = n * sumXY - sumX * sumY;
  const slopeDen = n * sumX2 - sumX * sumX;
  const slope = slopeDen === 0 ? 0 : slopeNum / slopeDen;
  const intercept = sumY / n - slope * (sumX / n);

  const rNum = slopeNum;
  const rDen = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = rDen === 0 ? 0 : rNum / rDen;
  const rSquared = r * r;

  const yMean = sumY / n;
  const sst = yValues.reduce((s, y) => s + (y - yMean) ** 2, 0);
  const sse = yValues.reduce((s, y, i) => {
    const yHat = intercept + slope * xValues[i];
    return s + (y - yHat) ** 2;
  }, 0);

  const df = n - 2;
  const seEstimate = df > 0 ? Math.sqrt(sse / df) : 0;
  const ssX = sumX2 - (sumX * sumX) / n;
  const seSlope = ssX > 0 ? seEstimate / Math.sqrt(ssX) : 0;
  const tStatistic = seSlope > 0 ? slope / seSlope : 0;
  const tCritical = lookupTValue(df, alpha / 2);
  const isSignificant = tCritical !== null && Math.abs(tStatistic) > tCritical;

  const sign = intercept >= 0 ? "+" : "-";
  return {
    n,
    slope,
    intercept,
    r,
    rSquared,
    tStatistic,
    df,
    tCritical,
    isSignificant,
    equation: `y_hat = ${slope.toFixed(4)}x ${sign} ${Math.abs(intercept).toFixed(4)}`,
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
    min: sorted[0],
    q1,
    median: med,
    q3,
    max: sorted[sorted.length - 1],
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
  const diffs = before.map((b, i) => after[i] - b);
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

export interface GoodnessOfFitResult {
  chiSquare: number;
  df: number;
  chiCritical: number | null;
  reject: boolean;
}

export function goodnessOfFit(
  observed: number[],
  expected: number[],
  alpha = 0.05,
): GoodnessOfFitResult {
  if (observed.length !== expected.length || observed.length < 2) {
    throw new Error("Observed and expected must have same length (>=2).");
  }
  if (expected.some((v) => v <= 0)) throw new Error("Expected values must be > 0.");
  const chiSquare = observed.reduce((sum, o, i) => sum + ((o - expected[i]) ** 2) / expected[i], 0);
  const df = observed.length - 1;
  const chiCritical = lookupChiSquare(df, alpha);
  const reject = chiCritical !== null && chiSquare > chiCritical;
  return { chiSquare, df, chiCritical, reject };
}

export interface IndependenceResult {
  chiSquare: number;
  df: number;
  chiCritical: number | null;
  reject: boolean;
}

export function chiSquareIndependence(table: number[][], alpha = 0.05): IndependenceResult {
  const rows = table.length;
  const cols = table[0]?.length ?? 0;
  if (rows < 2 || cols < 2) throw new Error("Need at least a 2x2 table.");
  if (table.some((row) => row.length !== cols)) throw new Error("All rows must have same length.");

  const rowTotals = table.map((row) => row.reduce((s, v) => s + v, 0));
  const colTotals = Array.from({ length: cols }, (_, c) =>
    table.reduce((s, row) => s + row[c], 0),
  );
  const grandTotal = rowTotals.reduce((s, v) => s + v, 0);

  let chiSquare = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const expected = (rowTotals[r] * colTotals[c]) / grandTotal;
      chiSquare += ((table[r][c] - expected) ** 2) / expected;
    }
  }

  const df = (rows - 1) * (cols - 1);
  const chiCritical = lookupChiSquare(df, alpha);
  const reject = chiCritical !== null && chiSquare > chiCritical;
  return { chiSquare, df, chiCritical, reject };
}

export interface OneWayAnovaResult {
  fStat: number;
  dfBetween: number;
  dfWithin: number;
  fCritical: number | null;
}

export function oneWayAnova(groups: number[][]): OneWayAnovaResult {
  if (groups.length < 2) throw new Error("Need at least 2 groups.");
  const nonEmpty = groups.filter((g) => g.length > 0);
  if (nonEmpty.length < 2) throw new Error("Need at least 2 non-empty groups.");
  const all = nonEmpty.flat();
  if (all.length === 0) throw new Error("No data.");

  const grandMean = mean(all);
  const ssBetween = nonEmpty.reduce((sum, group) => sum + group.length * (mean(group) - grandMean) ** 2, 0);
  const ssWithin = nonEmpty.reduce(
    (sum, group) => sum + group.reduce((inner, x) => inner + (x - mean(group)) ** 2, 0),
    0,
  );

  const dfBetween = nonEmpty.length - 1;
  const dfWithin = all.length - nonEmpty.length;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const fStat = msBetween / msWithin;
  const fCritical = lookupFValue(dfBetween, dfWithin, 0.05);
  return { fStat, dfBetween, dfWithin, fCritical };
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

export function twoWayAnova(data: number[][][]): TwoWayAnovaResult {
  const R = data.length;
  if (R < 2) throw new Error("Need at least 2 rows.");
  const C = data[0].length;
  if (C < 2) throw new Error("Need at least 2 columns.");
  const n = data[0][0].length;
  if (n < 2) throw new Error("Need at least 2 replications per cell.");

  let grandSum = 0;
  let N = 0;
  const rowSums = new Array(R).fill(0);
  const colSums = new Array(C).fill(0);
  const cellSums = Array.from({ length: R }, () => new Array(C).fill(0));

  for (let i = 0; i < R; i += 1) {
    if (data[i].length !== C) throw new Error("Unbalanced columns.");
    for (let j = 0; j < C; j += 1) {
      if (data[i][j].length !== n) throw new Error("Unbalanced replications.");
      for (let k = 0; k < n; k += 1) {
        const value = data[i][j][k];
        grandSum += value;
        rowSums[i] += value;
        colSums[j] += value;
        cellSums[i][j] += value;
        N += 1;
      }
    }
  }

  const grandMean = grandSum / N;
  const rowMeans = rowSums.map((s) => s / (C * n));
  const colMeans = colSums.map((s) => s / (R * n));
  const cellMeans = cellSums.map((row) => row.map((s) => s / n));

  let ssTotal = 0;
  for (let i = 0; i < R; i += 1) {
    for (let j = 0; j < C; j += 1) {
      for (let k = 0; k < n; k += 1) {
        ssTotal += (data[i][j][k] - grandMean) ** 2;
      }
    }
  }

  let ssRow = 0;
  for (let i = 0; i < R; i += 1) {
    ssRow += C * n * (rowMeans[i] - grandMean) ** 2;
  }

  let ssCol = 0;
  for (let j = 0; j < C; j += 1) {
    ssCol += R * n * (colMeans[j] - grandMean) ** 2;
  }

  let ssError = 0;
  for (let i = 0; i < R; i += 1) {
    for (let j = 0; j < C; j += 1) {
      const cellMean = cellMeans[i][j];
      for (let k = 0; k < n; k += 1) {
        ssError += (data[i][j][k] - cellMean) ** 2;
      }
    }
  }

  const ssInter = ssTotal - ssRow - ssCol - ssError;
  const dfRow = R - 1;
  const dfCol = C - 1;
  const dfInter = (R - 1) * (C - 1);
  const dfError = R * C * (n - 1);

  const msRow = ssRow / dfRow;
  const msCol = ssCol / dfCol;
  const msInter = ssInter / dfInter;
  const msError = ssError / dfError;

  const fRow = msRow / msError;
  const fCol = msCol / msError;
  const fInter = msInter / msError;

  return {
    fRow,
    fCol,
    fInter,
    dfRow,
    dfCol,
    dfInter,
    dfError,
    fCriticalRow: lookupFValue(dfRow, dfError, 0.05),
    fCriticalCol: lookupFValue(dfCol, dfError, 0.05),
    fCriticalInter: lookupFValue(dfInter, dfError, 0.05),
  };
}
