import * as z from "zod";
import { call_ollama } from "./ollama.service";

const DEFAULT_QUESTION_COUNT = 5;
const ollamaRawObjectSchema = z.object({}).passthrough();
const QUESTION_KEYS = new Set([
  "question",
  "questions",
  "practicequestion",
  "practicequestions",
  "text",
  "prompt",
  "problem",
  "problems",
  "items",
  "output",
  "result",
  "results",
]);

function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase();
}

function uniqueQuestions(questions: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const question of questions) {
    const trimmed = question.trim();
    if (trimmed.length === 0) continue;

    const normalized = normalizeQuestion(trimmed);
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    result.push(trimmed);
  }

  return result;
}

function splitCandidateString(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.replace(/^\s*[-*•\d.)]+\s*/, "").trim())
    .filter((item) => item.length > 0);
}

function collectQuestionCandidates(payload: unknown, bucket: string[], depth = 0): void {
  if (depth > 6 || payload === null || payload === undefined) return;

  if (typeof payload === "string") {
    bucket.push(...splitCandidateString(payload));
    return;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      collectQuestionCandidates(item, bucket, depth + 1);
    }
    return;
  }

  if (typeof payload !== "object") return;

  const record = payload as Record<string, unknown>;
  let usedKeyMatch = false;

  for (const [key, value] of Object.entries(record)) {
    if (!QUESTION_KEYS.has(key.toLowerCase())) continue;
    usedKeyMatch = true;
    collectQuestionCandidates(value, bucket, depth + 1);
  }

  if (!usedKeyMatch) {
    for (const value of Object.values(record)) {
      collectQuestionCandidates(value, bucket, depth + 1);
    }
  }
}

function normalizeOllamaQuestions(payload: unknown): string[] {
  const candidates: string[] = [];
  collectQuestionCandidates(payload, candidates);

  return uniqueQuestions(
    candidates.filter((item) => item.length >= 6 && item.length <= 300),
  );
}

function buildGeneratePrompt(question: string, category: string, count: number): string {
  return [
    "You are a math tutor creating practice questions.",
    `Topic category: ${category}`,
    `Source question: ${question}`,
    `Generate exactly ${count} new practice questions.`,
    "Keep them in the same category and similar difficulty.",
    "Do not include answers or explanations.",
    'Return JSON only with this format: {"questions": ["..."]}.',
  ].join("\n");
}

function buildRefreshPrompt(question: string, category: string, existingQuestions: string[], count: number): string {
  const existingList =
    existingQuestions.length > 0
      ? existingQuestions.map((item, index) => `${index + 1}. ${item}`).join("\n")
      : "(none provided)";

  return [
    "You are a math tutor refreshing a practice set.",
    `Topic category: ${category}`,
    `Source question: ${question}`,
    `Generate exactly ${count} NEW practice questions.`,
    "All generated questions must be unique and must not repeat any existing question below.",
    `Existing questions to avoid:\n${existingList}`,
    "Do not include answers or explanations.",
    'Return JSON only with this format: {"questions": ["..."]}.',
  ].join("\n");
}

export async function generatePracticeQuestions(
  question: string,
  category: string,
  count = DEFAULT_QUESTION_COUNT,
): Promise<string[]> {
  if (question.length === 0) {
    throw new Error("No question was submitted.");
  }
  const prompt = buildGeneratePrompt(question, category, count);
  const generated = await call_ollama(prompt, ollamaRawObjectSchema);
  const normalizedQuestions = normalizeOllamaQuestions(generated);

  if (normalizedQuestions.length === 0) {
    throw new Error("No valid practice questions were generated.");
  }

  return normalizedQuestions.slice(0, count);
}

export async function refreshPracticeQuestions(
  question: string,
  category: string,
  generatedQuestions: string[],
  count = generatedQuestions.length > 0 ? generatedQuestions.length : DEFAULT_QUESTION_COUNT,
): Promise<string[]> {
  if (question.length === 0) {
    throw new Error("No question was submitted.");
  }
  if (generatedQuestions.length === 0) {
    throw new Error("No generated questions were provided.");
  }
  const prompt = buildRefreshPrompt(question, category, generatedQuestions, count);
  const generated = await call_ollama(prompt, ollamaRawObjectSchema);
  const normalizedQuestions = normalizeOllamaQuestions(generated);

  const existingSet = new Set(generatedQuestions.map((item) => normalizeQuestion(item)));
  const refreshedQuestions = normalizedQuestions
    .filter((item) => !existingSet.has(normalizeQuestion(item)))
    .slice(0, count);

  if (refreshedQuestions.length > 0) {
    return refreshedQuestions;
  }

  // Fallback: request a fresh set and try filtering again.
  const regenerated = await generatePracticeQuestions(question, category, Math.max(count, DEFAULT_QUESTION_COUNT));
  const regeneratedFiltered = regenerated.filter((item) => !existingSet.has(normalizeQuestion(item))).slice(0, count);

  if (regeneratedFiltered.length > 0) {
    return regeneratedFiltered;
  }

  // Last resort to avoid hard failure when model keeps repeating items.
  if (regenerated.length > 0) {
    return regenerated.slice(0, count);
  }

  throw new Error("Failed to generate new refreshed practice questions.");
}
