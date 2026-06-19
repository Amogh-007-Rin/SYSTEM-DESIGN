# Module 11 — Microservices Architecture: Summary

> This module covered microservices as a deliberate trade-off, not a default best practice: the real differences between monolith/SOA/microservices, how to decompose a system into service boundaries that hold up under scrutiny, how to coordinate a transaction that now spans multiple databases (the saga pattern), and the resilience patterns — circuit breaker, bulkhead, service mesh — that keep one failing service from taking the rest of the system down with it.

---

## Key Concepts

1. **Monolith vs. SOA vs. microservices** — the defining technical line isn't size, it's data ownership and the absence of a centralized integration broker (ESB); microservices each own their own database.
2. **Service decomposition** — drawn by business capability, DDD bounded context, or Conway's Law/team alignment, never by arbitrary technical layering.
3. **Synchronous vs. asynchronous communication** — synchronous when the caller needs the result to proceed now; asynchronous events when it doesn't.
4. **Service discovery** — client-side (Eureka-style registry + heartbeats), server-side (Consul-style), or DNS-based (Kubernetes Services).
5. **The saga pattern** — replaces a single ACID transaction across services with a sequence of local transactions plus explicit compensating transactions, accepting eventual consistency instead of 2PC's blocking locks and single-coordinator failure mode.
6. **Circuit breaker** — closed/open/half-open state machine that fast-fails calls to an already-unhealthy dependency instead of letting every caller queue up and risk cascading failure.
7. **Bulkhead** — partitions resources (thread/connection pools) per dependency so one slow dependency can't exhaust resources shared by calls to every other dependency.
8. **Service mesh** — moves mTLS, observability, and traffic management out of application code into a per-instance sidecar proxy.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Architecture | Monolith (modular) | Microservices | Small team, unclear domain boundaries, no real scaling/tech divergence yet | Team coordination is the bottleneck, or components have genuinely different scaling/tech needs |
| Saga coordination | Choreography | Orchestration | Few steps, simple reactions, want zero central coupling | Multiple steps, need centralized visibility and explicit control as the flow grows |
| Service communication | Synchronous (REST/gRPC) | Asynchronous (events) | Caller needs the result right now to proceed | Caller can continue without waiting for the result |
| Distributed transaction strategy | Two-phase commit | Saga with compensations | (Rarely the right choice across independent services — included for contrast) | Crossing independently-deployed services with separate databases |
| Resilience pattern | Circuit breaker | Bulkhead | Need to stop sending traffic to a known-failing dependency | Need to limit blast radius of calls still in flight to a slow dependency |

---

## Common Interview Questions from This Module

- What's the real difference between SOA and microservices?
- How do you decide service boundaries in a decomposition exercise?
- Explain the saga pattern, and choreography vs. orchestration.
- How does a circuit breaker prevent cascading failure, and what are its three states?
- What's the difference between a circuit breaker and a bulkhead, and why use both?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Client-side service registry with heartbeats (Eureka-style) | Lets a caller find a healthy instance when nothing has a fixed address |
| Saga (choreography and orchestration) | Coordinates a logical transaction across services that each own their own database, without 2PC |
| Compensating transaction | Semantically undoes an already-committed local transaction when a later saga step fails |
| Circuit breaker (closed/open/half-open) | Stops cascading failure by fast-failing calls to a known-unhealthy dependency |
| Bulkhead | Limits the blast radius of a slow/failing dependency to its own resource pool |
| Strangler fig | Migrates a monolith to microservices incrementally, capability by capability, instead of a risky big-bang rewrite |
| Backends for Frontends (BFF) | Shapes a per-client-type API instead of forcing one generic API to serve every client |
| Service mesh sidecar | Centralizes mTLS, observability, and traffic management instead of reimplementing them per service |

---

## What This Unlocks

After this module, you can tackle:
- [Module 12 — Distributed Systems](../module-12-distributed-systems/), which goes deeper into the partial-failure and consistency questions this module introduced via the saga pattern
- [Module 13 — Consistency & Consensus](../module-13-consistency-consensus/), which formalizes the eventual-consistency trade-offs accepted when abandoning 2PC
- System design interview questions that require a full service decomposition with justified boundaries, APIs, and a saga for any cross-service write (e.g., e-commerce checkout, ride-hailing trip lifecycle)

---

## Quick Reference

- **Microservices = independent deployability + no shared database.** Size is not the defining property.
- Decompose by **business capability**, **DDD bounded context**, or **Conway's Law** — name the method, don't slice arbitrarily.
- **Sync** = caller needs the result now. **Async** = caller doesn't need to wait.
- **2PC** blocks on locks and has a single-coordinator failure mode — sagas trade atomicity for eventual consistency instead.
- **Choreography** = no central coordinator, implicit logic, hard to debug past a few steps. **Orchestration** = central coordinator, explicit logic, easier visibility.
- **Circuit breaker states**: closed (normal) → open (fast-fail after threshold) → half-open (one trial call) → closed or open again.
- **Bulkhead** limits blast radius of in-flight calls; **circuit breaker** stops new calls to a known-bad dependency — complementary, not redundant.
- **Strangler fig** = incremental migration, one capability at a time. **BFF** = one backend per client type.
- **Service mesh** = sidecar proxy per instance handling mTLS, observability, and traffic management uniformly.

---

← [Previous Module ← Module 10 — CDN](../module-10-cdn/) | [Next Module → Module 12 — Distributed Systems](../module-12-distributed-systems/)
