import * as z from "zod";

// category will be handled in route, assume general
export const solveRequest = z.object({
    question: z.string(),
});

export const solveResponse = z.object({
    answer: z.string(),
    id: z.string() // handled in hashing later
});