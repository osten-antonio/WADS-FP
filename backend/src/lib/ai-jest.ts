export const MATH_SYSTEM_PROMPT = `Solve the following math question and return ONLY valid JSON matching the schema {\n  "answer": "<string>",\n  "id": "<string>"\n} If it is a math question but unsolvable, respond with exactly "None" If it is not a math question, respond with "Not a math question" Question: `;

/**
 * Builds the complete prompt for the LLM.
 */
export function buildMathPrompt(question: string): string {
  return `${MATH_SYSTEM_PROMPT}${question}`;
}

/**
 * Custom validation logic designed to be used as a Promptfoo assertion 
 * or inside your custom Jest matchers.
 */
export function validateMathResponse(output: string): { pass: boolean; reason?: string } {
  // Strip potential whitespace and markdown code blocks that LLMs often add
  const cleanedOutput = output.replace(/```json/g, '').replace(/```/g, '').trim();

  // Condition 1: Is it an unsolvable math question?
  if (cleanedOutput === "None") {
    return { pass: true, reason: 'Correctly formatted as "None".' };
  }

  // Condition 2: Is it completely unrelated to math?
  if (cleanedOutput === "Not a math question") {
    return { pass: true, reason: 'Correctly formatted as "Not a math question".' };
  }

  // Condition 3: Is it valid JSON matching the exact schema?
  try {
    const parsed = JSON.parse(cleanedOutput);
    
    // Validate schema types
    const hasValidAnswer = typeof parsed.answer === 'string';
    const hasValidId = typeof parsed.id === 'string';
    
    // Ensure NO extra keys were added by the LLM
    const exactKeyCount = Object.keys(parsed).length === 2;

    if (hasValidAnswer && hasValidId && exactKeyCount) {
      return { pass: true, reason: "Output is valid JSON and strictly matches the schema." };
    } else {
      return { 
        pass: false, 
        reason: `JSON is valid, but violates schema. Expected keys {answer, id} as strings. Received: ${JSON.stringify(parsed)}` 
      };
    }
  } catch (error) {
    // If it's not "None", not "Not a math...", and fails to parse as JSON
    return { 
      pass: false, 
      reason: `Output failed all conditions. It is not valid JSON, nor an accepted fallback string. Raw output: ${output}`
    };
  }
}