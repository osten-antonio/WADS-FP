import { combinations, logFactorial } from "./helpers";
import { normalCdf as standardNormalCdf } from "./tables";

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
