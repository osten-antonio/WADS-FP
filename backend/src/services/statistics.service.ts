import * as math from "../lib/statistics/math";
import type { CalculationResult, CalculationStep } from "../lib/statistics/types";

function formatNumber(n: number, digits = 6) {
  if (!Number.isFinite(n)) return String(n);
  return Number(n.toFixed(digits)).toString();
}

function sanitizeForJson(v: any): any {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (Array.isArray(v)) return v.map(sanitizeForJson);
  if (v && typeof v === "object") {
    const out: any = Array.isArray(v) ? [] : {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = sanitizeForJson(val);
    }
    return out;
  }
  return v;
}

export function descriptiveStatsWithSteps(values: number[]): CalculationResult {
  const value = math.descriptiveStats(values) as any;
  const sum = values.reduce((s, v) => s + v, 0);
  const sorted = [...values].sort((a, b) => a - b);
  const median = value.median;
  const modeArr: number[] = value.mode ?? [];
  const min = value.min;
  const max = value.max;
  const range = value.range;
  const sumSquaredDev = values.reduce((s, v) => s + (v - value.mean) ** 2, 0);
  const populationVariance = value.populationVariance;
  const sampleVariance = value.sampleVariance;
  const populationSD = value.populationStdDev;
  const sampleSD = value.sampleStdDev;

  const sumExpansion =
    values.length <= 10 ? values.join(" + ") : `${values.slice(0, 6).join(" + ")} + ...`;

  const squaredSamples = values.slice(0, Math.min(3, values.length)).map((v) => `(${formatNumber(v, 6)} - ${formatNumber(value.mean, 6)})^2 = ${formatNumber((v - value.mean) ** 2, 6)}`);

  const steps: CalculationStep[] = [
    {
      id: "identify",
      title: "Identify the Data Set",
      description: `n = ${value.n}, preview: ${values.slice(0, 10).join(", ")}`,
      note: `Sorted preview: ${sorted.slice(0, 10).join(", ")}`,
    },
    {
      id: "sum",
      title: "Calculate the Sum (Σx)",
      formula: "\\Sigma x = x_1 + x_2 + ... + x_n",
      calculation: `\\Sigma x = ${sumExpansion} = ${formatNumber(sum, 6)}`,
      result: String(formatNumber(sum, 6)),
    },
    {
      id: "mean",
      title: "Calculate the Mean (\\bar{x})",
      formula: "\\bar{x} = \\frac{\\Sigma x}{n}",
      calculation: `\\bar{x} = \\frac{${formatNumber(sum, 6)}}{${value.n}} = ${formatNumber(value.mean, 6)}`,
      result: String(formatNumber(value.mean, 6)),
    },
    {
      id: "median",
      title: "Calculate the Median",
      description: `Sorted data: ${sorted.slice(0, 12).join(", ")}`,
      calculation: `Median = ${formatNumber(median, 6)}`,
      result: String(formatNumber(median, 6)),
    },
    {
      id: "mode",
      title: "Find the Mode",
      description: modeArr.length ? `Mode(s): ${modeArr.join(", ")}` : "No mode (all values unique)",
      result: modeArr.length ? String(modeArr.join(", ")) : "No mode",
    },
    {
      id: "range",
      title: "Calculate Range",
      formula: "Range = Max - Min",
      calculation: `Range = ${formatNumber(max, 6)} - ${formatNumber(min, 6)} = ${formatNumber(range, 6)}`,
      result: String(formatNumber(range, 6)),
    },
    {
      id: "variance-setup",
      title: "Calculate Squared Deviations",
      formula: "(x_i - \\bar{x})^2",
      description: squaredSamples.join("; "),
      note: `Σ(x_i - x̄)^2 = ${formatNumber(sumSquaredDev, 6)}`,
    },
    {
      id: "variance-population",
      title: "Population Variance (σ²)",
      formula: "\\sigma^2 = \\frac{\\Sigma(x_i - \\bar{x})^2}{n}",
      calculation: `\\sigma^2 = \\frac{${formatNumber(sumSquaredDev, 6)}}{${value.n}} = ${formatNumber(populationVariance, 6)}`,
      result: String(formatNumber(populationVariance, 6)),
      note: "Use when data represents entire population",
    },
    {
      id: "variance-sample",
      title: "Sample Variance (s²)",
      formula: "s^2 = \\frac{\\Sigma(x_i - \\bar{x})^2}{n - 1}",
      calculation: `s^2 = \\frac{${formatNumber(sumSquaredDev, 6)}}{${value.n} - 1} = ${formatNumber(sampleVariance, 6)}`,
      result: String(formatNumber(sampleVariance, 6)),
      note: "Bessel's correction",
    },
    {
      id: "sd-population",
      title: "Population Standard Deviation (σ)",
      formula: "\\sigma = \\sqrt{\\sigma^2}",
      calculation: `\\sigma = \\sqrt{${formatNumber(populationVariance, 6)}} = ${formatNumber(populationSD, 6)}`,
      result: String(formatNumber(populationSD, 6)),
    },
    {
      id: "sd-sample",
      title: "Sample Standard Deviation (s)",
      formula: "s = \\sqrt{s^2}",
      calculation: `s = \\sqrt{${formatNumber(sampleVariance, 6)}} = ${formatNumber(sampleSD, 6)}`,
      result: String(formatNumber(sampleSD, 6)),
    },
    {
      id: "summary",
      title: "Summary of Results",
      description: `n=${value.n}, Σx=${formatNumber(sum, 6)}, mean=${formatNumber(value.mean, 6)}, median=${formatNumber(median, 6)}, mode=${modeArr.length ? modeArr.join(", ") : 'No mode'}, range=${formatNumber(range, 6)}, s^2=${formatNumber(sampleVariance, 6)}, s=${formatNumber(sampleSD, 6)}`,
    },
  ];

  return { value: sanitizeForJson(value), steps, formula: "descriptive" };
}

