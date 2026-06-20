# Module 03 — API Design: Summary

> This module covered designing the contract a system exposes to the world: REST conventions and status codes, when GraphQL or gRPC beat REST, and the operational machinery (versioning, rate limiting, auth, idempotency) that keeps an API maintainable once real clients depend on it.

---

## Key Concepts

1. **REST constraints** — stateless, resource-based, uniform interface — are what make REST cacheable and tooling-friendly.
2. **GraphQL** — client-specified query shape avoids over/under-fetching, at the cost of harder caching and more server-side complexity.
3. **gRPC** — Protocol Buffers over HTTP/2 for fast, native-streaming internal service communication, at the cost of human-debuggability.
4. **Rate limiting algorithms** — token bucket, leaky bucket, fixed window, sliding window — each with different burst-handling trade-offs.
5. **Idempotency keys** — make retried `POST` requests safe by deduplicating on a client-generated key.
6. **Cursor vs. offset pagination** — cursor pagination stays fast and stable at any depth; offset pagination degrades and can skip/duplicate rows under concurrent writes.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| API style | REST | GraphQL | Public API, need cacheability/simplicity | Clients have heterogeneous, evolving data needs |
| API style | REST | gRPC | External, human-debuggable consumers | Internal service-to-service, performance-critical |
| Rate limiting | Token bucket | Fixed window | Need to allow legitimate bursts | Implementation simplicity matters more than burst correctness |
| Pagination | Cursor-based | Offset-based | List is large or frequently written to | List is small and stable, simplicity matters most |

---

## Common Interview Questions from This Module

- When would you choose GraphQL over REST?
- Why is cursor pagination preferred over offset pagination at scale?
- What's wrong with fixed-window rate limiting?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Token bucket rate limiting | Bounds request rate per client while allowing legitimate bursts |
| Idempotency keys | Makes retried non-idempotent requests (e.g., payments) safe |
| Cursor pagination | Stable, fast pagination regardless of dataset depth or concurrent writes |
| API gateway | Centralizes auth, rate limiting, and routing across many backend services |

---

## What This Unlocks

After this module, you can tackle:
- [Module 11 — Microservices](../module-11-microservices/), which assumes you understand API gateways and service-to-service communication styles
- Medium-difficulty interview questions involving full API design, like [Uber](../../interview-prep/question-bank/medium/uber.md) and [Twitter](../../interview-prep/question-bank/medium/twitter.md)

---

## Quick Reference

- **REST** = stateless + resource-based + uniform interface.
- **GraphQL** solves over/under-fetching; **gRPC** solves internal-service speed.
- **Token bucket**: refill rate + capacity, allows bursts. **Sliding window**: avoids fixed-window boundary bursts.
- **Idempotency key** = safe retries for non-idempotent operations.
- **Cursor pagination** scales; **offset pagination** doesn't, past a point.

---

← [Previous Module ← Module 02 — Networking](../module-02-networking/) | [Next Module → Module 04 — Databases](../module-04-databases/)
