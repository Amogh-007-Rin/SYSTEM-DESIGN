# Design Challenge 01 — Solution: Design WhatsApp

## Connection Layer

**WebSockets**, for one specific reason: 1:1 chat genuinely needs low-latency bidirectional traffic over the same channel — a message in, a read receipt or typing indicator out, often within the same brief exchange. SSE's one-directional model would force splitting sends onto a separate HTTP channel, adding complexity without removing it (you'd still need *some* persistent connection for receiving).

For unreliable mobile networks: clients reconnect aggressively with exponential backoff, and every connection includes a "resume from sequence N" handshake (see message ordering below) so a reconnecting client can request everything it missed while disconnected, rather than the server needing to track per-client connection state across the gap. As a compatibility fallback for networks that actively block WebSocket upgrades (some corporate/restrictive mobile networks still do), the client degrades to long polling — exactly the historical reason WhatsApp's own early Erlang-based infrastructure relied on long-held connections before WebSocket support was network-wide.

## 1:1 Message Delivery

Every message write goes to **two places, both required, neither optional**:
1. **A durable message store** (the source of truth) — keyed by conversation, with a per-conversation sequence number (see ordering below). This succeeds or the send is reported as failed to the sender; it's what makes "never silently lost" true regardless of the recipient's connection state.
2. **A live delivery attempt** — if the recipient has an active connection (checked via a connection registry, see scaling below), the message is pushed immediately over their socket via the pub/sub backbone. If they're offline, this step is simply skipped — the durable write already happened, so nothing is lost; the recipient receives it on their next reconnect via a fetch of "everything since my last known sequence number."

The sender's client distinguishes three delivery states (sent → delivered → read), where "delivered" specifically means "durably stored and either pushed live or confirmed retrievable" — not "currently connected," since delivery and current connectivity are different facts.

## Group Chat Fan-Out

A group message is durably written once (to the conversation's message store, same as 1:1), then fanned out to every group member: for each member with an active connection, deliver live via the pub/sub backbone (per [Module 16's deep dive](../../02-deep-dive/README.md) fan-out pattern); for offline members, no live action is taken — same reasoning as 1:1, the durable write covers them.

![Chat system group message write path diagram](../../01-concepts/diagrams/exports/chat-system-architecture.png)
*A group message's write path: one durable write to the conversation's message store, followed by parallel live-delivery attempts to each connected group member via the pub/sub backbone — offline members rely entirely on the durable write for eventual delivery on reconnect.*

For large groups (hundreds of members), fan-out is the dominant cost — this is exactly the hierarchical fan-out pattern from the deep dive: the durable write triggers one publish to the backbone, which is fanned out by each subscribed server instance only to the (much smaller) subset of group members it personally holds connections for.

## Message Ordering

Each conversation (1:1 or group) has its own monotonically increasing sequence number, assigned **server-side** at write time to the durable store — never client-side, since client clocks drift and a reply could otherwise display before the message it replies to. Clients render strictly by sequence number; a client noticing a gap in sequence numbers (e.g., it has #41 and #43 but not #42) knows to explicitly re-fetch the missing range rather than silently rendering an incomplete conversation.

## Read Receipts

Tracked as a per-(user, conversation) **high-water mark** — "user X has read through sequence N" — rather than a flag per message per recipient. For a group with 200 members and 10,000 messages, that's 200 numbers to track (one per member), not 2,000,000 flags. Updating the mark is itself a small real-time event delivered the same way a message is: durably recorded, then pushed live to the other participant(s) so their UI updates the double-checkmark/"seen" indicator without polling.

## Online Presence

A heartbeat-driven TTL key per user (`presence:{userId}`, refreshed on every heartbeat, expiring after a short timeout — the exact mechanism built in [Coding Challenge 02](../coding-challenges/challenge-02/)). When a user's key expires, the system records a "last seen" timestamp (the time of the last successful heartbeat) and propagates an "offline" event to their contacts who have them in view. This is explicitly an approximation — "online" means "heartbeated within the last ~15–30 seconds," not "definitely connected right now" — and the design should state that bound rather than imply perfect knowledge.

## Horizontal Scaling

At hundreds of millions of DAU with a meaningful concurrent fraction, this is squarely the scaling problem from [Module 16's deep dive](../../02-deep-dive/README.md):

- **Sticky sessions** at the load balancer route a client's connection consistently to one server instance.
- **A connection registry** (`userId -> serverInstanceId`, in a fast key-value store, refreshed alongside presence) lets the message-delivery path look up exactly which instance holds a recipient's connection, rather than broadcasting every message to the entire fleet.
- **A pub/sub backbone** (Redis Cluster or a dedicated broker, given the message volume) is the channel the sender's instance publishes to, targeted at the recipient's specific instance per the registry lookup, and that instance delivers to the actual socket it holds.

## Trade-offs

| Decision | Choice | Trade-off | Under a different constraint, I'd instead... |
|---|---|---|---|
| Delivery vs. durability ordering | Durable write happens before/independent of live delivery attempt | Slightly higher write latency (every message pays the durable-store write cost even when the recipient is online and could theoretically get it faster) | ...if raw latency mattered more than absolute durability (e.g., a live-only ephemeral feature), allow live delivery to fire in parallel with the durable write rather than gating on it, accepting a small window of risk |
| Read receipt granularity | High-water mark per (user, conversation) | Cannot express "read message #5 but not #3" (out-of-order reads) — assumes reads are effectively sequential, which is true for chat UIs that render top-to-bottom | ...if a UI allowed genuinely out-of-order reads (e.g., jumping to a search result), I'd need a sparse "set of read sequence numbers" instead of one scalar mark, at higher storage cost |
| Cross-instance delivery | Connection registry + targeted publish | Extra moving part and a lookup on every send, versus simpler (but far more wasteful) broadcast-to-all-instances | ...at a much smaller scale (a startup's first 10K users), I'd skip the registry and just broadcast to all instances — the waste is negligible below a certain fleet size, and the registry is complexity not yet earned |
