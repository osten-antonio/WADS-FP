import * as z from 'zod';
import { categories } from '../lib/categories';

export const practiceRequest = z.object({
    question: z.string(),
    category: z.enum(categories).default('General'),
    forced: z.boolean().default(false)
})

export const practiceResponse = z.object({
    questions: z.string().array()
})

export const practiceRefresh = z.object({
    question: z.string(),
    category: z.enum(categories).default('General'),
    generatedQuestions: z.string().array()
})