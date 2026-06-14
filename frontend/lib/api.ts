const UNREACHABLE_MESSAGE = "Could not reach the service. Check your connection.";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiPost<T>(url: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE);
  }

  if (res.status === 502 || res.status === 504) {
    throw new ApiError(UNREACHABLE_MESSAGE);
  }

  const data = (await res.json().catch(() => null)) as T | { message?: string } | null;

  if (!res.ok) {
    throw new Error((data as { message?: string } | null)?.message ?? `Request failed (status ${res.status}).`);
  }

  return data as T;
}

export interface SolveResult {
  answer: string;
  id: string;
}

export interface IngestionImageResult {
  question: string;
}

export interface ExplanationStepsResult {
  steps: Array<{ step: number; explanation: string }>;
}

export interface ExplanationHintResult {
  hintGeneral: string;
  hints: Array<{ text: string }>;
}

export interface ExplanationGenerateResult {
  explanation: string;
}

export interface PracticeGenerateResult {
  questions: string[];
}

export async function solveText(question: string, category: string): Promise<SolveResult> {
  return apiPost<SolveResult>("/api/ingestion/text", { question, category, forced: false });
}

export async function solveImage(formData: FormData): Promise<IngestionImageResult> {
  let res: Response;
  try {
    res = await fetch("/api/ingestion/image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE);
  }

  if (res.status === 502 || res.status === 504) {
    throw new ApiError(UNREACHABLE_MESSAGE);
  }

  const data = (await res.json().catch(() => null)) as IngestionImageResult | { message?: string } | null;

  if (!res.ok) {
    throw new Error((data as { message?: string } | null)?.message ?? `Image scan failed (status ${res.status}).`);
  }

  return data as IngestionImageResult;
}

export async function getExplanationSteps(
  question: string,
  answer: string,
  category: string,
): Promise<ExplanationStepsResult> {
  return apiPost<ExplanationStepsResult>("/api/explanation/steps", { question, answer, category, forced: false });
}

export async function getExplanationHint(
  question: string,
  answer: string,
  category: string,
): Promise<ExplanationHintResult> {
  return apiPost<ExplanationHintResult>("/api/explanation/hint", { question, answer, category, forced: false });
}

export async function generateExplanation(
  question: string,
  answer: string,
  step: { step: number; explanation: string },
): Promise<ExplanationGenerateResult> {
  return apiPost<ExplanationGenerateResult>("/api/explanation/generate", { question, answer, step });
}

export async function followUpExplanation(
  explanation: string,
  followUpQuestion: string,
  ogQuestion: string,
  answer: string,
): Promise<ExplanationGenerateResult> {
  return apiPost<ExplanationGenerateResult>("/api/explanation/follow-up", {
    explanation,
    question: followUpQuestion,
    ogQuestion,
    answer,
  });
}

export async function generatePractice(
  question: string,
  category: string,
): Promise<PracticeGenerateResult> {
  return apiPost<PracticeGenerateResult>("/api/practice/generate", { question, category, forced: false });
}

export async function refreshPractice(
  question: string,
  category: string,
  generatedQuestions: string[],
): Promise<PracticeGenerateResult> {
  return apiPost<PracticeGenerateResult>("/api/practice/refresh", {
    question,
    category,
    generatedQuestions,
  });
}
