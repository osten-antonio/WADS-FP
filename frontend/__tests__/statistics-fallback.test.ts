import { computeLocally } from "@/lib/statistics/local";
import { runCalculationWithSteps, runCalculation, BackendUnreachableError } from "@/lib/statistics/api";

const originalFetch = global.fetch;

function mockFetch(impl: () => Promise<unknown>) {
  global.fetch = jest.fn(impl) as unknown as typeof fetch;
}

afterEach(() => {
  global.fetch = originalFetch;
});

describe("computeLocally", () => {
  it("computes a one-sample t-test with steps", () => {
    const { result, steps } = computeLocally("one-sample-t-test", {
      values: [1, 2, 3, 4, 5],
      mu0: 3,
    });
    const r = result as { tStatistic: number; df: number };
    expect(r.tStatistic).toBeCloseTo(0, 6);
    expect(r.df).toBe(4);
    expect(steps.length).toBeGreaterThan(0);
  });

  it("computes descriptive stats with steps", () => {
    const { result, steps } = computeLocally("descriptive-stats", {
      values: [2, 4, 4, 4, 5, 5, 7, 9],
    });
    const r = result as { mean: number; n: number };
    expect(r.mean).toBeCloseTo(5, 6);
    expect(r.n).toBe(8);
    expect(steps.some((s) => /Mean/.test(s.summary))).toBe(true);
  });
});

describe("runCalculationWithSteps fallback", () => {
  it("falls back to local computation when fetch fails", async () => {
    mockFetch(() => Promise.reject(new Error("network down")));
    const { result, steps } = await runCalculationWithSteps("descriptive-stats", {
      values: [2, 4, 4, 4, 5, 5, 7, 9],
    });
    expect((result as { mean: number }).mean).toBeCloseTo(5, 6);
    expect(steps.length).toBeGreaterThan(0);
  });

  it("falls back when the proxy returns 502", async () => {
    mockFetch(() =>
      Promise.resolve({
        ok: false,
        status: 502,
        json: async () => ({ message: "Failed to connect to backend" }),
      }),
    );
    const { steps } = await runCalculationWithSteps("box-plot", {
      values: [12, 14, 15, 15, 16, 18, 20, 22, 24, 25, 30, 95],
    });
    expect(steps.length).toBeGreaterThan(0);
  });
});

describe("runCalculation (no fallback)", () => {
  it("throws BackendUnreachableError when the backend is down", async () => {
    mockFetch(() => Promise.reject(new Error("network down")));
    await expect(runCalculation("combinations", { n: 5, r: 2 })).rejects.toBeInstanceOf(
      BackendUnreachableError,
    );
  });
});
