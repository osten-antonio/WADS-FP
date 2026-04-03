import express from "express";

import { ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { steps, hint, generate, followUpExplanation } from "../controllers/explanation.controller";
import { validateCategory } from "../middleware/validate.middleware";

/**
 * @openapi
 * tags:
 *   - name: Explanation
 *     description: Generate steps, hints, and explanations.
 */

const explanationRouter = express.Router();

/**
 * @openapi
 * /explanation/steps:
 *   post:
 *     tags: [Explanation]
 *     summary: Generate solution steps
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/stepsRequest'
 *           example:
 *             question: "2x + 3 = 11"
 *             answer: "x = 4"
 *             category: "Algebra"
 *     responses:
 *       '200':
 *         description: Steps generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/stepsResponse'
 *             example:
 *               steps:
 *                 - step: 1
 *                   explanation: "Subtract 3 from both sides: 2x = 8"
 *                 - step: 2
 *                   explanation: "Divide by 2: x = 4"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid request parameters"
 */
explanationRouter.post('/steps/', ollamaRateLimit, validateCategory, steps);

/**
 * @openapi
 * /explanation/hint:
 *   post:
 *     tags: [Explanation]
 *     summary: Generate hints
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/stepsRequest'
 *           example:
 *             question: "2x + 3 = 11"
 *             answer: "x = 4"
 *             category: "Algebra"
 *     responses:
 *       '200':
 *         description: Hints generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/hintResponse'
 *             example:
 *               hintGeneral: "Try isolating the variable x."
 *               hints:
 *                 - text: "What happens if you subtract 3 from both sides?"
 *                 - text: "Remember to perform the same operation on both sides."
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
explanationRouter.post('/hint/', ollamaRateLimit, validateCategory, hint);

/**
 * @openapi
 * /explanation/generate:
 *   post:
 *     tags: [Explanation]
 *     summary: Generate a full explanation for a specific step
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/explanationRequest'
 *           example:
 *             step:
 *               step: 1
 *               explanation: "Subtract 3 from both sides: 2x = 8"
 *     responses:
 *       '200':
 *         description: Explanation generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/explanationResponse'
 *             example:
 *               explanation: "By subtracting 3 from both sides, we isolate the term with the variable. This is a fundamental step in solving linear equations."
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
 * /explanation/follow-up:
 *   post:
 *     tags: [Explanation]
 *     summary: Ask a follow-up question about an explanation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/followUpRequest'
 *           example:
 *             explanation: "By subtracting 3 from both sides, we isolate the term with the variable."
 *             question: "Why do we subtract 3 specifically?"
 *             ogQuestion: "2x + 3 = 11"
 *             answer: "x = 4"
 *     responses:
 *       '200':
 *         description: Follow-up response generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/explanationResponse'
 *             example:
 *               explanation: "We subtract 3 because it is the additive constant on the side of the variable. To get 2x by itself, we need to reverse the addition of 3."
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
explanationRouter.post('/follow-up/', ollamaRateLimit, followUpExplanation);


export default explanationRouter;
