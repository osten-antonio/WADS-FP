import type { Request, Response } from "express";
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function verifySession(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function profile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateUsername(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function filterHistory(req: Request, res: Response): Promise<void>;
export declare function deleteHistory(req: Request, res: Response): Promise<void>;
export declare function changePassword(req: Request, res: Response): void;
export declare function forgotPassword(req: Request, res: Response): void;
//# sourceMappingURL=user.controller.d.ts.map