import type { Request, Response } from "express";

export function solve(req: Request, res: Response){
    // Try this function first, service will use math.js, for deterministic problems
    // For Algebar, Linear Algebra, Pre-calculus, Calculus, General (if not word problem)
}

export async function solveAI(req: Request, res: Response) {
    // For other problems, fallback if solve cant be solved
}