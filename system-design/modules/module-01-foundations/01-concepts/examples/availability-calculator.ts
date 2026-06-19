/**
 * Availability Calculator
 * Module: 01 — Foundations of System Design
 * Concept: Availability is usually expressed in "nines" (99.9%, 99.99%...).
 *   Each additional nine cuts allowed downtime by ~10x. This file converts
 *   between an availability percentage and concrete downtime budgets,
 *   and combines the availability of components in series and in parallel.
 * Run: npx ts-node availability-calculator.ts
 * Dependencies: none
 */

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
const SECONDS_PER_MONTH = SECONDS_PER_YEAR / 12;
const SECONDS_PER_DAY = 24 * 60 * 60;

interface DowntimeBudget {
  availabilityPercent: number;
  downtimePerYear: string;
  downtimePerMonth: string;
  downtimePerDay: string;
}

// Converts an availability percentage (e.g. 99.95) into human-readable downtime budgets.
// This is the number every SLA negotiation eventually comes down to.
function downtimeBudget(availabilityPercent: number): DowntimeBudget {
  const allowedDowntimeFraction = 1 - availabilityPercent / 100;

  return {
    availabilityPercent,
    downtimePerYear: formatDuration(allowedDowntimeFraction * SECONDS_PER_YEAR),
    downtimePerMonth: formatDuration(allowedDowntimeFraction * SECONDS_PER_MONTH),
    downtimePerDay: formatDuration(allowedDowntimeFraction * SECONDS_PER_DAY),
  };
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 1) return `${(totalSeconds * 1000).toFixed(1)}ms`;
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

// Components wired in SERIES (a request must pass through all of them) multiply
// their availabilities — the chain is only as available as the product of its links.
// This is why a request that touches 5 services each at 99.99% is NOT 99.99% available
// overall: 0.9999^5 ≈ 99.95%, a meaningfully bigger downtime budget consumed.
function seriesAvailability(componentAvailabilities: number[]): number {
  return componentAvailabilities.reduce((acc, a) => acc * (a / 100), 1) * 100;
}

// Components wired in PARALLEL (redundant — only one needs to succeed) combine
// via 1 - product(failure rates). Two 99% available replicas in parallel give you
// 1 - (0.01 * 0.01) = 99.99% — redundancy is how you buy nines back.
function parallelAvailability(componentAvailabilities: number[]): number {
  const failureProduct = componentAvailabilities.reduce(
    (acc, a) => acc * (1 - a / 100),
    1
  );
  return (1 - failureProduct) * 100;
}

// === USAGE EXAMPLE ===
console.log("=== Downtime Budgets by Nines ===");
[99, 99.9, 99.95, 99.99, 99.999].forEach((pct) => {
  const budget = downtimeBudget(pct);
  console.log(
    `${pct}% → ${budget.downtimePerYear}/year | ${budget.downtimePerMonth}/month | ${budget.downtimePerDay}/day`
  );
});

console.log("\n=== Series vs Parallel: 5 services, each 99.99% available ===");
const fiveServices = [99.99, 99.99, 99.99, 99.99, 99.99];
console.log(
  `In series (request hits all 5): ${seriesAvailability(fiveServices).toFixed(4)}%`
);
console.log(
  `In parallel (only one needs to respond): ${parallelAvailability(fiveServices).toFixed(6)}%`
);

console.log("\n=== Why redundancy matters: 2 replicas at 99% each ===");
console.log(
  `Single replica: 99% | Two replicas in parallel: ${parallelAvailability([99, 99]).toFixed(2)}%`
);
