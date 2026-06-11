// Local fallback math for the Inference and Data tools, used by computeLocally
// (lib/statistics/local.ts) when the backend is unreachable. Mirrors the backend
// engine (backend/src/lib/statistics/math.ts) so results match. Probability and
// Counting are intentionally not included — they have no offline fallback.

import { lookupChiSquare, lookupFValue, lookupTValue } from "./tables";

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

function quartiles(values: number[]): { q1: number; median: number; q3: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const med = median(sorted);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
  return { q1: median(lower), median: med, q3: median(upper) };
}

export function descriptiveStats(values: number[]) {
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

export function linearRegression(xValues: number[], yValues: number[], alpha = 0.05) {
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

export function boxPlotSummary(values: number[]) {
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

export function specialMeans(values: number[], trimPercent?: number, trimCount?: number) {
  if (values.length < 2) throw new Error("Need at least 2 data points.");
  const sorted = [...values].sort((a, b) => a - b);
  const q = quartiles(sorted);
  const trimean = (q.q1 + 2 * q.median + q.q3) / 4;

  const geometricMean = sorted.some((v) => v <= 0)
    ? Number.NaN
    : Math.exp(sorted.reduce((s, v) => s + Math.log(v), 0) / sorted.length);

  let trimPerSide = 0;
  if (typeof trimCount === "number" && Number.isFinite(trimCount)) {
    trimPerSide = Math.max(0, Math.floor(trimCount));
  } else if (typeof trimPercent === "number" && Number.isFinite(trimPercent)) {
    const clamped = Math.max(0, Math.min(50, trimPercent));
    trimPerSide = Math.floor((clamped / 100) * sorted.length);
  }

  const trimmed = trimPerSide > 0 ? sorted.slice(trimPerSide, sorted.length - trimPerSide) : sorted;
  if (trimmed.length === 0) throw new Error("Trim settings remove all values.");
  const trimmedMean = mean(trimmed);

  return { trimean, geometricMean, trimmedMean, trimPerSide, quartiles: q };
}

export function oneSampleTTest(values: number[], mu0: number, alpha = 0.05) {
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

export function pairedTTest(before: number[], after: number[], alpha = 0.05) {
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

export function independentTTestFromStats(
  group1: { n: number; mean: number; sd: number },
  group2: { n: number; mean: number; sd: number },
  alpha = 0.05,
  tails: 1 | 2 = 2,
) {
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
    method: useWelch ? ("welch" as const) : ("pooled" as const),
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
) {
  if (sample1.length < 2 || sample2.length < 2) {
    throw new Error("Each sample needs at least 2 values.");
  }
  return independentTTestFromStats(
    { n: sample1.length, mean: mean(sample1), sd: Math.sqrt(sampleVariance(sample1)) },
    { n: sample2.length, mean: mean(sample2), sd: Math.sqrt(sampleVariance(sample2)) },
    alpha,
    tails,
  );
}

export function goodnessOfFit(observed: number[], expected: number[], alpha = 0.05) {
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

export function chiSquareIndependence(table: number[][], alpha = 0.05) {
  const rows = table.length;
  const cols = table[0]?.length ?? 0;
  if (rows < 2 || cols < 2) throw new Error("Need at least a 2x2 table.");
  if (table.some((row) => row.length !== cols)) throw new Error("All rows must have same length.");

  const rowTotals = table.map((row) => row.reduce((s, v) => s + v, 0));
  const colTotals = Array.from({ length: cols }, (_, c) => table.reduce((s, row) => s + row[c], 0));
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

export function oneWayAnova(groups: number[][]) {
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

export function twoWayAnova(data: number[][][]) {
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
  for (let i = 0; i < R; i += 1) ssRow += C * n * (rowMeans[i] - grandMean) ** 2;

  let ssCol = 0;
  for (let j = 0; j < C; j += 1) ssCol += R * n * (colMeans[j] - grandMean) ** 2;

  let ssError = 0;
  for (let i = 0; i < R; i += 1) {
    for (let j = 0; j < C; j += 1) {
      const cellMean = cellMeans[i][j];
      for (let k = 0; k < n; k += 1) ssError += (data[i][j][k] - cellMean) ** 2;
    }
  }

  const ssInter = ssTotal - ssRow - ssCol - ssError;
  const dfRow = R - 1;
  const dfCol = C - 1;
  const dfInter = (R - 1) * (C - 1);
  const dfError = R * C * (n - 1);

  const msError = ssError / dfError;
  const fRow = ssRow / dfRow / msError;
  const fCol = ssCol / dfCol / msError;
  const fInter = ssInter / dfInter / msError;

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
