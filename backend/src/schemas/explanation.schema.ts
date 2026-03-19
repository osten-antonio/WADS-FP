import * as z from 'zod';

export const stepsRequest = z.object({
    question: z.string(),
    answer: z.string(),
    category: z.enum([
        "General", 
        "Statistics", 
        "Algebra", 
        "Proofs and theorem", 
        "Linear algebra", 
        "Trigonometry", 
        "Calculus", 
        "Pre-calculus"
    ])
})

const stepsBase = z.object({
    step: z.number(),
    explanation: z.string()
    // equation?
})

export const stepsResponse = z.object({
    steps: stepsBase.array()
});

const hintBase = z.object({
    text: z.string()
});

export const hintResponse = z.object({
    hintGeneral: z.string(),
    hints: hintBase.array()
});

export const explanationRequest = z.object({
    question: z.string(),
    answer: z.string(),
    step: stepsBase,
})

export const explanationResponse = z.object({
    explanation: z.string()
});

export const followUpRequest = z.object({
    explanation: z.string(),
    question: z.string(),
    ogQuestion: z.string(),
    answer: z.string()
})