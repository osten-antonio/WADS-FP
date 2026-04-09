import * as z from "zod";
import { call_ollama } from "./ollama.service";
import * as cacheService from "./cache.service";
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
function normalizeQuestion(question) {
    return question.trim().toLowerCase();
}
function uniqueQuestions(questions) {
    const seen = new Set();
    const result = [];
    for (const question of questions) {
        const trimmed = question.trim();
        if (trimmed.length === 0)
            continue;
        const normalized = normalizeQuestion(trimmed);
        if (seen.has(normalized))
            continue;
        seen.add(normalized);
        result.push(trimmed);
    }
    return result;
}
function splitCandidateString(value) {
    return value
        .split("\n")
        .map((item) => item.replace(/^\s*[-*•\d.)]+\s*/, "").trim())
        .filter((item) => item.length > 0);
}
function collectQuestionCandidates(payload, bucket, depth = 0) {
    if (depth > 6 || payload === null || payload === undefined)
        return;
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
    if (typeof payload !== "object")
        return;
    const record = payload;
    let usedKeyMatch = false;
    for (const [key, value] of Object.entries(record)) {
        if (!QUESTION_KEYS.has(key.toLowerCase()))
            continue;
        usedKeyMatch = true;
        collectQuestionCandidates(value, bucket, depth + 1);
    }
    if (!usedKeyMatch) {
        for (const value of Object.values(record)) {
            collectQuestionCandidates(value, bucket, depth + 1);
        }
    }
}
function normalizeOllamaQuestions(payload) {
    const candidates = [];
    collectQuestionCandidates(payload, candidates);
    return uniqueQuestions(candidates.filter((item) => item.length >= 6 && item.length <= 300));
}
function buildGeneratePrompt(question, category, count) {
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
function buildRefreshPrompt(question, category, existingQuestions, count) {
    const existingList = existingQuestions.length > 0
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
export async function generatePracticeQuestions(question, category, count = DEFAULT_QUESTION_COUNT) {
    if (question.length === 0) {
        throw new Error("No question was submitted.");
    }
    // Try to satisfy from cache first, otherwise generate only what's needed.
    const generator = async (q, c, n) => {
        const prompt = buildGeneratePrompt(q, c, n);
        const generated = await call_ollama(prompt, ollamaRawObjectSchema);
        const normalizedQuestions = normalizeOllamaQuestions(generated);
        return normalizedQuestions.slice(0, n);
    };
    const items = await cacheService.ensurePracticeItems(question, category, count, generator);
    if (!items || items.length === 0) {
        throw new Error("No valid practice questions were generated.");
    }
    return items.slice(0, count);
}
export async function refreshPracticeQuestions(question, category, generatedQuestions, count = generatedQuestions.length > 0 ? generatedQuestions.length : DEFAULT_QUESTION_COUNT) {
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
        // persist refreshed items to cache for future use
        try {
            await cacheService.appendPracticeListForQuestion(question, refreshedQuestions);
        }
        catch (e) {
            console.error("Failed to append refreshed practice questions to cache", e);
        }
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
//# sourceMappingURL=practice.service.js.map