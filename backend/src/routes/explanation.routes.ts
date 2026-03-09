import express from "express";

import { ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { steps, hint, generate, askExplanation } from "../controllers/explanation.controller";

const explanationRouter = express.Router();

explanationRouter.post('/steps/', ollamaRateLimit, steps);
explanationRouter.post('/hint/', ollamaRateLimit, hint);
explanationRouter.post('/generate/', ollamaRateLimit, generate);
explanationRouter.post('/add', ollamaRateLimit, askExplanation);

export default explanationRouter;
