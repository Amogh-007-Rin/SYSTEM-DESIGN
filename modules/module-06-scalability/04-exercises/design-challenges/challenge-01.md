# Design Challenge 01: Scaling a Monolith from 100 to 1M Users

**Difficulty:** Medium

## Prompt

You're given a simple system: a single server running a monolithic application (REST API + server-rendered pages) with a single relational database on the same machine. It currently serves about **100 concurrent users** comfortably.

Take this design and evolve it through **5 stages of scale** — 100 → 1,000 → 10,000 → 100,000 → 1,000,000 concurrent users. At each stage:

1. Identify the **specific bottleneck** that emerges (not "it gets slow" — name the actual resource or component under pressure)
2. Propose the **specific architectural change** that addresses it
3. State at least **one trade-off** the change introduces

## What to Produce

A stage-by-stage table or write-up covering all 5 stages, plus:
- Where you applied caching, and what you chose to cache
- Where the application tier needed to become stateless, and what you did with session data as a result
- Whether you ever needed to shard the database, and if so, what key you'd shard on
- At least one place where you'd reach for Amdahl's Law or Little's Law to justify a sizing decision with a number rather than intuition alone

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md).
