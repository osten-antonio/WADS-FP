import express from "express";

import { globalRateLimit, ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { solve, solveAI } from "../controllers/solver.controller";

/**
 * @openapi
 * tags:
 *   - name: Solver
 *     description: Solve math problems via deterministic or AI-based pipelines (draft).
 *
 * components:
 *   schemas:
 *     SolverType:
 *       type: string
 *       enum: [MATHJS, LLM]
 *     ProblemSubmission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         inputType:
 *           $ref: '#/components/schemas/InputType'
 *         rawText:
 *           type: string
 *           nullable: true
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         topicSelected:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         status:
 *           $ref: '#/components/schemas/SubmissionStatus'
 *     Step:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         stepNumber:
 *           type: integer
 *         math:
 *           type: string
 *         explanation:
 *           type: string
 *     Hint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         hintLevel:
 *           type: integer
 *         content:
 *           type: string
 *     RecommendationSuggestion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         concept:
 *           type: string
 *         advice:
 *           type: string
 *     PracticeQuestion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *         difficulty:
 *           type: string
 *     PracticeSet:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PracticeQuestion'
 *     SolveResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         solverUsed:
 *           $ref: '#/components/schemas/SolverType'
 *         finalAnswer:
 *           type: string
 *         confidence:
 *           type: number
 *           format: float
 *         topic:
 *           type: string
 *         difficulty:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         steps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Step'
 *         hints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Hint'
 *         recommendations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecommendationSuggestion'
 *         practiceSets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PracticeSet'
 *     SolveRequest:
 *       type: object
 *       required: [inputType]
 *       properties:
 *         inputType:
 *           $ref: '#/components/schemas/InputType'
 *         rawText:
 *           type: string
 *           description: Provide when inputType is TEXT.
 *         imageUrl:
 *           type: string
 *           description: Provide when inputType is IMAGE.
 *         topicSelected:
 *           type: string
 *     SolveResponse:
 *       type: object
 *       properties:
 *         submission:
 *           $ref: '#/components/schemas/ProblemSubmission'
 *         result:
 *           $ref: '#/components/schemas/SolveResult'
 */

const solverRouter = express.Router();

/**
 * @openapi
 * /solver/solve:
 *   post:
 *     tags: [Solver]
 *     summary: Solve a math problem with deterministic engine
 *     description: Draft endpoint. Replace fields once the solver pipeline is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolveRequest'
 *           example:
 *             inputType: TEXT
 *             rawText: "Solve for x: 2x + 3 = 11"
 *             topicSelected: Algebra
 *     responses:
 *       '200':
 *         description: Solved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolveResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
solverRouter.post('/solve', globalRateLimit, solve);

/**
 * @openapi
 * /solver/solve/ai:
 *   post:
 *     tags: [Solver]
 *     summary: Solve a math problem using AI fallback
 *     description: Draft endpoint. Replace fields once the solver pipeline is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolveRequest'
 *           example:
 *             inputType: TEXT
 *             rawText: "Solve: integral of x^2 dx"
 *             topicSelected: Calculus
 *     responses:
 *       '200':
 *         description: Solved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolveResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
solverRouter.post('/solve/ai', ollamaRateLimit, solveAI);

export default solverRouter;
