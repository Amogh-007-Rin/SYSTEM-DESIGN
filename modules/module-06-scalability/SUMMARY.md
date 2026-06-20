# Module 06 — Scalability: Summary

> This module covered how systems grow from serving a handful of users to millions: the vertical-vs-horizontal scaling decision, why statelessness is the precondition for scaling out, the standard journey systems follow as load grows, and the quantitative tools (Amdahl's Law, Little's Law) that turn "this should scale" into a number you can defend.

---

## Key Concepts

1. **Vertical scaling** — making a single machine more powerful; simple, but has a hard ceiling and does nothing for availability.
2. **Horizontal scaling** — adding more machines and spreading load across them; effectively unlimited, but requires shared-nothing, stateless design to work cleanly.
3. **Statelessness** — an app server holding no client-specific data locally between requests, which is what makes adding/removing instances safe.
4. **The scaling journey** — single server → separate DB → caching → multiple app servers → read replicas → sharding, each stage solving the bottleneck the last exposed.
5. **Amdahl's Law** — speedup from parallelization is capped at `1/(1-P)`; the serial portion of a workload is a hard ceiling no added capacity removes.
6. **Little's Law** — `L = λW`; converts arrival rate and latency directly into the concurrency a system must be provisioned to hold.
7. **CQRS** — separating the write model from the read model entirely, letting each scale and evolve independently at the cost of eventual consistency between them.
8. **Eventual consistency as a scalability enabler** — relaxing strong consistency for tolerant data is often what makes scaling across nodes and regions possible at all.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Scaling direction | Vertical (bigger machine) | Horizontal (more machines) | Early-stage, simplicity matters, workload is hard to distribute | You've hit vertical's ceiling, or need redundancy/availability |
| Auto-scaling strategy | Reactive (threshold-based) | Predictive (forecast-based) | Load patterns are unpredictable or you lack historical data | Load follows known patterns (daily/seasonal spikes) and lag is costly |
| Database read scaling | Read replicas (same schema) | CQRS (separate read/write models) | You only need more read throughput | Reads and writes genuinely need different shapes or technologies |
| Consistency model | Strong consistency | Eventual consistency | Staleness has real consequences (balances, permissions) | Brief staleness is tolerable (counters, feeds) and you need the scale eventual consistency unlocks |

---

## Common Interview Questions from This Module

- How would you scale a system from 1,000 to 1,000,000 users?
- What does Amdahl's Law imply about the limits of adding more servers to a problem?
- How do you tell whether a system is CPU-bound, I/O-bound, or memory-bound, and why does the distinction change your fix?
- What's the difference between a database read replica and CQRS?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Stateless application tier | Makes horizontal scaling and load balancing safe — any instance can serve any request |
| The scaling journey (staged evolution) | Avoids both premature over-engineering and waiting too long to address a real bottleneck |
| Reactive auto-scaling (HPA-style) | Automatically matches capacity to real-time load without manual intervention |
| Read replicas | Scales read throughput independently of write throughput |
| CQRS | Lets read and write models scale and evolve independently when they need fundamentally different shapes |
| Async processing via queues | Moves non-urgent work off the request's critical path so it can scale on its own terms |

---

## What This Unlocks

After this module, you can tackle:
- [Module 07 — Load Balancing](../module-07-load-balancing/), which covers in depth the component this module assumed exists once you have multiple stateless app servers
- [Module 08 — Message Queues](../module-08-message-queues/), the infrastructure behind this module's async processing discussion
- [Module 13 — Consistency & Consensus](../module-13-consistency-consensus/), which goes deeper into the eventual-consistency trade-offs introduced here
- Scaling-focused interview questions like "design a system that scales from 1K to 1M users" with a structured, staged, trade-off-aware answer

---

## Quick Reference

- **Vertical** = bigger machine, hard ceiling. **Horizontal** = more machines, needs statelessness.
- **Scaling journey:** single server → separate DB → cache → multiple app servers → read replicas → sharding.
- **Amdahl's Law:** `Speedup = 1 / ((1-P) + P/N)` — serial work caps maximum speedup.
- **Little's Law:** `L = λW` — concurrency needed = arrival rate × average latency.
- **CPU-bound** → more workers helps. **I/O-bound** → more concurrency/caching helps. **Memory-bound** → stream/paginate, fix retention.
- **Reactive scaling** lags behind spikes; **predictive scaling** forecasts ahead but needs good historical signal.
- **Eventual consistency** is often what makes scale possible — apply it deliberately, per piece of data.

---

← [Previous Module ← Module 05 — Caching](../module-05-caching/) | [Next Module → Module 07 — Load Balancing](../module-07-load-balancing/)
