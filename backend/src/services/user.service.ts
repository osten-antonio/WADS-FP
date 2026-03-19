import { prisma } from "../lib/prisma";

type SyncUserAccountInput = {
  firebaseUID: string;
  displayName: string;
};

export async function syncUserAccount(input: SyncUserAccountInput) {
  return prisma.userAccount.upsert({
    where: { firebaseUID: input.firebaseUID },
    create: {
      firebaseUID: input.firebaseUID,
      displayName: input.displayName,
    },
    update: {
      displayName: input.displayName,
    },
  });
}

export async function getUserProfile(firebaseUID: string) {
  const userAccount = await prisma.userAccount.findUnique({
    where: { firebaseUID },
    include: {
      history: {
        orderBy: { createdAt: "desc" },
        include: { submission: true },
      },
    },
  });

  if (!userAccount) {
    return null;
  }

  return {
    user: {
      firebaseUID: userAccount.firebaseUID,
      displayName: userAccount.displayName,
    },
    history: userAccount.history.map((item) => ({
      id: item.submission.id,
      inputMode: item.submission.inputMode,
      category: item.submission.category,
      type: item.submission.type,
      subtype: item.submission.subtype,
      text: item.submission.text,
      createdAt: item.submission.createdAt.toISOString(),
    })),
  };
}

export async function updateUserDisplayName(firebaseUID: string, displayName: string) {
  return prisma.userAccount.upsert({
    where: { firebaseUID },
    create: {
      firebaseUID,
      displayName,
    },
    update: {
      displayName,
    },
  });
}
