/**
 * Exponential Backoff With and Without Jitter — Retry Storm Simulator
 * Module: 20 — Advanced Patterns & Putting It All Together
 * Concept: When many clients fail at the same moment (e.g., a downstream
 *   dependency blips), naive exponential backoff alone doesn't desynchronize
 *   them — every client computes the same delay sequence (1s, 2s, 4s, ...)
 *   and retries in lockstep, hitting the recovering dependency with
 *   synchronized waves of traffic instead of smooth, spread-out load. Adding
 *   random jitter to each client's delay breaks that synchronization. This
 *   simulation runs many simulated clients through both strategies against
 *   the same failure scenario and measures the peak number of clients
 *   retrying in the same instant — the number that directly determines how
 *   hard each retry wave hits the dependency.
 * Run: npx ts-node exponential-backoff-jitter.ts
 * Dependencies: none
 */

interface RetryConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  maxAttempts: number;
}

/** Strategy 1: plain exponential backoff, no randomness — every client with the same attempt number computes the exact same delay. */
function exponentialDelayMs(attempt: number, config: RetryConfig): number {
  const raw = config.baseDelayMs * 2 ** attempt;
  return Math.min(raw, config.maxDelayMs);
}

/** Strategy 2: "full jitter" — pick a uniformly random delay between 0 and the exponential value. This is the variant AWS's own retry-storm analysis found most effective at spreading out retries. */
function fullJitterDelayMs(attempt: number, config: RetryConfig): number {
  const cap = exponentialDelayMs(attempt, config);
  return Math.random() * cap;
}

/**
 * Simulates one client repeatedly retrying a call that fails on every
 * attempt except the last (the dependency "recovers" at a fixed time).
 * Returns the list of (virtual) millisecond timestamps at which this client
 * issued a retry attempt, relative to the initial failure at t=0.
 */
function simulateClientRetryTimeline(
  config: RetryConfig,
  delayFn: (attempt: number, config: RetryConfig) => number
): number[] {
  const retryTimestamps: number[] = [];
  let clock = 0;
  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    const delay = delayFn(attempt, config);
    clock += delay;
    retryTimestamps.push(Math.round(clock));
  }
  return retryTimestamps;
}

/**
 * Buckets every client's retry timestamps into fixed-width time windows and
 * returns the peak number of retries landing in any single window — this is
 * the "retry storm intensity" metric: how concentrated the retry traffic is.
 */
function peakConcurrentRetries(allClientTimelines: number[][], bucketWidthMs: number): {
  peakCount: number;
  peakBucketStartMs: number;
  histogram: Map<number, number>;
} {
  const histogram = new Map<number, number>();
  for (const timeline of allClientTimelines) {
    for (const ts of timeline) {
      const bucket = Math.floor(ts / bucketWidthMs) * bucketWidthMs;
      histogram.set(bucket, (histogram.get(bucket) ?? 0) + 1);
    }
  }
  let peakCount = 0;
  let peakBucketStartMs = 0;
  for (const [bucket, count] of histogram) {
    if (count > peakCount) {
      peakCount = count;
      peakBucketStartMs = bucket;
    }
  }
  return { peakCount, peakBucketStartMs, histogram };
}

function printHistogramSummary(label: string, histogram: Map<number, number>, bucketWidthMs: number): void {
  const sortedBuckets = Array.from(histogram.entries()).sort((a, b) => a[0] - b[0]);
  console.log(`  ${label} — retries per ${bucketWidthMs}ms window (first 8 non-empty windows):`);
  for (const [bucket, count] of sortedBuckets.slice(0, 8)) {
    const bar = "#".repeat(Math.min(count, 80));
    console.log(`    t=${bucket.toString().padStart(6)}ms : ${count.toString().padStart(4)} ${bar}`);
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const clientCount = 500;
  const config: RetryConfig = { baseDelayMs: 200, maxDelayMs: 6_400, maxAttempts: 6 };
  const bucketWidthMs = 50;

  console.log("=== Retry Storm Simulation ===");
  console.log(
    `${clientCount} clients all experience the same failure at t=0 (e.g., a downstream dependency blip), ` +
      `then independently retry using ${config.maxAttempts} attempts each.\n`
  );

  // Every client experiences the identical failure at t=0 — this is the
  // worst case for synchronization: a shared outage with a shared start time.
  console.log("--- Strategy A: Plain exponential backoff (no jitter) ---");
  const noJitterTimelines = Array.from({ length: clientCount }, () =>
    simulateClientRetryTimeline(config, exponentialDelayMs)
  );
  const noJitterResult = peakConcurrentRetries(noJitterTimelines, bucketWidthMs);
  printHistogramSummary("No jitter", noJitterResult.histogram, bucketWidthMs);
  console.log(
    `  => Peak concurrent retries in a single ${bucketWidthMs}ms window: ${noJitterResult.peakCount} ` +
      `(at t=${noJitterResult.peakBucketStartMs}ms)\n`
  );

  console.log("--- Strategy B: Exponential backoff WITH full jitter ---");
  const jitterTimelines = Array.from({ length: clientCount }, () =>
    simulateClientRetryTimeline(config, fullJitterDelayMs)
  );
  const jitterResult = peakConcurrentRetries(jitterTimelines, bucketWidthMs);
  printHistogramSummary("With jitter", jitterResult.histogram, bucketWidthMs);
  console.log(
    `  => Peak concurrent retries in a single ${bucketWidthMs}ms window: ${jitterResult.peakCount} ` +
      `(at t=${jitterResult.peakBucketStartMs}ms)\n`
  );

  console.log("=== Comparison ===");
  console.log(`Without jitter, peak retries/window: ${noJitterResult.peakCount} (clients retry in synchronized waves)`);
  console.log(`With jitter,    peak retries/window: ${jitterResult.peakCount} (retries are spread out over time)`);
  const reductionFactor = noJitterResult.peakCount / Math.max(jitterResult.peakCount, 1);
  console.log(
    `Jitter reduced the peak instantaneous retry load by ~${reductionFactor.toFixed(1)}x for the same ${clientCount} clients.`
  );
  console.log(
    "\nConclusion: exponential backoff alone does not desynchronize clients that failed at the same moment — " +
      "they all compute the same delay sequence and retry in lockstep. Adding randomness (full jitter) is what " +
      "actually spreads retry load over time, reducing the chance that a recovering dependency gets hit with " +
      "another synchronized wave and falls back over."
  );
}

main();
