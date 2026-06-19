# Coding Challenge 03: Consistent Hashing

## Problem Statement

Implement a consistent hash ring with virtual nodes: each physical node is given many positions ("virtual nodes") on a hash ring, and a key maps to whichever ring position is nearest clockwise. This minimizes how many keys move when a node is added or removed — the core problem with naive `hash(key) % N` sharding (see [Module 04's deep dive](../../../02-deep-dive/README.md)).

## Requirements

1. `addNode(nodeName)` — adds 150 virtual node positions for this node to the ring.
2. `removeNode(nodeName)` — removes all of this node's virtual positions.
3. `getNode(key)` — finds the nearest ring position clockwise from `hash(key)` and returns its owning node.
4. `getDistribution(keys)` — counts how many of a key set map to each node, to verify even distribution.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expect roughly even distribution across 3 nodes (each ~33%), and after removing one node, only that node's ~33% of keys should remap — the other two nodes' keys should stay put, which is the entire point of consistent hashing over naive modulo hashing.
