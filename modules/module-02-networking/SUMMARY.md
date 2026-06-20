# Module 02 — Networking Fundamentals: Summary

> This module covered the networking layer every system design decision sits on top of: how names resolve to addresses, how TCP and UDP trade reliability for speed, how HTTP evolved to reduce connection overhead, and how to choose between real-time communication strategies.

---

## Key Concepts

1. **DNS resolution** — a cached, hierarchical lookup from domain name to IP address; TTL controls how fast changes propagate.
2. **TCP vs. UDP** — TCP guarantees reliable, ordered delivery at the cost of overhead; UDP is fast and connectionless, pushing reliability (if needed) to the application.
3. **HTTP/1.1 → HTTP/2 → HTTP/3** — progressively remove connection and head-of-line blocking overhead, culminating in QUIC (UDP-based) for HTTP/3.
4. **WebSockets, SSE, long polling, short polling** — a spectrum of real-time communication strategies trading complexity, directionality, and latency.
5. **Connection reuse** — keep-alive and connection pooling avoid repeatedly paying handshake costs, one of the highest-leverage low-level optimizations.
6. **Anycast** — routes clients to the nearest of many identical endpoints at the network level, underlying CDNs and DDoS mitigation.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Transport protocol | TCP | UDP | Correctness/ordering matters (web, DB traffic) | Recency matters more than completeness (video, gaming) |
| Real-time strategy | WebSockets | Long polling / SSE | Bidirectional, frequent, low-latency needs | Simpler infra is worth slightly higher latency, or communication is one-directional |
| DNS TTL | Low TTL | High TTL | Need fast failover/rerouting ability | Want to minimize DNS query volume and have stable routing |

---

## Common Interview Questions from This Module

- Why would you choose UDP over TCP for a video call application?
- What problem does HTTP/2 multiplexing solve that HTTP/1.1 had?
- When would you choose WebSockets over Server-Sent Events?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Connection pooling / keep-alive | Avoids repeated TCP/TLS handshake cost per request |
| Long polling | Lower latency than fixed-interval polling without full WebSocket infrastructure |
| GeoDNS / Anycast routing | Routes clients to the nearest endpoint without client-side logic |

---

## What This Unlocks

After this module, you can tackle:
- [Module 03 — API Design](../module-03-apis/), which assumes you understand HTTP and can reason about request/response cost
- [Module 10 — CDN](../module-10-cdn/) and [Module 16 — Real-Time Systems](../module-16-real-time-systems/), both of which build directly on this module's protocols

---

## Quick Reference

- **L3/L4/L7** = addressing / transport / application — the only OSI layers that matter day-to-day.
- **TCP** = reliable + ordered, higher overhead. **UDP** = fast, no guarantees.
- **HTTP/2** multiplexes over one connection; **HTTP/3 (QUIC)** removes TCP-level head-of-line blocking entirely.
- **Real-time spectrum:** short polling → long polling → SSE (server push only) → WebSockets (full duplex).
- **Connection reuse** is one of the cheapest, highest-impact performance wins available.

---

← [Previous Module ← Module 01 — Foundations](../module-01-foundations/) | [Next Module → Module 03 — API Design](../module-03-apis/)
