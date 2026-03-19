import { prisma } from "../lib/prisma";

export type HistoryItem = {
  id: string;
  inputMode: "TEXT" | "IMAGE";
  category: string;
  type: string;
  subtype: string | null;
  text: string;
  createdAt: string;
};

export type UserRecord = {
  firebaseUID: string;
  displayName: string;
};

export type SyncUserAccountInput = {
  firebaseUID: string;
  displayName: string;
};

function normalizeCategory(category?: string): string | null {
  if (!category) return null;
  const trimmed = category.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toHistoryItem(item: {
  submission: {
    id: string;
    inputMode: "TEXT" | "IMAGE";
    category: string;
    type: string;
    subtype: string | null;
    text: string;
    createdAt: Date;
  };
}): HistoryItem {
  return {
    id: item.submission.id,
    inputMode: item.submission.inputMode,
    category: item.submission.category,
    type: item.submission.type,
    subtype: item.submission.subtype,
    text: item.submission.text,
    createdAt: item.submission.createdAt.toISOString(),
  };
}

export async function syncUserAccount(input: SyncUserAccountInput): Promise<UserRecord> {
  const displayName = input.displayName.trim();
  const resolvedDisplayName = displayName.length > 0 ? displayName : input.firebaseUID;

  const existing = await prisma.userAccount.findUnique({
    where: { firebaseUID: input.firebaseUID },
    select: {
      firebaseUID: true,
      displayName: true,
    },
  });
  if (existing) return existing;

  return prisma.userAccount.create({
    data: {
      firebaseUID: input.firebaseUID,
      displayName: resolvedDisplayName,
    },
    select: {
      firebaseUID: true,
      displayName: true,
    },
  });
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  return prisma.userAccount.findUnique({
    where: { firebaseUID: userId },
    select: {
      firebaseUID: true,
      displayName: true,
    },
  });
}

export async function getUserHistory(userId: string, category?: string): Promise<HistoryItem[]> {
  const normalizedCategory = normalizeCategory(category);

  const history = await prisma.history.findMany({
    where: {
      userID: userId,
      ...(normalizedCategory
        ? {
            submission: {
              OR: [
                { category: { equals: normalizedCategory, mode: "insensitive" } },
                { type: { equals: normalizedCategory, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      submission: true,
    },
  });

  return history.map(toHistoryItem);
}

export async function getUserProfile(
  userId: string,
): Promise<{ user: UserRecord; history: HistoryItem[] } | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const history = await getUserHistory(userId);
  return { user, history };
}

export async function updateDisplayName(userId: string, displayName: string): Promise<UserRecord | null> {
  const trimmedName = displayName.trim();
  if (trimmedName.length === 0) return null;

  const updated = await prisma.userAccount.updateMany({
    where: { firebaseUID: userId },
    data: { displayName: trimmedName },
  });

  if (updated.count === 0) return null;
  return getUserById(userId);
}

export async function updateUserDisplayName(firebaseUID: string, displayName: string): Promise<UserRecord> {
  const trimmedName = displayName.trim();
  const resolvedDisplayName = trimmedName.length > 0 ? trimmedName : firebaseUID;

  return prisma.userAccount.upsert({
    where: { firebaseUID },
    create: {
      firebaseUID,
      displayName: resolvedDisplayName,
    },
    update: {
      displayName: resolvedDisplayName,
    },
    select: {
      firebaseUID: true,
      displayName: true,
    },
  });
}

export async function deleteUserHistory(userId: string, submissionIds?: string[]): Promise<number> {
  const ids = submissionIds?.map((id) => id.trim()).filter((id) => id.length > 0);

  const result = await prisma.history.deleteMany({
    where: {
      userID: userId,
      ...(ids && ids.length > 0
        ? {
            submissionID: {
              in: ids,
            },
          }
        : {}),
    },
  });

  return result.count;
}
