import type { NextFunction, Request, Response } from "express";
export type AuthUserContext = {
    userId: string;
    source: "bearer-token" | "dev-header";
};
export declare function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map