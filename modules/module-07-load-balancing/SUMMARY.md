# Module 07 — Load Balancing: Summary

> This module covered how a fleet of redundant servers is turned into one reliable system: the L4/L7 split, the algorithms that decide which backend handles each request, health checks, making the load balancer itself highly available, and the operational nuance — connection draining, SSL termination, service mesh — that separates a load balancer that works in a demo from one that survives a real deploy.

---

## Key Concepts

1. **L4 vs. L7 load balancing** — L4 forwards on IP/port only and is fast but content-blind; L7 terminates the protocol and can route on path, headers, or cookies at the cost of more CPU per request.
2. **Round Robin** — fixed rotating order across backends; simple and fair only when backends and request cost are roughly uniform.
3. **Least Connections** — routes to the backend with the fewest active connections, adapting to uneven request cost that Round Robin ignores.
4. **IP Hash** — deterministically maps a client to the same backend, giving free session affinity at the cost of distribution evenness.
5. **Sticky sessions** — pinning a client to one backend for session state; a workaround for stateful backends, not a best practice, since externalizing session state removes the need for it.
6. **Load balancer HA** — active-active or active-passive behind a floating IP, because a single load balancer just relocates the single point of failure it was meant to remove.
7. **Connection draining (deregistration delay)** — lets in-flight requests finish before a backend leaves rotation, the mechanism that enables zero-downtime rolling deploys.
8. **Service mesh** — decentralizes load balancing to a per-instance sidecar proxy for east-west (service-to-service) traffic, avoiding the bottleneck a centralized LB would become at microservices scale.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Load balancing layer | L4 | L7 | You only need to spread connections, need max throughput | Routing depends on request content (path, header, cookie) |
| Algorithm | Round Robin | Least Connections | Backends and requests are uniform | Request cost varies significantly across requests |
| Session handling | Sticky sessions (IP Hash / cookie) | Externalized session state | Quick fix, can't change backend code right now | You want backends to stay fully interchangeable |
| LB tier HA | Active-passive | Active-active | Simplicity, traffic volume is modest | Traffic volume justifies using all provisioned capacity |
| Global routing | GeoDNS | Anycast | Standard DNS-level multi-region routing is enough | You control BGP/network routing and need near-instant failover |

---

## Common Interview Questions from This Module

- What's the difference between L4 and L7 load balancing, and when would you choose each?
- Why is a load balancer a single point of failure, and how do you fix that?
- What is connection draining, and why does it matter for zero-downtime deployments?
- How do a load balancer, a reverse proxy, and an API gateway differ?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Round Robin / Weighted Round Robin | Simple, predictable request distribution across uniform (or known-heterogeneous) backends |
| Least Connections | Adapts routing to real-time backend load when request cost is uneven |
| IP Hash | Session affinity without any server-side session storage |
| Active-active LB HA behind a floating IP | Removes the load balancer itself as a single point of failure |
| Connection draining | Zero-downtime rolling deploys — no in-flight request is ever forcibly aborted |
| Service mesh sidecar proxy | Decentralized east-west load balancing, retries, and mTLS in microservices |

---

## What This Unlocks

After this module, you can tackle:
- [Module 08 — Message Queues](../module-08-message-queues/), which covers how systems decouple work that shouldn't sit on the synchronous request/response path a load balancer manages
- [Module 10 — CDN](../module-10-cdn/), which applies global load balancing concepts (Anycast, GeoDNS) at the content-delivery edge
- [Module 11 — Microservices](../module-11-microservices/), which builds directly on the service mesh / API gateway distinctions introduced here
- Infrastructure-design interview questions like "design highly available load balancing for a global service" with a layered, trade-off-aware answer

---

## Quick Reference

- **L4** = IP/port only, fast, blind. **L7** = full HTTP, slower, content-aware routing.
- **Round Robin** = fixed rotation. **Least Connections** = adapts to load. **IP Hash** = free session affinity.
- A load balancer needs its own HA story (active-active/active-passive + floating IP) — one LB is a relocated SPOF, not a removed one.
- **Connection draining** = stop new traffic, let in-flight requests finish, up to a timeout above your p99 latency.
- **SSL termination at the LB** saves backend CPU but leaves internal traffic plaintext unless you re-encrypt.
- **LB vs. reverse proxy vs. API gateway**: interchangeable backends (LB) vs. general request forwarding (reverse proxy) vs. routing between distinct services (API gateway).
- **Service mesh** = load balancing decentralized to a sidecar per instance, for service-to-service traffic.
- **GeoDNS** = simple, DNS-TTL-bounded failover. **Anycast** = near-instant, requires BGP control.

---

← [Previous Module ← Module 06 — Scalability](../module-06-scalability/) | [Next Module → Module 08 — Message Queues](../module-08-message-queues/)
