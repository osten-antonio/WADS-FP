// Local fallback dispatcher: computes an Inference/Data result and its worked
// steps entirely in the browser when the backend is unreachable. Returns the
// same `{ result, steps }` envelope the backend would, so callers are unchanged.

import type { SolutionStep, StatisticsOperation } from "./api";
import * as math from "./math";
import * as steps from "./steps";

export function computeLocally(
  operation: StatisticsOperation,
  payload: Record<string, unknown>,
): { result: unknown; steps: SolutionStep[] } {
  const p = payload as Record<string, never>;
  const alpha = (payload.alpha as number) ?? 0.05;
  const tails = ((payload.tails as 1 | 2) ?? 2) as 1 | 2;

  switch (operation) {
    case "one-sample-t-test": {
      const values = p.values as number[];
      const result = math.oneSampleTTest(values, payload.mu0 as number, alpha);
      return { result, steps: steps.oneSampleTTestSteps({ values, mu0: payload.mu0 as number }, result) };
    }
    case "paired-t-test": {
      const before = p.before as number[];
      const result = math.pairedTTest(before, p.after as number[], alpha);
      return { result, steps: steps.pairedTTestSteps({ before }, result) };
    }
    case "independent-t-test-data": {
      const result = math.independentTTestFromData(p.sample1 as number[], p.sample2 as number[], alpha, tails);
      return { result, steps: steps.independentTTestSteps({ tails }, result) };
    }
    case "independent-t-test-stats": {
      const result = math.independentTTestFromStats(
        payload.group1 as { n: number; mean: number; sd: number },
        payload.group2 as { n: number; mean: number; sd: number },
        alpha,
        tails,
      );
      return { result, steps: steps.independentTTestSteps({ tails }, result) };
    }
    case "goodness-of-fit": {
      const result = math.goodnessOfFit(p.observed as number[], p.expected as number[], alpha);
      return { result, steps: steps.goodnessOfFitSteps(result) };
    }
    case "chi-square-independence": {
      const result = math.chiSquareIndependence(p.table as number[][], alpha);
      return { result, steps: steps.chiSquareIndependenceSteps(result) };
    }
    case "one-way-anova": {
      const result = math.oneWayAnova(p.groups as number[][]);
      return { result, steps: steps.oneWayAnovaSteps(result) };
    }
    case "two-way-anova": {
      const result = math.twoWayAnova(p.data as number[][][]);
      return { result, steps: steps.twoWayAnovaSteps(result) };
    }
    case "descriptive-stats": {
      const result = math.descriptiveStats(p.values as number[]);
      return { result, steps: steps.descriptiveStatsSteps(result) };
    }
    case "linear-regression": {
      const result = math.linearRegression(p.xValues as number[], p.yValues as number[], alpha);
      return { result, steps: steps.linearRegressionSteps(result) };
    }
    case "box-plot": {
      const result = math.boxPlotSummary(p.values as number[]);
      return { result, steps: steps.boxPlotSteps(result) };
    }
    case "special-means": {
      const result = math.specialMeans(
        p.values as number[],
        payload.trimPercent as number | undefined,
        payload.trimCount as number | undefined,
      );
      return { result, steps: steps.specialMeansSteps(result) };
    }
    default:
      throw new Error(`No local fallback for operation: ${operation}`);
  }
}
