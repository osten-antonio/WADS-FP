import express from "express";


import { globalRateLimit, ollamaRateLimit } from "../middleware/rateLimit.middleware";
import { solve, solveAI } from "../controllers/solver.controller";

const solverRouter = express.Router();

solverRouter.post('/solve', globalRateLimit, solve);
solverRouter.post('/solve/ai', ollamaRateLimit, solveAI);

export default solverRouter;