declare module 'math-expressions' {
  class MathExpression {
    static fromText(text: string): MathExpression;
    static fromLatex(latex: string): MathExpression;

    equals(other: MathExpression): boolean;
    equalsViaSampling(other: MathExpression, vars?: string[]): boolean;
    toString(): string;
    toLatex(): string;
    evaluate(vars?: { [key: string]: number }): number;
    variables(): string[];
    derivative(variable: string): MathExpression;
    simplify(): MathExpression;
  }

  export = MathExpression;
}