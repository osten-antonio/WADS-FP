import type { NextFunction, Request, Response } from "express";
import { adminAuth } from "../lib/firebase-admin";
import { sendErrorResponse } from "../lib/error-response";

export type AuthUserContext = {
  userId: string;
  source: "bearer-token" | "dev-header";
};

async function verifyFirebaseToken(token: string): Promise<string | null> {
  // Dev helper for local testing before full Firebase auth wiring.
  if (token.startsWith("dev-uid:")) {
    const id = token.slice("dev-uid:".length).trim();
    return id.length > 0 ? id : null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    return decoded.uid;
  } catch {
    try {
      // Fallback: try as a session cookie
      const decoded = await adminAuth.verifySessionCookie(token, true);
      return decoded.uid;
    } catch {
      return null;
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authorization = req.header("authorization")?.trim();
    if (authorization?.toLowerCase().startsWith("bearer ")) {
      const token = authorization.slice(7).trim();
      const userId = await verifyFirebaseToken(token);
      if (userId) {
        (res.locals as { authUser?: AuthUserContext }).authUser = {
          userId,
          source: "bearer-token",
        };
        next();
        return;
      }
    }

    const allowDevHeader = process.env.ALLOW_DEV_USER_ID_HEADER === "true";
    if (allowDevHeader) {
      const devUserId = req.header("x-user-id")?.trim();
      if (devUserId) {
        (res.locals as { authUser?: AuthUserContext }).authUser = {
          userId: devUserId,
          source: "dev-header",
        };
        next();
        return;
      }
    }

    sendErrorResponse(res, 401, "Unauthorized. Provide a valid Bearer token.", 'UNAUTHORIZED');
  } catch {
    sendErrorResponse(res, 500, "Internal server error during authentication", 'AUTH_INTERNAL_ERROR');
  }
}
