import { fireEvent, render, screen } from "@testing-library/react";

import { StatisticsGroupPage } from "@/components/statistics/StatisticsGroupPage";
import StatisticsGroupRoutePage from "@/app/app/calculator/statistics/[group]/page";

// Calculations now run on the backend; mock the API client so the component
// can be tested without a live server.
jest.mock("@/lib/statistics/api", () => ({
  ...jest.requireActual("@/lib/statistics/api"),
  runCalculation: jest.fn().mockResolvedValue(0.5),
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
});
