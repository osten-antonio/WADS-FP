import { Pool } from "pg";

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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function normalizeCategory(category?: string): string | null {
  if (!category) return null;
  const trimmed = category.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function asIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return new Date(0).toISOString();
  return parsed.toISOString();
}

function toHistoryItem(row: Record<string, unknown>): HistoryItem {
  const inputMode = String(row.inputMode).toUpperCase() === "IMAGE" ? "IMAGE" : "TEXT";
  const category = String(row.category ?? "General");
  const type = String(row.type ?? category);
  const subtype = row.subtype === null || row.subtype === undefined ? null : String(row.subtype);
  const text = String(row.text ?? "");

  return {
    id: String(row.id),
    inputMode,
    category,
    type,
    subtype,
    text,
    createdAt: asIsoDate(row.createdAt),
  };
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const { rows } = await pool.query<{ firebaseUID: string; displayName: string }>(
    `
      SELECT "firebaseUID", "displayName"
      FROM "UserAccount"
      WHERE "firebaseUID" = $1
      LIMIT 1
    `,
    [userId],
  );
  const user = rows[0];
  if (!user) return null;
  return user;
}

export async function getUserHistory(userId: string, category?: string): Promise<HistoryItem[]> {
  const normalizedCategory = normalizeCategory(category);
  const params: string[] = [userId];
  let categoryClause = "";
  if (normalizedCategory) {
    params.push(normalizedCategory);
    categoryClause = `AND (LOWER(p.category) = LOWER($2) OR LOWER(p.type) = LOWER($2))`;
  }

  const { rows } = await pool.query<Record<string, unknown>>(
    `
      SELECT
        p.id::text AS id,
        p."inputMode"::text AS "inputMode",
        p.category,
        p.type,
        p.subtype,
        p.text,
        p."createdAt" AS "createdAt"
      FROM "History" h
      INNER JOIN "ProblemSubmission" p ON p.id = h."submissionID"
      WHERE h."userID" = $1
      ${categoryClause}
      ORDER BY p."createdAt" DESC
    `,
    params,
  );

  return rows.map(toHistoryItem);
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

  const { rows } = await pool.query<{ firebaseUID: string; displayName: string }>(
    `
      UPDATE "UserAccount"
      SET "displayName" = $2
      WHERE "firebaseUID" = $1
      RETURNING "firebaseUID", "displayName"
    `,
    [userId, trimmedName],
  );
  const user = rows[0];
  if (!user) return null;
  return user;
}

export async function deleteUserHistory(userId: string, submissionIds?: string[]): Promise<number> {
  const ids = submissionIds?.filter((id) => id.trim().length > 0);

  if (ids && ids.length > 0) {
    const result = await pool.query(
      `
        DELETE FROM "History"
        WHERE "userID" = $1
        AND "submissionID"::text = ANY($2::text[])
      `,
      [userId, ids],
    );
    return result.rowCount ?? 0;
  }

  const result = await pool.query(
    `
      DELETE FROM "History"
      WHERE "userID" = $1
    `,
    [userId],
  );
  return result.rowCount ?? 0;
}
