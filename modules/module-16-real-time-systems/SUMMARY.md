# Module 16 — Real-Time Systems: Summary

> This module covered how systems push data to clients instead of waiting to be asked: WebSockets, Server-Sent Events, and long polling as the three connection models; how WebSocket servers scale horizontally via sticky sessions and a pub/sub backbone; the fan-out problem at the heart of chat, notifications, and live feeds; and the specific mechanics of chat (ordering, read receipts), presence (heartbeats + TTL), and notification delivery (in-app, push, email/SMS).

---

## Key Concepts

1. **Soft real-time** — the practical target for almost all system design interview questions: low-latency, best-effort delivery, not the strict-deadline guarantees of hard real-time (embedded/control systems).
2. **WebSocket** — a single persistent TCP connection supporting full bidirectional push after an HTTP-upgrade handshake.
3. **Server-Sent Events (SSE)** — a one-directional server-to-client stream over plain HTTP, with automatic client reconnection built in.
4. **Long polling** — a held-open HTTP request used as a compatibility fallback when WebSockets/SSE aren't reliably supported across a client's network path.
5. **Pub/sub backbone** — the shared channel (e.g., Redis Pub/Sub) that lets WebSocket server instances which don't share memory still deliver messages to connections held by other instances.
6. **Fan-out** — delivering one event to many subscribers efficiently, handled hierarchically (publish once, each server instance fans out only to its own local connections).
7. **Presence (heartbeat + TTL)** — "online" inferred from a recently-refreshed TTL key, not a fact known with certainty; absence of a heartbeat within the timeout window means offline.
8. **Per-conversation sequence numbers** — the mechanism that makes chat message ordering reliable despite client clock drift, used in place of client-reported timestamps.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Connection model | WebSocket | Server-Sent Events | Client needs to push data back over the same low-latency channel | Data only flows server → client (feeds, notifications, dashboards) |
| Cross-instance delivery | Broadcast to all server instances | Targeted publish via a connection registry | Fleet is small enough that broadcast waste is negligible | Fleet is large enough that broadcasting to every instance for every message meaningfully wastes CPU |
| Fan-out strategy | Fan-out-on-write (push immediately) | Fan-out-on-read (pull/poll current state) | Per-recipient latency matters and subscriber count is manageable | A sudden huge subscriber spike makes "write to everyone now" infeasible, and slightly stale reads are acceptable |
| Live update granularity | Coalesce rapid updates (send only the latest) | Deliver every individual update | Only the current value matters (price ticker, live score) | Every individual change matters and must be preserved (chat messages, collaborative edits) |
| Compatibility | WebSocket/SSE only | Long-polling fallback | Client network paths reliably support persistent/streamed connections | Meaningful traffic comes from restrictive networks or legacy clients that block WebSocket upgrades |

---

## Common Interview Questions from This Module

- How do WebSockets, SSE, and long polling differ, and how do you choose between them?
- What breaks when you put a second WebSocket server instance behind a load balancer, and how do you fix it?
- What is the fan-out problem, and how do large systems deliver one event to millions of subscribers?
- How does a presence system detect that a user has gone offline?
- Why can't you reliably order chat messages using client-reported timestamps?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Pub/sub backbone for WebSocket fleets | Lets server instances that don't share memory still deliver messages to connections held elsewhere in the fleet |
| Hierarchical fan-out (backbone → instances → local sockets) | Bounds per-process delivery load to "connections per instance," not the global subscriber count |
| Heartbeat + TTL presence | Infers online/offline status from recency of a lightweight signal, without requiring a graceful disconnect |
| Per-conversation sequence numbers | Guarantees consistent message ordering despite client clock drift |
| High-water-mark read receipts | Tracks per-user read state in O(1) per conversation instead of one flag per message per recipient |
| Connection registry for targeted delivery | Lets a sender's server instance route directly to the instance holding the recipient's connection instead of broadcasting to the full fleet |

---

## What This Unlocks

After this module, you can tackle:
- [Module 17 — Data Pipelines](../module-17-data-pipelines/), which covers the durable, asynchronous side of data movement that this module's "durable write + live delivery" pattern depends on
- Chat, live-feed, and notification-system questions in interview prep and company-architecture deep dives throughout this repository
- Any system design prompt that requires reasoning about server-initiated push, not just request/response

---

## Quick Reference

- **WebSocket** = bidirectional, persistent, needs an upgrade handshake. **SSE** = one-directional, plain HTTP, auto-reconnect. **Long polling** = compatibility fallback, costs more overhead per cycle.
- **Sticky sessions** solve routing a client back to its server; they do **not** solve cross-server message delivery — that needs a pub/sub backbone.
- **Fan-out** at scale = publish once → fan out to N server instances → each fans out only to its own local connections.
- **Presence** = heartbeat refreshes a TTL key; TTL expiry (detected by a sweep) means offline. Always state the accuracy bound (≈ the timeout window).
- **Chat ordering** = server-assigned per-conversation sequence number, never client timestamps. **Read receipts** = a high-water mark per user per conversation, not a flag per message.

---

← [Previous Module ← Module 15 — Security](../module-15-security/) | [Next Module → Module 17 — Data Pipelines](../module-17-data-pipelines/)
