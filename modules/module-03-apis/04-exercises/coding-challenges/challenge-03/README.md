# Coding Challenge 03: Token Bucket Rate Limiter

## Problem Statement

Implement the token bucket algorithm from scratch: a bucket holds up to `capacity` tokens, refilling at `refillRatePerSecond`. Each request consumes one token; if the bucket is empty, the request is rejected with a `retryAfterMs` hint. Then wrap it in a per-user `RateLimiter`.

This is the algorithm referenced throughout [Module 03's deep dive](../../../02-deep-dive/README.md) and used again, distributed across nodes, in [Module 20](../../../../module-20-advanced-patterns/01-concepts/README.md).

## Requirements

1. `TokenBucket.consume(tokens = 1)` — lazily refills based on elapsed time since the last refill, then attempts to consume; returns `{ allowed, tokensRemaining, retryAfterMs? }`.
2. `RateLimiter.checkLimit(userId)` — looks up (or creates) a `TokenBucket` per user and delegates to `consume()`.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expected behavior: with `capacity: 5, refillRatePerSecond: 1`, the first 5 requests succeed immediately, the 6th and 7th are rejected with a `retryAfterMs`, and after waiting 3 seconds, 3 more tokens have refilled.
