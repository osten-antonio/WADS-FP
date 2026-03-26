import { call_ollama } from "./ollama.service";
import * as cacheService from "./cache.service";
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
    // Check cache for steps first
    const cached = await cacheService.getStepsForQuestion(data.question);
    if (cached && cached.length > 0) {
        return { steps: cached };
    }

    const prompt = `
        You are a helpful mathematical assistant specializing in ${data.category}. 
        Given the question: "${data.question}" and the final answer: "${data.answer}", 
        generate a clear, step-by-step breakdown of how to reach that answer.
        If it is not a math question, respond with an empty step

        CRITICAL RULES:
        1. Only use knowledge and techniques relevant to the category: ${data.category}.
        2. If the question starts to stray outside of ${data.category}, inform the user but try to solve it using ${data.category} methods if possible.
        
        Each step should include a step number and a clear explanation.
    `;
    const aiResp = await call_ollama(prompt, stepsResponse);
    if(!aiResp.steps || aiResp.steps.length === 0){
        throw Error('Invalid input');
    }

    // Store steps in cache (only steps per requirement)
    try {
        await cacheService.setStepsForQuestion(data.question, aiResp.steps);
    } catch (e) {
        console.error('Failed to cache steps', e);
    }

    return aiResp;
}

export async function generateHints(data: z.infer<typeof stepsRequest>) {
    const prompt = `
        You are a helpful mathematical assistant specializing in ${data.category}.
        Given the question: "${data.question}" and the final answer: "${data.answer}",
        provide a general hint and a list of specific hints to help the user solve the problem themselves.


        CRITICAL RULES:
        1. Only provide hints based on ${data.category} principles.
        2. Do not give away the full solution immediately.
    `;
    if (!data.question || !data.answer) {
        throw Error("Invalid input");
    }
    const aiResp = await call_ollama(prompt, hintResponse);
    return aiResp;
}

export async function generateStepExplanation(data: z.infer<typeof explanationRequest>) {
    const prompt = `
        You are an expert tutor. 
        Provide an in-depth, educational explanation for the following solution step
        for the following quesiton and answer:
        Question: ${data.question}
        Answer: ${data.answer}

        Step ${data.step.step}: "${data.step.explanation}"
        
        The explanation should be detailed, explaining the "why" behind the operation.
        Use Markdown formatting (e.g., bolding, LaTeX for math if necessary).
        Treat the response to be a note for the user.
        Return the response in a JSON object with a single field "explanation".
        If it is not a math question, respond with "Not a math question" 
    `;
    const aiResp = await call_ollama(prompt, explanationResponse);

    if (JSON.stringify(aiResp).includes("Not a math question")) {
        throw Error('Not a math question');
    }
    return aiResp;
}

export async function generateFollowUp(data: z.infer<typeof followUpRequest>) {
    const prompt = `
        You are an expert tutor. 
        The user has a follow-up question: "${data.question}"
        Regarding the original problem: "${data.ogQuestion}"
        With final answer: "${data.answer}"
        And the previous explanation provided was: "${data.explanation}"
        
        If the question is not related, just respond with "Not related"
        
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
    const aiResp = await call_ollama(prompt, explanationResponse);

    if (JSON.stringify(aiResp).includes("Not related")) {
        throw Error('Not related');
    }
    return aiResp;
}
