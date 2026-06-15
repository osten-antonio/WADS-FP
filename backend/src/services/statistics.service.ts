import type { CalculationResult } from "../lib/statistics/types";
import { wrapLatexInSteps } from "./statistics/utils";
import { descriptiveStatsWithSteps } from "./statistics/descriptive";
import { linearRegressionWithSteps } from "./statistics/regression";
import { oneSampleTTestWithSteps, pairedTTestWithSteps, independentTTestStatsWithSteps, independentTTestDataWithSteps } from "./statistics/ttest";
import { goodnessOfFitWithSteps, chiSquareIndependenceWithSteps } from "./statistics/chisquare";
import { oneWayAnovaWithSteps, twoWayAnovaWithSteps } from "./statistics/anova";
import { boxPlotWithSteps, specialMeansWithSteps } from "./statistics/special";
import { binomialRangeWithSteps, binomialNormalApproxWithSteps, poissonRangeWithSteps, poissonNormalApproxWithSteps, hypergeometricWithSteps, combinationsWithSteps, permutationsWithSteps } from "./statistics/probability";

export {
  descriptiveStatsWithSteps,
  linearRegressionWithSteps,
  oneSampleTTestWithSteps,
  pairedTTestWithSteps,
  independentTTestStatsWithSteps,
  independentTTestDataWithSteps,
  goodnessOfFitWithSteps,
  chiSquareIndependenceWithSteps,
  oneWayAnovaWithSteps,
  twoWayAnovaWithSteps,
  boxPlotWithSteps,
  specialMeansWithSteps,
  binomialRangeWithSteps,
  binomialNormalApproxWithSteps,
  poissonRangeWithSteps,
  poissonNormalApproxWithSteps,
  hypergeometricWithSteps,
  combinationsWithSteps,
  permutationsWithSteps,
};

export const handlerMap = {
  "binomial-range": binomialRangeWithSteps,
  "binomial-normal-approx": binomialNormalApproxWithSteps,
  "poisson-range": poissonRangeWithSteps,
  "poisson-normal-approx": poissonNormalApproxWithSteps,
  hypergeometric: hypergeometricWithSteps,
  combinations: combinationsWithSteps,
  permutations: permutationsWithSteps,
  "one-sample-t-test": oneSampleTTestWithSteps,
  "paired-t-test": pairedTTestWithSteps,
  "independent-t-test-data": independentTTestDataWithSteps,
  "independent-t-test-stats": independentTTestStatsWithSteps,
  "goodness-of-fit": goodnessOfFitWithSteps,
  "chi-square-independence": chiSquareIndependenceWithSteps,
  "one-way-anova": oneWayAnovaWithSteps,
  "two-way-anova": twoWayAnovaWithSteps,
  "descriptive-stats": descriptiveStatsWithSteps,
  "linear-regression": linearRegressionWithSteps,
  "box-plot": boxPlotWithSteps,
  "special-means": specialMeansWithSteps,
} as const;

export type StatisticsOperationKey = keyof typeof handlerMap;

export function runOperation(operation: string, input: any) {
  let result: CalculationResult;
  switch (operation) {
    case "binomial-range":
      result = binomialRangeWithSteps(input.n, input.min, input.max, input.p); break;
    case "binomial-normal-approx":
      result = binomialNormalApproxWithSteps(input.n, input.min, input.max, input.p); break;
    case "poisson-range":
      result = poissonRangeWithSteps(input.lambda, input.min, input.max); break;
    case "poisson-normal-approx":
      result = poissonNormalApproxWithSteps(input.lambda, input.min, input.max); break;
    case "hypergeometric":
      result = hypergeometricWithSteps(input.N, input.K, input.n, input.k); break;
    case "combinations":
      result = combinationsWithSteps(input.n, input.r); break;
    case "permutations":
      result = permutationsWithSteps(input.n, input.r); break;
    case "one-sample-t-test":
      result = oneSampleTTestWithSteps(input.values, input.mu0, input.alpha); break;
    case "paired-t-test":
      result = pairedTTestWithSteps(input.before, input.after, input.alpha); break;
    case "independent-t-test-data":
      result = independentTTestDataWithSteps(input.sample1, input.sample2, input.alpha, input.tails); break;
    case "independent-t-test-stats":
      result = independentTTestStatsWithSteps(input.group1, input.group2, input.alpha, input.tails); break;
    case "goodness-of-fit":
      result = goodnessOfFitWithSteps(input.observed, input.expected, input.alpha); break;
    case "chi-square-independence":
      result = chiSquareIndependenceWithSteps(input.table, input.alpha); break;
    case "one-way-anova":
      result = oneWayAnovaWithSteps(input.groups); break;
    case "two-way-anova":
      result = twoWayAnovaWithSteps(input.data); break;
    case "descriptive-stats":
      result = descriptiveStatsWithSteps(input.values); break;
    case "linear-regression":
      result = linearRegressionWithSteps(input.xValues, input.yValues, input.alpha); break;
    case "box-plot":
      result = boxPlotWithSteps(input.values); break;
    case "special-means":
      result = specialMeansWithSteps(input.values, input.trimPercent, input.trimCount); break;
    default:
      throw new Error(`Operation not implemented: ${operation}`);
  }
  result.steps = wrapLatexInSteps(result.steps);
  return result;
}
