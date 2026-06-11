// Worked-solution step generators for the local fallback. Each builds a
// SolutionStep[] (numbered summary + one KaTeX formula line) from the inputs and
// the locally-computed result, matching the StepBox format used by the UI.

import type {
  SolutionStep,
  OneSampleTResult,
  PairedTResult,
  IndependentTResult,
  GoodnessOfFitResult,
  IndependenceResult,
  OneWayAnovaResult,
  TwoWayAnovaResult,
  DescriptiveStatsResult,
  RegressionResult,
  BoxPlotSummaryResult,
  SpecialMeansResult,
} from "./api";

// Compact number formatting for formulas.
function f(x: number, d = 4): string {
  if (!Number.isFinite(x)) return "\\text{N/A}";
  if (Number.isInteger(x)) return String(x);
  return x.toFixed(d).replace(/\.?0+$/, "");
}

function decision(reject: boolean): string {
  return reject ? "\\text{Reject } H_0" : "\\text{Fail to reject } H_0";
}

export function oneSampleTTestSteps(
  input: { values: number[]; mu0: number },
  r: OneSampleTResult,
): SolutionStep[] {
  const crit = r.tCritical === null ? "\\text{N/A}" : f(r.tCritical);
  return [
    { step: 1, summary: "State the hypotheses.", expression: `H_0:\\ \\mu = ${f(input.mu0)} \\qquad H_1:\\ \\mu \\neq ${f(input.mu0)}` },
    { step: 2, summary: "Sample statistics.", expression: `\\bar{x} = ${f(r.sampleMean)},\\quad s = ${f(r.sampleStdDev)},\\quad n = ${input.values.length}` },
    { step: 3, summary: "Compute the test statistic.", expression: `t = \\dfrac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} = ${f(r.tStatistic)}` },
    { step: 4, summary: "Critical value.", expression: `df = n - 1 = ${r.df},\\quad t_{crit} = \\pm ${crit}` },
    { step: 5, summary: "Decision.", expression: `|t| = ${f(Math.abs(r.tStatistic))} \\Rightarrow ${decision(r.reject)}` },
  ];
}

export function pairedTTestSteps(
  input: { before: number[] },
  r: PairedTResult,
): SolutionStep[] {
  const crit = r.tCritical === null ? "\\text{N/A}" : f(r.tCritical);
  return [
    { step: 1, summary: "State the hypotheses.", expression: `H_0:\\ \\mu_d = 0 \\qquad H_1:\\ \\mu_d \\neq 0` },
    { step: 2, summary: "Summarise the differences.", expression: `\\bar{d} = ${f(r.meanDiff)},\\quad s_d = ${f(r.sdDiff)},\\quad n = ${input.before.length}` },
    { step: 3, summary: "Compute the test statistic.", expression: `t = \\dfrac{\\bar{d}}{s_d/\\sqrt{n}} = ${f(r.tStatistic)}` },
    { step: 4, summary: "Critical value.", expression: `df = n - 1 = ${r.df},\\quad t_{crit} = \\pm ${crit}` },
    { step: 5, summary: "Decision.", expression: `|t| = ${f(Math.abs(r.tStatistic))} \\Rightarrow ${decision(r.reject)}` },
  ];
}

export function independentTTestSteps(
  input: { tails: 1 | 2 },
  r: IndependentTResult,
): SolutionStep[] {
  const crit = r.tCritical === null ? "\\text{N/A}" : f(r.tCritical);
  const alt = input.tails === 1 ? "H_1:\\ \\mu_1 > \\mu_2" : "H_1:\\ \\mu_1 \\neq \\mu_2";
  const methodNote =
    r.method === "welch"
      ? "\\text{Unequal variances} \\Rightarrow \\text{Welch's } t"
      : "\\text{Equal variances} \\Rightarrow \\text{pooled } t";
  return [
    { step: 1, summary: "State the hypotheses.", expression: `H_0:\\ \\mu_1 = \\mu_2 \\qquad ${alt}` },
    { step: 2, summary: "Choose the method (F-test on variances).", expression: methodNote },
    { step: 3, summary: "Compute the test statistic.", expression: `t = ${f(r.tStatistic)}` },
    { step: 4, summary: "Critical value.", expression: `df = ${f(r.df)},\\quad t_{crit} = \\pm ${crit}` },
    { step: 5, summary: "Decision.", expression: `|t| = ${f(Math.abs(r.tStatistic))} \\Rightarrow ${decision(r.reject)}` },
  ];
}