export function linearRegressionWithSteps(xValues: number[], yValues: number[], alpha = 0.05): CalculationResult {
  const value = math.linearRegression(xValues, yValues, alpha) as any;

  const steps: CalculationStep[] = [
    {
      id: "data",
      title: "Prepare data",
      description: `n = ${value.n}; first points: ${xValues.slice(0, 5).map((x, i) => `(${x},${yValues[i]})`).join(", ")}`,
    },
    {
      id: "slope",
      title: "Calculate slope",
      formula: "b = \\frac{n\\sum xy - \\sum x \\sum y}{n\\sum x^2 - (\\sum x)^2}",
      result: String(formatNumber(value.slope, 6)),
    },
    {
      id: "intercept",
      title: "Calculate intercept",
      formula: "a = \\bar{y} - b\\bar{x}",
      result: String(formatNumber(value.intercept, 6)),
    },
    {
      id: "equation",
      title: "Regression equation",
      result: String(value.equation),
    },
  ];

  return { value: sanitizeForJson(value), steps, formula: "linear-regression", inputs: { alpha } };
}

export function oneSampleTTestWithSteps(values: number[], mu0: number, alpha = 0.05): CalculationResult {
  const value = math.oneSampleTTest(values, mu0, alpha) as any;

  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify sample", description: `n = ${value.df + 1}; sample mean = ${formatNumber(value.sampleMean, 6)}` },
    { id: "tstat", title: "Compute t statistic", formula: "t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}", result: String(formatNumber(value.tStatistic, 6)) },
    { id: "decision", title: "Decision", result: value.reject ? "Reject H0" : "Fail to reject H0" },
  ];

  return { value: sanitizeForJson(value), steps, inputs: { mu0, alpha } };
}

export function binomialRangeWithSteps(n: number, min: number, max: number, p: number): CalculationResult {
  const prob = math.binomialRangeProbability(n, min, max, p);

  const perK: string[] = [];
  for (let k = min; k <= max; k += 1) {
    const c = math.combinations(n, k);
    const pPow = Math.pow(p, k);
    const qPow = Math.pow(1 - p, n - k);
    const pmf = math.binomialPmf(n, k, p);
    perK.push(
      `P(X=${k}) = C(${n},${k})=${c} * ${p}^${k}=${formatNumber(pPow, 8)} * ${1 - p}^${n - k}=${formatNumber(qPow, 8)} => ${formatNumber(pmf, 8)}`,
    );
  }

  const calculationsPreview = perK.length > 6 ? `${perK.slice(0, 3).join("; ")} ; ... ; ${perK.slice(-2).join("; ")}` : perK.join("; ");

  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify parameters", description: `n=${n}, p=${p}, range=[${min},${max}]` },
    { id: "formula", title: "Binomial formula", formula: "P(X = k) = C(n, k) \u00B7 p^k \u00B7 (1-p)^{n-k}" },
    { id: "calculations", title: "Calculate individual probabilities (P(X=k))", calculation: calculationsPreview },
    { id: "sum", title: "Sum the Results", calculation: `Sum P(X=k) for k=${min}..${max} = ${perK.length <= 6 ? perK.map((s) => s.split('=>').pop()?.trim()).join(' + ') : 'See calculations preview'} = ${formatNumber(prob, 8)}` },
    { id: "result", title: "Final Answer", result: String(formatNumber(prob, 8)) },
  ];
  return { value: sanitizeForJson(prob), steps, formula: "binomial-range", inputs: { n, min, max, p } };
}

