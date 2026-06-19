/**
 * Canary Deployment Router and Promotion Decision Simulator
 * Module: 20 — Advanced Patterns & Putting It All Together
 * Concept: A canary deployment routes a small, configurable percentage of
 *   real traffic to a new ("canary") version while the rest continues to
 *   the proven ("stable") version, then watches a concrete signal — here,
 *   error rate — to decide whether to promote the canary to 100% of traffic
 *   or roll it back to 0%. The critical design point this file illustrates:
 *   "looks fine" is not a decision criterion — you need a stated threshold
 *   and a statistically meaningful sample size before acting, or you risk
 *   promoting a broken version on a lucky run of canary requests (too few
 *   samples) or rolling back a healthy one on ordinary noise.
 * Run: npx ts-node canary-router.ts
 * Dependencies: none
 */

interface VersionBehavior {
  name: string;
  /** Probability (0–1) that a single request to this version fails. */
  errorRate: number;
}

interface RoutingDecisionInput {
  canaryRequests: number;
  canaryErrors: number;
  stableRequests: number;
  stableErrors: number;
  /** Minimum canary sample size before any promote/rollback decision is trusted. */
  minSampleSize: number;
  /** How many percentage points worse than stable the canary can be before we roll back. */
  errorRateRegressionThreshold: number;
}

type RoutingDecision = "PROMOTE" | "ROLLBACK" | "CONTINUE_MONITORING";

/** Routes one simulated request to canary or stable based on the configured traffic split, and returns whether that request failed. */
function routeRequest(
  canaryTrafficPercent: number,
  stable: VersionBehavior,
  canary: VersionBehavior
): { routedTo: "stable" | "canary"; failed: boolean } {
  const routedToCanary = Math.random() * 100 < canaryTrafficPercent;
  const version = routedToCanary ? canary : stable;
  const failed = Math.random() < version.errorRate;
  return { routedTo: routedToCanary ? "canary" : "stable", failed };
}

/** Decides what to do based on accumulated canary vs. stable results. This is the heart of the pattern: a stated, reproducible decision rule instead of "eyeballing the dashboard." */
function decideRouting(input: RoutingDecisionInput): RoutingDecision {
  if (input.canaryRequests < input.minSampleSize) {
    return "CONTINUE_MONITORING"; // not enough data yet — don't act on noise
  }

  const canaryErrorRate = input.canaryErrors / input.canaryRequests;
  const stableErrorRate = input.stableRequests > 0 ? input.stableErrors / input.stableRequests : 0;
  const regression = canaryErrorRate - stableErrorRate;

  if (regression > input.errorRateRegressionThreshold) {
    return "ROLLBACK";
  }
  return "PROMOTE";
}

/** Runs a full canary rollout simulation for one (stable, canary) pair and prints the outcome. */
function runCanarySimulation(
  label: string,
  stable: VersionBehavior,
  canary: VersionBehavior,
  totalRequests: number,
  canaryTrafficPercent: number
): void {
  let canaryRequests = 0;
  let canaryErrors = 0;
  let stableRequests = 0;
  let stableErrors = 0;

  for (let i = 0; i < totalRequests; i++) {
    const result = routeRequest(canaryTrafficPercent, stable, canary);
    if (result.routedTo === "canary") {
      canaryRequests++;
      if (result.failed) canaryErrors++;
    } else {
      stableRequests++;
      if (result.failed) stableErrors++;
    }
  }

  const canaryErrorRate = canaryRequests > 0 ? canaryErrors / canaryRequests : 0;
  const stableErrorRate = stableRequests > 0 ? stableErrors / stableRequests : 0;

  const decision = decideRouting({
    canaryRequests,
    canaryErrors,
    stableRequests,
    stableErrors,
    minSampleSize: 200,
    errorRateRegressionThreshold: 0.02, // canary can be up to 2 percentage points worse before rollback
  });

  console.log(`=== ${label} ===`);
  console.log(`Traffic split: ${canaryTrafficPercent}% canary / ${100 - canaryTrafficPercent}% stable`);
  console.log(`Stable : ${stableRequests} requests, ${stableErrors} errors (${(stableErrorRate * 100).toFixed(2)}% error rate)`);
  console.log(`Canary : ${canaryRequests} requests, ${canaryErrors} errors (${(canaryErrorRate * 100).toFixed(2)}% error rate)`);
  console.log(
    `Error rate regression (canary - stable): ${((canaryErrorRate - stableErrorRate) * 100).toFixed(2)} percentage points`
  );
  console.log(`Decision: ${decision}\n`);
}

// === USAGE EXAMPLE ===
function main(): void {
  console.log("Canary Deployment Router — simulating production traffic against stable vs. canary versions\n");

  // Scenario 1: canary is healthy — same error rate as stable. Expect PROMOTE.
  runCanarySimulation(
    "Scenario 1: Healthy canary (same error rate as stable)",
    { name: "stable-v1", errorRate: 0.01 },
    { name: "canary-v2", errorRate: 0.01 },
    5_000,
    10
  );

  // Scenario 2: canary has a real regression (5x the error rate). Expect ROLLBACK.
  runCanarySimulation(
    "Scenario 2: Broken canary (5x stable's error rate)",
    { name: "stable-v1", errorRate: 0.01 },
    { name: "canary-v2", errorRate: 0.05 },
    5_000,
    10
  );

  // Scenario 3: canary is actually an improvement (lower error rate). Expect PROMOTE.
  runCanarySimulation(
    "Scenario 3: Improved canary (lower error rate than stable)",
    { name: "stable-v1", errorRate: 0.03 },
    { name: "canary-v2", errorRate: 0.005 },
    5_000,
    10
  );

  // Scenario 4: very small traffic percentage + early in rollout -> not enough
  // samples yet to trust a decision. Expect CONTINUE_MONITORING.
  runCanarySimulation(
    "Scenario 4: Just started rollout (1% traffic, small total volume)",
    { name: "stable-v1", errorRate: 0.01 },
    { name: "canary-v2", errorRate: 0.08 },
    1_000,
    1
  );

  console.log(
    "Key point: the decision rule requires both a minimum sample size and a stated regression threshold — " +
      "without both, a canary rollout is just routing traffic with no actual safety mechanism attached to it."
  );
}

main();
