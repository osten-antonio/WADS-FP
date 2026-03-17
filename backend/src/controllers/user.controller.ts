import type { Request, Response } from "express";
import { deleteHistoryRequest, updateUsernameRequest } from "../schemas/user.schema";
import {
  deleteUserHistory,
  getUserHistory,
  getUserProfile,
  updateDisplayName,
} from "../services/user.service";
import type { AuthUserContext } from "../middleware/auth.middleware";

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
  res.status(501).json({
    message: "Login endpoint is not implemented yet.",
  });
}

export async function profile(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(res);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const profileData = await getUserProfile(userId);
    if (!profileData) {
      res.status(404).json({ message: `User not found: ${userId}` });
      return;
    }

    res.status(200).json(profileData);
  } catch (error) {
    const message = toErrorMessage(error, "Failed to load profile.");
    res.status(500).json({ message });
  }
}

export async function updateUsername(req: Request, res: Response) {
  try {
    const parsed = updateUsernameRequest.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid body for update username request." });
      return;
    }

    const userId = getAuthenticatedUserId(res);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const user = await updateDisplayName(userId, parsed.data.displayName);
    if (!user) {
      res.status(404).json({ message: `User not found: ${userId}` });
      return;
    }

    const history = await getUserHistory(userId);
    res.status(200).json({
      user,
      history,
    });
  } catch (error) {
    const message = toErrorMessage(error, "Failed to update username.");
    res.status(500).json({ message });
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
