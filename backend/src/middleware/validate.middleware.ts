import { type NextFunction, type Request, type Response } from "express";
import { call_ollama } from "../services/ollama.service";
import { categories } from "../lib/categories";
import * as z from "zod";
import { sendErrorResponse } from "../lib/error-response";

export async function validateCategory(req: Request, res: Response, next: NextFunction) {
    const { category, question, force } = req.query;
    
    if(!category) { // If no category, assume its general
        next();
        return;
    }

    if(category && !categories.includes(category as string)) {
        return sendErrorResponse(res, 400, "Invalid category", "INVALID_CATEGORY");
    }
    
    if(force &&
        (force as string).toLowerCase() === "true" 
        || (force as string).toLowerCase() === "1"
    ) {
        next();
        return;
    }

    const response_schema = z.object({
        category: z.enum(categories).default("General")
    });

    const prompt = `
        You are a maths tutor validating a math question. 
        You are given a question, and the assumed category, you need to 
        validate the category and give the appropriate category among these categories:
        ${categories.join(', ')}

        Rules:
          - If the category is not among the listed categories, respond with "General".
          - If the category is within the listed category and is correct, respond with the same category.

        Question: ${question}
        Assumed category: ${category}   
    `;
    
    const resp = await call_ollama(prompt, response_schema);
    
    if(category !== resp.category) { 
        return sendErrorResponse(res, 422, "Invalid category", "CATEGORY_NOT_MATCHING", { suggested: resp.category });
    }
    
    next();
}