/**
 * Scaling Laws Calculator: Amdahl's Law + Little's Law
 * Module: 06 — Scalability
 * Concept: Two of the foundational equations for reasoning quantitatively
 *   about scaling instead of guessing. Amdahl's Law caps the maximum speedup
 *   parallelization can ever deliver, given how much of a workload is
 *   serial. Little's Law (L = λW) converts arrival rate + latency directly
 *   into the concurrency a system must be provisioned to hold.
 * Run: npx ts-node scaling-laws-calculator.ts
 * Dependencies: none
 */

// AMDAHL'S LAW: Speedup(N) = 1 / ((1 - P) + P/N)
// P = the fraction of the workload that can run in parallel.
// N = number of workers/processors thrown at the parallel portion.
// The (1 - P) term is the serial portion — it runs no matter how big N
// gets, which is exactly why speedup saturates instead of growing forever.
function amdahlSpeedup(parallelFraction: number, workers: number): number {
  if (parallelFraction < 0 || parallelFraction > 1) {
    throw new Error("parallelFraction must be between 0 and 1");
  }
  const serialFraction = 1 - parallelFraction;
  return 1 / (serialFraction + parallelFraction / workers);
}

// The theoretical ceiling as workers -> infinity. Useful to show a team
// *why* throwing more machines at a problem eventually stops paying off.
function amdahlMaxSpeedup(parallelFraction: number): number {
  const serialFraction = 1 - parallelFraction;
  // As N -> infinity, P/N -> 0, so speedup approaches 1 / (1 - P).
  return 1 / serialFraction;
}

// LITTLE'S LAW: L = λ * W
// L = average number of items "in the system" (e.g. concurrent requests).
// λ = average arrival rate (e.g. requests per second).
// W = average time an item spends in the system (e.g. latency in seconds).
//
// This is exact (not a heuristic) for any stable queueing system, and it's
// the quickest way to turn "requests/sec" and "latency" into "how many
// concurrent in-flight requests must my server/connection-pool support?"
function littlesLawConcurrency(arrivalRatePerSecond: number, avgLatencySeconds: number): number {
  return arrivalRatePerSecond * avgLatencySeconds;
}

// Demonstrates the "death spiral" Little's Law predicts: if latency rises
// while arrival rate holds steady, required concurrency rises in lockstep.
// A fixed-size thread/connection pool will start queueing (or rejecting)
// requests well before the system visibly "looks" overloaded.
function simulateLatencyDegradation(
  arrivalRatePerSecond: number,
  latencyStagesSeconds: number[]
): { latencySeconds: number; requiredConcurrency: number }[] {
  return latencyStagesSeconds.map((latencySeconds) => ({
    latencySeconds,
    requiredConcurrency: littlesLawConcurrency(arrivalRatePerSecond, latencySeconds),
  }));
}

// === USAGE EXAMPLE ===

console.log("=== Amdahl's Law: Speedup vs. Worker Count ===");
console.log("A workload that is 90% parallelizable (P = 0.9):\n");

const parallelFraction = 0.9;
const workerCounts = [1, 2, 4, 8, 16, 32, 64, 128, 1024];

for (const workers of workerCounts) {
  const speedup = amdahlSpeedup(parallelFraction, workers);
  console.log(`  ${String(workers).padStart(5)} workers -> ${speedup.toFixed(2)}x speedup`);
}

const ceiling = amdahlMaxSpeedup(parallelFraction);
console.log(`\nTheoretical maximum speedup as workers -> infinity: ${ceiling.toFixed(2)}x`);
console.log("(the unparallelizable 10% of the work caps total speedup at 10x, forever)\n");

console.log("Compare to a workload that is 99% parallelizable (P = 0.99):");
console.log(`  Max speedup ceiling: ${amdahlMaxSpeedup(0.99).toFixed(2)}x`);
console.log("(shrinking the serial portion from 10% to 1% raised the ceiling from 10x to 100x —");
console.log(" this is why reducing serial work often beats adding more parallel workers)\n");

console.log("=== Little's Law: Required Concurrency from Arrival Rate + Latency ===\n");

const arrivalRate = 1000; // requests per second
console.log(`Service receiving ${arrivalRate} requests/sec:\n`);

const latencyStages = [0.05, 0.1, 0.2, 0.5, 1.0, 2.0]; // seconds, simulating degradation
const results = simulateLatencyDegradation(arrivalRate, latencyStages);

for (const { latencySeconds, requiredConcurrency } of results) {
  console.log(
    `  avg latency ${(latencySeconds * 1000).toString().padStart(5)}ms -> ` +
      `must support ${requiredConcurrency.toFixed(0).padStart(5)} concurrent in-flight requests`
  );
}

console.log(
  "\nNotice: as latency rises 40x (50ms -> 2000ms) at a FIXED arrival rate, required"
);
console.log(
  "concurrency also rises 40x. A server sized for the 50ms case (50 concurrent slots)"
);
console.log(
  "would be catastrophically under-provisioned once latency degrades to 2000ms (2000 slots"
);
console.log("needed) — this is the mechanism behind cascading overload under load.");
