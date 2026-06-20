# Coding Challenge 02: Presence System (Heartbeat + Redis TTL)

## Problem Statement

Implement a presence system in TypeScript using a heartbeat + TTL pattern: `PresenceTracker.heartbeat(userId)` refreshes a TTL-backed key for that user, `PresenceTracker.isOnline(userId)` checks whether that key hasn't expired, and a background sweep periodically detects expired users and marks them offline (e.g., by emitting/logging an "offline" transition rather than waiting for someone to call `isOnline` to notice).

> 💡 **Note:** This exercise uses an in-memory mock (`InMemoryTtlClient`) instead of a real Redis connection, so it runs with zero infrastructure. The mock's interface mirrors `ioredis`'s method shapes (`set` with an expiry option, `pexpiretime`-style expiry lookup, `del`) — to use real Redis: `npm install ioredis`, then replace `InMemoryTtlClient` with an `ioredis`-backed implementation of the same `TtlClient` interface. No change to `PresenceTracker` itself would be required.

## Requirements

1. `TtlClient` interface: `set(key, value, ttlMs)`, `get(key)`, `getExpiry(key)` (returns the epoch ms the key expires at, or `null` if absent/expired), `del(key)`.
2. `PresenceTracker.heartbeat(userId)` — refreshes (or creates) a TTL key for the user with a configured timeout window, and if the user was previously offline, emits an "online" transition.
3. `PresenceTracker.isOnline(userId)` — returns `true` only if the user's key exists and hasn't expired.
4. `PresenceTracker.startSweep(intervalMs)` / `stopSweep()` — a background interval that periodically checks all tracked users and emits an "offline" transition for any whose TTL has lapsed since the last sweep, so offline detection doesn't depend on someone happening to call `isOnline`.

## Why This Matters

This is the hands-on version of the presence section in [`01-concepts/README.md`](../../../01-concepts/README.md): "online" is never a fact the server has perfect real-time knowledge of — it's an inference from "have I heard a heartbeat recently enough," bounded by however the TTL/timeout is configured. Building it makes that approximation, and the trade-off between sweep frequency and detection latency, concrete instead of abstract.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node solution.ts
```

Expect to see several simulated users heartbeating on different intervals, one user heartbeating normally then going silent, and — once enough simulated time has passed without a heartbeat from that user — the background sweep detecting and reporting the transition to "offline," while the other users remain online throughout.
