// Input-parsing helpers for the statistics calculator.
// These turn raw UI strings into numeric arrays before they are sent to the
// backend. They contain no statistical calculation — the math itself runs
// server-side (see lib/statistics/api.ts).

export function parseNumberList(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
}

export function parseMatrixRows(input: string): number[][] {
  return input
    .split("\n")
    .map((line) =>
      line
        .split(/[\s,]+/)
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isFinite(v)),
    )
    .filter((row) => row.length > 0);
}

export function parseTwoWayAnovaGrid(input: string): number[][][] {
  const rows = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    throw new Error("Need at least 2 row lines.");
  }

  const parsed = rows.map((row) =>
    row
      .split("|")
      .map((cell) => parseNumberList(cell))
      .filter((cell) => cell.length > 0),
  );

  const colCount = parsed[0].length;
  if (colCount < 2) {
    throw new Error("Need at least 2 columns.");
  }
  for (const row of parsed) {
    if (row.length !== colCount) {
      throw new Error("All rows must have the same number of columns.");
    }
  }

  const reps = parsed[0][0].length;
  if (reps < 2) {
    throw new Error("Each cell must have at least 2 replications.");
  }
  for (const row of parsed) {
    for (const cell of row) {
      if (cell.length !== reps) {
        throw new Error("All cells must have the same replication count.");
      }
    }
  }

  return parsed;
}
