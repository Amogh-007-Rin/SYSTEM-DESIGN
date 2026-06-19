# Module 20 — Advanced Patterns & Putting It All Together: Summary

> This capstone module covered the patterns that separate "I can design a system" from "I can design a system that survives FAANG scale": multi-region architecture and conflict resolution, distributed ID generation, rate limiting and idempotency across many nodes, jittered backoff, cell-based blast-radius isolation, and safe progressive rollout — then synthesized all of it, plus every prior module, into three full capstone system designs and a senior/staff interview framework.

---

## Key Concepts

1. **Active-active vs. active-passive multi-region** — active-active maximizes latency and availability but forces conflict resolution on concurrent writes; active-passive is simpler and the right default absent a specific reason to need active-active.
2. **Snowflake-style distributed IDs** — pack a timestamp, machine ID, and sequence into one integer, giving sortable, collision-free, coordination-free ID generation across many writers.
3. **Distributed rate limiting via Redis + Lua** — moving a token bucket's state into a shared store and making the check-and-decrement atomic via a Lua script prevents the limit from being silently multiplied across nodes.
4. **Idempotency keys** — the synchronous-request-path analog of the message-queue idempotent consumer: a client-supplied key lets a retried request return the original result instead of re-executing the operation.
5. **Backoff with jitter** — exponential backoff alone doesn't desynchronize clients that failed simultaneously; random jitter is what actually spreads retries out and prevents a retry storm.
6. **Cell-based architecture** — partitioning an entire stack into independent cells, each serving a disjoint slice of traffic, contains blast radius so one cell's failure doesn't take down every customer.
7. **Canary deployments with a stated rollback trigger** — a canary is only a real safety mechanism when paired with an explicit success metric, a minimum sample size, and an automatic rollback rule — not just "route 5% of traffic and watch."
8. **Driving the interview conversation** — at senior/staff level, proactively stating your plan, surfacing ambiguity with a proposed default, and proposing what to go deep on next is what distinguishes "answering questions" from "running the session."

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Multi-region write strategy | Active-active | Active-passive | Extremely latency-sensitive global writes or zero-tolerance for failover downtime | Write volume is modest and a brief failover RTO is acceptable |
| Distributed ID scheme | Snowflake (64-bit) | ULID (128-bit) | Need the most compact sortable ID and can assign unique machine IDs | Want time-sortable IDs with zero coordination, can afford the larger size |
| Rate limiter failure mode | Fail closed | Fail open | A violated limit causes real harm (e.g., billing abuse) that outweighs downtime | The rate limiter must never become a hard availability dependency for the API |
| Feed/fan-out strategy | Fan-out-on-write | Fan-out-on-read (or hybrid) | Follower counts are small and uniform | Some accounts have massive follower counts, making uniform fan-out-on-write a write-amplification catastrophe |
| Rollback mechanism | Blue-green (instant traffic flip) | Redeploy previous version | Fast rollback is critical and you can afford running two full environments | Infrequent deploys where the cost of a standing second environment isn't justified |

---

## Common Interview Questions from This Module

- How would you design a distributed rate limiter that stays correct across many application nodes?
- What's the difference between fan-out-on-write and fan-out-on-read for a social feed, and why does a single celebrity account break the naive version of one of them?
- Why isn't exponential backoff alone sufficient to prevent a retry storm, and what does jitter actually fix?
- What's the difference between a senior/staff-level system design answer and a mid-level one on the same prompt?
- How does cell-based architecture contain blast radius, and what does that isolation actually cost?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Snowflake-style distributed ID generation | Globally unique, time-sortable IDs generated independently by many writers with no coordinator |
| Redis + Lua atomic token bucket | Correct rate limiting enforced consistently across many application nodes |
| Idempotency keys | Safe client retries on the synchronous request path without double-applying an effect |
| Full jitter exponential backoff | Prevents synchronized retry storms against a recovering dependency |
| Cell-based architecture / shuffle sharding | Contains the blast radius of a failure to a slice of customers instead of all of them |
| Shadow traffic (dark launch) | Validates a new system against real production input with zero user-facing risk |
| Canary deployment with promotion/rollback rule | Limits exposure to a bad release and automates the decision to proceed or revert |
| Blue-green deployment | Near-instant, low-risk rollback by keeping the previous environment warm and switching traffic back |

---

## What This Unlocks

This is the capstone module — there is no Module 21. After completing this module, you are positioned for:
- **Full interview-prep practice**: the senior/staff framework, driving-the-conversation techniques, and the worked distributed rate limiter answer in this module's [`03-interview-prep/`](./03-interview-prep/) are the direct preparation for tackling the complete interview-prep question bank covering every difficulty tier.
- **The question bank**: every pattern from this module (multi-region, distributed IDs, rate limiting, idempotency, jittered retries, cell-based isolation, canaries, blue-green) recurs across hard and staff-level interview prompts — this module is the toolkit those prompts assume you already have.
- **Independent end-to-end system design**: the three capstones in [`04-exercises/`](./04-exercises/) (URL shortener, Twitter, Uber) are full syntheses of Modules 01–19 plus this module — completing them is the practical proof that the whole course's material composes into real, defensible designs, not just isolated facts per topic.

---

## Quick Reference

- **Active-active** = both regions write, must resolve conflicts. **Active-passive** = one writer, simpler, slower failover.
- **Snowflake ID** = timestamp + machine ID + sequence in one integer — sortable, unique, no coordinator needed.
- **Distributed rate limit** = shared store (Redis) + atomic check-and-decrement (Lua script), or the limit is silently multiplied by node count.
- **Idempotency key** = client-supplied key so a retried request returns the original result instead of repeating the effect.
- **Jitter** = randomized backoff delay; the actual fix for retry storms, not exponential backoff alone.
- **Cell-based architecture** = independent stack copies per traffic slice; contains blast radius at the cost of running N copies.
- **Canary** = traffic % + stated metric + minimum sample size + rollback rule. Missing any one of these isn't a real safety mechanism.
- **Senior/staff interview signal** = drive the structure, quantify trade-offs, self-correct out loud, address failure modes and operability unprompted.

---

← [Previous Module](../module-19-ml-systems/) | [Back to Module Index](../../README.md)
