import type { NextFunction, Request, Response } from "express";
export declare function normalizeAndCleanText(value: string): string;
export declare function containsDangerousMarkup(value: string): boolean;
export declare function containsPromptInjectionIndicators(value: string): boolean;
export declare function apiSecurityHeaders(req: Request, res: Response, next: NextFunction): void;
export declare function validateIngestionTextSecurity(req: Request, res: Response, next: NextFunction): void;
export declare function validateGenerateExplanationSecurity(req: Request, res: Response, next: NextFunction): void;
export declare function validateFollowUpSecurity(req: Request, res: Response, next: NextFunction): void;
export declare function isSafeDisplayName(displayName: string): boolean;
export declare function validateUpdateUsernameSecurity(req: Request, res: Response, next: NextFunction): void;
export declare function detectImageTypeFromSignature(buffer: Buffer): "jpeg" | "png" | "webp" | null;
export declare function validateImageUploadSecurity(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=security.middleware.d.ts.map