import type { Request, Response } from "express";
import { generateSteps, generateHints, generateStepExplanation, generateFollowUp } from "../services/explanation.service";
import { stepsRequest, explanationRequest, followUpRequest } from "../schemas/explanation.schema";

export async function steps(req: Request, res: Response) {
    try {
        const validatedData = stepsRequest.parse(req.body);
        const result = await generateSteps(validatedData);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Invalid request parameters", errors: error.errors });
        }
        console.error("Error in steps controller:", error);
        return res.status(500).json({ message: "An unexpected error occurred." });
    }
}

export async function hint(req: Request, res: Response) {
    try {
        console.log(req.body);
        const validatedData = stepsRequest.parse(req.body);
        const result = await generateHints(validatedData);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Invalid request parameters", errors: error.errors });
        }
        console.error("Error in hint controller:", error.message);
        return res.status(500).json({ message: "An unexpected error occurred." });
    }
}

export async function generate(req: Request, res: Response) {
    try {
        console.log(req.body);
        const validatedData = explanationRequest.parse(req.body);
        const result = await generateStepExplanation(validatedData);
        return res.status(200).json(result);
    } catch (error: any) {
        console.log(error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Invalid request parameters", errors: error.errors });
        }
        console.error("Error in generate controller:", error.message);
        return res.status(500).json({ message: "An unexpected error occurred." });
    }
}

export async function followUpExplanation(req: Request, res: Response) {
    try {
        const validatedData = followUpRequest.parse(req.body);
        const result = await generateFollowUp(validatedData);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Invalid request parameters", errors: error.errors });
        }
        console.error("Error in follow-up controller:", error.message);
        return res.status(500).json({ message: "An unexpected error occurred." });
    }
}