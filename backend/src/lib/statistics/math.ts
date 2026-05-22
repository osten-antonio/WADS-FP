// Aggregation module: re-export smaller sub-modules so the original
// `math.ts` import path remains stable while the implementation is split.

export * from "./helpers";
export * from "./probability";
export * from "./descriptive";
export * from "./regression";
export * from "./inference";
export * from "./anova";
export * from "./tables";
