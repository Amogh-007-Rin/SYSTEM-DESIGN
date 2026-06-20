# Coding Challenge 02: Gossip Protocol Simulation

## Problem Statement

Implement a simple gossip protocol simulation in TypeScript: a cluster of nodes, each holding a local `key -> {value, version}` map, that converges on the same data purely through repeated random pairwise exchanges — no central coordinator, no broadcaster, no node aware of the full cluster state at any single point in time.

## Background

See [02-deep-dive](../../../02-deep-dive/README.md#gossip-protocol) for the full explanation of how gossip is used for both membership discovery and failure detection in real systems (Cassandra, Riak, Dynamo-style stores). This exercise focuses on the core mechanic: **merge-by-highest-version**, applied symmetrically on every gossip exchange.

## Requirements

1. `localWrite(key, value)` — originates a brand-new write at this node, bumping the key's version so peers can recognize it as newer than whatever they have (or don't have).
2. `pickRandomPeer()` — returns a uniformly random peer to gossip with this round.
3. `gossipRound()` — picks a random peer and merges state **symmetrically**: for every key known to either side, both nodes end up holding whichever `{value, version}` pair has the higher version. This symmetry (not just "pull from peer") is what makes the protocol converge regardless of which node calls `gossipRound()`.
4. `getValue(key)` / `getVersion(key)` — read accessors used by the convergence check.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

The usage example simulates a 6-node cluster where `N0` originates a single write, then runs up to 10 gossip rounds (every node gossips with one random peer per round) and reports how many nodes have received the value after each round. Once implemented correctly, the cluster should fully converge — typically within 2-4 rounds for 6 nodes — well before the 10-round cap, demonstrating the `O(log N)` convergence property described in the deep dive.

> 💡 **Note:** Because peer selection is random, the exact number of rounds to converge will vary slightly between runs — that's expected and is the point: gossip gives you *probabilistic*, not deterministic, convergence timing. `solution.ts` includes an explicit convergence check at the end (every node agrees on both value AND version) so you can verify correctness regardless of how many rounds it happened to take.

> 🎯 **Interview Tip:** If asked to extend this to failure detection, the natural next step is gossiping a `lastHeartbeatFrom: Map<nodeId, timestamp>` alongside the data map, using the exact same merge-by-highest-version logic — a node is suspected down when enough peers' gossiped heartbeat timestamps for it are older than a threshold.
