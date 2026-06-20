// SOLUTION FILE — try starter.ts first!
/**
 * Capacity Estimator
 * Module: 01 — Foundations of System Design
 * Concept: Back-of-envelope estimation is a core system design skill.
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

interface SystemParams {
  dailyActiveUsers: number;
  averageRequestsPerUserPerDay: number;
  averageRequestSizeBytes: number;
  readToWriteRatio: number; // e.g. 10 means 10 reads per 1 write
  dataRetentionYears: number;
}

interface CapacityEstimate {
  totalRequestsPerDay: number;
  averageQPS: number;
  peakQPS: number; // assume peak = 2x average
  readQPS: number;
  writeQPS: number;
  dailyStorageGB: number;
  totalStorageGB: number;
  dailyBandwidthGbps: number;
}

const SECONDS_PER_DAY = 86_400;

function estimateCapacity(params: SystemParams): CapacityEstimate {
  const totalRequestsPerDay =
    params.dailyActiveUsers * params.averageRequestsPerUserPerDay;

  const averageQPS = totalRequestsPerDay / SECONDS_PER_DAY;
  const peakQPS = averageQPS * 2;

  // Only writes consume new storage; reads don't. Splitting QPS by the
  // read:write ratio is what lets us size storage and write-path capacity
  // independently of read-path capacity (caching, replicas) later on.
  const ratio = params.readToWriteRatio;
  const readQPS = peakQPS * (ratio / (ratio + 1));
  const writeQPS = peakQPS * (1 / (ratio + 1));

  const dailyStorageGB =
    (writeQPS * SECONDS_PER_DAY * params.averageRequestSizeBytes) / 1e9;
  const totalStorageGB =
    dailyStorageGB * 365 * params.dataRetentionYears;

  const dailyBandwidthGbps =
    (totalRequestsPerDay * params.averageRequestSizeBytes) /
    SECONDS_PER_DAY /
    1e9;

  return {
    totalRequestsPerDay,
    averageQPS,
    peakQPS,
    readQPS,
    writeQPS,
    dailyStorageGB,
    totalStorageGB,
    dailyBandwidthGbps,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatEstimate(params: SystemParams, estimate: CapacityEstimate): void {
  console.log("=== Input Parameters ===");
  console.log(`DAU: ${params.dailyActiveUsers.toLocaleString()}`);
  console.log(`Requests/user/day: ${params.averageRequestsPerUserPerDay}`);
  console.log(`Avg request size: ${params.averageRequestSizeBytes} bytes`);
  console.log(`Read:Write ratio: ${params.readToWriteRatio}:1`);
  console.log(`Retention: ${params.dataRetentionYears} years`);

  console.log("\n=== Capacity Estimate ===");
  console.log(`Total requests/day: ${estimate.totalRequestsPerDay.toLocaleString()}`);
  console.log(`Average QPS: ${round2(estimate.averageQPS).toLocaleString()}`);
  console.log(`Peak QPS (2x avg): ${round2(estimate.peakQPS).toLocaleString()}`);
  console.log(`Read QPS: ${round2(estimate.readQPS).toLocaleString()}`);
  console.log(`Write QPS: ${round2(estimate.writeQPS).toLocaleString()}`);
  console.log(`Daily storage: ${round2(estimate.dailyStorageGB)} GB`);
  console.log(`Total storage (${params.dataRetentionYears}y): ${round2(estimate.totalStorageGB).toLocaleString()} GB`);
  console.log(`Daily bandwidth: ${round2(estimate.dailyBandwidthGbps)} GB/s equivalent`);
}

// === USAGE EXAMPLE ===
const twitterLike: SystemParams = {
  dailyActiveUsers: 100_000_000,
  averageRequestsPerUserPerDay: 10,
  averageRequestSizeBytes: 1024,
  readToWriteRatio: 10,
  dataRetentionYears: 5,
};

const estimate = estimateCapacity(twitterLike);
formatEstimate(twitterLike, estimate);
