# Coding Challenge 01: In-Memory Message Queue with DLQ

## Problem Statement

Implement an in-memory message queue in TypeScript that models the core mechanics real queues (SQS, RabbitMQ) use to provide **at-least-once delivery**: a **visibility timeout** that hides a message from other consumers while it's being processed, **retry counting**, and a **dead letter queue (DLQ)** for messages that exhaust their retries.

## Requirements

1. `enqueue(payload)` — creates a new message with a unique ID and adds it to the queue; returns the message ID.
2. `receive()` — returns the first *visible* message (one with no visibility timeout set, or whose timeout has expired), marks it invisible until `visibilityTimeoutMs` from now, and increments its attempt count. If a message's attempts exceed `maxRetries`, it is moved to the DLQ instead of being returned.
3. `ack(messageId)` — acknowledges successful processing; removes the message from the queue permanently.
4. `nack(messageId)` — signals failed processing; makes the message immediately visible again for another `receive()` call (instead of waiting out the rest of its visibility timeout).
5. `getStats()` — reports `queueDepth` (messages still in the queue, including in-flight ones), `dlqDepth` (messages moved to the DLQ), and `inFlight` (messages currently invisible because their visibility timeout hasn't expired).

## Why This Matters

This is the exact mechanism behind SQS's visibility timeout and DLQ redrive policy, and behind RabbitMQ's `x-death` header plus DLX (dead letter exchange) configuration. If you understand this in-memory version, you understand *why* a production queue's "max receive count" setting exists and what happens to a message that keeps failing.

## Starter / Solution

- [`starter.ts`](./starter.ts) — class skeleton with the exact behavior specified in the doc comments; run it with `npx ts-node starter.ts` (it type-checks but throws `Not implemented` at runtime by design — that's your job to fix).
- [`solution.ts`](./solution.ts) — reference implementation.

## Usage Example

```bash
npx ts-node starter.ts   # after you implement the TODOs
npx ts-node solution.ts  # reference implementation, runs end-to-end
```

The usage example at the bottom of both files enqueues 3 messages, successfully processes one (`ack`), then repeatedly fails (`nack`) the next message across multiple `receive()` calls until it exceeds `maxRetries` (3) and lands in the DLQ. Expected final state: 1 message acked and gone, 1 message in the DLQ, and the remaining message(s) still sitting in the queue untouched.
