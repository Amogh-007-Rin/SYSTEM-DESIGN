/**
 * Cache Patterns: Cache-Aside vs. Write-Through
 * Module: 05 — Caching
 * Concept: Demonstrates the two most common caching patterns against a mock
 *   database with an artificial latency cost, making the "cache avoids the
 *   slow path" claim measurable rather than just asserted.
 * Run: npx ts-node cache-patterns.ts
 * Dependencies: none
 */

interface MockDatabase {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

// Simulates real database latency so cache hits vs. misses are measurably different.
function createMockDatabase(latencyMs: number): MockDatabase {
  const store = new Map<string, string>();
  return {
    async get(key) {
      await new Promise((r) => setTimeout(r, latencyMs));
      return store.get(key);
    },
    async set(key, value) {
      await new Promise((r) => setTimeout(r, latencyMs));
      store.set(key, value);
    },
  };
}

// CACHE-ASIDE: the application owns the caching logic. On a miss, it reads
// from the database and populates the cache itself. The cache is never
// written to except as a side effect of a read miss (or explicit invalidation).
class CacheAsideStore {
  private cache = new Map<string, string>();
  constructor(private db: MockDatabase) {}

  async get(key: string): Promise<string | undefined> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = await this.db.get(key);
    if (value !== undefined) this.cache.set(key, value);
    return value;
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

// WRITE-THROUGH: every write goes to both the cache and the database,
// synchronously, before the write is considered complete. Reads are always
// served from the cache and are guaranteed to reflect the latest write.
class WriteThroughStore {
  private cache = new Map<string, string>();
  constructor(private db: MockDatabase) {}

  async get(key: string): Promise<string | undefined> {
    return this.cache.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.db.set(key, value); // write source of truth first
    this.cache.set(key, value); // then update the cache to match
  }
}

async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const result = await fn();
  console.log(`${label}: ${Date.now() - start}ms`);
  return result;
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const DB_LATENCY_MS = 50;

  console.log("=== Cache-Aside ===");
  const db1 = createMockDatabase(DB_LATENCY_MS);
  await db1.set("user:1", "Alice");
  const cacheAside = new CacheAsideStore(db1);

  await timed("First read (cache miss, hits DB)", () => cacheAside.get("user:1"));
  await timed("Second read (cache hit)", () => cacheAside.get("user:1"));

  console.log("\n=== Write-Through ===");
  const db2 = createMockDatabase(DB_LATENCY_MS);
  const writeThrough = new WriteThroughStore(db2);

  await timed("Write (goes to DB + cache)", () => writeThrough.set("user:2", "Bob"));
  await timed("Read immediately after write (served from cache, already fresh)", () =>
    writeThrough.get("user:2")
  );
}

main();
