# Coding Challenge 02: Connection Pool

## Problem Statement

Implement a simple connection pool: a fixed-size set of reusable "connections" (modeled as objects with a fake `query()` method and an artificial creation cost), where callers `acquire()` a connection, use it, and `release()` it back — instead of creating a new connection per use.

## Requirements

1. `ConnectionPool` is constructed with `maxSize` and a `createConnection()` factory.
2. `acquire(): Promise<PooledConnection>` — returns an idle connection immediately if one exists; otherwise creates a new one if under `maxSize`; otherwise waits in a FIFO queue until one is released.
3. `release(conn): void` — returns a connection to the idle pool and wakes the next waiter, if any.
4. Track and expose stats: `{ totalCreated, idle, inUse, waiting }`.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expect to see that with `maxSize: 2` and 5 concurrent callers, only 2 connections are ever created (`totalCreated: 2`), with the remaining 3 callers queueing until one frees up — demonstrating the exact problem connection pooling solves (see [Module 02's deep dive](../../../../module-02-networking/02-deep-dive/README.md) on connection setup cost).
