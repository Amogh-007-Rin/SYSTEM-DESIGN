/**
 * Token Bucket Rate Limiter
 * Module: 03 — API Design
 * Concept: Token bucket is the most common API rate limiting algorithm.
 *   Tokens refill at a fixed rate. Each request consumes one token.
 *   If empty, request is rejected.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface TokenBucketConfig {
  capacity: number;           // Max tokens in bucket
  refillRatePerSecond: number; // Tokens added per second
}

interface RateLimitResult {
  allowed: boolean;
  tokensRemaining: number;
  retryAfterMs?: number;
}

/**
 * TODO: Implement TokenBucket class.
 *
 * private refill(): void
 *   - elapsed = Date.now() - lastRefillTime
 *   - tokensToAdd = elapsed * refillRatePerSecond / 1000
 *   - currentTokens = min(capacity, currentTokens + tokensToAdd)
 *   - lastRefillTime = Date.now()
 *
 * consume(tokens = 1): RateLimitResult
 *   - Call refill() first
 *   - If currentTokens >= tokens: subtract, return allowed: true
 *   - Else: return allowed: false, retryAfterMs = (tokens - currentTokens) / refillRatePerSecond * 1000
 */
class TokenBucket {
  private capacity: number;
  private refillRatePerSecond: number;
  private currentTokens: number;
  private lastRefillTime: number;

  constructor(config: TokenBucketConfig) {
    this.capacity = config.capacity;
    this.refillRatePerSecond = config.refillRatePerSecond;
    this.currentTokens = config.capacity;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    // TODO: implement
  }

  consume(tokens: number = 1): RateLimitResult {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

/**
 * TODO: Implement RateLimiter — a per-user map of TokenBuckets.
 * checkLimit(userId): get or create bucket for userId, call consume()
 */
class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private config: TokenBucketConfig;

  constructor(config: TokenBucketConfig) {
    this.config = config;
  }

  checkLimit(userId: string): RateLimitResult {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// === USAGE EXAMPLE ===
const limiter = new RateLimiter({ capacity: 5, refillRatePerSecond: 1 });

async function simulate(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const result = limiter.checkLimit("alice");
    const icon = result.allowed ? "✅" : "❌";
    console.log(`Request ${i + 1}: ${icon} | Tokens left: ${result.tokensRemaining}${result.retryAfterMs ? ` | Retry after: ${result.retryAfterMs}ms` : ""}`);
    if (i === 6) {
      console.log("--- Waiting 3 seconds for token refill ---");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
simulate();
