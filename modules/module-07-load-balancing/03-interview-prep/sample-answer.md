# Sample Answer: "How Would You Design Highly Available Load Balancing for a Global Service?"

> A fully worked deep-dive answer, applying the framework from [`README.md`](./README.md) to a concrete prompt.

---

## Clarify the Scope

Before designing anything, pin down: how many regions, what traffic shape (mostly reads vs. mixed read/write), is there any session-stateful behavior, and what's the acceptable failover time if a region or load balancer goes down? For this answer, assume a global web/API service serving users across North America, Europe, and Asia, with a mix of HTTP API traffic and some long-lived WebSocket connections, and a target of sub-minute failover.

## Layer 1: Global Load Balancing (Region Selection)

Users need to reach the *nearest healthy region* before any in-region load balancer matters at all.

- **Choice: GeoDNS**, not Anycast. Anycast's near-instant failover is attractive, but it requires BGP-level network control that's a heavy operational lift not justified unless this service is operating at CDN/cloud-provider scale itself. GeoDNS resolves users to their nearest region's entry point and is supported by standard managed DNS providers (Route 53 geolocation routing, Cloudflare's geo-steering).
- **Trade-off accepted**: failover when an entire region fails is bounded by DNS TTL, not instant. Mitigate by keeping the TTL deliberately short (e.g., 60 seconds) for this specific record, accepting slightly worse DNS caching efficiency in exchange for faster regional failover.

## Layer 2: In-Region Load Balancer Tier (High Availability)

Within each region, the load balancer tier itself must not be a single point of failure.

- **Choice: active-active**, at least two load balancer instances per region, behind a **floating IP** that the region's GeoDNS record points to. Both instances receive traffic simultaneously; if one fails its own health check, the floating IP mechanism (or the cloud provider's managed load balancer service, e.g. an AWS ALB which is inherently multi-AZ) routes around it within seconds.
- **Why not active-passive**: it leaves the standby's capacity completely idle, and this service's traffic volume justifies using that capacity rather than paying for it to sit unused.

## Layer 3: Algorithm and Protocol Choice

- **L7 (ALB-equivalent)** for the HTTP API traffic, since routing needs to distinguish at minimum `/api/*` from static asset paths, and SSL termination needs to happen somewhere central.
- **Least Connections**, not Round Robin, as the algorithm — this service's request costs vary significantly (a cache-hit read and a complex aggregation query are not the same cost), so spreading purely by count of requests (Round Robin) would let cost-heavy requests pile up unevenly on whichever backend got unlucky.
- **WebSocket connections need special handling**: these are long-lived, so Least Connections naturally avoids piling many onto one backend (a connection that lasts an hour counts against that backend's load for the whole hour, exactly as it should).

## Layer 4: Health Checks

- **Active**: every backend exposes `/health`, checked every 10 seconds, which verifies database connectivity and the backend's queue depth — not just "process is up."
- **Passive**: the load balancer tracks real request error rates per backend over a rolling window and pulls a backend out of rotation if its real-traffic error rate spikes, even between active check intervals.

## Layer 5: State and Session Affinity

- No sticky sessions. Session state (auth tokens, user preferences needed mid-request) is externalized to a shared Redis cluster reachable from every backend in the region, so any backend can serve any request — this keeps backends interchangeable, which is the precondition for Least Connections (or any algorithm) actually working as intended.
- The one exception: the WebSocket connections themselves are inherently sticky to whichever backend accepted them (a TCP connection can't be "moved"), but that's a property of the connection, not a load-balancer feature — once the connection ends, the next one is freely load-balanced again.

## Layer 6: Deployments

- **Connection draining** with a deregistration delay set above the service's p99 latency (measured, not guessed) for the slowest endpoint, so rolling deploys never forcibly cut off a legitimately slow-but-healthy request.
- WebSocket connections get a longer drain allowance specifically, since cutting one off mid-session is more disruptive to the user than a single HTTP request retry would be.

## Trade-offs Summary

| Decision | Choice | Trade-off Accepted |
|---|---|---|
| Global routing | GeoDNS over Anycast | Failover bounded by DNS TTL, not instant — but far lower operational complexity |
| Regional LB HA | Active-active over active-passive | More coordination required; no idle standby capacity |
| Algorithm | Least Connections over Round Robin | Requires live connection tracking; correctly reflects this service's variable request cost |
| Session state | Externalized (Redis) over sticky sessions | An extra network hop per request needing session data; keeps backends fully interchangeable |

## Closing the Loop

This design explicitly avoids two single points of failure (the global routing layer and the regional load balancer tier), picks an algorithm justified by the actual traffic shape rather than a default, and ties session handling back to the statelessness principle from [Module 06](../../module-06-scalability/01-concepts/README.md) — which is exactly the kind of cross-module, trade-off-aware reasoning an interviewer is listening for.
