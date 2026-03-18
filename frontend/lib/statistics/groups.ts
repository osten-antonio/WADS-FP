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
        formula: "P(min <= X <= max) = sum[k=min..max] C(n,k) * p^k * (1-p)^(n-k)",
      },
      {
        id: "poisson",
        title: "Poisson",
        description:
          "Event-count probability from average rate lambda, including ranges.",
        formula: "P(X = k) = (lambda^k * e^(-lambda)) / k!",
      },
      {
        id: "hypergeometric",
        title: "Hypergeometric",
        description:
          "Sampling without replacement from a finite population.",
        formula:
          "P(X = k) = [C(K,k) * C(N-K,n-k)] / C(N,n)",
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
        formula: "P(n,r) = n! / (n-r)!",
      },
      {
        id: "combinations",
        title: "Combinations",
        description:
          "Unordered selection count of r objects selected from n.",
        formula: "C(n,r) = n! / (r! * (n-r)!)",
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
        formula: "t = (x_bar - mu_0) / (s / sqrt(n))",
      },
      {
        id: "chi-square",
        title: "Chi-Square",
        description:
          "Goodness-of-fit and independence tests with expected counts.",
        formula: "chi^2 = sum((O - E)^2 / E)",
      },
      {
        id: "anova",
        title: "ANOVA",
        description:
          "One-way and two-way variance decomposition and F testing.",
        formula: "F = MS_between / MS_within",
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
        formula: "x_bar = (sum x_i) / n",
      },
      {
        id: "regression",
        title: "Regression",
        description:
          "Simple linear model, correlation, and significance summary.",
        formula: "y_hat = a + b*x",
      },
      {
        id: "box-plot",
        title: "Box Plot",
        description:
          "Five-number summary, IQR fences, whiskers, and outlier checks.",
        formula: "IQR = Q3 - Q1",
      },
      {
        id: "special-means",
        title: "Special Means",
        description:
          "Trimean, geometric mean, and trimmed-mean analysis.",
        formula: "T = (Q1 + 2*Q2 + Q3) / 4",
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
