export type StatisticsGroupSlug =
  | "probability"
  | "counting"
  | "inference"
  | "data"
  | "reference";

export interface StatisticsTool {
  id: string;
  title: string;
  description: string;
  formula: string;
}

export interface StatisticsGroup {
  slug: StatisticsGroupSlug;
  title: string;
  description: string;
  tools: StatisticsTool[];
}

export const STATISTICS_GROUPS: Record<StatisticsGroupSlug, StatisticsGroup> = {
  probability: {
    slug: "probability",
    title: "Probability",
    description:
      "Distribution-based calculators for discrete events and range probabilities.",
    tools: [
      {
        id: "binomial",
        title: "Binomial",
        description:
          "Exact and range probability for successes in n independent trials.",
        formula: "P(\\min \\le X \\le \\max) = \\sum_{k=\\min}^{\\max} \\binom{n}{k} p^k (1-p)^{n-k}",
      },
      {
        id: "poisson",
        title: "Poisson",
        description:
          "Event-count probability from average rate lambda, including ranges.",
        formula: "P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}",
      },
      {
        id: "hypergeometric",
        title: "Hypergeometric",
        description:
          "Sampling without replacement from a finite population.",
        formula: "P(X = k) = \\frac{\\binom{K}{k} \\binom{N-K}{n-k}}{\\binom{N}{n}}",
      },
    ],
  },
  counting: {
    slug: "counting",
    title: "Counting",
    description:
      "Combinatorics tools for arrangement and selection counts.",
    tools: [
      {
        id: "permutations",
        title: "Permutations",
        description:
          "Ordered arrangement count of r objects selected from n.",
        formula: "P(n,r) = \\frac{n!}{(n-r)!}",
      },
      {
        id: "combinations",
        title: "Combinations",
        description:
          "Unordered selection count of r objects selected from n.",
        formula: "C(n,r) = \\binom{n}{r} = \\frac{n!}{r!\\,(n-r)!}",
      },
    ],
  },
  inference: {
    slug: "inference",
    title: "Inference",
    description:
      "Hypothesis-testing tools for means, associations, and variance ratios.",
    tools: [
      {
        id: "t-tests",
        title: "T-Tests",
        description:
          "One-sample, paired, and independent test setups.",
        formula: "t = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}}",
      },
      {
        id: "chi-square",
        title: "Chi-Square",
        description:
          "Goodness-of-fit and independence tests with expected counts.",
        formula: "\\chi^2 = \\sum \\frac{(O - E)^2}{E}",
      },
      {
        id: "anova",
        title: "ANOVA",
        description:
          "One-way and two-way variance decomposition and F testing.",
        formula: "F = \\frac{MS_{\\text{between}}}{MS_{\\text{within}}}",
      },
    ],
  },
  data: {
    slug: "data",
    title: "Data",
    description:
      "Descriptive and modeling tools for numerical datasets.",
    tools: [
      {
        id: "descriptive",
        title: "Descriptive Stats",
        description:
          "Mean, median, mode, range, variance, and standard deviation.",
        formula: "\\bar{x} = \\frac{\\sum x_i}{n}",
      },
      {
        id: "regression",
        title: "Regression",
        description:
          "Simple linear model, correlation, and significance summary.",
        formula: "\\hat{y} = a + bx",
      },
      {
        id: "box-plot",
        title: "Box Plot",
        description:
          "Five-number summary, IQR fences, whiskers, and outlier checks.",
        formula: "IQR = Q_3 - Q_1",
      },
      {
        id: "special-means",
        title: "Special Means",
        description:
          "Trimean, geometric mean, and trimmed-mean analysis.",
        formula: "T = \\frac{Q_1 + 2Q_2 + Q_3}{4}",
      },
    ],
  },
  reference: {
    slug: "reference",
    title: "Reference",
    description:
      "Lookup tables for critical values and normal cumulative probability.",
    tools: [
      {
        id: "statistical-tables",
        title: "Statistical Tables",
        description:
          "t, z, chi-square, and F distribution lookup structure.",
        formula: "Critical values by alpha and degrees of freedom",
      },
    ],
  },
};
