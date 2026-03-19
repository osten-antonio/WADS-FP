import { call_ollama } from "./ollama.service";
import { 
    stepsResponse, 
    hintResponse, 
    explanationResponse, 
    type stepsRequest, 
    type explanationRequest, 
    type followUpRequest 
} from "../schemas/explanation.schema";
import * as z from 'zod';


export async function generateSteps(data: z.infer<typeof stepsRequest>) {
    const prompt = `
        You are a helpful mathematical assistant specializing in ${data.category}. 
        Given the question: "${data.question}" and the final answer: "${data.answer}", 
        generate a clear, step-by-step breakdown of how to reach that answer.
        
        CRITICAL RULES:
        1. Only use knowledge and techniques relevant to the category: ${data.category}.
        2. If the question starts to stray outside of ${data.category}, inform the user but try to solve it using ${data.category} methods if possible.
        
        Each step should include a step number and a clear explanation.
    `;
    return await call_ollama(prompt, stepsResponse);
}

export async function generateHints(data: z.infer<typeof stepsRequest>) {
    const prompt = `
        You are a helpful mathematical assistant specializing in ${data.category}.
        Given the question: "${data.question}" and the final answer: "${data.answer}",
        provide a general hint and a list of specific hints to help the user solve the problem themselves.
        
        CRITICAL RULES:
        1. Only provide hints based on ${data.category} principles.
        3. Do not give away the full solution immediately.
    `;
    return await call_ollama(prompt, hintResponse);
}

export async function generateStepExplanation(data: z.infer<typeof explanationRequest>) {
    const prompt = `
        You are an expert tutor. 
        Provide an in-depth, educational explanation for the following solution step:
        Step ${data.step.step}: "${data.step.explanation}"
        
        The explanation should be detailed, explaining the "why" behind the operation.
        Use Markdown formatting (e.g., bolding, LaTeX for math if necessary).
        Treat the response to be a note for the user.
        Return the response in a JSON object with a single field "explanation".

    `;
    return await call_ollama(prompt, explanationResponse);
}

export async function generateFollowUp(data: z.infer<typeof followUpRequest>) {
    const prompt = `
        You are an expert tutor. 
        The user has a follow-up question: "${data.question}"
        Regarding the original problem: "${data.ogQuestion}"
        With final answer: "${data.answer}"
        And the previous explanation provided was: "${data.explanation}"
        
        
        Provide a helpful, clear response to the user's question in Markdown format.
        Explain concepts clearly and use LaTeX for math where appropriate.
        Return the response in a JSON object with a single field "explanation".
        As much as possible address the user's question back, and treat the response
        to be a note for the user, by treating it as an additional explanation to the original,
        to be appended LATER.
        Do not give the final answer, instead only address the given step.

        For example:
        {
            "question": "2*x is the same as 2x correct?",
            "ogQuestion":"2x + 3 = 11",
            "answer":"4",
            "explanation" :"Step1: Starts with..."
        }
        Your response should be something along the lines of explaining n*x, do not start
        with words like Certainly! You are absolutely correct!, etc. Go straight to the point
        without repeating what is provided in the original explanation, e.g saying step 1 again.
    `;
    return await call_ollama(prompt, explanationResponse);
}
