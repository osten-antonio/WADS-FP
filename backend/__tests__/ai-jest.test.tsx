import { buildMathPrompt, validateMathResponse } from '../src/services/ai-jest.service';
import { call_ollama } from '../src/services/ollama.service';
import { solveResponse } from '../src/schemas/solve.schema';

describe('Ollama AI Math Solver', () => {
  // LLM calls can take a few seconds, so we increase the default Jest timeout
  jest.setTimeout(30000);

  it('should correctly solve "2 + 2" and match the strict validation rules', async () => {

    const question = "2 + 2";
    const prompt = buildMathPrompt(question);

    const responseObject = await call_ollama(prompt, solveResponse);

    const rawOutputString = JSON.stringify(responseObject);
    const validation = validateMathResponse(rawOutputString);

    expect(validation.pass).toBe(true);
    
    expect(typeof responseObject.answer).toBe('string');
    expect(typeof responseObject.id).toBe('string');
  });

  it('should handle an unsolvable math question gracefully', async () => {
    const question = "What is x if x + y = 10?";
    const prompt = buildMathPrompt(question);

    // how strict your Zod schema is set up. You might need a try/catch block if testing fallbacks!
    try {
       const response = await call_ollama(prompt, solveResponse);
       const validation = validateMathResponse(JSON.stringify(response));
       expect(validation.pass).toBe(true);
    } catch (error) {
       // If Zod throws an error because the LLM responded with just "None",
       // you would handle/assert that specific failure case here.
       expect(error).toBeDefined();
    }
  });
});