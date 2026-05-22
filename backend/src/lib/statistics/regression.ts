import { lookupTValue } from "./tables";

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
  const sumXY = xValues.reduce((s, x, i) => s + x * yValues[i]!, 0);
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
    const yHat = intercept + slope * xValues[i]!;
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
