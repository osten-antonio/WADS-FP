import * as z from 'zod';

export const ErrorResponse = z.object({
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponse>;
