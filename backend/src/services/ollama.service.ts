import { Ollama } from 'ollama';
import { ZodObject, toJSONSchema } from 'zod';


const host = process.env.OLLAMA_URL;



console.log(host);
if (!host) {
    throw new Error('Environment variable OLLAMA_URL must be set');
}

const ollama = new Ollama({
    host: host
});

export async function call_ollama(prompt: string, schema: ZodObject<any>): Promise<Record<string, any>> {
    try {
        const response = await ollama.chat({
            model: 'qwen2.5:7b-instruct',
            messages: [{ role: 'user', content: prompt }],
            format: toJSONSchema(schema),
        });

        if (!response.message?.content) {
            throw new Error('Ollama returned an empty response.');
        }

        return schema.parse(JSON.parse(response.message.content));

    } catch (error: any) {
        if (error.status >= 500 && error.status < 600) {
            throw new Error(`Ollama Server is down (${error.status}): ${error.message}`);
        }
        if (error.status >= 400 && error.status < 500) {
            console.error("Ollama Error Details:", error.message);
            throw new Error(`Ollama Client Error (${error.status}): ${error.message}`);
        }
        
        if (error instanceof SyntaxError) {
            console.error("Model returned invalid JSON:", error.message);
            throw new Error("Model failed to generate valid JSON.");
        }

        if (error.name === 'ZodError') {
            console.error("Schema validation failed:", error.errors);
            throw new Error("Generated content does not match the required schema.");
        }
        console.log('Unexpected error occurred:');
        console.log(error)
        throw error;
    }
}
