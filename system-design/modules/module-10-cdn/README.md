# Module 10 — Content Delivery Networks (CDNs)

> A CDN turns "every user fetches from one origin server on the other side of the planet" into "every user fetches from a server a few milliseconds away" — it's the single biggest lever for making a global product feel fast.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 02 — Networking](../module-02-networking/) | Anycast routing, DNS resolution, TCP/TLS handshake cost, reverse proxies |
| [Module 09 — Storage Systems](../module-09-storage/) | Object storage (origin for CDN-distributed assets), storage tiering and durability trade-offs |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain how a CDN routes a user to a nearby edge node using Anycast/GeoDNS, and why that matters for latency
- Choose between push and pull CDN models for a given content type and justify the choice
- Design a cache-control and invalidation strategy using TTLs, the `Vary` header, surrogate keys, and versioned URLs
- Explain how adaptive bitrate streaming (HLS/DASH) lets a video player adjust quality to available bandwidth in real time
- Reason about CDN-level security (DDoS mitigation, edge WAF, TLS termination) and edge computing (Cloudflare Workers, Lambda@Edge) as system design tools, not just product features

---

## Estimated Time

**3–4 hours** total: Concepts: ~1.5h | Deep dive: ~1h | Exercises: ~1h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Design challenge (no coding challenges in this module) |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 09 — Storage Systems](../module-09-storage/) | [Next Module → Module 11 — Microservices](../module-11-microservices/)
