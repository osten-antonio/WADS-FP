import { lookupChiSquare, lookupFValue } from "./tables";
import { mean } from "./helpers";

export interface GoodnessOfFitResult {
  chiSquare: number;
  df: number;
  chiCritical: number | null;
  reject: boolean;
}

export function goodnessOfFit(
  observed: number[],
  expected: number[],
  alpha = 0.05,
): GoodnessOfFitResult {
  if (observed.length !== expected.length || observed.length < 2) {
    throw new Error("Observed and expected must have same length (>=2).");
  }
  if (expected.some((v) => v <= 0)) throw new Error("Expected values must be > 0.");
  const chiSquare = observed.reduce((sum, o, i) => sum + ((o - expected[i]!) ** 2) / expected[i]!, 0);
  const df = observed.length - 1;
  const chiCritical = lookupChiSquare(df, alpha);
  const reject = chiCritical !== null && chiSquare > chiCritical;
  return { chiSquare, df, chiCritical, reject };
}

export interface IndependenceResult {
  chiSquare: number;
  df: number;
  chiCritical: number | null;
  reject: boolean;
}

export function chiSquareIndependence(table: number[][], alpha = 0.05): IndependenceResult {
  const rows = table.length;
  const cols = table[0]?.length ?? 0;
  if (rows < 2 || cols < 2) throw new Error("Need at least a 2x2 table.");
  if (table.some((row) => row.length !== cols)) throw new Error("All rows must have same length.");

  const rowTotals = table.map((row) => row.reduce((s, v) => s + v, 0));
  const colTotals = Array.from({ length: cols }, (_, c) =>
    table.reduce((s, row) => s + row[c]!, 0),
  );
  const grandTotal = rowTotals.reduce((s, v) => s + v, 0);

  let chiSquare = 0;
  for (let r = 0; r < rows; r += 1) {
    const tableRow = table[r]!;
    for (let c = 0; c < cols; c += 1) {
      const expected = (rowTotals[r]! * colTotals[c]!) / grandTotal;
      chiSquare += ((tableRow[c]! - expected) ** 2) / expected;
    }
  }

  const df = (rows - 1) * (cols - 1);
  const chiCritical = lookupChiSquare(df, alpha);
  const reject = chiCritical !== null && chiSquare > chiCritical;
  return { chiSquare, df, chiCritical, reject };
}

export interface OneWayAnovaResult {
  fStat: number;
  dfBetween: number;
  dfWithin: number;
  fCritical: number | null;
}

export function oneWayAnova(groups: number[][]): OneWayAnovaResult {
  if (groups.length < 2) throw new Error("Need at least 2 groups.");
  const nonEmpty = groups.filter((g) => g.length > 0);
  if (nonEmpty.length < 2) throw new Error("Need at least 2 non-empty groups.");
  const all = nonEmpty.flat();
  if (all.length === 0) throw new Error("No data.");

  const grandMean = mean(all);
  const ssBetween = nonEmpty.reduce((sum, group) => sum + group.length * (mean(group) - grandMean) ** 2, 0);
  const ssWithin = nonEmpty.reduce(
    (sum, group) => sum + group.reduce((inner, x) => inner + (x - mean(group)) ** 2, 0),
    0,
  );

  const dfBetween = nonEmpty.length - 1;
  const dfWithin = all.length - nonEmpty.length;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const fStat = msBetween / msWithin;
  const fCritical = lookupFValue(dfBetween, dfWithin, 0.05);
  return { fStat, dfBetween, dfWithin, fCritical };
}

export interface TwoWayAnovaResult {
  fRow: number;
  fCol: number;
  fInter: number;
  dfRow: number;
  dfCol: number;
  dfInter: number;
  dfError: number;
  fCriticalRow: number | null;
  fCriticalCol: number | null;
  fCriticalInter: number | null;
}

export function twoWayAnova(data: number[][][]): TwoWayAnovaResult {
  const R = data.length;
  if (R < 2) throw new Error("Need at least 2 rows.");
  const C = data[0]!.length;
  if (C < 2) throw new Error("Need at least 2 columns.");
  const n = data[0]![0]!.length;
  if (n < 2) throw new Error("Need at least 2 replications per cell.");

  let grandSum = 0;
  let N = 0;
  const rowSums: number[] = new Array(R).fill(0);
  const colSums: number[] = new Array(C).fill(0);
  const cellSums: number[][] = Array.from({ length: R }, () => new Array(C).fill(0));

  for (let i = 0; i < R; i += 1) {
    const rowData = data[i]!;
    if (rowData.length !== C) throw new Error("Unbalanced columns.");
    const cellRow = cellSums[i]!;
    for (let j = 0; j < C; j += 1) {
      const cell = rowData[j]!;
      if (cell.length !== n) throw new Error("Unbalanced replications.");
      for (let k = 0; k < n; k += 1) {
        const value = cell[k]!;
        grandSum += value;
        rowSums[i] = (rowSums[i] ?? 0) + value;
        colSums[j] = (colSums[j] ?? 0) + value;
        cellRow[j] = (cellRow[j] ?? 0) + value;
        N += 1;
      }
    }
  }

  const grandMean = grandSum / N;
  const rowMeans = rowSums.map((s) => s / (C * n));
  const colMeans = colSums.map((s) => s / (R * n));
  const cellMeans = cellSums.map((row) => row.map((s) => s / n));

  let ssTotal = 0;
  for (let i = 0; i < R; i += 1) {
    const rowData = data[i]!;
    for (let j = 0; j < C; j += 1) {
      const cell = rowData[j]!;
      for (let k = 0; k < n; k += 1) {
        ssTotal += (cell[k]! - grandMean) ** 2;
      }
    }
  }

  let ssRow = 0;
  for (let i = 0; i < R; i += 1) {
    ssRow += C * n * (rowMeans[i]! - grandMean) ** 2;
  }

  let ssCol = 0;
  for (let j = 0; j < C; j += 1) {
    ssCol += R * n * (colMeans[j]! - grandMean) ** 2;
  }

  let ssError = 0;
  for (let i = 0; i < R; i += 1) {
    const rowData = data[i]!;
    const meanRow = cellMeans[i]!;
    for (let j = 0; j < C; j += 1) {
      const cell = rowData[j]!;
      const cellMean = meanRow[j]!;
      for (let k = 0; k < n; k += 1) {
        ssError += (cell[k]! - cellMean) ** 2;
      }
    }
  }

  const ssInter = ssTotal - ssRow - ssCol - ssError;
  const dfRow = R - 1;
  const dfCol = C - 1;
  const dfInter = (R - 1) * (C - 1);
  const dfError = R * C * (n - 1);

  const msRow = ssRow / dfRow;
  const msCol = ssCol / dfCol;
  const msInter = ssInter / dfInter;
  const msError = ssError / dfError;

  const fRow = msRow / msError;
  const fCol = msCol / msError;
  const fInter = msInter / msError;

  return {
    fRow,
    fCol,
    fInter,
    dfRow,
    dfCol,
    dfInter,
    dfError,
    fCriticalRow: lookupFValue(dfRow, dfError, 0.05),
    fCriticalCol: lookupFValue(dfCol, dfError, 0.05),
    fCriticalInter: lookupFValue(dfInter, dfError, 0.05),
  };
}
