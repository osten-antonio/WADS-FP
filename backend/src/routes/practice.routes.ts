import express from "express";

import { ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { generate as generatePractice } from "../controllers/practice.controller";

/**
 * @openapi
 * tags:
 *   - name: Practice
 *     description: Generate practice questions from a topic or solution (draft).
 */

const practiceRouter = express.Router();

/**
 * @openapi
 * /practice/generate:
 *   post:
 *     tags: [Practice]
 *     summary: Generate practice questions
 *     description: Draft endpoint. Update payload once generation flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *             example:
 *               topic: Algebra
 *               difficulty: Easy
 *               count: 5
 *     responses:
 *       '200':
 *         description: Practice set generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PracticeSet'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
practiceRouter.post('/generate/', ollamaRateLimit, generatePractice);

export default practiceRouter;
