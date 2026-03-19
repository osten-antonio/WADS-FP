import type { Request, Response } from "express";
import { adminAuth } from "../lib/firebase-admin";
import { getUserProfile, syncUserAccount, updateUserDisplayName } from "../services/user.service";
import { updateUsernameRequest } from "../schemas/user.schema";
import type { DecodedIdToken } from "firebase-admin/auth";

const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

function readBearerToken(req: Request): string | null {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.split("Bearer ")[1] ?? null;
}

async function decodeFirebaseToken(token: string): Promise<DecodedIdToken> {
  try {
    return await adminAuth.verifyIdToken(token, true);
  } catch {
    return await adminAuth.verifySessionCookie(token, true);
  }
}

function getFallbackDisplayName(decoded: DecodedIdToken): string {
  return decoded.name?.trim() || decoded.email?.split("@")[0] || decoded.uid;
}


export async function register(req: Request, res: Response) {
} 

export async function login(req: Request, res: Response) {
  const idToken = readBearerToken(req);
  if (!idToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const displayName = getFallbackDisplayName(decoded);

    const userAccount = await syncUserAccount({
      firebaseUID: decoded.uid,
      displayName,
    });

    const sessionToken = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    return res.status(200).json({
      sessionToken,
      user: {
        uid: userAccount.firebaseUID,
        email: decoded.email ?? null,
        name: userAccount.displayName,
      },
    });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function profile(req: Request, res: Response) {
  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decoded: DecodedIdToken;
  try {
    decoded = await decodeFirebaseToken(token);
  } catch {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const fallbackDisplayName = getFallbackDisplayName(decoded);

    await syncUserAccount({
      firebaseUID: decoded.uid,
      displayName: fallbackDisplayName,
    });

    const profilePayload = await getUserProfile(decoded.uid);
    if (!profilePayload) {
      return res.status(404).json({ message: "User profile not found" });
    }

    return res.status(200).json(profilePayload);
  } catch {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}

export async function updateUsername(req: Request, res: Response) {
  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = updateUsernameRequest.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  const nextDisplayName = parsed.data.displayName.trim();
  if (!nextDisplayName) {
    return res.status(400).json({ message: "displayName cannot be empty" });
  }

  let decoded: DecodedIdToken;
  try {
    decoded = await decodeFirebaseToken(token);
  } catch {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    await updateUserDisplayName(decoded.uid, nextDisplayName);

    const profilePayload = await getUserProfile(decoded.uid);
    if (!profilePayload) {
      return res.status(404).json({ message: "User profile not found" });
    }

    return res.status(200).json(profilePayload);
  } catch {
    return res.status(500).json({ message: "Failed to update username" });
  }
}

export function filterHistory(req: Request, res: Response) {
}

export function deleteHistory(req: Request, res: Response) {
    // handle specific also
}

export function changePassword(req: Request, res: Response) {
}

export function forgotPassword(req: Request, res: Response) {
}
