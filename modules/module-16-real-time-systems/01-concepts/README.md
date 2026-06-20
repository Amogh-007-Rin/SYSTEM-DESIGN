# Module 16 — Concepts: Real-Time Systems

## Why This Matters

Every prior module in this repository has, at its core, been about request/response: a client asks, a server answers, the connection (or at least the logical exchange) ends. That model breaks the moment a server needs to speak first — a chat message arriving while you have the app open, a stock price ticking, a teammate's cursor moving in a shared document, a friend coming online. Real-time systems exist to solve exactly one problem: **getting the server to push data to a client the instant something happens, instead of the client having to repeatedly ask "anything new yet?"** Get this wrong and you either burn enormous resources on wasted polling, or you build a connection model that collapses the moment it has to scale past a handful of users.

---

## What Makes a System "Real-Time"? Hard vs. Soft Real-Time

"Real-time" is overloaded — it means something quite different in embedded/control systems than it does in the web/mobile systems this module focuses on.

- **Hard real-time**: missing a deadline is a system failure, full stop. A car's anti-lock braking system, an aircraft's flight control computer, a pacemaker. If the response doesn't arrive within a strict bound (often single-digit milliseconds), the system is considered to have failed, regardless of whether the answer eventually arrives.
- **Soft real-time**: missing a deadline degrades the experience but isn't catastrophic. A chat message that arrives 200ms late instead of 50ms is still a perfectly good chat experience. Video calls, live sports scores, collaborative editing, and stock tickers are all soft real-time — "as fast as practical," not "or the system has failed."

> 💡 **Note:** Almost everything discussed in a software system design interview — chat, notifications, live feeds — is **soft real-time**. Hard real-time belongs to a different engineering discipline (RTOS, embedded systems) with fundamentally different tools. If an interviewer says "real-time," they essentially always mean "low-latency soft real-time," not "hard real-time guarantees."

The analogy that makes this concrete: hard real-time is a heart surgeon who must make an incision at exactly the right moment or the patient dies. Soft real-time is a waiter who should refill your water glass promptly — doing it within a few seconds versus instantly makes no meaningful difference to your experience, but taking five minutes would.

---

## WebSocket Deep Dive

A WebSocket is a single TCP connection that stays open and lets *either side* send messages at any time, with none of HTTP's "client asks, server answers, repeat" structure.

### Connection Lifecycle

1. **Handshake**: the client sends a normal-looking HTTP `GET` request with an `Upgrade: websocket` header. The server responds `101 Switching Protocols` if it agrees.
2. **Upgrade**: from this point on, the same underlying TCP socket stops speaking HTTP and starts speaking the WebSocket framing protocol — a lightweight binary frame format, not text-based HTTP request/response anymore.
3. **Open**: both sides can now send frames (text or binary) at any time, in any direction, without waiting for a "request."
4. **Close**: either side sends a close frame; the TCP connection is torn down only after both sides have acknowledged the close (a graceful, two-way handshake — not just one side hanging up).

### Server-Side Push

This is the entire point of choosing WebSockets: the server can write to the socket the instant it has something to send, with zero round trips wasted "asking" whether anything's new. The cost is that the server must now hold one open TCP connection (and some in-memory bookkeeping) per connected client, for as long as that client is connected — a fundamentally different resource profile than stateless HTTP request handling.

### Scaling WebSocket Connections

A single connection is cheap to a point, but a production WebSocket server needs to hold hundreds of thousands of them simultaneously. The practical limits are file descriptors (each socket is one), memory per connection (read/write buffers, per-client metadata), and CPU spent on the routine work of keeping each one alive (heartbeats/pings). This module's deep dive covers exactly how production systems scale past what one machine can hold — the short version is: **horizontal scaling plus a pub/sub backbone**, because a single server's in-memory connection list isn't visible to any other server.

> 🎯 **Interview Tip:** If you mention WebSockets in an interview, immediately follow with "and here's how I'd scale that beyond one server" — interviewers specifically probe this because it's the part candidates who've only used WebSockets in a toy project tend to skip. See [`02-deep-dive/README.md`](../02-deep-dive/README.md) for the full treatment.

---

## Server-Sent Events (SSE): When It's the Right Choice

SSE is a much simpler alternative: the client opens a regular HTTP connection (`EventSource` in the browser), and the server keeps that response stream open indefinitely, writing one `data: ...\n\n` chunk at a time. It rides on plain HTTP — no protocol upgrade, no special handshake.

**Choose SSE when:**
- Data only needs to flow server → client (a live score feed, a stock ticker, a notification stream). SSE has no client → server channel; if the client needs to send anything back, it does so via an ordinary separate HTTP request.
- You want automatic reconnection for free — `EventSource` reconnects on its own if the connection drops, with no client code required.
- You'd like to ride on existing HTTP infrastructure (load balancers, proxies, CDNs) without needing WebSocket-aware upgrades anywhere in the path.

**Choose WebSockets instead when:**
- The client needs to send data back over the *same* persistent connection at low latency (chat input, multiplayer game state, collaborative editing keystrokes).
- You need binary frames (SSE is text/UTF-8 only).

> 💡 **Note:** SSE is the underrated option in most interview discussions — candidates reach for WebSockets by default, but a huge fraction of "real-time" requirements (notifications, live feeds, dashboards) are genuinely one-directional, and SSE solves them with far less operational complexity than a WebSocket fleet.

