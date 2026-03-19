import type { Request, Response } from "express";
import { practiceRefresh, practiceRequest } from "../schemas/practice.schema";
import { generatePracticeQuestions, refreshPracticeQuestions } from "../services/practice.service";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0) return message;
  }
  return fallback;
}

export async function generate(req: Request, res: Response) {
  const parsed = practiceRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid request parameters" });
    return;
  }

  try {
    const questions = await generatePracticeQuestions(parsed.data.question, parsed.data.category);
    res.status(200).json({ questions });
  } catch (error) {
    const message = toErrorMessage(error, "Failed to generate practice questions.");
    res.status(500).json({ message });
  }
}

export async function refresh(req: Request, res: Response) {
  const parsed = practiceRefresh.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid request parameters" });
    return;
  }

  try {
    const questions = await refreshPracticeQuestions(
      parsed.data.question,
      parsed.data.category,
      parsed.data.generatedQuestions,
    );
    res.status(200).json({ questions });
  } catch (error) {
    const message = toErrorMessage(error, "Failed to refresh practice questions.");
    res.status(500).json({ message });
  }
}
