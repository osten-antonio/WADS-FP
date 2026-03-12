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
 *     description: Ingest text/image inputs to convert it to a latex text for submission.
 */

const ingestionRouter = express.Router();

/**
 * @openapi
 * /ingestion/image:
 *   post:
 *     tags: [Ingestion]
 *     summary: Ingest an image input
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *              $ref: '#/components/schemas/ingestionImage'
 *     responses:
 *       '201':
 *         description: Submission created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ingestionResponse'
 *             example:
 *               question: "2x + 3 = 11"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid image format"
 */
ingestionRouter.post('/image', ollamaRateLimit,validateCategory, handleImageUpload);

/**
 * @openapi
 * /ingestion/text:
 *   post:
 *     tags: [Ingestion]
 *     summary: Ingest a text input
 *     description: Will also validate against the sent category, if its different, will warn user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ingestionText'
 *           example:
 *             category: "Algebra"
 *             question: "Solve for x: 2x + 3 = 11"
 *     responses:
 *       '201':
 *         description: Submission created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ingestionResponse'
 *             example:
 *               question: "Solve for x: 2x + 3 = 11"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
ingestionRouter.post('/text', ollamaRateLimit, validateCategory, handleTextUpload);


export default ingestionRouter;