---

## Long Polling at Scale: How WhatsApp Used It

Before WebSockets had ubiquitous support, "long polling" was the standard workaround: the client makes a normal HTTP request, but the server *holds it open* without responding until either new data exists or a timeout is hit — then the client immediately opens a new request and repeats. From the outside it looks like push, but it's actually request/response with the response artificially delayed.

WhatsApp's early architecture (built on Erlang/ejabberd, an XMPP-based system) relied on exactly this kind of held-open long-lived connection model in its early years, before WebSocket support was standard across mobile carriers and intermediate proxies — at the time, many mobile networks and middleboxes actively misbehaved with raw persistent TCP sockets, while a "slow HTTP response" passed through almost any network path untouched. The trade-off: every "no new data yet" timeout cycle costs a full HTTP request's overhead (new TCP handshake or at least new HTTP headers, even on a kept-alive connection), so long polling burns meaningfully more bandwidth and server-side request-handling overhead than a true persistent connection, in exchange for working absolutely everywhere, including through restrictive networks and old infrastructure.

> ⚠️ **Warning:** Long polling is a compatibility fallback, not a design goal — reach for it only when you have a concrete reason to believe WebSockets/SSE won't work for a meaningful slice of your client base (very old browsers, restrictive corporate proxies, certain legacy mobile carrier networks). Defaulting to it "to be safe" in a modern stack is usually the wrong call.

---

## Notification Systems

"Notify the user" has three quite different delivery channels, each with its own infrastructure:

- **Push notifications (mobile)**: delivered by the OS vendor's own service — **APNs** (Apple Push Notification service) for iOS, **FCM** (Firebase Cloud Messaging) for Android. Your backend never talks directly to the device; it hands the message to APNs/FCM, which maintains the actual persistent connection to the device and handles delivery, retries, and waking a backgrounded app. This is the only reliable way to reach a mobile app that isn't currently running.
- **In-app notifications**: delivered over a connection the app already holds open while in the foreground — typically the same WebSocket or SSE channel used for everything else in this module. Cheapest to build since it reuses existing infrastructure, but only reaches users actively using the app right now.
- **Email/SMS**: the slowest and most disruptive channel, reserved for things that must reach the user even if they have no app open and no network connectivity on their phone right now (password resets, critical account security alerts, appointment reminders). Typically routed through a message queue to a dedicated worker pool, since email/SMS providers are slow and rate-limited compared to an in-process function call.

> 🎯 **Interview Tip:** A strong notification system design names all three channels and explicitly states the fallback chain — e.g., "try in-app first since the user might be active; if no acknowledgment within N seconds, fall back to a mobile push; for critical alerts, also send email regardless." Treating "send a notification" as a single undifferentiated action is a common tell of someone who hasn't designed one of these before.

---

## Presence Systems: Online/Offline Detection

"Is this user online right now?" sounds trivial and is actually deceptively hard, because **a closed connection is reliable, but a closed connection happening *right now* is not always something either side can detect immediately** — a phone losing signal in a tunnel doesn't get to send a polite "I'm going offline" message first.

The standard solution is a **heartbeat mechanism**: the client periodically sends a small "I'm still here" signal (either an application-level message or relying on the WebSocket protocol's own built-in ping/pong control frames), and the server tracks the last-seen timestamp per user. If no heartbeat arrives within some timeout window (typically 2–3x the heartbeat interval, to tolerate a missed beat or two from normal network jitter), the server marks the user offline.

A common, scale-friendly implementation: store `presence:{userId}` as a key in a fast TTL-capable store (Redis is the standard choice) with an expiry equal to the timeout window; every heartbeat simply refreshes the TTL. If the key expires, the user is offline — no background sweep needed to *detect* expiry, though one is still useful to *react* to it (e.g., to broadcast "user went offline" to that user's contacts). [Coding Challenge 02](../04-exercises/coding-challenges/challenge-02/) builds exactly this.

> ⚠️ **Warning:** Presence is inherently approximate, not exact — there is always a window (bounded by your heartbeat interval and timeout) where the system believes someone is online a few seconds after they actually disconnected. Stating this bound explicitly ("our presence is accurate to within ~15 seconds") is a sign of a candidate who understands the mechanism, rather than treating "online" as some real-time ground truth the system has perfect knowledge of.

---

## Key Takeaways

- "Real-time" in system design interviews almost always means soft real-time (low-latency, best-effort) — hard real-time (embedded/control systems) is a different discipline entirely.
- WebSockets give full bidirectional push over one persistent connection; SSE gives simpler one-directional server push over plain HTTP; long polling is a compatibility fallback for when neither will work.
- Notification delivery has three distinct channels — in-app (cheap, only reaches active users), mobile push via APNs/FCM (the only way to reach a backgrounded app), and email/SMS (slowest, reserved for critical/guaranteed delivery) — and a real design states the fallback chain between them.
- Presence is detected via heartbeats and a timeout, almost always implemented as a TTL key per user in a fast store like Redis — no heartbeat before the TTL expires means offline.
- Presence accuracy is bounded by the heartbeat interval, not instantaneous — always state that bound rather than treating "online" as a perfectly real-time fact.
