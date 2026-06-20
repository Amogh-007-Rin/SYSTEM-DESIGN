# Module 01 — Foundations of System Design: Summary

> This module established the vocabulary and mental models used throughout the rest of the repository: what system design is, the properties every design must reason about, and how to turn a vague prompt into numbers via capacity estimation.

---

## Key Concepts

1. **System design** — defining a system's architecture and components to satisfy functional and non-functional requirements, distinct from software design (one codebase) and software architecture (one deployable unit).
2. **Functional vs. Non-Functional Requirements** — FRs define *what* the system does; NFRs define *how well*, and NFRs are what drive architecture decisions.
3. **Availability** — the proportion of time a system can respond to requests, usually expressed in "nines."
4. **SLA / SLO / SLI** — external promise, internal target, and the metric that measures whether you're hitting the target.
5. **Capacity estimation** — deriving QPS, storage, and bandwidth from DAU, request size, and read:write ratio.
6. **Trade-offs** — every improvement to one property (availability, consistency, performance) typically costs another; naming the trade-off is the core skill.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Consistency model | Strong consistency | Eventual consistency | Correctness of a single value matters (inventory, balance) | Staleness is invisible to users (like counts, feeds) |
| Availability investment | High (multi-region, redundancy) | Lower (single region) | Downtime has real business/financial cost | Early-stage product where speed of iteration matters more |
| Architecture style | Monolith | Distributed/microservices | Small team, fast-changing requirements | Independent scaling/team autonomy needed at real scale |

---

## Common Interview Questions from This Module

- What is system design, and how does it differ from software engineering?
- How do you decide what availability target to design for?
- Why does back-of-envelope estimation matter if the numbers are "just estimates"?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Back-of-envelope estimation | Converts vague product descriptions into concrete QPS/storage numbers that constrain architecture choices |
| Series/parallel availability composition | Explains why chained dependencies reduce availability and redundancy restores it |

---

## What This Unlocks

After this module, you can tackle:
- [Module 02 — Networking Fundamentals](../module-02-networking/), which assumes you already think in terms of clients, servers, and the properties introduced here
- Easy interview questions in the [question bank](../../interview-prep/question-bank/easy/) that don't yet require distributed systems knowledge

---

## Quick Reference

- **System design ≠ software design ≠ software architecture** — different altitudes.
- **7 properties to always have a vocabulary for:** availability, reliability, scalability, maintainability, performance, durability, consistency.
- **SLA → SLO → SLI:** promise → internal target → measurement.
- **5 inputs drive capacity estimation:** DAU, requests/user/day, request size, read:write ratio, retention period.
- **Always state the trade-off.** Every decision costs something — name it.

---

← Previous Module: none | [Next Module → Module 02 — Networking](../module-02-networking/)
