import type { Request, Response } from "express";
import { adminAuth } from "../lib/firebase-admin";
import type { AuthUserContext } from "../middleware/auth.middleware";
import { deleteHistoryRequest, updateUsernameRequest } from "../schemas/user.schema";
import {
  deleteUserHistory,
  getUserById,
  getUserHistory,
  getUserProfile,
  syncUserAccount,
  updateUserDisplayName,
} from "../services/user.service";
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

function getAuthenticatedUserId(res: Response): string | null {
  const authUser = (res.locals as { authUser?: AuthUserContext }).authUser;
  if (!authUser?.userId) return null;
  return authUser.userId;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0) return message;
  }
  return fallback;
}

function readCategory(req: Request): string | undefined {
  if (typeof req.query.category === "string") {
    const category = req.query.category.trim();
    if (category.length > 0) return category;
  }

  if (typeof req.query.topic === "string") {
    const topic = req.query.topic.trim();
    if (topic.length > 0) return topic;
  }

  return undefined;
}

export async function register(req: Request, res: Response) {
  res.status(501).json({
    message: "Register endpoint is not implemented yet.",
  });
}

export async function login(req: Request, res: Response) {
  const idToken = readBearerToken(req);
  if (!idToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const displayName = getFallbackDisplayName(decoded);

    let userAccount = await getUserById(decoded.uid);
    if (!userAccount) {
      userAccount = await syncUserAccount({
        firebaseUID: decoded.uid,
        displayName,
      });
    }

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
    const existingUser = await getUserById(decoded.uid);
    if (!existingUser) {
      await syncUserAccount({
        firebaseUID: decoded.uid,
        displayName: fallbackDisplayName,
      });
    }

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
    await adminAuth.updateUser(decoded.uid, {
      displayName: nextDisplayName,
    });

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

export async function filterHistory(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(res);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const category = readCategory(req);
    const items = await getUserHistory(userId, category);
    res.status(200).json({ items });
  } catch (error) {
    const message = toErrorMessage(error, "Failed to filter history.");
    res.status(500).json({ message });
  }
}

export async function deleteHistory(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(res);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const pathSubmissionId =
      typeof req.params.id === "string" && req.params.id.trim().length > 0 ? req.params.id.trim() : undefined;

    let submissionIds: string[] | undefined;
    if (pathSubmissionId) {
      submissionIds = [pathSubmissionId];
    } else {
      const parsed = deleteHistoryRequest.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Invalid body for delete history request. Use { submissionIds: string[] } or /delete-history/:id",
        });
        return;
      }
      submissionIds = parsed.data.submissionIds;
    }

    const deletedCount = await deleteUserHistory(userId, submissionIds);
    res.status(200).json({ deletedCount });
  } catch (error) {
    const message = toErrorMessage(error, "Failed to delete history.");
    res.status(500).json({ message });
  }
}

export function changePassword(req: Request, res: Response) {
  res.status(501).json({
    message: "Change password endpoint is not implemented yet.",
  });
}

export function forgotPassword(req: Request, res: Response) {
  res.status(501).json({
    message: "Forgot password endpoint is not implemented yet.",
  });
}