export function goodnessOfFitSteps(r: GoodnessOfFitResult): SolutionStep[] {
  const crit = r.chiCritical === null ? "\\text{N/A}" : f(r.chiCritical);
  return [
    { step: 1, summary: "State the hypotheses.", expression: `H_0:\\ \\text{observed fits expected} \\qquad H_1:\\ \\text{it does not}` },
    { step: 2, summary: "Compute the chi-square statistic.", expression: `\\chi^2 = \\sum \\dfrac{(O - E)^2}{E} = ${f(r.chiSquare)}` },
    { step: 3, summary: "Critical value.", expression: `df = k - 1 = ${r.df},\\quad \\chi^2_{crit} = ${crit}` },
    { step: 4, summary: "Decision.", expression: `\\chi^2 = ${f(r.chiSquare)} \\Rightarrow ${decision(r.reject)}` },
  ];
}

export function chiSquareIndependenceSteps(r: IndependenceResult): SolutionStep[] {
  const crit = r.chiCritical === null ? "\\text{N/A}" : f(r.chiCritical);
  return [
    { step: 1, summary: "State the hypotheses.", expression: `H_0:\\ \\text{variables are independent} \\qquad H_1:\\ \\text{associated}` },
    { step: 2, summary: "Compute the chi-square statistic from expected counts.", expression: `\\chi^2 = \\sum \\dfrac{(O - E)^2}{E} = ${f(r.chiSquare)}` },
    { step: 3, summary: "Critical value.", expression: `df = (r-1)(c-1) = ${r.df},\\quad \\chi^2_{crit} = ${crit}` },
    { step: 4, summary: "Decision.", expression: `\\chi^2 = ${f(r.chiSquare)} \\Rightarrow ${decision(r.reject)}` },
  ];
}

export function oneWayAnovaSteps(r: OneWayAnovaResult): SolutionStep[] {
  const crit = r.fCritical === null ? "\\text{N/A}" : f(r.fCritical);
  const reject = r.fCritical !== null && r.fStat > r.fCritical;
  return [
    { step: 1, summary: "State the hypotheses.", expression: `H_0:\\ \\mu_1 = \\mu_2 = \\cdots \\qquad H_1:\\ \\text{at least one differs}` },
    { step: 2, summary: "Compute the F statistic.", expression: `F = \\dfrac{MS_{between}}{MS_{within}} = ${f(r.fStat)}` },
    { step: 3, summary: "Critical value.", expression: `df = (${r.dfBetween},\\ ${r.dfWithin}),\\quad F_{crit} = ${crit}` },
    { step: 4, summary: "Decision.", expression: `F = ${f(r.fStat)} \\Rightarrow ${decision(reject)}` },
  ];
}

export function twoWayAnovaSteps(r: TwoWayAnovaResult): SolutionStep[] {
  const line = (fv: number, fc: number | null, df: number, label: string) => {
    const crit = fc === null ? "\\text{N/A}" : f(fc);
    const rej = fc !== null && fv > fc;
    return {
      summary: `${label} effect.`,
      expression: `F = ${f(fv)},\\quad df = (${df},\\ ${r.dfError}),\\quad F_{crit} = ${crit} \\Rightarrow ${decision(rej)}`,
    };
  };
  const row = line(r.fRow, r.fCriticalRow, r.dfRow, "Row");
  const col = line(r.fCol, r.fCriticalCol, r.dfCol, "Column");
  const inter = line(r.fInter, r.fCriticalInter, r.dfInter, "Interaction");
  return [
    { step: 1, summary: "Test three effects (row, column, interaction).", expression: `F = \\dfrac{MS_{effect}}{MS_{error}}` },
    { step: 2, summary: row.summary, expression: row.expression },
    { step: 3, summary: col.summary, expression: col.expression },
    { step: 4, summary: inter.summary, expression: inter.expression },
  ];
}

