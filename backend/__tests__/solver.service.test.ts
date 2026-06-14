import { tryMathSolve } from "../src/services/solver.service";

describe("tryMathSolve — matrix handling", () => {
  test("computes a determinant", async () => {
    const result = await tryMathSolve("determinant of [[1,2],[3,4]]");
    expect(result.solved).toBe(true);
    expect(result.answer).toBe("determinant = -2");
  });

  test("computes an inverse", async () => {
    const result = await tryMathSolve("inverse of [[1,2],[3,4]]");
    expect(result.solved).toBe(true);
    expect(result.answer.startsWith("inverse =")).toBe(true);
  });

  test("does not hang on a ReDoS-style bracket string", async () => {
    // Pathological input for the old /\[\s*\[.*\]\s*(,\s*\[.*\]\s*)*\]/ regex.
    // Linear extraction must return promptly instead of backtracking.
    const evil = "[[]" + "],[".repeat(40);
    const result = await tryMathSolve(evil);
    expect(result.solved).toBe(false);
  }, 3000);
});
