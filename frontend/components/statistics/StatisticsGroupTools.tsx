"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DataTableInput,
  type DataTableValue,
} from "@/components/statistics/DataTableInput";
import type { StatisticsGroupSlug, StatisticsTool } from "@/lib/statistics/groups";
import {
  CHI_SQUARE_DF,
  CHI_SQUARE_ALPHA,
  CHI_SQUARE_VALUES,
  F_CRITICAL_001,
  F_CRITICAL_005,
  F_TABLE_DF1,
  F_TABLE_DF2,
  T_CRITICAL_VALUES,
  T_TABLE_ALPHA_TWO_TAIL,
  T_TABLE_DF,
  T_TABLE_ALPHA_ONE_TAIL,
  Z_TABLE_COLS,
  Z_TABLE_ROWS,
  Z_TABLE_VALUES,
  findClosestChiDf,
  findClosestDf,
  findClosestFDf1,
  findClosestFDf2,
  lookupChiSquare,
  lookupFValue,
  lookupTValue,
  lookupZValue,
} from "@/lib/statistics/tables";
import {
  binomialNormalApproxProbability,
  binomialRangeProbability,
  boxPlotSummary,
  chiSquareIndependence,
  combinations,
  descriptiveStats,
  goodnessOfFit,
  hypergeometricProbability,
  independentTTestFromData,
  independentTTestFromStats,
  linearRegression,
  oneSampleTTest,
  oneWayAnova,
  pairedTTest,
  parseNumberList,
  parseTwoWayAnovaGrid,
  permutations,
  poissonNormalApproxProbability,
  poissonRangeProbability,
  specialMeans,
  twoWayAnova,
} from "@/lib/statistics/math";

function formatNumber(value: number, decimals = 6): string {
  if (!Number.isFinite(value)) return "N/A";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

function parseInteger(value: string): number {
  return Number.parseInt(value, 10);
}

function parseFloatSafe(value: string): number {
  return Number.parseFloat(value);
}

function csvToList(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function makeSingleColumnTable(column: string, csv: string): DataTableValue {
  const values = csvToList(csv);
  return {
    columns: [column],
    rows: [...values.map((v) => [v]), [""]],
  };
}

function makeTwoColumnTable(
  colA: string,
  colB: string,
  csvA: string,
  csvB: string,
): DataTableValue {
  const a = csvToList(csvA);
  const b = csvToList(csvB);
  const length = Math.max(a.length, b.length, 1);
  const rows = Array.from({ length }, (_, i) => [a[i] ?? "", b[i] ?? ""]);
  rows.push(["", ""]);
  return {
    columns: [colA, colB],
    rows,
  };
}

function parseNumericColumn(table: DataTableValue, columnIndex = 0): number[] {
  const values: number[] = [];

  table.rows.forEach((row, r) => {
    const raw = (row[columnIndex] ?? "").trim();
    if (!raw) return;
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      throw new Error(`Invalid number at row ${r + 1}, column ${columnIndex + 1}.`);
    }
    values.push(num);
  });

  return values;
}

function parsePairedColumns(
  table: DataTableValue,
  leftColumnIndex: number,
  rightColumnIndex: number,
): { left: number[]; right: number[] } {
  const left: number[] = [];
  const right: number[] = [];

  table.rows.forEach((row, r) => {
    const l = (row[leftColumnIndex] ?? "").trim();
    const rt = (row[rightColumnIndex] ?? "").trim();
    if (!l && !rt) return;
    if (!l || !rt) {
      throw new Error(`Row ${r + 1} must have values in both selected columns.`);
    }

    const leftNum = Number(l);
    const rightNum = Number(rt);
    if (!Number.isFinite(leftNum) || !Number.isFinite(rightNum)) {
      throw new Error(`Invalid number at row ${r + 1}.`);
    }

    left.push(leftNum);
    right.push(rightNum);
  });

  return { left, right };
}

function parseNumericMatrix(table: DataTableValue): number[][] {
  if (table.columns.length < 2) {
    throw new Error("Need at least 2 columns.");
  }

  const matrix: number[][] = [];
  table.rows.forEach((row, r) => {
    const values = table.columns.map((_, c) => (row[c] ?? "").trim());
    if (values.every((v) => v === "")) return;
    if (values.some((v) => v === "")) {
      throw new Error(`Fill all cells in row ${r + 1} or clear the entire row.`);
    }

    const nums = values.map((v) => Number(v));
    if (nums.some((n) => !Number.isFinite(n))) {
      throw new Error(`Invalid number at row ${r + 1}.`);
    }
    matrix.push(nums);
  });

  if (matrix.length < 2) {
    throw new Error("Need at least 2 non-empty rows.");
  }

  return matrix;
}

function minExpectedCountIndependence(table: number[][]): number {
  const rows = table.length;
  const cols = table[0].length;
  const rowTotals = table.map((row) => row.reduce((sum, v) => sum + v, 0));
  const colTotals = Array.from({ length: cols }, (_, c) =>
    table.reduce((sum, row) => sum + row[c], 0),
  );
  const grandTotal = rowTotals.reduce((sum, v) => sum + v, 0);

  let minExpected = Number.POSITIVE_INFINITY;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const expected = (rowTotals[r] * colTotals[c]) / grandTotal;
      minExpected = Math.min(minExpected, expected);
    }
  }
  return minExpected;
}

