export interface CalculationStep {
  id: string;
  title: string;
  description?: string;
  formula?: string;
  calculation?: string;
  result?: string;
  note?: string;
}

export interface CalculationResult<T = unknown> {
  value: T;
  steps: CalculationStep[];
  formula?: string;
  inputs?: Record<string, number | string>;
}

