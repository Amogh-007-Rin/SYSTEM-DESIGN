// SOLUTION FILE — try starter.ts first!
/**
 * Token Bucket Rate Limiter
 * Module: 03 — API Design
 * Concept: Token bucket is the most common API rate limiting algorithm.
 *   Tokens refill at a fixed rate. Each request consumes one token.
 *   If empty, request is rejected.
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

interface TokenBucketConfig {
  capacity: number;
  refillRatePerSecond: number;
}

interface RateLimitResult {
  allowed: boolean;
  tokensRemaining: number;
  retryAfterMs?: number;
}

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

  // Lazy refill: we don't run a background timer — we compute "how many
  // tokens would have accrued since we last checked" on demand. This keeps
  // the bucket correct with zero idle CPU cost, which matters when you have
  // one bucket per user and most users aren't actively making requests.
  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTime;
    const tokensToAdd = (elapsedMs * this.refillRatePerSecond) / 1000;
    this.currentTokens = Math.min(this.capacity, this.currentTokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  consume(tokens: number = 1): RateLimitResult {
    this.refill();

    if (this.currentTokens >= tokens) {
      this.currentTokens -= tokens;
      return { allowed: true, tokensRemaining: Math.floor(this.currentTokens) };
    }

    const tokensNeeded = tokens - this.currentTokens;
    const retryAfterMs = Math.ceil((tokensNeeded / this.refillRatePerSecond) * 1000);
    return {
      allowed: false,
      tokensRemaining: Math.floor(this.currentTokens),
      retryAfterMs,
    };
  }
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private config: TokenBucketConfig;

  constructor(config: TokenBucketConfig) {
    this.config = config;
  }

  checkLimit(userId: string): RateLimitResult {
    let bucket = this.buckets.get(userId);
    if (!bucket) {
      bucket = new TokenBucket(this.config);
      this.buckets.set(userId, bucket);
    }
    return bucket.consume();
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
