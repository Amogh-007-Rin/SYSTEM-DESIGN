# Module 13 — Exercises

## Coding Challenges

| Challenge | Description |
|---|---|
| [01 — G-Counter CRDT](./coding-challenges/challenge-01/) | Implement a grow-only counter CRDT whose merge function is commutative, associative, and idempotent |
| [02 — Simplified Raft Leader Election](./coding-challenges/challenge-02/) | Implement Raft's leader election (no log replication) across a simulated 5-node cluster, including split-vote retry |

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Consistency Model for a Distributed Shopping Cart](./design-challenges/challenge-01.md) | Choose a consistency model for a distributed shopping cart and defend it against concrete partition/failure scenarios |

Challenge 01 (G-Counter) is the fastest on-ramp into CRDTs and the one most likely to come up as a quick coding warm-up before a deeper system design discussion. Challenge 02 (Raft election) is more involved — it's the same mental model interviewers expect when they ask "how does a cluster agree on a leader without a single point of failure?" Work through both before attempting the design challenge, since the design challenge assumes you can reason concretely about what AP/CRDT and CP/consensus approaches actually do during a failure, not just name them.
