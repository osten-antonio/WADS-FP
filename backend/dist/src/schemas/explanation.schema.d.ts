import * as z from 'zod';
export declare const stepsRequest: z.ZodObject<{
    question: z.ZodString;
    answer: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<{
        [x: string]: string;
    }>>;
    forced: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const stepsResponse: z.ZodObject<{
    steps: z.ZodArray<z.ZodObject<{
        step: z.ZodNumber;
        explanation: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const hintResponse: z.ZodObject<{
    hintGeneral: z.ZodString;
    hints: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const explanationRequest: z.ZodObject<{
    question: z.ZodString;
    answer: z.ZodString;
    step: z.ZodObject<{
        step: z.ZodNumber;
        explanation: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const explanationResponse: z.ZodObject<{
    explanation: z.ZodString;
}, z.core.$strip>;
export declare const followUpRequest: z.ZodObject<{
    explanation: z.ZodString;
    question: z.ZodString;
    ogQuestion: z.ZodString;
    answer: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=explanation.schema.d.ts.map