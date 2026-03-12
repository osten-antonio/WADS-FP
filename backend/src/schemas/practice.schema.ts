import * as z from 'zod';

export const practiceRequest = z.object({
    question: z.string(),
    category: z.string()
})

export const practiceResponse = z.object({
    questions: z.string().array()
})

export const practiceRefresh = z.object({
    question: z.string(),
    category: z.string(),
    generatedQuestions: z.string().array()
})