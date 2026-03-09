import type { NextFunction, Request, Response } from "express";

export async function validateCategory(req: Request, res: Response, next: NextFunction) {
    next();
}