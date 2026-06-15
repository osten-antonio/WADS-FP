import { Ollama } from 'ollama';
import { type ZodObject, type ZodRawShape, type z, toJSONSchema, ZodError } from 'zod';
import { repairJsonEscapes } from '../lib/repair-json-escapes';


const host = process.env.OLLAMA_URL;



console.log(host);
if (!host) {
    throw new Error('Environment variable OLLAMA_URL must be set');
}

const ollama = new Ollama({
    host: host
});

export async function call_ollama<T extends ZodRawShape>(prompt: string, schema: ZodObject<T>): Promise<z.infer<ZodObject<T>>> {
    try {
        const response = await ollama.chat({
            model: 'qwen2.5:7b-instruct',
            messages: [{ role: 'user', content: prompt }],
            format: toJSONSchema(schema),
        });

        if (!response.message?.content) {
            throw new Error('Ollama returned an empty response.');
        }

        // The model sometimes under-escapes backslashes in JSON (e.g. "\frac"),
        // which JSON.parse corrupts or rejects. Repair before parsing (Fix B).
        const content = response.message.content;
        const repaired = repairJsonEscapes(content);
        if (repaired !== content && process.env.NODE_ENV !== 'production') {
            console.warn('[ollama] model under-escaped backslashes in JSON; repaired before parse (the prompt-level escaping rule may need attention)');
        }
        return schema.parse(JSON.parse(repaired));

    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'status' in error) {
            const status = (error as { status: number }).status;
            const msg = error instanceof Error ? error.message : String(error);
            if (status >= 500 && status < 600) {
                throw new Error(`Ollama Server is down (${status}): ${msg}`);
            }
            if (status >= 400 && status < 500) {
                console.error("Ollama Error Details:", msg);
                throw new Error(`Ollama Client Error (${status}): ${msg}`);
            }
        }

        if (error instanceof SyntaxError) {
            console.error("Model returned invalid JSON:", error.message);
            throw new Error("Model failed to generate valid JSON.");
        }

        if (error instanceof ZodError) {
            console.error("Schema validation failed:", error.issues);
            throw new Error("Generated content does not match the required schema.");
        }
        console.log('Unexpected error occurred:');
        console.log(error);
        throw error;
    }
}
