# Module 16 — Exercises

## Coding Challenges

| Challenge | Description |
|---|---|
| [01 — WebSocket Chat Server](./coding-challenges/challenge-01/) | Build a real-time chat server in TypeScript using the `ws` library, with room support, join/leave broadcasts, and a live user list |
| [02 — Presence System](./coding-challenges/challenge-02/) | Implement a heartbeat-driven presence tracker against a Redis-shaped TTL client, detecting when a silent user should flip to offline |

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Design WhatsApp](./design-challenges/challenge-01.md) | Design WhatsApp's message delivery, group chat, read receipts, and online presence end to end |

Challenge 01 (WebSocket chat server) is the most directly interview-relevant coding exercise in this module — "implement a chat server with rooms" is a real take-home/pairing exercise at multiple companies, not just a teaching device. Make sure you understand *why* each piece of state (the `clients` map and the `rooms` map) exists before moving to Challenge 02.
