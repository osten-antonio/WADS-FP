import * as z from "zod";

// Request schemas for the statistics calculator endpoints.
// These enforce the *shape* of the payload (types/arrays) server-side.
// Semantic range checks (p in [0,1], integer counts, min sample sizes, ...)
// are enforced by the calculation engine in lib/statistics/math.ts, which
// throws human-readable errors.

const numberArray = z.array(z.number());
const alpha = z.number().default(0.05);
const tails = z.union([z.literal(1), z.literal(2)]).default(2);

// --- Probability ---
export const binomialRangeRequest = z.object({
  n: z.number(),
  min: z.number(),
  max: z.number(),
  p: z.number(),
});
export const binomialNormalApproxRequest = binomialRangeRequest;

export const poissonRangeRequest = z.object({
  lambda: z.number(),
  min: z.number(),
  max: z.number(),
});
export const poissonNormalApproxRequest = poissonRangeRequest;

export const hypergeometricRequest = z.object({
  N: z.number(),
  K: z.number(),
  n: z.number(),
  k: z.number(),
});

// --- Counting ---
export const countingRequest = z.object({
  n: z.number(),
  r: z.number(),
});

// --- Inference ---
export const oneSampleTTestRequest = z.object({
  values: numberArray,
  mu0: z.number(),
  alpha,
});

export const pairedTTestRequest = z.object({
  before: numberArray,
  after: numberArray,
  alpha,
});

export const independentTTestDataRequest = z.object({
  sample1: numberArray,
  sample2: numberArray,
  alpha,
  tails,
});

const groupStats = z.object({
  n: z.number(),
  mean: z.number(),
  sd: z.number(),
});
export const independentTTestStatsRequest = z.object({
  group1: groupStats,
  group2: groupStats,
  alpha,
  tails,
});

export const goodnessOfFitRequest = z.object({
  observed: numberArray,
  expected: numberArray,
  alpha,
});

export const chiSquareIndependenceRequest = z.object({
  table: z.array(numberArray),
  alpha,
});

export const oneWayAnovaRequest = z.object({
  groups: z.array(numberArray),
});

export const twoWayAnovaRequest = z.object({
  data: z.array(z.array(numberArray)),
});

// --- Data ---
export const descriptiveStatsRequest = z.object({
  values: numberArray,
});

export const linearRegressionRequest = z.object({
  xValues: numberArray,
  yValues: numberArray,
  alpha,
});

export const boxPlotRequest = z.object({
  values: numberArray,
});

export const specialMeansRequest = z.object({
  values: numberArray,
  trimPercent: z.number().optional(),
  trimCount: z.number().optional(),
});

// Shared response envelope. `result` is the calculation output (number or object).
import { z as zod } from 'zod';

const stepSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  description: zod.string().optional(),
  formula: zod.string().optional(),
  calculation: zod.string().optional(),
  result: zod.string().optional(),
  note: zod.string().optional(),
});

const calculationResult = zod.object({
  value: zod.unknown(),
  steps: stepSchema.array(),
  formula: zod.string().optional(),
  inputs: zod.record(zod.string(), zod.union([zod.string(), zod.number()])).optional(),
});

export const statisticsResponse = zod.object({
  result: calculationResult,
});