function ResultBanner({
  title,
  lines,
}: {
  title: string;
  lines: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="mt-4 rounded-lg border border-primary-main/20 bg-primary-light/20 p-3">
      <p className="text-sm font-semibold text-primary-dark">{title}</p>
      <div className="mt-2 grid gap-1">
        {lines.map((line) => (
          <p key={line.label} className="text-sm text-slate-700">
            <span className="font-medium text-primary-dark">{line.label}: </span>
            {line.value}
          </p>
        ))}
      </div>
    </div>
  );
}

function HintBanner({
  message,
  variant = "warning",
}: {
  message: string;
  variant?: "warning" | "info";
}) {
  const classes =
    variant === "warning"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-sky-300 bg-sky-50 text-sky-800";

  return <p className={`rounded-md border px-3 py-2 text-sm ${classes}`}>{message}</p>;
}

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium leading-5 text-primary-dark md:flex md:min-h-10 md:items-end">
        {label}
      </p>
      {children}
    </div>
  );
}

function ToolFrame({
  tool,
  children,
}: {
  tool: StatisticsTool;
  children: React.ReactNode;
}) {
  return (
    <section id={tool.id}>
      <Card className="h-full border-primary-main/15 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-primary-dark">{tool.title}</CardTitle>
          <p className="text-sm leading-relaxed text-slate-700">{tool.description}</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-primary-dark px-3 py-3 font-mono text-xs text-white">
            {tool.formula}
          </div>
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

function BinomialTool() {
  const [n, setN] = useState("10");
  const [kMin, setKMin] = useState("4");
  const [kMax, setKMax] = useState("6");
  const [p, setP] = useState("0.5");
  const [useNormal, setUseNormal] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const approximationHint = useMemo(() => {
    const nVal = parseInteger(n);
    const pVal = parseFloatSafe(p);
    if (!Number.isFinite(nVal) || !Number.isFinite(pVal) || pVal < 0 || pVal > 1) {
      return null;
    }

    const np = nVal * pVal;
    const nq = nVal * (1 - pVal);
    if (useNormal) {
      if (np <= 5 || nq <= 5) {
        return {
          variant: "warning" as const,
          message:
            "Warning: normal approximation may be inaccurate when n*p or n*(1-p) is 5 or less.",
        };
      }
      return {
        variant: "info" as const,
        message: "Normal approximation condition check passed (n*p and n*(1-p) are above 5).",
      };
    }
    if (nVal > 170) {
      return {
        variant: "warning" as const,
        message: "For n > 170, exact factorial terms overflow. Enable Normal Approximation.",
      };
    }
    return null;
  }, [n, p, useNormal]);

  function calculate() {
    try {
      setError("");
      const nVal = parseInteger(n);
      const minVal = parseInteger(kMin);
      const maxVal = parseInteger(kMax);
      const pVal = parseFloatSafe(p);
      const probability = useNormal
        ? binomialNormalApproxProbability(nVal, minVal, maxVal, pVal).probability
        : binomialRangeProbability(nVal, minVal, maxVal, pVal);
      setResult(probability);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-4">
        <LabeledField label="n (trials)">
          <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="e.g. 10" />
        </LabeledField>
        <LabeledField label="k_min (minimum successes)">
          <Input value={kMin} onChange={(e) => setKMin(e.target.value)} placeholder="e.g. 4" />
        </LabeledField>
        <LabeledField label="k_max (maximum successes)">
          <Input value={kMax} onChange={(e) => setKMax(e.target.value)} placeholder="e.g. 6" />
        </LabeledField>
        <LabeledField label="p (success probability)">
          <Input value={p} onChange={(e) => setP(e.target.value)} placeholder="e.g. 0.5" />
        </LabeledField>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={useNormal}
          onChange={(e) => setUseNormal(e.target.checked)}
        />
        Use Normal Approximation
      </label>
      {approximationHint ? (
        <HintBanner message={approximationHint.message} variant={approximationHint.variant} />
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result !== null ? (
        <ResultBanner
          title="Binomial Probability"
          lines={[
            { label: "P(k_min <= X <= k_max)", value: formatNumber(result, 8) },
            { label: "Percentage", value: `${formatNumber(result * 100, 4)}%` },
          ]}
        />
      ) : null}
    </div>
  );
}

function PoissonTool() {
  const [lambda, setLambda] = useState("3.5");
  const [kMin, setKMin] = useState("2");
  const [kMax, setKMax] = useState("4");
  const [useNormal, setUseNormal] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const approximationHint = useMemo(() => {
    const lambdaVal = parseFloatSafe(lambda);
    if (!Number.isFinite(lambdaVal) || lambdaVal <= 0) return null;

    if (useNormal) {
      if (lambdaVal <= 15) {
        return {
          variant: "warning" as const,
          message:
            "Warning: normal approximation may be inaccurate when lambda is 15 or below.",
        };
      }
      return {
        variant: "info" as const,
        message: "Normal approximation condition check passed (lambda > 15).",
      };
    }
    if (lambdaVal > 15) {
      return {
        variant: "info" as const,
        message: "Tip: for lambda > 15, Normal Approximation is typically appropriate.",
      };
    }
    return null;
  }, [lambda, useNormal]);

  function calculate() {
    try {
      setError("");
      const lambdaVal = parseFloatSafe(lambda);
      const minVal = parseInteger(kMin);
      const maxVal = parseInteger(kMax);
      const probability = useNormal
        ? poissonNormalApproxProbability(lambdaVal, minVal, maxVal).probability
        : poissonRangeProbability(lambdaVal, minVal, maxVal);
      setResult(probability);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <LabeledField label="lambda (mean rate)">
          <Input value={lambda} onChange={(e) => setLambda(e.target.value)} placeholder="e.g. 3.5" />
        </LabeledField>
        <LabeledField label="k_min (minimum occurrences)">
          <Input value={kMin} onChange={(e) => setKMin(e.target.value)} placeholder="e.g. 2" />
        </LabeledField>
        <LabeledField label="k_max (maximum occurrences)">
          <Input value={kMax} onChange={(e) => setKMax(e.target.value)} placeholder="e.g. 4" />
        </LabeledField>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={useNormal}
          onChange={(e) => setUseNormal(e.target.checked)}
        />
        Use Normal Approximation
      </label>
      {approximationHint ? (
        <HintBanner message={approximationHint.message} variant={approximationHint.variant} />
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result !== null ? (
        <ResultBanner
          title="Poisson Probability"
          lines={[
            { label: "P(k_min <= X <= k_max)", value: formatNumber(result, 8) },
            { label: "Percentage", value: `${formatNumber(result * 100, 4)}%` },
          ]}
        />
      ) : null}
    </div>
  );
}

function HypergeometricTool() {
  const [N, setN] = useState("52");
  const [K, setK] = useState("13");
  const [n, setSmallN] = useState("5");
  const [k, setSmallK] = useState("2");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      const probability = hypergeometricProbability(
        parseInteger(N),
        parseInteger(K),
        parseInteger(n),
        parseInteger(k),
      );
      setResult(probability);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-4">
        <LabeledField label="N (population size)">
          <Input value={N} onChange={(e) => setN(e.target.value)} placeholder="e.g. 52" />
        </LabeledField>
        <LabeledField label="K (population successes)">
          <Input value={K} onChange={(e) => setK(e.target.value)} placeholder="e.g. 13" />
        </LabeledField>
        <LabeledField label="n (draws)">
          <Input value={n} onChange={(e) => setSmallN(e.target.value)} placeholder="e.g. 5" />
        </LabeledField>
        <LabeledField label="k (desired successes)">
          <Input value={k} onChange={(e) => setSmallK(e.target.value)} placeholder="e.g. 2" />
        </LabeledField>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result !== null ? (
        <ResultBanner
          title="Hypergeometric Probability"
          lines={[
            { label: "P(X = k)", value: formatNumber(result, 8) },
            { label: "Percentage", value: `${formatNumber(result * 100, 4)}%` },
          ]}
        />
      ) : null}
    </div>
  );
}

function CountingTool({ type }: { type: "permutations" | "combinations" }) {
  const [n, setN] = useState("10");
  const [r, setR] = useState("3");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      const nVal = parseInteger(n);
      const rVal = parseInteger(r);
      setResult(type === "permutations" ? permutations(nVal, rVal) : combinations(nVal, rVal));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-2">
        <LabeledField label="n (total items)">
          <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="e.g. 10" />
        </LabeledField>
        <LabeledField label="r (chosen items)">
          <Input value={r} onChange={(e) => setR(e.target.value)} placeholder="e.g. 3" />
        </LabeledField>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result !== null ? (
        <ResultBanner
          title={type === "permutations" ? "Permutations Result" : "Combinations Result"}
          lines={[{ label: type === "permutations" ? "P(n,r)" : "C(n,r)", value: formatNumber(result, 0) }]}
        />
      ) : null}
    </div>
  );
}

function TTestsTool() {
  const [mode, setMode] = useState<"one-sample" | "paired" | "independent">("one-sample");
  const [inputMode, setInputMode] = useState<"data" | "stats">("data");
  const [alpha, setAlpha] = useState("0.05");
  const [tails, setTails] = useState<1 | 2>(2);
  const [oneSampleTable, setOneSampleTable] = useState<DataTableValue>(() =>
    makeSingleColumnTable("Sample", "950, 960, 970, 980, 1020, 1030"),
  );
  const [pairedTable, setPairedTable] = useState<DataTableValue>(() =>
    makeTwoColumnTable(
      "Before",
      "After",
      "950, 960, 970, 980, 1020, 1030",
      "930, 940, 955, 970, 990, 1005",
    ),
  );
  const [independentTable, setIndependentTable] = useState<DataTableValue>(() =>
    makeTwoColumnTable(
      "Group 1",
      "Group 2",
      "950, 960, 970, 980, 1020, 1030",
      "930, 940, 955, 970, 990, 1005",
    ),
  );
  const [mu0, setMu0] = useState("1000");
  const [stats1, setStats1] = useState({ n: "25", mean: "8", sd: "2" });
  const [stats2, setStats2] = useState({ n: "25", mean: "6", sd: "2.5" });
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      const alphaVal = parseFloatSafe(alpha);
      if (mode === "one-sample") {
        const values = parseNumericColumn(oneSampleTable, 0);
        const output = oneSampleTTest(values, parseFloatSafe(mu0), alphaVal);
        setResult([
          { label: "t-statistic", value: formatNumber(output.tStatistic, 6) },
          { label: "df", value: String(Math.round(output.df)) },
          { label: "t-critical", value: output.tCritical === null ? "N/A" : formatNumber(output.tCritical, 6) },
          { label: "decision", value: output.reject ? "Reject H0" : "Fail to reject H0" },
        ]);
        return;
      }
      if (mode === "paired") {
        const { left: before, right: after } = parsePairedColumns(pairedTable, 0, 1);
        const output = pairedTTest(before, after, alphaVal);
        setResult([
          { label: "t-statistic", value: formatNumber(output.tStatistic, 6) },
          { label: "df", value: String(Math.round(output.df)) },
          { label: "mean diff", value: formatNumber(output.meanDiff, 6) },
          { label: "t-critical", value: output.tCritical === null ? "N/A" : formatNumber(output.tCritical, 6) },
          { label: "decision", value: output.reject ? "Reject H0" : "Fail to reject H0" },
        ]);
        return;
      }

      const output =
        inputMode === "data"
          ? (() => {
              const { left, right } = parsePairedColumns(independentTable, 0, 1);
              return independentTTestFromData(left, right, alphaVal, tails);
            })()
          : independentTTestFromStats(
              {
                n: parseFloatSafe(stats1.n),
                mean: parseFloatSafe(stats1.mean),
                sd: parseFloatSafe(stats1.sd),
              },
              {
                n: parseFloatSafe(stats2.n),
                mean: parseFloatSafe(stats2.mean),
                sd: parseFloatSafe(stats2.sd),
              },
              alphaVal,
              tails,
            );
      setResult([
        { label: "method", value: output.method === "welch" ? "Welch" : "Pooled" },
        { label: "t-statistic", value: formatNumber(output.tStatistic, 6) },
        { label: "df", value: formatNumber(output.df, 4) },
        { label: "t-critical", value: output.tCritical === null ? "N/A" : formatNumber(output.tCritical, 6) },
        { label: "decision", value: output.reject ? "Reject H0" : "Fail to reject H0" },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <LabeledField label="Test type">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "one-sample" | "paired" | "independent")}
            className="h-9 rounded-md border border-input px-3 text-sm"
          >
            <option value="one-sample">One-Sample</option>
            <option value="paired">Paired</option>
            <option value="independent">Independent</option>
          </select>
        </LabeledField>
        <LabeledField label="alpha">
          <Input value={alpha} onChange={(e) => setAlpha(e.target.value)} placeholder="e.g. 0.05" />
        </LabeledField>
        {mode === "independent" ? (
          <LabeledField label="Tail option">
            <select
              value={String(tails)}
              onChange={(e) => setTails(Number(e.target.value) as 1 | 2)}
              className="h-9 rounded-md border border-input px-3 text-sm"
            >
              <option value="2">Two-tailed</option>
              <option value="1">One-tailed</option>
            </select>
          </LabeledField>
        ) : null}
      </div>

      {mode === "independent" ? (
        <div className="space-y-2">
          <LabeledField label="Input format">
            <select
              value={inputMode}
              onChange={(e) => setInputMode(e.target.value as "data" | "stats")}
              className="h-9 w-full rounded-md border border-input px-3 text-sm"
            >
              <option value="data">Raw Data Input</option>
              <option value="stats">Summary Statistics Input</option>
            </select>
          </LabeledField>

          {inputMode === "data" ? (
            <LabeledField label="Independent samples data">
              <DataTableInput
                value={independentTable}
                onChange={setIndependentTable}
                minColumns={2}
                maxColumns={2}
                minRows={2}
              />
            </LabeledField>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <LabeledField label="n1">
                  <Input value={stats1.n} onChange={(e) => setStats1({ ...stats1, n: e.target.value })} placeholder="e.g. 25" />
                </LabeledField>
                <LabeledField label="mean1">
                  <Input value={stats1.mean} onChange={(e) => setStats1({ ...stats1, mean: e.target.value })} placeholder="e.g. 8" />
                </LabeledField>
                <LabeledField label="sd1">
                  <Input value={stats1.sd} onChange={(e) => setStats1({ ...stats1, sd: e.target.value })} placeholder="e.g. 2" />
                </LabeledField>
              </div>
              <div className="grid gap-2">
                <LabeledField label="n2">
                  <Input value={stats2.n} onChange={(e) => setStats2({ ...stats2, n: e.target.value })} placeholder="e.g. 25" />
                </LabeledField>
                <LabeledField label="mean2">
                  <Input value={stats2.mean} onChange={(e) => setStats2({ ...stats2, mean: e.target.value })} placeholder="e.g. 6" />
                </LabeledField>
                <LabeledField label="sd2">
                  <Input value={stats2.sd} onChange={(e) => setStats2({ ...stats2, sd: e.target.value })} placeholder="e.g. 2.5" />
                </LabeledField>
              </div>
            </div>
          )}
        </div>
      ) : mode === "one-sample" ? (
        <div className="space-y-2">
          <LabeledField label="Sample values">
            <DataTableInput
              value={oneSampleTable}
              onChange={setOneSampleTable}
              minColumns={1}
              maxColumns={1}
              minRows={2}
            />
          </LabeledField>
          <LabeledField label="mu0 (hypothesized mean)">
            <Input value={mu0} onChange={(e) => setMu0(e.target.value)} placeholder="e.g. 1000" />
          </LabeledField>
        </div>
      ) : (
        <LabeledField label="Paired data">
          <DataTableInput
            value={pairedTable}
            onChange={setPairedTable}
            minColumns={2}
            maxColumns={2}
            minRows={2}
          />
        </LabeledField>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result ? <ResultBanner title="T-Test Result" lines={result} /> : null}
    </div>
  );
}

function ChiSquareTool() {
  const [mode, setMode] = useState<"goodness" | "independence">("goodness");
  const [alpha, setAlpha] = useState("0.05");
  const [gofTable, setGofTable] = useState<DataTableValue>(() =>
    makeTwoColumnTable("Observed", "Expected", "20, 30, 25, 25", "25, 25, 25, 25"),
  );
  const [contingencyTable, setContingencyTable] = useState<DataTableValue>({
    columns: ["Column 1", "Column 2"],
    rows: [["30", "10"], ["20", "40"], ["", ""]],
  });
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");
  const [hint, setHint] = useState<{ message: string; variant: "warning" | "info" } | null>(
    null,
  );

  function calculate() {
    try {
      setError("");
      setHint(null);
      const alphaVal = parseFloatSafe(alpha);
      if (mode === "goodness") {
        const { left: observedValues, right: expectedValues } = parsePairedColumns(gofTable, 0, 1);
        const output = goodnessOfFit(observedValues, expectedValues, alphaVal);
        if (Math.min(...expectedValues) < 5) {
          setHint({
            variant: "warning",
            message: "Some expected counts are below 5; chi-square approximation may be less reliable.",
          });
        }
        setResult([
          { label: "chi-square", value: formatNumber(output.chiSquare, 6) },
          { label: "df", value: String(output.df) },
          { label: "chi-critical", value: output.chiCritical === null ? "N/A" : formatNumber(output.chiCritical, 6) },
          { label: "decision", value: output.reject ? "Reject H0" : "Fail to reject H0" },
        ]);
        return;
      }
      const matrix = parseNumericMatrix(contingencyTable);
      const output = chiSquareIndependence(matrix, alphaVal);
      if (minExpectedCountIndependence(matrix) < 5) {
        setHint({
          variant: "warning",
          message:
            "Some expected cell counts are below 5; chi-square independence results should be interpreted carefully.",
        });
      }
      setResult([
        { label: "chi-square", value: formatNumber(output.chiSquare, 6) },
        { label: "df", value: String(output.df) },
        { label: "chi-critical", value: output.chiCritical === null ? "N/A" : formatNumber(output.chiCritical, 6) },
        { label: "decision", value: output.reject ? "Reject H0" : "Fail to reject H0" },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-2">
        <LabeledField label="Chi-square mode">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "goodness" | "independence")}
            className="h-9 rounded-md border border-input px-3 text-sm"
          >
            <option value="goodness">Goodness-of-Fit</option>
            <option value="independence">Independence</option>
          </select>
        </LabeledField>
        <LabeledField label="alpha">
          <Input value={alpha} onChange={(e) => setAlpha(e.target.value)} placeholder="e.g. 0.05" />
        </LabeledField>
      </div>

      {mode === "goodness" ? (
        <LabeledField label="Observed/Expected data">
          <DataTableInput
            value={gofTable}
            onChange={setGofTable}
            minColumns={2}
            maxColumns={2}
            minRows={2}
          />
        </LabeledField>
      ) : (
        <LabeledField label="Contingency table">
          <DataTableInput
            value={contingencyTable}
            onChange={setContingencyTable}
            minColumns={2}
            minRows={2}
          />
        </LabeledField>
      )}

      {hint ? <HintBanner message={hint.message} variant={hint.variant} /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result ? <ResultBanner title="Chi-Square Result" lines={result} /> : null}
    </div>
  );
}

function AnovaTool() {
  const [mode, setMode] = useState<"one-way" | "two-way">("one-way");
  const [oneWayInput, setOneWayInput] = useState("10,12,15\n15,18,20\n20,22,25");
  const [twoWayInput, setTwoWayInput] = useState("10,12 | 15,18\n20,22 | 25,28");
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      if (mode === "one-way") {
        const groups = oneWayInput
          .split("\n")
          .map((line) => parseNumberList(line))
          .filter((line) => line.length > 0);
        const output = oneWayAnova(groups);
        setResult([
          { label: "F-statistic", value: formatNumber(output.fStat, 6) },
          { label: "df between", value: String(output.dfBetween) },
          { label: "df within", value: String(output.dfWithin) },
          { label: "F-critical", value: output.fCritical === null ? "N/A" : formatNumber(output.fCritical, 6) },
        ]);
        return;
      }

      const grid = parseTwoWayAnovaGrid(twoWayInput);
      const output = twoWayAnova(grid);
      setResult([
        { label: "F row", value: formatNumber(output.fRow, 6) },
        { label: "F col", value: formatNumber(output.fCol, 6) },
        { label: "F interaction", value: formatNumber(output.fInter, 6) },
        { label: "df row/col/inter/error", value: `${output.dfRow}/${output.dfCol}/${output.dfInter}/${output.dfError}` },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <LabeledField label="ANOVA mode">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "one-way" | "two-way")}
          className="h-9 w-full rounded-md border border-input px-3 text-sm"
        >
          <option value="one-way">One-Way ANOVA</option>
          <option value="two-way">Two-Way ANOVA (with replication)</option>
        </select>
      </LabeledField>

      {mode === "one-way" ? (
        <LabeledField label="One-way groups">
          <Textarea
            value={oneWayInput}
            onChange={(e) => setOneWayInput(e.target.value)}
            className="min-h-24"
            placeholder={"e.g.\n10,12,15\n15,18,20\n20,22,25"}
          />
        </LabeledField>
      ) : (
        <LabeledField label="Two-way grid">
          <Textarea
            value={twoWayInput}
            onChange={(e) => setTwoWayInput(e.target.value)}
            className="min-h-24"
            placeholder={"e.g.\n10,12 | 15,18\n20,22 | 25,28"}
          />
        </LabeledField>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result ? <ResultBanner title="ANOVA Result" lines={result} /> : null}
    </div>
  );
}

function DescriptiveTool() {
  const [valuesTable, setValuesTable] = useState<DataTableValue>(() =>
    makeSingleColumnTable("Data", "12,15,18,22,25,28,30,35"),
  );
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      const values = parseNumericColumn(valuesTable, 0);
      const output = descriptiveStats(values);
      setResult([
        { label: "n", value: String(output.n) },
        { label: "mean", value: formatNumber(output.mean, 6) },
        { label: "median", value: formatNumber(output.median, 6) },
        { label: "mode", value: output.mode.length ? output.mode.join(", ") : "No mode" },
        { label: "sample SD", value: formatNumber(output.sampleStdDev, 6) },
        { label: "population SD", value: formatNumber(output.populationStdDev, 6) },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <LabeledField label="Data values">
        <DataTableInput
          value={valuesTable}
          onChange={setValuesTable}
          minColumns={1}
          maxColumns={1}
          minRows={2}
        />
      </LabeledField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result ? <ResultBanner title="Descriptive Statistics" lines={result} /> : null}
    </div>
  );
}

function RegressionTool() {
  const [xyTable, setXyTable] = useState<DataTableValue>(() =>
    makeTwoColumnTable(
      "X",
      "Y",
      "1,2,3,4,5,6,7,8,9,10",
      "52,59,62,64,72,80,74,83,91,89",
    ),
  );
  const [alpha, setAlpha] = useState("0.05");
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      const { left: xValues, right: yValues } = parsePairedColumns(xyTable, 0, 1);
      const output = linearRegression(xValues, yValues, parseFloatSafe(alpha));
      setResult([
        { label: "equation", value: output.equation },
        { label: "slope", value: formatNumber(output.slope, 6) },
        { label: "intercept", value: formatNumber(output.intercept, 6) },
        { label: "r", value: formatNumber(output.r, 6) },
        { label: "r-squared", value: formatNumber(output.rSquared, 6) },
        { label: "t-statistic", value: formatNumber(output.tStatistic, 6) },
        { label: "decision", value: output.isSignificant ? "Significant" : "Not Significant" },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <LabeledField label="X/Y data">
        <DataTableInput
          value={xyTable}
          onChange={setXyTable}
          minColumns={2}
          maxColumns={2}
          minRows={2}
        />
      </LabeledField>
      <LabeledField label="alpha">
        <Input value={alpha} onChange={(e) => setAlpha(e.target.value)} placeholder="e.g. 0.05" />
      </LabeledField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result ? <ResultBanner title="Regression Result" lines={result} /> : null}
    </div>
  );
}

function BoxPlotTool() {
  const [valuesTable, setValuesTable] = useState<DataTableValue>(() =>
    makeSingleColumnTable("Values", "12,14,15,15,16,18,20,22,24,25,30,95"),
  );
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      const output = boxPlotSummary(parseNumericColumn(valuesTable, 0));
      setResult([
        { label: "min", value: formatNumber(output.min, 4) },
        { label: "Q1", value: formatNumber(output.q1, 4) },
        { label: "median", value: formatNumber(output.median, 4) },
        { label: "Q3", value: formatNumber(output.q3, 4) },
        { label: "max", value: formatNumber(output.max, 4) },
        { label: "IQR", value: formatNumber(output.iqr, 4) },
        { label: "outliers", value: output.outliers.length ? output.outliers.join(", ") : "None" },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <LabeledField label="Data values">
        <DataTableInput
          value={valuesTable}
          onChange={setValuesTable}
          minColumns={1}
          maxColumns={1}
          minRows={2}
        />
      </LabeledField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result ? <ResultBanner title="Box Plot Summary" lines={result} /> : null}
    </div>
  );
}

function SpecialMeansTool() {
  const [valuesTable, setValuesTable] = useState<DataTableValue>(() =>
    makeSingleColumnTable("Values", "2,3,5,7,11,13,17,19,23,29,31,37"),
  );
  const [trimPercent, setTrimPercent] = useState("10");
  const [trimCount, setTrimCount] = useState("0");
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      const output = specialMeans(
        parseNumericColumn(valuesTable, 0),
        parseFloatSafe(trimPercent),
        parseFloatSafe(trimCount),
      );
      setResult([
        { label: "trimean", value: formatNumber(output.trimean, 6) },
        {
          label: "geometric mean",
          value: Number.isFinite(output.geometricMean) ? formatNumber(output.geometricMean, 6) : "N/A (needs all > 0)",
        },
        { label: "trimmed mean", value: formatNumber(output.trimmedMean, 6) },
        { label: "trim per side", value: String(output.trimPerSide) },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <LabeledField label="Data values">
        <DataTableInput
          value={valuesTable}
          onChange={setValuesTable}
          minColumns={1}
          maxColumns={1}
          minRows={2}
        />
      </LabeledField>
      <div className="grid gap-2 md:grid-cols-2">
        <LabeledField label="Trim percent (0-50)">
          <Input value={trimPercent} onChange={(e) => setTrimPercent(e.target.value)} placeholder="e.g. 10" />
        </LabeledField>
        <LabeledField label="Trim count per side">
          <Input value={trimCount} onChange={(e) => setTrimCount(e.target.value)} placeholder="e.g. 1" />
        </LabeledField>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Calculate
      </Button>
      {result ? <ResultBanner title="Special Means" lines={result} /> : null}
    </div>
  );
}

function ReferenceTool() {
  const [mode, setMode] = useState<"t" | "z" | "chi" | "f">("t");
  const [df, setDf] = useState("25");
  const [alpha, setAlpha] = useState("0.05");
  const [z, setZ] = useState("1.96");
  const [df1, setDf1] = useState("3");
  const [df2, setDf2] = useState("20");
  const [result, setResult] = useState<Array<{ label: string; value: string }> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      setError("");
      if (mode === "t") {
        const dfVal = parseInteger(df);
        const alphaVal = parseFloatSafe(alpha);
        const value = lookupTValue(dfVal, alphaVal);
        setResult([
          { label: "table", value: "t-distribution" },
          { label: "requested df", value: String(dfVal) },
          { label: "used df", value: String(findClosestDf(dfVal)) },
          { label: "alpha (one-tail)", value: String(alphaVal) },
          { label: "critical value", value: value === null ? "N/A" : formatNumber(value, 6) },
        ]);
        return;
      }

      if (mode === "z") {
        const zVal = parseFloatSafe(z);
        const value = lookupZValue(zVal);
        setResult([
          { label: "P(Z <= z)", value: formatNumber(value, 6) },
          { label: "P(Z > z)", value: formatNumber(1 - value, 6) },
        ]);
        return;
      }

      if (mode === "chi") {
        const dfVal = parseInteger(df);
        const alphaVal = parseFloatSafe(alpha);
        const value = lookupChiSquare(dfVal, alphaVal);
        setResult([
          { label: "table", value: "chi-square" },
          { label: "requested df", value: String(dfVal) },
          { label: "used df", value: String(findClosestChiDf(dfVal)) },
          { label: "alpha", value: String(alphaVal) },
          { label: "critical value", value: value === null ? "N/A" : formatNumber(value, 6) },
        ]);
        return;
      }

      const df1Val = parseInteger(df1);
      const df2Val = parseInteger(df2);
      const alphaVal = parseFloatSafe(alpha);
      const value = lookupFValue(df1Val, df2Val, alphaVal);
      setResult([
        { label: "table", value: "F-distribution" },
        { label: "requested df1/df2", value: `${df1Val}/${df2Val}` },
        { label: "used df1/df2", value: `${findClosestFDf1(df1Val)}/${String(findClosestFDf2(df2Val))}` },
        { label: "alpha", value: String(alphaVal) },
        { label: "critical value", value: value === null ? "N/A" : formatNumber(value, 6) },
      ]);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <LabeledField label="Reference table">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "t" | "z" | "chi" | "f")}
          className="h-9 w-full rounded-md border border-input px-3 text-sm"
        >
          <option value="t">t-table</option>
          <option value="z">z-table</option>
          <option value="chi">chi-square table</option>
          <option value="f">F-table</option>
        </select>
      </LabeledField>

      {mode === "z" ? (
        <LabeledField label="z-score">
          <Input value={z} onChange={(e) => setZ(e.target.value)} placeholder="e.g. 1.96" />
        </LabeledField>
      ) : mode === "f" ? (
        <div className="grid gap-2 md:grid-cols-3">
          <LabeledField label="df1">
            <Input value={df1} onChange={(e) => setDf1(e.target.value)} placeholder="e.g. 3" />
          </LabeledField>
          <LabeledField label="df2">
            <Input value={df2} onChange={(e) => setDf2(e.target.value)} placeholder="e.g. 20" />
          </LabeledField>
          <LabeledField label="alpha">
            <select
              value={alpha}
              onChange={(e) => setAlpha(e.target.value)}
              className="h-9 rounded-md border border-input px-3 text-sm"
            >
              <option value="0.05">0.05</option>
              <option value="0.01">0.01</option>
            </select>
          </LabeledField>
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          <LabeledField label="Degrees of freedom">
            <Input value={df} onChange={(e) => setDf(e.target.value)} placeholder="e.g. 25" />
          </LabeledField>
          <LabeledField label="alpha">
            <select
              value={alpha}
              onChange={(e) => setAlpha(e.target.value)}
              className="h-9 rounded-md border border-input px-3 text-sm"
            >
              {(mode === "t" ? T_TABLE_ALPHA_ONE_TAIL : CHI_SQUARE_ALPHA).map((a) => (
                <option key={String(a)} value={String(a)}>
                  {String(a)}
                </option>
              ))}
            </select>
          </LabeledField>
        </div>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="bg-button-main hover:bg-button-main/80" onClick={calculate}>
        Look Up
      </Button>
      {result ? <ResultBanner title="Table Lookup Result" lines={result} /> : null}

      {mode === "t" ? (
        <div className="overflow-x-auto rounded-md border border-primary-main/20 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-xs">
            <thead>
              <tr className="bg-primary-light/20">
                <th className="border-b border-r border-primary-main/15 px-2 py-2">df</th>
                {T_TABLE_ALPHA_ONE_TAIL.map((a, i) => (
                  <th
                    key={`t-head-${a}`}
                    className="border-b border-r border-primary-main/15 px-2 py-2 text-center last:border-r-0"
                  >
                    <div>alpha={a}</div>
                    <div className="text-[10px] text-slate-500">
                      2-tail={T_TABLE_ALPHA_TWO_TAIL[i]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {T_TABLE_DF.map((dfRow) => (
                <tr key={`t-row-${String(dfRow)}`} className="hover:bg-primary-light/10">
                  <td className="border-b border-r border-primary-main/10 px-2 py-1 font-medium">
                    {dfRow === Infinity ? "inf" : String(dfRow)}
                  </td>
                  {T_CRITICAL_VALUES[dfRow]?.map((value, i) => (
                    <td
                      key={`t-cell-${String(dfRow)}-${i}`}
                      className="border-b border-r border-primary-main/10 px-2 py-1 text-right last:border-r-0"
                    >
                      {formatNumber(value, 3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {mode === "z" ? (
        <div className="overflow-x-auto rounded-md border border-primary-main/20 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-xs">
            <thead>
              <tr className="bg-primary-light/20">
                <th className="border-b border-r border-primary-main/15 px-2 py-2">z</th>
                {Z_TABLE_COLS.map((col) => (
                  <th
                    key={`z-head-${col}`}
                    className="border-b border-r border-primary-main/15 px-2 py-2 text-center last:border-r-0"
                  >
                    {col.toFixed(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Z_TABLE_ROWS.map((row, r) => (
                <tr key={`z-row-${row}`} className="hover:bg-primary-light/10">
                  <td className="border-b border-r border-primary-main/10 px-2 py-1 font-medium">
                    {row.toFixed(1)}
                  </td>
                  {Z_TABLE_VALUES[r]?.map((value, c) => (
                    <td
                      key={`z-cell-${r}-${c}`}
                      className="border-b border-r border-primary-main/10 px-2 py-1 text-right last:border-r-0"
                    >
                      {value.toFixed(4)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {mode === "chi" ? (
        <div className="overflow-x-auto rounded-md border border-primary-main/20 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-xs">
            <thead>
              <tr className="bg-primary-light/20">
                <th className="border-b border-r border-primary-main/15 px-2 py-2">df</th>
                {CHI_SQUARE_ALPHA.map((a) => (
                  <th
                    key={`chi-head-${a}`}
                    className="border-b border-r border-primary-main/15 px-2 py-2 text-center last:border-r-0"
                  >
                    alpha={a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHI_SQUARE_DF.map((dfRow) => (
                <tr key={`chi-row-${dfRow}`} className="hover:bg-primary-light/10">
                  <td className="border-b border-r border-primary-main/10 px-2 py-1 font-medium">
                    {dfRow}
                  </td>
                  {CHI_SQUARE_VALUES[dfRow]?.map((value, i) => (
                    <td
                      key={`chi-cell-${dfRow}-${i}`}
                      className="border-b border-r border-primary-main/10 px-2 py-1 text-right last:border-r-0"
                    >
                      {formatNumber(value, 3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {mode === "f" ? (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border border-primary-main/20 bg-white">
            <table className="w-full min-w-[760px] border-collapse text-xs">
              <thead>
                <tr className="bg-primary-light/20">
                  <th className="border-b border-r border-primary-main/15 px-2 py-2">
                    df2\\df1 (alpha=0.05)
                  </th>
                  {F_TABLE_DF1.map((d) => (
                    <th
                      key={`f005-head-${d}`}
                      className="border-b border-r border-primary-main/15 px-2 py-2 text-center last:border-r-0"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {F_TABLE_DF2.slice(0, 20).map((df2Row) => (
                  <tr key={`f005-row-${String(df2Row)}`} className="hover:bg-primary-light/10">
                    <td className="border-b border-r border-primary-main/10 px-2 py-1 font-medium">
                      {df2Row === Infinity ? "inf" : String(df2Row)}
                    </td>
                    {F_TABLE_DF1.map((df1Col) => (
                      <td
                        key={`f005-cell-${String(df2Row)}-${df1Col}`}
                        className="border-b border-r border-primary-main/10 px-2 py-1 text-right last:border-r-0"
                      >
                        {F_CRITICAL_005[df2Row]?.[df1Col] !== undefined
                          ? formatNumber(F_CRITICAL_005[df2Row][df1Col], 2)
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-md border border-primary-main/20 bg-white">
            <table className="w-full min-w-[760px] border-collapse text-xs">
              <thead>
                <tr className="bg-primary-light/20">
                  <th className="border-b border-r border-primary-main/15 px-2 py-2">
                    df2\\df1 (alpha=0.01)
                  </th>
                  {F_TABLE_DF1.map((d) => (
                    <th
                      key={`f001-head-${d}`}
                      className="border-b border-r border-primary-main/15 px-2 py-2 text-center last:border-r-0"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {F_TABLE_DF2.slice(0, 20).map((df2Row) => (
                  <tr key={`f001-row-${String(df2Row)}`} className="hover:bg-primary-light/10">
                    <td className="border-b border-r border-primary-main/10 px-2 py-1 font-medium">
                      {df2Row === Infinity ? "inf" : String(df2Row)}
                    </td>
                    {F_TABLE_DF1.map((df1Col) => (
                      <td
                        key={`f001-cell-${String(df2Row)}-${df1Col}`}
                        className="border-b border-r border-primary-main/10 px-2 py-1 text-right last:border-r-0"
                      >
                        {F_CRITICAL_001[df2Row]?.[df1Col] !== undefined
                          ? formatNumber(F_CRITICAL_001[df2Row][df1Col], 2)
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToolInteraction({ tool }: { tool: StatisticsTool }) {
  switch (tool.id) {
    case "binomial":
      return <BinomialTool />;
    case "poisson":
      return <PoissonTool />;
    case "hypergeometric":
      return <HypergeometricTool />;
    case "permutations":
      return <CountingTool type="permutations" />;
    case "combinations":
      return <CountingTool type="combinations" />;
    case "t-tests":
      return <TTestsTool />;
    case "chi-square":
      return <ChiSquareTool />;
    case "anova":
      return <AnovaTool />;
    case "descriptive":
      return <DescriptiveTool />;
    case "regression":
      return <RegressionTool />;
    case "box-plot":
      return <BoxPlotTool />;
    case "special-means":
      return <SpecialMeansTool />;
    case "statistical-tables":
      return <ReferenceTool />;
    default:
      return null;
  }
}

export function StatisticsGroupTools({
  groupSlug,
  tools,
}: {
  groupSlug: StatisticsGroupSlug;
  tools: StatisticsTool[];
}) {
  const columnsClass = useMemo(() => {
    if (groupSlug === "reference") return "grid-cols-1";
    return "md:grid-cols-2";
  }, [groupSlug]);

  return (
    <div className={`grid gap-4 ${columnsClass}`}>
      {tools.map((tool) => (
        <ToolFrame key={tool.id} tool={tool}>
          <ToolInteraction tool={tool} />
        </ToolFrame>
      ))}
    </div>
  );
}
