import express from "express";

import {
    handleImageUpload,
    handleTextUpload
} from "../controllers/ingestion.controller";

import {
    validateCategory
} from "../middleware/validate.middleware";
import { ollamaRateLimit } from "../middleware/rateLimit.middleware";

/**
 * @openapi
 * tags:
 *   - name: Ingestion
 *     description: Ingest text/image inputs and create submissions (draft).
 */

const ingestionRouter = express.Router();

/**
 * @openapi
 * /ingestion/image:
 *   post:
 *     tags: [Ingestion]
 *     summary: Ingest an image input
 *     description: Draft endpoint. Update payload once image upload flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category]
 *             properties:
 *               category:
 *                 type: string
 *                 description: Category/topic for validation.
 *               imageUrl:
 *                 type: string
 *                 description: Public URL to the image (preferred).
 *               imageBase64:
 *                 type: string
 *                 description: Base64-encoded image (alternative to imageUrl).
 *           example:
 *             category: Algebra
 *             imageUrl: https://example.com/problem.png
 *     responses:
 *       '201':
 *         description: Submission created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemSubmission'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
ingestionRouter.post('/image', ollamaRateLimit,validateCategory, handleImageUpload);

/**
 * @openapi
 * /ingestion/text:
 *   post:
 *     tags: [Ingestion]
 *     summary: Ingest a text input
 *     description: Draft endpoint. Update payload once text ingestion flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, text]
 *             properties:
 *               category:
 *                 type: string
 *                 description: Category/topic for validation.
 *               text:
 *                 type: string
 *           example:
 *             category: Algebra
 *             text: "Solve for x: 2x + 3 = 11"
 *     responses:
 *       '201':
 *         description: Submission created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemSubmission'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
ingestionRouter.post('/text', ollamaRateLimit, validateCategory, handleTextUpload);

export default ingestionRouter;
