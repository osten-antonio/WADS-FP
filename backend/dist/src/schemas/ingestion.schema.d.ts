import * as z from "zod";
export declare const ingestionText: z.ZodObject<{
    question: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<{
        [x: string]: string;
    }>>;
    forced: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const ingestionImage: z.ZodObject<{
    image: z.ZodAny;
}, z.core.$strip>;
export declare const ingestionResponse: z.ZodObject<{
    question: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=ingestion.schema.d.ts.map