import { fireEvent, render, screen } from "@testing-library/react";

import { StatisticsGroupPage } from "@/components/statistics/StatisticsGroupPage";
import StatisticsGroupRoutePage from "@/app/app/calculator/statistics/[group]/page";

// Calculations now run on the backend; mock the API client so the component
// can be tested without a live server.
jest.mock("@/lib/statistics/api", () => ({
  ...jest.requireActual("@/lib/statistics/api"),
  runCalculation: jest.fn().mockResolvedValue(0.5),
  runCalculationWithSteps: jest.fn().mockResolvedValue({
    result: { tStatistic: -1.74, df: 5, sampleMean: 970, sampleStdDev: 42.3, tCritical: 2.571, reject: false },
    steps: [{ step: 1, summary: "State hypotheses", expression: "H_0: \\mu = 1000" }],
  }),
}));

describe("StatisticsGroupPage", () => {
  it("renders probability sections", () => {
    render(<StatisticsGroupPage groupSlug="probability" />);

    expect(screen.getByText("Probability")).toBeInTheDocument();
    expect(screen.getAllByText("Binomial").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Poisson").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hypergeometric").length).toBeGreaterThan(0);
  });

  it("renders invalid group message for unknown route params", async () => {
    const page = await StatisticsGroupRoutePage({
      params: Promise.resolve({ group: "unknown" }),
    });

    render(page);
    expect(
      screen.getByText("Invalid statistics group: unknown"),
    ).toBeInTheDocument();
  });

  it("calculates binomial probability from inputs", async () => {
    render(<StatisticsGroupPage groupSlug="probability" />);

    fireEvent.click(screen.getAllByText("Calculate")[0]);
    expect(await screen.findByText("Binomial Probability")).toBeInTheDocument();
  });

  it("renders inference subsections as tabs", () => {
    render(<StatisticsGroupPage groupSlug="inference" />);

    expect(screen.getByRole("tab", { name: "T-Tests" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Chi-Square" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "ANOVA" })).toBeInTheDocument();
  });

  it("shows worked solution steps after calculating", async () => {
    render(<StatisticsGroupPage groupSlug="inference" />);

    fireEvent.click(screen.getAllByText("Calculate")[0]);
    expect(await screen.findByText("T-Test Result")).toBeInTheDocument();
    expect(screen.getByText("Solution steps")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });
});
