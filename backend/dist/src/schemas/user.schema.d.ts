import * as z from 'zod';
export declare const userAccountSchema: z.ZodObject<{
    firebaseUID: z.ZodString;
    displayName: z.ZodString;
}, z.core.$strip>;
export declare const updateUsernameRequest: z.ZodObject<{
    displayName: z.ZodString;
}, z.core.$strip>;
export declare const forgotPasswordRequest: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const changePasswordRequest: z.ZodObject<{
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const historyFilterRequest: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const deleteHistoryRequest: z.ZodObject<{
    submissionIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const problemSubmissionSchema: z.ZodObject<{
    id: z.ZodString;
    inputMode: z.ZodEnum<{
        TEXT: "TEXT";
        IMAGE: "IMAGE";
    }>;
    category: z.ZodString;
    type: z.ZodString;
    subtype: z.ZodNullable<z.ZodString>;
    text: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
export declare const historyResponse: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        inputMode: z.ZodEnum<{
            TEXT: "TEXT";
            IMAGE: "IMAGE";
        }>;
        category: z.ZodString;
        type: z.ZodString;
        subtype: z.ZodNullable<z.ZodString>;
        text: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const deleteHistoryResponse: z.ZodObject<{
    deletedCount: z.ZodNumber;
}, z.core.$strip>;
export declare const profileResponse: z.ZodObject<{
    user: z.ZodObject<{
        firebaseUID: z.ZodString;
        displayName: z.ZodString;
    }, z.core.$strip>;
    history: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        inputMode: z.ZodEnum<{
            TEXT: "TEXT";
            IMAGE: "IMAGE";
        }>;
        category: z.ZodString;
        type: z.ZodString;
        subtype: z.ZodNullable<z.ZodString>;
        text: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=user.schema.d.ts.map