# Coding Challenge 01: Capacity Estimator

## Problem Statement

Implement `estimateCapacity()`, a function that takes a small set of system parameters (daily active users, average requests per user, average request size, read:write ratio, retention period) and returns a complete capacity estimate: total daily requests, average and peak QPS, split read/write QPS, daily storage, total storage over the retention period, and daily bandwidth.

This is the mechanical core of the [capacity estimation deep dive](../../../02-deep-dive/README.md) — turning a product description into the numbers that justify (or rule out) an architecture.

## Requirements

Implement the steps documented in the comments of `starter.ts`:

1. `totalRequestsPerDay = dailyActiveUsers × averageRequestsPerUserPerDay`
2. `averageQPS = totalRequestsPerDay / 86400`
3. `peakQPS = averageQPS × 2`
4. `readQPS = peakQPS × (ratio / (ratio + 1))`
5. `writeQPS = peakQPS × (1 / (ratio + 1))`
6. `dailyStorageGB = (writeQPS × 86400 × avgSizeBytes) / 1e9`
7. `totalStorageGB = dailyStorageGB × 365 × retentionYears`
8. `dailyBandwidthGbps = (totalRequestsPerDay × avgSizeBytes) / 86400 / 1e9` (converted to bits if you want true Gbps — see solution notes)

Also implement `formatEstimate()`, which prints a human-readable summary of the inputs and the resulting estimate, rounded to 2 decimal places.

## Starter / Solution

- [`starter.ts`](./starter.ts) — skeleton with `TODO`s
- [`solution.ts`](./solution.ts) — reference implementation

## Usage Example

```bash
npx ts-node starter.ts
```

Expected output (once implemented) for the built-in 100M-DAU Twitter-like example: average QPS in the low tens of thousands, total 5-year storage in the hundreds of terabytes.
