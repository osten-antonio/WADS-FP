import express from "express";

import { globalRateLimit } from "../middleware/rateLimit.middleware";
import * as statsService from "../services/statistics.service";

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

// Single dispatcher that routes all operations through runOperation,
// which includes LaTeX wrapping for step descriptions.
statisticsRouter.post('/:operation', globalRateLimit, (req, res) => {
  try {
    const rawOp = req.params.operation;
    const operation = Array.isArray(rawOp) ? rawOp[0] : rawOp ?? "";
    if (!operation) {
      return res.status(400).json({ message: "Missing operation parameter", code: "VALIDATION_ERROR" });
    }
    const result = statsService.runOperation(operation, req.body);
    return res.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation error";
    return res.status(400).json({ message, code: "CALCULATION_ERROR" });
  }
});

export default statisticsRouter;
