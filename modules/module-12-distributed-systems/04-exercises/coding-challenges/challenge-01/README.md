# Coding Challenge 01: Lamport Timestamps

## Problem Statement

Implement Lamport's logical clock algorithm in TypeScript, so that a small set of nodes exchanging messages end up with timestamps that always respect causality — every "receive" event's timestamp must be strictly greater than the "send" event's timestamp that caused it, even though no node shares a physical clock with any other.

## Background

A single integer counter per node, updated by three rules, is enough to order events correctly without any synchronized clock (see [02-deep-dive](../../../02-deep-dive/README.md#logical-clocks-lamport-timestamps) for the full explanation):

1. **Local event:** `clock = clock + 1`.
2. **Send a message:** `clock = clock + 1`, then attach the new clock value to the outgoing message.
3. **Receive a message** carrying timestamp `t`: `clock = max(clock, t) + 1`.

## Requirements

1. `localEvent(name)` — increments the clock, logs the event, and returns it.
2. `send(name)` — increments the clock, logs the event, and returns both the event and the timestamp to attach to the outgoing message.
3. `receive(name, senderTimestamp)` — sets the clock to `max(local clock, senderTimestamp) + 1`, logs the event, and returns it.
4. `printLog()` — prints every logged event for that node, in the order they occurred locally, with their timestamp.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

The usage example at the bottom simulates 3 nodes (A, B, C) passing a request around in a chain (A → B → C → A) and prints each node's event log. Once implemented correctly, every "receive" timestamp must be strictly greater than the "send" timestamp that produced it — check `solution.ts`'s trailing comment block for the exact expected timestamp trace (1 through 9) if you want to verify your own implementation against it.

> 🎯 **Interview Tip:** Lamport timestamps are a frequent "implement this from memory" interview question precisely because the three rules are simple to state but easy to get subtly wrong (a common mistake: forgetting to increment on send, or using `senderTimestamp` directly instead of `max(local, senderTimestamp) + 1` on receive). Practice writing the three rules without looking them up.
