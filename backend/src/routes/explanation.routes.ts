import express from "express";

import { ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { steps, hint, generate, askExplanation } from "../controllers/explanation.controller";

/**
 * @openapi
 * tags:
 *   - name: Explanation
 *     description: Generate steps, hints, and explanations (draft).
 */

const explanationRouter = express.Router();

/**
 * @openapi
 * /explanation/steps:
 *   post:
 *     tags: [Explanation]
 *     summary: Generate solution steps
 *     description: Draft endpoint. Update payload once explanation flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               solveResultId:
 *                 type: string
 *                 format: uuid
 *               problemText:
 *                 type: string
 *             example:
 *               solveResultId: 3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2
 *     responses:
 *       '200':
 *         description: Steps generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 steps:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Step'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
explanationRouter.post('/steps/', ollamaRateLimit, steps);

/**
 * @openapi
 * /explanation/hint:
 *   post:
 *     tags: [Explanation]
 *     summary: Generate hints
 *     description: Draft endpoint. Update payload once explanation flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               solveResultId:
 *                 type: string
 *                 format: uuid
 *               problemText:
 *                 type: string
 *             example:
 *               solveResultId: 3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2
 *     responses:
 *       '200':
 *         description: Hints generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hints:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hint'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
explanationRouter.post('/hint/', ollamaRateLimit, hint);

/**
 * @openapi
 * /explanation/generate:
 *   post:
 *     tags: [Explanation]
 *     summary: Generate a full explanation
 *     description: Draft endpoint. Update payload once explanation flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               solveResultId:
 *                 type: string
 *                 format: uuid
 *               problemText:
 *                 type: string
 *               finalAnswer:
 *                 type: string
 *             example:
 *               solveResultId: 3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2
 *     responses:
 *       '200':
 *         description: Explanation generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolveResult'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
explanationRouter.post('/generate/', ollamaRateLimit, generate);

/**
 * @openapi
 * /explanation/add:
 *   post:
 *     tags: [Explanation]
 *     summary: Ask a follow-up explanation question
 *     description: Draft endpoint. Update payload once explanation flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               solveResultId:
 *                 type: string
 *                 format: uuid
 *               question:
 *                 type: string
 *             example:
 *               solveResultId: 3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2
 *               question: "Why is the derivative 2x here?"
 *     responses:
 *       '200':
 *         description: Explanation returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
explanationRouter.post('/add', ollamaRateLimit, askExplanation);

export default explanationRouter;