export function binomialNormalApproxWithSteps(n: number, min: number, max: number, p: number): CalculationResult {
  const value = math.binomialNormalApproxProbability(n, min, max, p) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify parameters", description: `n=${n}, p=${p}` },
    { id: "approx", title: "Normal approximation", formula: `\n mean=${formatNumber(value.mean,6)}, sd=${formatNumber(value.stdDev,6)}` },
    { id: "z", title: "Z values", calculation: `z_low=${formatNumber(value.zLow,6)}, z_high=${formatNumber(value.zHigh,6)}` },
    { id: "result", title: "Probability", result: String(formatNumber(value.probability, 8)) },
  ];
  return { value: sanitizeForJson(value), steps, formula: "binomial-normal-approx", inputs: { n, min, max, p } };
}

export function poissonRangeWithSteps(lambda: number, min: number, max: number): CalculationResult {
  const prob = math.poissonRangeProbability(lambda, min, max);
  const pmfs: string[] = [];
  for (let k = min; k <= max; k += 1) {
    const pmf = math.poissonPmf(lambda, k);
    pmfs.push(`${k}: ${formatNumber(pmf, 8)}`);
  }
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify parameters", description: `\u03BB=${lambda}, range=[${min},${max}]` },
    { id: "pmf", title: "PMF values", calculation: pmfs.join(", ") },
    { id: "result", title: "Range probability", result: String(formatNumber(prob, 8)) },
  ];
  return { value: sanitizeForJson(prob), steps, formula: "poisson-range", inputs: { lambda, min, max } };
}

export function poissonNormalApproxWithSteps(lambda: number, min: number, max: number): CalculationResult {
  const value = math.poissonNormalApproxProbability(lambda, min, max) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify parameters", description: `\u03BB=${lambda}` },
    { id: "approx", title: "Normal approximation", calculation: `mean=${formatNumber(value.mean,6)}, sd=${formatNumber(value.stdDev,6)}` },
    { id: "z", title: "Z values", calculation: `z_low=${formatNumber(value.zLow,6)}, z_high=${formatNumber(value.zHigh,6)}` },
    { id: "result", title: "Probability", result: String(formatNumber(value.probability, 8)) },
  ];
  return { value: sanitizeForJson(value), steps, formula: "poisson-normal-approx", inputs: { lambda, min, max } };
}

export function hypergeometricWithSteps(N: number, K: number, n: number, k: number): CalculationResult {
  const value = math.hypergeometricProbability(N, K, n, k);
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify parameters", description: `N=${N}, K=${K}, n=${n}, k=${k}` },
    { id: "result", title: "Probability", result: String(formatNumber(value, 8)) },
  ];
  return { value: sanitizeForJson(value), steps, formula: "hypergeometric", inputs: { N, K, n, k } };
}

export function combinationsWithSteps(n: number, r: number): CalculationResult {
  const value = math.combinations(n, r);
  const steps: CalculationStep[] = [
    { id: "formula", title: "Combinations formula", formula: "C(n,r) = n! / (r!(n-r)!)" },
    { id: "result", title: "Result", result: String(value) },
  ];
  return { value: sanitizeForJson(value), steps, formula: "combinations", inputs: { n, r } };
}

export function permutationsWithSteps(n: number, r: number): CalculationResult {
  const value = math.permutations(n, r);
  const steps: CalculationStep[] = [
    { id: "formula", title: "Permutations formula", formula: "P(n,r) = n! / (n-r)!" },
    { id: "result", title: "Result", result: String(value) },
  ];
  return { value: sanitizeForJson(value), steps, formula: "permutations", inputs: { n, r } };
}

