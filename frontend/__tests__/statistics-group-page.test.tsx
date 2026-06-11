import { fireEvent, render, screen } from "@testing-library/react";

import { StatisticsGroupPage } from "@/components/statistics/StatisticsGroupPage";
import StatisticsGroupRoutePage from "@/app/app/calculator/statistics/[group]/page";

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

  it("calculates binomial probability from inputs", () => {
    render(<StatisticsGroupPage groupSlug="probability" />);

    fireEvent.click(screen.getAllByText("Calculate")[0]);
    expect(screen.getByText("Binomial Probability")).toBeInTheDocument();
  });
});
