# Module 16 — Interview Prep: Real-Time Systems

## Why This Matters

"Design a chat application" and "design a notification system" are two of the most frequently asked system design interview prompts, precisely because they force a candidate to reason about something request/response thinking doesn't prepare you for: a server that has to *initiate* contact with a client, at scale, reliably. Interviewers use this module's topics to separate candidates who've memorized "use WebSockets" as a buzzword from candidates who can explain what happens to that WebSocket the moment a second server instance enters the picture.

---

## A Framework for Real-Time System Design Questions

1. **Identify the actual real-time requirement first** — bidirectional or one-directional? Does the client need to send data back over the same channel, or just receive? This single question eliminates either WebSockets or SSE from consideration immediately.
2. **State the connection model explicitly** — WebSocket, SSE, or long-polling fallback — and justify it against the requirement from step 1, not by default.
3. **Address horizontal scaling unprompted** — the moment you say "WebSocket server," immediately follow with how multiple instances of it share state (pub/sub backbone) and how clients get routed back to the right one (sticky sessions). Interviewers specifically watch for whether you raise this before being asked.
4. **Separate the durable path from the live path** — for anything resembling chat or notifications, state clearly that data is written to a durable store *and* pushed live to currently-connected recipients, as two separate concerns that both have to succeed independently.
5. **Name the presence/delivery guarantees you're providing** — "at least once," "best effort," exact ordering guarantees per conversation — and the trade-off each implies.
6. **Estimate the real per-instance load**, not just the global number — e.g., "10M concurrent connections across 500 server instances is 20K connections per instance," and reason about capacity from there.

> 🎯 **Interview Tip:** The single highest-leverage thing you can say unprompted in a real-time systems question is some version of: "this needs a pub/sub backbone so server instances that don't share memory can still deliver messages to connections held by other instances." Candidates who get this far without being prompted are demonstrating they've actually operated (or deeply studied) one of these systems, not just read about WebSockets.

---

## What Interviewers Are Listening For

- Whether you distinguish **delivery to an online recipient** from **durable storage for an offline one** — treating chat as "just send the message" without acknowledging both paths is the most common gap.
- Whether you can explain **why a load balancer alone doesn't solve WebSocket scaling** — sticky sessions solve routing, not cross-server delivery; a surprising number of candidates conflate the two.
- Whether you reach for the **right tool per requirement** (SSE for one-directional feeds, not WebSockets by default) rather than treating WebSockets as the only real-time primitive that exists.
- Whether you can reason about **fan-out cost** in concrete numbers rather than hand-waving "and then it scales."

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Scale a WebSocket-based notification system to 10 million concurrent connections").
