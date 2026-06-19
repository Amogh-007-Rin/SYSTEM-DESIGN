# Module 16 — Real-Time Systems

> The difference between an app that "has a chat feature" and one that feels alive is almost always a real-time data path — and that path has its own design rules, separate from the request/response thinking the rest of this repository has built so far.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 02 — Networking](../module-02-networking/) | TCP connection lifecycle, persistent connections vs. request/response, how a connection handshake works |
| [Module 08 — Message Queues](../module-08-message-queues/) | Pub/sub fundamentals — this module's fan-out and horizontal-scaling patterns are pub/sub applied to live connections instead of durable queues |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Choose between WebSockets, Server-Sent Events, and long polling for a given real-time requirement, and justify the choice
- Explain how a WebSocket server scales horizontally despite holding stateful, long-lived connections
- Design the fan-out path that delivers one event to millions of subscribers without melting a single server
- Design the core of a chat system: 1:1 messaging, group chat, message ordering, read receipts, and presence

---

## Estimated Time

**5–6 hours** total: Concepts: ~2h | Deep dive: ~2h | Exercises: ~1.5–2h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Coding challenges and design challenges |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 15 — Security](../module-15-security/) | [Next Module → Module 17 — Data Pipelines](../module-17-data-pipelines/)
