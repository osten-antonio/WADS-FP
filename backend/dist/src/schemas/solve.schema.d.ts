import * as z from "zod";
export declare const solveRequest: z.ZodObject<{
    question: z.ZodString;
}, z.core.$strip>;
export declare const solveResponse: z.ZodObject<{
    answer: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=solve.schema.d.ts.map