import express from "express";

import {
    handleImageUpload,
    handleTextUpload
} from "../controllers/ingestion.controller";

import {
    validateCategory
} from "../middleware/validate.middleware";
import { ollamaRateLimit } from "../middleware/rateLimit.middleware";

const ingestionRouter = express.Router();

ingestionRouter.post('/image', ollamaRateLimit,validateCategory, handleImageUpload);
ingestionRouter.post('/text', ollamaRateLimit, validateCategory, handleTextUpload);

export default ingestionRouter;