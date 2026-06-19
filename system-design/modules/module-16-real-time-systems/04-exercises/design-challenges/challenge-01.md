# Design Challenge 01: Design WhatsApp

**Difficulty:** Hard

## Prompt

Design WhatsApp's core real-time messaging system: 1:1 message delivery, group chat, read receipts, and online presence, at a scale of hundreds of millions of daily active users.

## What to Produce

1. **Connection layer**: what transport (WebSocket, SSE, long polling, or a mix) you'd use for the client-server connection, and why — including how you'd handle clients on unreliable mobile networks.
2. **Message delivery path** for a 1:1 message: what happens when the recipient is online vs. offline, and how you guarantee the message isn't lost in either case.
3. **Group chat fan-out**: how a single message reaches every member of a group, including members who are offline.
4. **Message ordering**: how you guarantee messages within a conversation are ordered consistently for every participant, despite clients on different devices with different clocks.
5. **Read receipts**: how per-user read state is tracked and delivered efficiently for both 1:1 and group conversations, without storing one flag per message per recipient.
6. **Online presence**: how "online"/"last seen" is detected and propagated to a user's contacts, including the staleness/accuracy trade-off involved.
7. **Horizontal scaling**: how the connection layer scales across many server instances — specifically, how a message gets from the server handling the sender's connection to the (possibly different) server holding the recipient's connection.
8. At least 3 trade-offs you made explicitly, and what you'd choose differently under a different constraint (e.g., "if delivery latency mattered more than server cost, I would instead...").

## Constraints to Assume

- 200 million daily active users, with a meaningful fraction concurrently connected at peak.
- Most messages are 1:1; group chats exist but are a minority of total message volume.
- Mobile clients on variable-quality networks — connections drop and reconnect frequently.
- Messages must never be silently lost, even if the recipient is offline for days.

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md).