export function boxPlotWithSteps(values: number[]): CalculationResult {
  const value = math.boxPlotSummary(values) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify data", description: `n = ${values.length}` },
    { id: "quartiles", title: "Quartiles", calculation: `Q1=${value.q1}, Median=${value.median}, Q3=${value.q3}` },
    { id: "outliers", title: "Outliers", result: value.outliers.length ? String(value.outliers.join(", ")) : "None" },
  ];
  return { value: sanitizeForJson(value), steps, formula: "box-plot" };
}

export function specialMeansWithSteps(values: number[], trimPercent?: number, trimCount?: number): CalculationResult {
  const value = math.specialMeans(values, trimPercent, trimCount) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify data", description: `n = ${values.length}` },
    { id: "trimean", title: "Trimean", result: String(formatNumber(value.trimean, 6)) },
    { id: "trimmed", title: "Trimmed mean", result: String(formatNumber(value.trimmedMean, 6)) },
  ];
  const inputs: Record<string, string | number> = {};
  if (typeof trimPercent !== "undefined") inputs.trimPercent = trimPercent;
  if (typeof trimCount !== "undefined") inputs.trimCount = trimCount;
  return { value: sanitizeForJson(value), steps, formula: "special-means", inputs };
}

export function pairedTTestWithSteps(before: number[], after: number[], alpha = 0.05): CalculationResult {
  const value = math.pairedTTest(before, after, alpha) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify pairs", description: `pairs = ${before.length}` },
    { id: "tstat", title: "Compute t statistic", result: String(formatNumber(value.tStatistic, 6)) },
    { id: "decision", title: "Decision", result: value.reject ? "Reject H0" : "Fail to reject H0" },
  ];
  return { value: sanitizeForJson(value), steps, formula: "paired-t-test", inputs: { alpha } };
}

export function independentTTestDataWithSteps(sample1: number[], sample2: number[], alpha = 0.05, tails: 1 | 2 = 2): CalculationResult {
  const value = math.independentTTestFromData(sample1, sample2, alpha, tails) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify samples", description: `n1=${sample1.length}, n2=${sample2.length}` },
    { id: "tstat", title: "t statistic", result: String(formatNumber(value.tStatistic, 6)) },
    { id: "decision", title: "Decision", result: value.reject ? "Reject H0" : "Fail to reject H0" },
  ];
  return { value: sanitizeForJson(value), steps, formula: "independent-t-test-data", inputs: { alpha, tails } };
}

export function independentTTestStatsWithSteps(group1: { n: number; mean: number; sd: number }, group2: { n: number; mean: number; sd: number }, alpha = 0.05, tails: 1 | 2 = 2): CalculationResult {
  const value = math.independentTTestFromStats(group1, group2, alpha, tails) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify group stats", description: `n1=${group1.n}, n2=${group2.n}` },
    { id: "tstat", title: "t statistic", result: String(formatNumber(value.tStatistic, 6)) },
    { id: "decision", title: "Decision", result: value.reject ? "Reject H0" : "Fail to reject H0" },
  ];
  return { value: sanitizeForJson(value), steps, formula: "independent-t-test-stats", inputs: { alpha, tails } };
}

export function goodnessOfFitWithSteps(observed: number[], expected: number[], alpha = 0.05): CalculationResult {
  const value = math.goodnessOfFit(observed, expected, alpha) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify data", description: `categories=${observed.length}` },
    { id: "chi", title: "Chi-square", result: String(formatNumber(value.chiSquare, 6)) },
    { id: "decision", title: "Decision", result: value.reject ? "Reject H0" : "Fail to reject H0" },
  ];
  return { value: sanitizeForJson(value), steps, formula: "goodness-of-fit", inputs: { alpha } };
}

export function chiSquareIndependenceWithSteps(table: number[][], alpha = 0.05): CalculationResult {
  const value = math.chiSquareIndependence(table, alpha) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify table", description: `rows=${table.length}, cols=${table[0]?.length ?? 0}` },
    { id: "chi", title: "Chi-square", result: String(formatNumber(value.chiSquare, 6)) },
    { id: "decision", title: "Decision", result: value.reject ? "Reject H0" : "Fail to reject H0" },
  ];
  return { value: sanitizeForJson(value), steps, formula: "chi-square-independence", inputs: { alpha } };
}

