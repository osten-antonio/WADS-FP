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

export function logFactorial(n: number): number {
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

export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  if (n % 2 === 0) return (sorted[mid - 1]! + sorted[mid]!) / 2;
  return sorted[mid]!;
}

export function sampleVariance(values: number[]): number {
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
}

export function populationVariance(values: number[]): number {
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
}
