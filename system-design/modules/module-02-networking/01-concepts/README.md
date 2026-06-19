# Module 02 — Concepts: Networking Fundamentals

## Why This Matters

Every architecture diagram you'll ever draw has arrows between boxes. Those arrows are not free — they cross a network, and the network has physics: a finite speed of light, packet loss, and connection setup overhead. A system designer who doesn't understand what an arrow actually costs will under-budget latency, over-trust "the network," and be blindsided when a design that worked at 10 requests/second falls over at 10,000. This module makes the arrows concrete.

---

## The OSI Model (Simplified)

The full 7-layer OSI model is academic overkill for system design — three layers do almost all the work in this repository:

- **L3 (Network layer)** — IP addressing and routing. "How does a packet find its way from my laptop to a server in another country?"
- **L4 (Transport layer)** — TCP and UDP. "Does delivery need to be reliable and ordered, or just fast?"
- **L7 (Application layer)** — HTTP, gRPC, WebSocket. "What's the actual message format applications speak?"

> 💡 **Note:** When someone says "L4 load balancer" or "L7 load balancer" (covered in [Module 07](../../module-07-load-balancing/)), they're referencing exactly this model — L4 balances based on IP/port, L7 can inspect the actual HTTP request.

---

## IP Addressing

- **IPv4** — 32-bit addresses (`192.168.1.1`), ~4.3 billion possible, effectively exhausted for public allocation.
- **IPv6** — 128-bit addresses, astronomically larger space, slowly being adopted.
- **Public vs. private** — private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) are not globally routable; this is why your laptop and your neighbor's laptop can both be `192.168.1.5` without conflict.
- **CIDR notation** (`10.0.0.0/24`) — the `/24` denotes how many leading bits are the fixed network prefix; a `/24` gives you 256 addresses, a `/16` gives you 65,536.

---

## DNS: How a Domain Name Becomes an IP Address

DNS is a distributed, hierarchical, heavily cached lookup system. Resolving `www.example.com` typically goes:

1. Browser checks its local cache.
2. If not cached, it asks a **recursive resolver** (often your ISP's, or a public one like 8.8.8.8).
3. The recursive resolver asks a **root server** ("who handles `.com`?").
4. It then asks the `.com` **TLD server** ("who handles `example.com`?").
5. It then asks `example.com`'s **authoritative server** ("what's the IP for `www`?").
6. The answer is returned and cached at every layer for the duration of its **TTL** (time-to-live).

> 📊 **Diagram:** `dns-resolution-flow.drawio` — End-to-end DNS resolution showing client → recursive resolver → root server → TLD server → authoritative server, with the final IP answer flowing back and being cached at each hop.

> 🎯 **Interview Tip:** TTL is a real design lever, not just a DNS implementation detail. A low TTL (e.g. 60s) lets you reroute traffic quickly during an incident or deploy, at the cost of more DNS query volume. A high TTL reduces query load but means a bad change propagates slowly to undo.

---

## TCP vs. UDP

| | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (handshake required) | Connectionless |
| Reliability | Guaranteed delivery, retransmission | No guarantee — packets can be lost |
| Ordering | Guaranteed in-order delivery | No ordering guarantee |
| Overhead | Higher (acks, flow control, congestion control) | Minimal |
| Typical use cases | Web traffic (HTTP), databases, anything needing correctness | Video calls, gaming, DNS queries, anything favoring speed over perfect delivery |

> ⚠️ **Warning:** "UDP is unreliable" doesn't mean "UDP is bad" — it means the application is responsible for handling loss if it matters. Live video can tolerate a dropped frame (reliability would mean re-sending an old, now-useless frame); a bank transfer cannot. Choosing UDP is choosing to build your own reliability *only where you need it*, instead of paying for guarantees you don't.

---

## HTTP/1.1 vs HTTP/2 vs HTTP/3

- **HTTP/1.1** — text-based, one request per TCP connection at a time without pipelining issues (in practice), leading to the "6 connections per domain" workaround browsers used for years.
- **HTTP/2** — binary framing, **multiplexing** (many requests over one TCP connection simultaneously), header compression (HPACK), and server push. Solves the connection-per-request problem, but all multiplexed streams still share one TCP connection, so a single lost packet can stall every stream ("head-of-line blocking" at the TCP layer).
- **HTTP/3** — runs over **QUIC** (built on UDP, not TCP), which implements its own reliability and per-stream flow control, eliminating head-of-line blocking at the transport level, and includes faster connection setup (0-RTT possible for repeat connections).

> 🎯 **Interview Tip:** If a system has many small, latency-sensitive requests (e.g., loading a page with 80 resources), naming HTTP/2 or HTTP/3 as the transport choice — and explaining why multiplexing matters here — is a small detail that signals real depth.

---

## HTTPS and TLS

HTTPS is HTTP carried over a TLS-encrypted connection. TLS provides three things: **encryption** (no one can read the data in transit), **integrity** (no one can tamper with it undetected), and **authentication** (the certificate proves you're talking to who you think you are). The TLS handshake adds round trips before any application data flows — TLS 1.3 reduced this to effectively one round trip, down from two in TLS 1.2.

---

## WebSockets

A WebSocket starts as a normal HTTP request that asks to be "upgraded," then becomes a persistent, full-duplex TCP connection — either side can send a message at any time, without the request/response back-and-forth HTTP requires. This is what makes WebSockets the default choice for chat, live collaboration, and gaming, covered in depth in [Module 16 — Real-Time Systems](../../module-16-real-time-systems/).

## Long Polling vs. Short Polling vs. SSE vs. WebSockets

| Technique | How It Works | Trade-off |
|---|---|---|
| **Short polling** | Client repeatedly asks "anything new?" on a fixed interval | Simple, but wastes requests when nothing changed, and has up-to-interval latency |
| **Long polling** | Server holds the request open until there's something to return (or a timeout) | Lower latency than short polling, but ties up a server connection per waiting client |
| **SSE** | Server keeps one HTTP connection open and streams events as plain text | Simple, one-directional (server → client only), works over plain HTTP |
| **WebSockets** | Persistent, bidirectional connection | Most powerful and lowest latency, but requires connection-state management at scale (see Module 16) |

---

## Ports and Protocols Every Engineer Should Know

| Port | Protocol |
|---|---|
| 80 | HTTP |
| 443 | HTTPS |
| 22 | SSH |
| 53 | DNS |
| 5432 | PostgreSQL |
| 3306 | MySQL |
| 6379 | Redis |
| 9092 | Kafka (default broker port) |

---

## Key Takeaways

- L3/L4/L7 are the only three OSI layers that matter for most system design conversations: addressing, transport reliability, and application protocol.
- DNS is a cached, hierarchical lookup — TTL is a real design lever for how fast you can reroute traffic.
- TCP buys reliability and ordering at the cost of overhead; UDP buys speed at the cost of needing the application to handle loss itself.
- HTTP/2 multiplexes many requests over one connection; HTTP/3 (via QUIC/UDP) removes the remaining head-of-line blocking HTTP/2 still has at the TCP layer.
- WebSockets, SSE, and polling exist on a spectrum from "client asks repeatedly" to "server pushes whenever it wants" — pick based on directionality and latency needs, not by default habit.
