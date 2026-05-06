import { evaluate, derivative, matrix, det, inv, simplify, parse } from 'mathjs';
import { normalizeQuestion } from '../lib/utils';
import MathExpression from 'math-expressions';

export type MathSolveResult = {
    answer: string;
    solved: boolean;
};

/**
 * Converts LaTeX strings to MathJS compatible expressions.
 */
function cleanLatex(latex: string): string {
    if (!latex.includes('\\')) return latex;
    
    try {
        // math-expressions can parse LaTeX and output mathjs-compatible strings
        const expr = MathExpression.fromLatex(latex);
        return expr.toString();
    } catch {
        // Fallback: simple replacements for common patterns if library fails
        return latex
            .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '($1)/($2)')
            .replace(/\\sqrt\{(.+?)\}/g, 'sqrt($1)')
            .replace(/\\left\(|\\right\)/g, '')
            .replace(/\\cdot/g, '*')
            .replace(/\{(.+?)\}/g, '($1)')
            .replace(/\\/g, '');
    }
}

function parseSide(side: string, variable: string) {
    let coeff = 0;
    let constSum = 0;
    const varRegex = new RegExp('([+-]?\\s*\\d*\\.?\\d*)\\s*\\*?\\s*' + variable, 'gi');
    
    let mVar: RegExpExecArray | null;
    while ((mVar = varRegex.exec(side)) !== null) {
        const numStr = mVar[1] ?? '';
        let n = numStr.replace(/\s+/g, '');
        if (n === '' || n === '+' || n === '-') n += '1';
        coeff += parseFloat(n);
    }

    const withoutVars = side.replace(varRegex, ' ');
    const numRegex = /([+-]?\s*\d*\.?\d+)/g;
    
    let mNum: RegExpExecArray | null;
    while ((mNum = numRegex.exec(withoutVars)) !== null) {
        const group = mNum[1];
        if (!group) continue;
        const n = parseFloat(group.replace(/\s+/g, ''));
        if (!Number.isNaN(n)) constSum += n;
    }

    return { coeff, constSum };
}

