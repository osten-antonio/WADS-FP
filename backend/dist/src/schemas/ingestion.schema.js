import * as z from "zod";
import { categories } from "../lib/categories";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ingestionText = z.object({
    question: z.string(),
    category: z.enum(categories).default('General'),
    forced: z.boolean().default(false)
});
export const ingestionImage = z.object({
    image: z.any()
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.mimetype), "Only .jpg, .jpeg, .png and .webp formats are supported.")
});
export const ingestionResponse = z.object({
    question: z.string()
});
//# sourceMappingURL=ingestion.schema.js.map