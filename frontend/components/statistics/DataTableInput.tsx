"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DataTableCell = string;
export type DataTableRow = DataTableCell[];

export interface DataTableValue {
  columns: string[];
  rows: DataTableRow[];
}

interface DataTableInputProps {
  value: DataTableValue;
  onChange: (next: DataTableValue) => void;
  minRows?: number;
  minColumns?: number;
  maxColumns?: number;
  className?: string;
}

function ensureRectangular(rows: DataTableRow[], cols: number): DataTableRow[] {
  return rows.map((row) => {
    const next = row.slice(0, cols);
    while (next.length < cols) next.push("");
    return next;
  });
}

export function DataTableInput({
  value,
  onChange,
  minRows = 1,
  minColumns = 1,
  maxColumns,
  className,
}: DataTableInputProps) {
  const normalized = useMemo(() => {
    const cols = Math.max(minColumns, value.columns.length || minColumns);
    const rows = ensureRectangular(value.rows, cols);
    const minVisibleRows = Math.max(1, minRows);

    while (rows.length < minVisibleRows) rows.push(new Array(cols).fill(""));

    const columns = value.columns.length
      ? value.columns.slice(0, cols)
      : Array.from({ length: cols }, (_, i) => `Col ${i + 1}`);

    while (columns.length < cols) columns.push(`Col ${columns.length + 1}`);

    return { columns, rows } satisfies DataTableValue;
  }, [minColumns, minRows, value.columns, value.rows]);

  function setCell(r: number, c: number, next: string) {
    const rows = normalized.rows.map((row) => row.slice());
    rows[r][c] = next;

    if (r === rows.length - 1 && next.trim() !== "") {
      rows.push(new Array(normalized.columns.length).fill(""));
    }

    onChange({ ...normalized, rows });
  }

  function setColumnName(c: number, name: string) {
    const columns = normalized.columns.slice();
    columns[c] = name;
    onChange({ ...normalized, columns });
  }

  function addRow() {
    onChange({
      ...normalized,
      rows: [...normalized.rows, new Array(normalized.columns.length).fill("")],
    });
  }

  function deleteRow(index: number) {
    const rows = normalized.rows.filter((_, i) => i !== index);
    while (rows.length < Math.max(1, minRows)) {
      rows.push(new Array(normalized.columns.length).fill(""));
    }
    onChange({ ...normalized, rows });
  }

  function addColumn() {
    if (maxColumns && normalized.columns.length >= maxColumns) return;

    const columns = [...normalized.columns, `Col ${normalized.columns.length + 1}`];
    const rows = normalized.rows.map((row) => [...row, ""]);
    onChange({ columns, rows });
  }

  function removeColumn() {
    if (normalized.columns.length <= minColumns) return;

    const columns = normalized.columns.slice(0, -1);
    const rows = normalized.rows.map((row) => row.slice(0, -1));
    onChange({ columns, rows });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="xs" onClick={addRow}>
          + Row
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={addColumn}
          disabled={Boolean(maxColumns && normalized.columns.length >= maxColumns)}
        >
          + Col
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={removeColumn}
          disabled={normalized.columns.length <= minColumns}
        >
          - Col
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-primary-main/20 bg-white">
        <table className="w-full min-w-[360px] border-collapse text-sm">
          <thead>
            <tr className="bg-primary-light/20">
              <th className="w-12 border-b border-r border-primary-main/15 px-2 py-2 text-center text-xs text-primary-dark">
                #
              </th>
              {normalized.columns.map((column, c) => (
                <th
                  key={c}
                  className="min-w-32 border-b border-r border-primary-main/15 px-2 py-1 last:border-r-0"
                >
                  <Input
                    value={column}
                    onChange={(e) => setColumnName(c, e.target.value)}
                    className="h-8 text-xs"
                    aria-label={`Column ${c + 1} name`}
                  />
                </th>
              ))}
              <th className="w-10 border-b border-primary-main/15 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {normalized.rows.map((row, r) => (
              <tr key={r} className="hover:bg-primary-light/10">
                <td className="border-b border-r border-primary-main/10 px-2 py-2 text-center font-mono text-xs text-slate-600">
                  {r + 1}
                </td>
                {row.map((cell, c) => (
                  <td key={`${r}-${c}`} className="border-b border-r border-primary-main/10 px-1 py-1 last:border-r-0">
                    <Input
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="h-8 text-right font-mono text-xs"
                      placeholder="-"
                      aria-label={`Row ${r + 1} Column ${c + 1}`}
                    />
                  </td>
                ))}
                <td className="border-b border-primary-main/10 px-1 text-center">
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-red-600"
                    onClick={() => deleteRow(r)}
                    title="Remove row"
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">Tip: paste values from spreadsheet cells directly into the grid.</p>
    </div>
  );
}
