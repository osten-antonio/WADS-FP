import express from "express";

import { globalRateLimit } from "../middleware/rateLimit.middleware";
import { statisticsOperations } from "../controllers/statistics.controller";

/**
 * @openapi
 * tags:
 *   - name: Statistics
 *     description: >
 *       Server-side statistics calculator. One POST endpoint per operation under
 *       `/statistics`. Every request body is validated with Zod and computed by
 *       the backend engine so calculation logic is never exposed to the client.
 *       Operations: binomial-range, binomial-normal-approx, poisson-range,
 *       poisson-normal-approx, hypergeometric, combinations, permutations,
 *       one-sample-t-test, paired-t-test, independent-t-test-data,
 *       independent-t-test-stats, goodness-of-fit, chi-square-independence,
 *       one-way-anova, two-way-anova, descriptive-stats, linear-regression,
 *       box-plot, special-means.
 */

/**
 * @openapi
 * /statistics/{operation}:
 *   post:
 *     tags: [Statistics]
 *     summary: Run a statistics calculation
 *     parameters:
 *       - in: path
 *         name: operation
 *         required: true
 *         schema:
 *           type: string
 *         description: The calculation to run (see Statistics tag description).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             n: 10
 *             min: 4
 *             max: 6
 *             p: 0.5
 *     responses:
 *       '200':
 *         description: Calculation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/statisticsResponse'
 *       '400':
 *         description: Validation or calculation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const statisticsRouter = express.Router();

// Register one POST route per operation, e.g. POST /statistics/binomial-range.
for (const [operation, handler] of Object.entries(statisticsOperations)) {
  statisticsRouter.post(`/${operation}`, globalRateLimit, handler);
}

export default statisticsRouter;
