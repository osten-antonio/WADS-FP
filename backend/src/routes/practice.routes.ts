import express from "express";

import { ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { generate as generatePractice } from "../controllers/practice.controller";

const practiceRouter = express.Router();

practiceRouter.post('/generate/', ollamaRateLimit, generatePractice);

export default practiceRouter;
