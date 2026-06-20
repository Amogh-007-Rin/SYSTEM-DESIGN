# Coding Challenge 02: Kafka Consumer Group Simulation

## Problem Statement

Simulate a Kafka **consumer group** in TypeScript: a topic with a fixed number of partitions, a group of consumers that splits those partitions between its members, and a **rebalance** operation that reassigns partitions whenever a consumer joins or leaves the group.

## Requirements

1. `Topic` — has a fixed number of partitions (e.g., 6), identified `0..N-1`.
2. `ConsumerGroup` — tracks a set of active consumer IDs and an assignment of partitions to consumers.
3. `addConsumer(consumerId)` — adds a consumer to the group and triggers a rebalance.
4. `removeConsumer(consumerId)` — removes a consumer from the group (simulating a crash or scale-down) and triggers a rebalance, redistributing its partitions to the remaining consumers.
5. `rebalance()` — reassigns all partitions across the currently active consumers as evenly as possible, round-robin style. Partition counts per consumer should differ by at most 1 (e.g., 6 partitions over 4 consumers → two consumers get 2 partitions, two get 1).
6. `getAssignment()` — returns the current mapping of consumer ID → list of partition numbers.

## Why This Matters

This is the mechanism behind a real, painful production fact: when a Kafka consumer pod restarts (deploy, crash, autoscale-down), **every consumer in that group briefly stops processing** while a rebalance runs, and partitions get reassigned — possibly to a different consumer than before, which matters if your processing logic has any in-memory state tied to a specific partition. Understanding this is what separates "I've used a Kafka client library" from "I understand what happens to my application when a pod in the deployment restarts."

> 💡 **Note:** Real Kafka rebalancing (especially with "cooperative sticky" assignors, available since Kafka 2.4+) tries to minimize unnecessary partition movement — it doesn't always do a full round-robin reshuffle from scratch the way this simplified exercise does. The exercise prioritizes a clear, correct mental model over replicating every optimization in the real Kafka protocol.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts   # after you implement the TODOs
npx ts-node solution.ts  # reference implementation
```

The usage example creates a topic with 6 partitions, adds 3 consumers (expect 2 partitions each), then removes one consumer and shows the rebalance redistributing its 2 partitions across the remaining 2 consumers (expect 3 partitions each).
