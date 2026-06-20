# Module 12 — Exercises

## Coding Challenges

| Challenge | Description |
|---|---|
| [01 — Lamport Timestamps](./coding-challenges/challenge-01/) | Implement logical clocks (increment-on-event, max+1-on-receive) and verify a chain of sends/receives across 3 nodes produces a correctly causality-respecting timestamp order |
| [02 — Gossip Protocol Simulation](./coding-challenges/challenge-02/) | Implement merge-by-highest-version state exchange between random peers and watch a single write propagate to an entire cluster without a coordinator |

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Distributed Counter Across 5 Nodes](./design-challenges/challenge-01.md) | Design a counter that stays available and eventually-consistent across 5 nodes with no central coordinator and no single point of failure |

Challenge 01 (Lamport timestamps) is the more commonly asked of the two coding challenges in interviews — implement it from memory before moving on to vector clocks ([deep dive example](../02-deep-dive/examples/vector-clocks.ts)), which build directly on the same idea. Challenge 02 (gossip) is less frequently asked as a raw coding exercise but is the mechanic most worth understanding deeply, since it underlies how real leaderless systems (Cassandra, Dynamo, Riak) propagate both data and cluster membership.

The design challenge ties both coding challenges together: a working distributed counter needs exactly the tools you just built — some notion of versioning to detect which update is newer (Lamport/vector-clock-style thinking) and some way for updates to reach every node without a coordinator (gossip-style propagation).
