/**
 * Cache-Aside Pattern with a Redis-Shaped Client
 * Module: 05 — Caching
 * Concept: The cache-aside pattern: check cache, fall back to the database on
 *   a miss, populate the cache, and invalidate on writes. The CacheClient
 *   interface mirrors ioredis's method shapes so swapping in real Redis
 *   later requires no change to CacheAsideRepository itself.
 * Run: npx ts-node starter.ts
 * Dependencies: none (in-memory mock — see README for the real-Redis swap)
 */

interface CacheClient {
  get(key: string): Promise<string | null>;
  setex(key: string, ttlSeconds: number, value: string): Promise<void>;
  del(key: string): Promise<void>;
}

// A zero-infrastructure stand-in for ioredis with the same method shapes.
class InMemoryCacheClient implements CacheClient {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.value;
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

interface User {
  id: string;
  name: string;
  email: string;
}

class MockUserDatabase {
  private users = new Map<string, User>();
  constructor(seed: User[]) {
    seed.forEach((u) => this.users.set(u.id, u));
  }

  async findById(id: string): Promise<User | null> {
    await new Promise((r) => setTimeout(r, 50)); // simulate DB latency
    return this.users.get(id) ?? null;
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await new Promise((r) => setTimeout(r, 50));
    const existing = this.users.get(id);
    if (existing) this.users.set(id, { ...existing, ...data });
  }
}

/**
 * TODO: Implement CacheAsideRepository.
 *
 * getUser(id): Promise<User | null>
 *   - cacheKey = `user:${id}`
 *   - Try cache.get(cacheKey); if hit, JSON.parse and return it.
 *   - On miss, db.findById(id); if found, cache.setex(cacheKey, ttlSeconds, JSON.stringify(user))
 *   - Return the user (or null).
 *
 * updateUser(id, data): Promise<void>
 *   - db.update(id, data)
 *   - cache.del(`user:${id}`)  — invalidate so the next read repopulates fresh data
 */
class CacheAsideRepository {
  constructor(
    private cache: CacheClient,
    private db: MockUserDatabase,
    private ttlSeconds: number = 60
  ) {}

  async getUser(id: string): Promise<User | null> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    // TODO: implement
  }
}

// === USAGE EXAMPLE ===
async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const result = await fn();
  console.log(`${label}: ${Date.now() - start}ms`, result);
  return result;
}

async function main(): Promise<void> {
  const db = new MockUserDatabase([{ id: "1", name: "Alice", email: "alice@example.com" }]);
  const repo = new CacheAsideRepository(new InMemoryCacheClient(), db);

  await timed("First read (cache miss)", () => repo.getUser("1"));
  await timed("Second read (cache hit)", () => repo.getUser("1"));

  await repo.updateUser("1", { email: "alice+new@example.com" });
  await timed("Read after update (cache invalidated, miss again)", () => repo.getUser("1"));
}

main();
