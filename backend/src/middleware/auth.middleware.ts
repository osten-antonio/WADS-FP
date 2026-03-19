import type { NextFunction, Request, Response } from "express";

export type AuthUserContext = {
  userId: string;
  source: "bearer-token" | "dev-header";
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payloadPart = parts[1];
  if (!payloadPart) return null;

  try {
    const payloadJson = Buffer.from(payloadPart, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    return payload;
  } catch {
    return null;
  }
}

function extractUserIdFromBearerToken(token: string): string | null {
  // Dev helper for local testing before full Firebase auth wiring.
  if (token.startsWith("dev-uid:")) {
    const id = token.slice("dev-uid:".length).trim();
    return id.length > 0 ? id : null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const uid = payload.uid;
  if (typeof uid === "string" && uid.trim().length > 0) return uid.trim();

  const userId = payload.user_id;
  if (typeof userId === "string" && userId.trim().length > 0) return userId.trim();

  const sub = payload.sub;
  if (typeof sub === "string" && sub.trim().length > 0) return sub.trim();

  return null;
}

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header("authorization")?.trim();
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    const token = authorization.slice(7).trim();
    const userId = extractUserIdFromBearerToken(token);
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

  res.status(401).json({
    message: "Unauthorized. Provide a valid Bearer token.",
  });
}
