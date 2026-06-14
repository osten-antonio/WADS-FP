import type { Request, Response } from "express";
import * as z from "zod";
import { sendErrorResponse } from "../lib/error-response";
import * as schema from "../schemas/statistics.schema";
import * as math from "../lib/statistics/math";
import * as statsService from "../services/statistics.service";

// Wraps a Zod request schema + a pure calculation into an Express handler.
// Validation failures and calculation errors both return 400 with a readable
// message; successful results are returned as { result }.
function makeHandler<S extends z.ZodType>(
  reqSchema: S,
  compute: (input: z.infer<S>) => unknown,
) {
  return (req: Request, res: Response) => {
    try {
      const input = reqSchema.parse(req.body);
      return res.json({ result: compute(input) });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const detail = err.issues
          .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
          .join("; ");
        return sendErrorResponse(res, 400, `Invalid input — ${detail}`, "VALIDATION_ERROR");
      }
      const message = err instanceof Error ? err.message : "Invalid input.";
      return sendErrorResponse(res, 400, message, "CALCULATION_ERROR");
    }
  };
}

// One handler per calculation. Keys are the URL path segments under /statistics.
export const statisticsOperations = {
  // Probability
  "binomial-range": makeHandler(schema.binomialRangeRequest, (i) =>
    math.binomialRangeProbability(i.n, i.min, i.max, i.p),
  ),
  "binomial-normal-approx": makeHandler(schema.binomialNormalApproxRequest, (i) =>
    math.binomialNormalApproxProbability(i.n, i.min, i.max, i.p),
  ),
  "poisson-range": makeHandler(schema.poissonRangeRequest, (i) =>
    math.poissonRangeProbability(i.lambda, i.min, i.max),
  ),
  "poisson-normal-approx": makeHandler(schema.poissonNormalApproxRequest, (i) =>
    math.poissonNormalApproxProbability(i.lambda, i.min, i.max),
  ),
  hypergeometric: makeHandler(schema.hypergeometricRequest, (i) =>
    math.hypergeometricProbability(i.N, i.K, i.n, i.k),
  ),

  // Counting
  combinations: makeHandler(schema.countingRequest, (i) => math.combinations(i.n, i.r)),
  permutations: makeHandler(schema.countingRequest, (i) => math.permutations(i.n, i.r)),

  // Inference
  "one-sample-t-test": makeHandler(schema.oneSampleTTestRequest, (i) =>
    statsService.oneSampleTTestWithSteps(i.values, i.mu0, i.alpha),
  ),
  "paired-t-test": makeHandler(schema.pairedTTestRequest, (i) =>
    math.pairedTTest(i.before, i.after, i.alpha),
  ),
  "independent-t-test-data": makeHandler(schema.independentTTestDataRequest, (i) =>
    math.independentTTestFromData(i.sample1, i.sample2, i.alpha, i.tails),
  ),
  "independent-t-test-stats": makeHandler(schema.independentTTestStatsRequest, (i) =>
    math.independentTTestFromStats(i.group1, i.group2, i.alpha, i.tails),
  ),
  "goodness-of-fit": makeHandler(schema.goodnessOfFitRequest, (i) =>
    math.goodnessOfFit(i.observed, i.expected, i.alpha),
  ),
  "chi-square-independence": makeHandler(schema.chiSquareIndependenceRequest, (i) =>
    math.chiSquareIndependence(i.table, i.alpha),
  ),
  "one-way-anova": makeHandler(schema.oneWayAnovaRequest, (i) => math.oneWayAnova(i.groups)),
  "two-way-anova": makeHandler(schema.twoWayAnovaRequest, (i) => math.twoWayAnova(i.data)),

  // Data
  "descriptive-stats": makeHandler(schema.descriptiveStatsRequest, (i) =>
    statsService.descriptiveStatsWithSteps(i.values),
  ),
  "linear-regression": makeHandler(schema.linearRegressionRequest, (i) =>
    statsService.linearRegressionWithSteps(i.xValues, i.yValues, i.alpha),
  ),
  "box-plot": makeHandler(schema.boxPlotRequest, (i) => math.boxPlotSummary(i.values)),
  "special-means": makeHandler(schema.specialMeansRequest, (i) =>
    math.specialMeans(i.values, i.trimPercent, i.trimCount),
  ),
} as const;

export type StatisticsOperation = keyof typeof statisticsOperations;
