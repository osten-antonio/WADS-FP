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
    type: string | null;
    subtype?: string | null;
    text: string;
    createdAt: Date;
  };
}): HistoryItem {
  return {
    id: item.submission.id,
    inputMode: item.submission.inputMode as "TEXT" | "IMAGE",
    category: item.submission.category,
    type: item.submission.type ?? "",
    subtype: item.submission.subtype ?? null,
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

export async function recordSubmission(
  userId: string | undefined | null,
  submission: {
    id: string;
    inputMode: "TEXT" | "IMAGE";
    category?: string | null;
    type?: string | null;
    subtype?: string | null;
    text: string;
  },
  displayName?: string,
) {
  const category = normalizeCategory(submission.category ?? undefined) ?? "General";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma TransactionClient type requires generated client
  return prisma.$transaction(async (tx: any) => {
    // If a userId is provided, upsert the user account
    if (userId) {
      const displayNameTrimmed = displayName?.trim();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma upsert args type requires generated client
      const upsertData: any = {
        where: { firebaseUID: userId },
        create: {
          firebaseUID: userId,
          displayName: displayNameTrimmed && displayNameTrimmed.length > 0 ? displayNameTrimmed : userId,
        },
        update: {},
      };
      if (displayNameTrimmed && displayNameTrimmed.length > 0) {
        upsertData.update.displayName = displayNameTrimmed;
      }

      await tx.userAccount.upsert(upsertData);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma create args type requires generated client
    const createData: any = {
      id: submission.id,
      inputMode: submission.inputMode,
      category,
      text: submission.text,
    };
    if (submission.type) createData.type = submission.type;
    if (typeof submission.subtype !== "undefined" && submission.subtype !== null) createData.subtype = submission.subtype;

    // Avoid create conflicts by returning existing if present
    let ps = await tx.problemSubmission.findUnique({ where: { id: submission.id } });
    if (!ps) {
      ps = await tx.problemSubmission.create({ data: createData });
    }

    // If a userId was provided, link to history (skip duplicates)
    if (userId) {
      await tx.history.createMany({ data: [{ userID: userId, submissionID: ps.id }], skipDuplicates: true });
    }

    return ps;
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