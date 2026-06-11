import {
  binomialRangeProbability,
  boxPlotSummary,
  chiSquareIndependence,
  combinations,
  descriptiveStats,
  factorial,
  goodnessOfFit,
  hypergeometricProbability,
  linearRegression,
  oneSampleTTest,
  oneWayAnova,
  pairedTTest,
  permutations,
  poissonRangeProbability,
  specialMeans,
  twoWayAnova,
} from "../math";

describe("counting", () => {
  test("factorial / combinations / permutations", () => {
    expect(factorial(5)).toBe(120);
    expect(combinations(5, 2)).toBe(10);
    expect(permutations(5, 2)).toBe(20);
    expect(combinations(6, 0)).toBe(1);
  });

  test("rejects invalid input", () => {
    expect(() => combinations(5, -1)).toThrow();
    expect(() => factorial(-3)).toThrow();
    expect(() => permutations(200, 2)).toThrow();
  });
});

describe("probability", () => {
  test("binomialRangeProbability matches the exact value", () => {
    // P(4 <= X <= 6) for n=10, p=0.5 -> (210 + 252 + 210) / 1024
    expect(binomialRangeProbability(10, 4, 6, 0.5)).toBeCloseTo(0.65625, 6);
  });

  test("binomialRangeProbability rejects p out of range", () => {
    expect(() => binomialRangeProbability(10, 4, 6, 2)).toThrow();
  });

  test("poissonRangeProbability stays within [0, 1]", () => {
    const p = poissonRangeProbability(3.5, 2, 4);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
    expect(p).toBeCloseTo(0.589556, 4);
  });

  test("hypergeometricProbability matches the exact value", () => {
    // Drawing 2 of 13 successes from a 52-card deck in 5 draws.
    expect(hypergeometricProbability(52, 13, 5, 2)).toBeCloseTo(0.27428, 4);
  });
});

describe("data", () => {
  test("descriptiveStats computes mean and spread", () => {
    const result = descriptiveStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(result.n).toBe(8);
    expect(result.mean).toBeCloseTo(5, 6);
    expect(result.median).toBeCloseTo(4.5, 6);
    expect(result.mode).toEqual([4]);
  });

  test("descriptiveStats needs at least two points", () => {
    expect(() => descriptiveStats([1])).toThrow();
  });

  test("linearRegression fits a perfect line", () => {
    const result = linearRegression([1, 2, 3], [2, 4, 6]);
    expect(result.slope).toBeCloseTo(2, 6);
    expect(result.intercept).toBeCloseTo(0, 6);
    expect(result.r).toBeCloseTo(1, 6);
  });

  test("boxPlotSummary flags outliers", () => {
    const result = boxPlotSummary([12, 14, 15, 15, 16, 18, 20, 22, 24, 25, 30, 95]);
    expect(result.outliers).toContain(95);
  });

  test("specialMeans computes a trimean", () => {
    const result = specialMeans([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(result.trimean).toBeGreaterThan(0);
    expect(Number.isFinite(result.geometricMean)).toBe(true);
  });
});

describe("inference", () => {
  test("oneSampleTTest with sample mean equal to mu0", () => {
    const result = oneSampleTTest([1, 2, 3, 4, 5], 3);
    expect(result.tStatistic).toBeCloseTo(0, 6);
    expect(result.df).toBe(4);
    expect(result.tCritical).toBeCloseTo(2.776, 3);
    expect(result.reject).toBe(false);
  });

  test("pairedTTest needs equal-length samples", () => {
    expect(() => pairedTTest([1, 2, 3], [1, 2])).toThrow();
  });

  test("goodnessOfFit computes the chi-square statistic", () => {
    const result = goodnessOfFit([20, 30, 25, 25], [25, 25, 25, 25]);
    expect(result.chiSquare).toBeCloseTo(2, 6);
    expect(result.df).toBe(3);
  });

  test("chiSquareIndependence returns a positive statistic", () => {
    const result = chiSquareIndependence([
      [30, 10],
      [20, 40],
    ]);
    expect(result.chiSquare).toBeGreaterThan(0);
    expect(result.df).toBe(1);
  });

  test("oneWayAnova computes the F statistic", () => {
    const result = oneWayAnova([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(result.dfBetween).toBe(2);
    expect(result.dfWithin).toBe(6);
    expect(result.fStat).toBeCloseTo(27, 6);
  });

  test("twoWayAnova returns all degrees of freedom", () => {
    const result = twoWayAnova([
      [
        [10, 12],
        [15, 18],
      ],
      [
        [20, 22],
        [25, 28],
      ],
    ]);
    expect(result.dfRow).toBe(1);
    expect(result.dfCol).toBe(1);
    expect(result.dfInter).toBe(1);
    expect(result.dfError).toBe(4);
    expect(Number.isFinite(result.fRow)).toBe(true);
  });
});
