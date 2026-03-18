import type { Request, Response } from "express";
import { ingestionImage, ingestionText, ingestionResponse } from "../schemas/ingestion.schema";
import { processImageUpload, processTextUpload } from "../services/ingestion.service";

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
		const body = req.body ?? {};
		
		const parsed = ingestionText.parse({ question: body.question, category: body.category ?? "General" });
		
		
		const result = await processTextUpload(parsed.question);

		// TODO solve immediately
		const out = ingestionResponse.parse({ question: result.question });
		return res.status(201).json(out);
	} catch (err: any) {
		return res.status(400).json({ message: err?.message ?? String(err) });
	}
}