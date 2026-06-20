/**
 * Capacity Estimator
 * Module: 01 — Foundations of System Design
 * Concept: Back-of-envelope estimation is a core system design skill.
 * Run: npx ts-node starter.ts
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

/**
 * TODO: Implement this function.
 * Steps:
 * 1. totalRequests = DAU × requestsPerUser
 * 2. averageQPS = totalRequests / 86400
 * 3. peakQPS = averageQPS × 2
 * 4. readQPS = peakQPS × (ratio / (ratio + 1))
 * 5. writeQPS = peakQPS × (1 / (ratio + 1))
 * 6. dailyStorageGB = (writeQPS × 86400 × avgSizeBytes) / 1e9
 * 7. totalStorageGB = dailyStorageGB × 365 × retentionYears
 * 8. dailyBandwidthGbps = (totalRequests × avgSizeBytes) / 86400 / 1e9
 */
function estimateCapacity(params: SystemParams): CapacityEstimate {
  // TODO: implement
  throw new Error("Not implemented");
}

function formatEstimate(params: SystemParams, estimate: CapacityEstimate): void {
  // TODO: print a human-readable summary — round all numbers to 2 decimal places
  throw new Error("Not implemented");
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
