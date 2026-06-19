# Design Challenge 01 (Capstone): Design a URL Shortener

**Difficulty:** Capstone (synthesizes Modules 01–08, 14)

## Prompt

Design a URL shortener like Bit.ly or TinyURL: a service that takes a long URL and returns a short one, and redirects anyone who visits the short URL to the original long URL.

## What to Produce

1. **Functional requirements** — what the system must do (creation, redirection, expiration, custom aliases, analytics — decide what's in scope and say so).
2. **Non-functional requirements** — explicit numbers for scale (URLs created/day, redirects/day, read:write ratio), latency targets, and availability/durability expectations.
3. **Capacity estimation** — back-of-envelope math for storage, write throughput, read throughput, and bandwidth, derived from your stated NFRs.
4. **API design** — the actual endpoints (method, path, request/response shape) for creating and resolving short URLs.
5. **ID/short-code generation strategy** — how you generate the short code, and why (this should connect to this module's distributed ID generation concepts).
6. **Database schema** — the actual table(s)/columns, and your choice of database category with justification.
7. **Caching strategy** — what's cached, what pattern, what eviction policy, and why, given the read:write ratio you estimated.
8. **Scaling strategy** — how the system handles 10x and 100x the load you estimated, and what breaks first.
9. **Observability** — what you'd monitor and alert on to know the system is healthy.
10. **At least 4 explicit trade-offs.**

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md) — attempt this yourself first.
