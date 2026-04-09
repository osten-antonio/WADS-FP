import express from "express";
import { ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { generate as generatePractice, refresh } from "../controllers/practice.controller";
import { validateCategory } from "../middleware/validate.middleware";
/**
 * @openapi
 * tags:
 *   - name: Practice
 *     description: Generate practice questions from a source question within the same topic (if provided).
 */
const practiceRouter = express.Router();
/**
 * @openapi
 * /practice/generate:
 *   post:
 *     tags: [Practice]
 *     summary: Generate practice questions from a source question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/practiceRequest'
 *           example:
 *             question: "Solve for x: 2x + 3 = 11"
 *             category: "Algebra"
 *     responses:
 *       '200':
 *         description: Practice set generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/practiceResponse'
 *             example:
 *               questions:
 *                 - "Solve for y: 3y - 5 = 10"
 *                 - "Find z: z/2 + 7 = 12"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
practiceRouter.post('/generate/', ollamaRateLimit, validateCategory, generatePractice);
/**
 * @openapi
 * /practice/refresh:
 *   post:
 *     tags: [Practice]
 *     summary: Refresh existing practice questions
 *     description: Provide new practice questions from a pool, creates new ones if pool is exhausted
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/practiceRefresh'
 *           example:
 *             question: "Solve for x: 2x + 3 = 11"
 *             category: "Algebra"
 *             generatedQuestions: ["Solve for y: 3y - 5 = 10", "Find z: z/2 + 7 = 12"]
 *     responses:
 *       '200':
 *         description: Practice set refreshed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/practiceResponse'
 *             example:
 *               questions:
 *                 - "Find a: 4a + 1 = 13"
 *                 - "Determine b: 5 - b = 2"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
practiceRouter.post('/refresh/', ollamaRateLimit, validateCategory, refresh);
export default practiceRouter;
//# sourceMappingURL=practice.routes.js.map