export function descriptiveStatsSteps(r: DescriptiveStatsResult): SolutionStep[] {
  return [
    { step: 1, summary: "Count the data points.", expression: `n = ${r.n}` },
    { step: 2, summary: "Mean.", expression: `\\bar{x} = \\dfrac{\\sum x_i}{n} = ${f(r.mean)}` },
    { step: 3, summary: "Median and range.", expression: `M = ${f(r.median)},\\quad \\text{range} = ${f(r.range)}` },
    { step: 4, summary: "Variance and standard deviation.", expression: `s = ${f(r.sampleStdDev)},\\quad \\sigma = ${f(r.populationStdDev)}` },
  ];
}

export function linearRegressionSteps(r: RegressionResult): SolutionStep[] {
  const crit = r.tCritical === null ? "\\text{N/A}" : f(r.tCritical);
  const sign = r.intercept >= 0 ? "+" : "-";
  return [
    { step: 1, summary: "Fit the least-squares line.", expression: `\\hat{y} = ${f(r.slope)}x ${sign} ${f(Math.abs(r.intercept))}` },
    { step: 2, summary: "Correlation.", expression: `r = ${f(r.r)},\\quad r^2 = ${f(r.rSquared)}` },
    { step: 3, summary: "Test the slope for significance.", expression: `t = ${f(r.tStatistic)},\\quad df = ${r.df},\\quad t_{crit} = \\pm ${crit}` },
    { step: 4, summary: "Decision.", expression: `\\text{${r.isSignificant ? "Significant" : "Not significant"} at the chosen } \\alpha` },
  ];
}

export function boxPlotSteps(r: BoxPlotSummaryResult): SolutionStep[] {
  return [
    { step: 1, summary: "Five-number summary.", expression: `\\min = ${f(r.min)},\\ Q_1 = ${f(r.q1)},\\ M = ${f(r.median)},\\ Q_3 = ${f(r.q3)},\\ \\max = ${f(r.max)}` },
    { step: 2, summary: "Interquartile range.", expression: `IQR = Q_3 - Q_1 = ${f(r.iqr)}` },
    { step: 3, summary: "Outlier fences.", expression: `[\\,Q_1 - 1.5\\,IQR,\\ Q_3 + 1.5\\,IQR\\,] = [${f(r.lowerFence)},\\ ${f(r.upperFence)}]` },
    { step: 4, summary: "Outliers.", expression: r.outliers.length ? r.outliers.map((v) => f(v)).join(",\\ ") : "\\text{none}" },
  ];
}

export function specialMeansSteps(r: SpecialMeansResult): SolutionStep[] {
  const geo = Number.isFinite(r.geometricMean) ? f(r.geometricMean) : "\\text{N/A (needs all } > 0)";
  return [
    { step: 1, summary: "Quartiles.", expression: `Q_1 = ${f(r.quartiles.q1)},\\quad M = ${f(r.quartiles.median)},\\quad Q_3 = ${f(r.quartiles.q3)}` },
    { step: 2, summary: "Trimean.", expression: `T = \\dfrac{Q_1 + 2M + Q_3}{4} = ${f(r.trimean)}` },
    { step: 3, summary: "Geometric mean.", expression: `G = \\left(\\prod x_i\\right)^{1/n} = ${geo}` },
    { step: 4, summary: `Trimmed mean (${r.trimPerSide} per side).`, expression: `\\bar{x}_{trim} = ${f(r.trimmedMean)}` },
  ];
}