export async function tryMathSolve(question: string): Promise<MathSolveResult> {
    const q = cleanLatex(normalizeQuestion(question));

    // Derivative
    if (/\b(derive|derivative|differentiate|d\/dx)\b/i.test(q)) {
        try {
            // Extracts the keyword
            const m = q.match(/(?:derive|derivative|differentiate|d\/dx)(?:\s+of)?\s+(.*)/i);
            
            // Clean expr
            let expr = (m && m[1]) ? m[1] : q;
            expr = expr.replace(/\b(derivative|differentiate|d\/dx|of)\b/gi, '').trim();

            // Check for vairable, defaults to x
            let variable = 'x';
            if (/\bx\b/i.test(expr)) {
                variable = 'x';
            } else {
                const varMatch = expr.match(/[a-zA-Z]/);
                if (varMatch) variable = varMatch[0];
            }

            const resultNode = derivative(expr, variable);
            const simplified = simplify(resultNode);
            
            return { answer: `Derivative: ${simplified.toString()}`, solved: true };
        } catch {
            return { answer: '', solved: false };
        }
    }

    // Matrices
    const matrixMatch = q.match(/\[\s*\[.*\]\s*(,\s*\[.*\]\s*)*\]/s);
    if (matrixMatch && /determinant|det|inverse|inv/i.test(q)) {
        try {
            const mat = matrix(JSON.parse(matrixMatch[0]));

            if (/determinant|det/i.test(q)) {
                const dval = det(mat);
                return { answer: `determinant = ${dval}`, solved: true };
            }

            if (/inverse|inv/i.test(q)) {
                const invmat = inv(mat);
                return { answer: `inverse = ${JSON.stringify(invmat.toArray ? invmat.toArray() : invmat)}`, solved: true };
            }
        } catch {
            return { answer: '', solved: false };
        }
    }

    if (!/=/.test(q)) {
        try {
            // Strip command verbs
            const expr = q.replace(/\b(evaluate|calculate|compute|simplify|what is|solve)\b/gi, '').trim();
            
            // Handles non variable expression, 2+2, etc
            const val = evaluate(expr);
            
            if (val !== undefined && val !== null) {
                // Handle matrix results from evaluation
                if (val.toArray) {
                    return { answer: JSON.stringify(val.toArray()), solved: true };
                }
                return { answer: String(val), solved: true };
            }
        } catch {
            // expression evaluation failed; fall through to equation solver
        }
    }

    // Quadratic & Linear
    if (/=/.test(q)) {
        try {
            const parts = q.split('=');
            if (parts.length === 2) {
                const left = parts[0] || '';
                const right = parts[1] || '';
                
                // Identify the variable character
                const vMatch = q.match(/([a-zA-Z])/);
                if (vMatch && vMatch[1]) {
                    const variable = vMatch[1];

                    // Check for quadratic (ax^2 + bx + c = 0)
                    const quadRegex = new RegExp(`${variable}\\s*(\\^\\^?|\\*\\*)\\s*2`);
                    if (quadRegex.test(q)) {
                        // Use Math.js to find coefficients by evaluating f(0), f(1), f(-1)
                        try {
                            const node = parse(`(${left}) - (${right})`);
                            const f = node.compile();

                            const c = f.evaluate({ [variable]: 0 });
                            const f1 = f.evaluate({ [variable]: 1 }); // A + B + C
                            const fm1 = f.evaluate({ [variable]: -1 }); // A - B + C

                            if (typeof c === 'number' && typeof f1 === 'number' && typeof fm1 === 'number') {
                                const A = ((f1 + fm1) / 2) - c;
                                const B = (f1 - fm1) / 2;
                                const C = c;

                                // If A is 0, it is not quadratic, fall through to linear
                                if (Math.abs(A) >= 1e-12) {
                                    const discriminant = B * B - 4 * A * C;
                                    
                                    if (discriminant < 0) {
                                        // Complex roots
                                        const realPart = -B / (2 * A);
                                        const imagPart = Math.sqrt(-discriminant) / (2 * A);
                                        const sign = imagPart < 0 ? '-' : '+';
                                        return { answer: `${variable} = ${realPart.toFixed(3)} ${sign} ${Math.abs(imagPart).toFixed(3)}i`, solved: true };
                                    } else {
                                        // Real roots
                                        const x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
                                        const x2 = (-B - Math.sqrt(discriminant)) / (2 * A);
                                        
                                        if (Math.abs(x1 - x2) < 1e-9) {
                                            return { answer: `${variable} = ${x1}`, solved: true }; // Repeated root
                                        }
                                        return { answer: `${variable} = ${x1}, ${x2}`, solved: true };
                                    }
                                }
                            }
                        } catch (e) {
                            console.error("Quadratic solver failed", e);
                        }
                    }
                    
                    // Parse both sides to extract coefficients and constants.
                    // "2x + 1" becomes { coeff: 2, constSum: 1 }
                    const leftParsed = parseSide(left, variable);
                    const rightParsed = parseSide(right, variable);
                    
                    // Rearrange equation (ax + b = cx + d) -> (a - c)x = (d - b)
                    const a = leftParsed.coeff - rightParsed.coeff;
                    const b = rightParsed.constSum - leftParsed.constSum;
                    
                    // Prevent division by zero (or near-zero floating point issues)
                    if (Math.abs(a) < 1e-12) {
                        return { answer: '', solved: false };
                    }

                    // ax = b, x = b/a
                    const solution = b / a;
                    return { answer: `${variable} = ${solution}`, solved: true };
                }
            }
        } catch {
            return { answer: '', solved: false };
        }
    }

    return { answer: '', solved: false };
}

export default { tryMathSolve };