export function oneWayAnovaWithSteps(groups: number[][]): CalculationResult {
  const value = math.oneWayAnova(groups) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify groups", description: `k=${groups.length}` },
    { id: "fstat", title: "F statistic", result: String(formatNumber(value.fStat, 6)) },
    { id: "decision", title: "Decision", result: value.fCritical ? `Compare to ${formatNumber(value.fCritical,6)}` : "No critical value" },
  ];
  return { value: sanitizeForJson(value), steps, formula: "one-way-anova" };
}

export function twoWayAnovaWithSteps(data: number[][][]): CalculationResult {
  const value = math.twoWayAnova(data) as any;
  const steps: CalculationStep[] = [
    { id: "identify", title: "Identify layout", description: `rows=${data.length}, cols=${data[0]?.length ?? 0}` },
    { id: "frow", title: "Row F", result: String(formatNumber(value.fRow, 6)) },
    { id: "fcol", title: "Col F", result: String(formatNumber(value.fCol, 6)) },
    { id: "finter", title: "Interaction F", result: String(formatNumber(value.fInter, 6)) },
  ];
  return { value: sanitizeForJson(value), steps, formula: "two-way-anova" };
}

export const handlerMap = {
  // Probability
  "binomial-range": binomialRangeWithSteps,
  "binomial-normal-approx": binomialNormalApproxWithSteps,
  "poisson-range": poissonRangeWithSteps,
  "poisson-normal-approx": poissonNormalApproxWithSteps,
  hypergeometric: hypergeometricWithSteps,

  // Counting
  combinations: combinationsWithSteps,
  permutations: permutationsWithSteps,

  // Inference / Tests
  "one-sample-t-test": oneSampleTTestWithSteps,
  "paired-t-test": pairedTTestWithSteps,
  "independent-t-test-data": independentTTestDataWithSteps,
  "independent-t-test-stats": independentTTestStatsWithSteps,
  "goodness-of-fit": goodnessOfFitWithSteps,
  "chi-square-independence": chiSquareIndependenceWithSteps,
  "one-way-anova": oneWayAnovaWithSteps,
  "two-way-anova": twoWayAnovaWithSteps,

  // Data
  "descriptive-stats": descriptiveStatsWithSteps,
  "linear-regression": linearRegressionWithSteps,
  "box-plot": boxPlotWithSteps,
  "special-means": specialMeansWithSteps,
} as const;

export type StatisticsOperationKey = keyof typeof handlerMap;

export function runOperation(operation: string, input: any) {
  switch (operation) {
    case "binomial-range":
      return binomialRangeWithSteps(input.n, input.min, input.max, input.p);
    case "binomial-normal-approx":
      return binomialNormalApproxWithSteps(input.n, input.min, input.max, input.p);
    case "poisson-range":
      return poissonRangeWithSteps(input.lambda, input.min, input.max);
    case "poisson-normal-approx":
      return poissonNormalApproxWithSteps(input.lambda, input.min, input.max);
    case "hypergeometric":
      return hypergeometricWithSteps(input.N, input.K, input.n, input.k);

    case "combinations":
      return combinationsWithSteps(input.n, input.r);
    case "permutations":
      return permutationsWithSteps(input.n, input.r);

    case "one-sample-t-test":
      return oneSampleTTestWithSteps(input.values, input.mu0, input.alpha);
    case "paired-t-test":
      return pairedTTestWithSteps(input.before, input.after, input.alpha);
    case "independent-t-test-data":
      return independentTTestDataWithSteps(input.sample1, input.sample2, input.alpha, input.tails);
    case "independent-t-test-stats":
      return independentTTestStatsWithSteps(input.group1, input.group2, input.alpha, input.tails);
    case "goodness-of-fit":
      return goodnessOfFitWithSteps(input.observed, input.expected, input.alpha);
    case "chi-square-independence":
      return chiSquareIndependenceWithSteps(input.table, input.alpha);
    case "one-way-anova":
      return oneWayAnovaWithSteps(input.groups);
    case "two-way-anova":
      return twoWayAnovaWithSteps(input.data);

    case "descriptive-stats":
      return descriptiveStatsWithSteps(input.values);
    case "linear-regression":
      return linearRegressionWithSteps(input.xValues, input.yValues, input.alpha);
    case "box-plot":
      return boxPlotWithSteps(input.values);
    case "special-means":
      return specialMeansWithSteps(input.values, input.trimPercent, input.trimCount);

    default:
      throw new Error(`Operation not implemented: ${operation}`);
  }
}
