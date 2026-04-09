import * as z from 'zod';
export const userAccountSchema = z.object({
    firebaseUID: z.string(),
    displayName: z.string(),
});
export const updateUsernameRequest = z.object({
    displayName: z.string().min(1),
});
export const forgotPasswordRequest = z.object({
    email: z.string().email(),
});
export const changePasswordRequest = z.object({
    newPassword: z.string().min(6),
});
export const historyFilterRequest = z.object({
    category: z.string().optional(),
});
export const deleteHistoryRequest = z.object({
    submissionIds: z.array(z.string().uuid()),
});
export const problemSubmissionSchema = z.object({
    id: z.string().uuid(),
    inputMode: z.enum(['TEXT', 'IMAGE']),
    category: z.string(),
    type: z.string(),
    subtype: z.string().nullable(),
    text: z.string(),
    createdAt: z.string(),
});
export const historyResponse = z.object({
    items: z.array(problemSubmissionSchema),
});
export const deleteHistoryResponse = z.object({
    deletedCount: z.number(),
});
export const profileResponse = z.object({
    user: userAccountSchema,
    history: z.array(problemSubmissionSchema),
});
//# sourceMappingURL=user.schema.js.map