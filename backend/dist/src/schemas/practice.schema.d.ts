import * as z from 'zod';
export declare const practiceRequest: z.ZodObject<{
    question: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<{
        [x: string]: string;
    }>>;
    forced: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const practiceResponse: z.ZodObject<{
    questions: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const practiceRefresh: z.ZodObject<{
    question: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<{
        [x: string]: string;
    }>>;
    generatedQuestions: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=practice.schema.d.ts.map