import type { Request, Response } from "express";
import { randomUUID } from 'crypto';
import { solveRequest, solveResponse } from "../schemas/solve.schema";
import solverService from "../services/solver.service";
import { call_ollama } from "../services/ollama.service";

export async function solve(req: Request, res: Response) {
    const { question } = solveRequest.parse(req.body);

    try {
        const result = await solverService.tryMathSolve(question);

        if (result.solved) {
            const id = randomUUID();
            return res.json(solveResponse.parse({ answer: result.answer, id }));
        }
        
        const prompt = `Solve the following math question and return ONLY valid JSON matching the schema {\n  "answer": "<string>",\n  "id": "<string>"\n}\nQuestion: ${question}`;
        const aiResp: any = await call_ollama(prompt, solveResponse);
        return res.json(aiResp);

    } catch (err: any) {
        return res.status(500).json({ message: err?.message ?? 'Internal error' });
    }
}

export async function solveAI(req: Request, res: Response) {
    const { question } = solveRequest.parse(req.body);
    try {
        const prompt = `Solve the following math question and return ONLY valid JSON matching the schema {\n  "answer": "<string>",\n  "id": "<string>"\n}\nQuestion: ${question}`;
        const aiResp: any = await call_ollama(prompt, solveResponse);
        const id = randomUUID();
        aiResp.id = id;
        return res.json(aiResp);
    } catch (err: any) {
        return res.status(500).json({ message: err?.message ?? 'Internal error' });
    }
}