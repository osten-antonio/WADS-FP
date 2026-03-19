import type { Request, Response } from "express";
import { ingestionImage, ingestionText, ingestionResponse } from "../schemas/ingestion.schema";
import { processImageUpload, processTextUpload } from "../services/ingestion.service";
import solverService from "../services/solver.service";
import { randomUUID } from "crypto";
import { solveResponse } from "../schemas/solve.schema";
import { call_ollama } from "../services/ollama.service";

// Validate middleware will run to validate category
export async function handleImageUpload(req: Request, res: Response) {
	try {
		// multer puts the file on req.file
		const file = req.file as Express.Multer.File | undefined;
		if (!file) return res.status(400).json({ message: "No image uploaded" });

		// validate using zod schema shape
		ingestionImage.parse({ image: [file] });

		const result = await processImageUpload(file);

		const out = ingestionResponse.parse({ question: result.question });
		return res.status(201).json(out);
	} catch (err: any) {
		return res.status(400).json({ message: err?.message ?? String(err) });
	}
}

export async function handleTextUpload(req: Request, res: Response) {
	try {
		const parsed = ingestionText.parse(req.body);
		
		
		const result = await processTextUpload(parsed.question);

		try {
			const result_answer = await solverService.tryMathSolve(result.question);
	
			if (result_answer.solved) {
				const id = randomUUID();
				return res.json(solveResponse.parse({ answer: result_answer.answer, id }));
			}
			
			const prompt = `
			Solve the following math question and 
			return ONLY valid JSON matching the schema {\n  "answer": "<string>",\n  "id": "<string>"\n}
			Question: ${result.question}`;
			const aiResp: any = await call_ollama(prompt, solveResponse);
			return res.json(aiResp);
	
		} catch (err: any) {
			console.log(err);
			return res.status(500).json({ message: err?.message ?? 'Internal error' });
		}
	} catch (err: any) {
		return res.status(400).json({ message: err?.message ?? String(err) });
	}
}