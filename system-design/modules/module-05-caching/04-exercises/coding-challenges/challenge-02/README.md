# Coding Challenge 02: Cache-Aside Pattern with a Redis-Shaped Client

## Problem Statement

Implement the cache-aside pattern against a mock database and a cache client that exposes the same shape as a real Redis client (`get`, `set` with a TTL, `del`) — so swapping the mock for `ioredis` later is a one-line change, not a rewrite.

> 💡 **Note:** This exercise uses an in-memory mock (`InMemoryCacheClient`) instead of a real Redis connection, so it runs with zero infrastructure. To use real Redis: `npm install ioredis`, then replace `InMemoryCacheClient` with an `ioredis`-backed implementation of the same `CacheClient` interface — `get`/`setex`/`del` map almost directly onto `ioredis`'s own method names.

## Requirements

1. `CacheClient` interface: `get(key)`, `setex(key, ttlSeconds, value)`, `del(key)`.
2. `CacheAsideRepository.getUser(id)` — checks the cache first; on a miss, reads from the mock database, populates the cache with a TTL, and returns the value.
3. `CacheAsideRepository.updateUser(id, data)` — writes to the database, then invalidates (deletes) the cache entry, so the next read repopulates it from fresh data.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expect the first read to be slow (cache miss, hits the mock DB), the second read to be fast (cache hit), and a read immediately after an update to be slow again (cache was invalidated) but return the updated value.
