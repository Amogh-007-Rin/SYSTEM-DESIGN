# Module 07 — Common Interview Questions

**Q1: What's the difference between L4 and L7 load balancing, and when would you choose each?**
L4 load balancing operates on IP address and TCP/UDP port only — it's fast because it never parses the application protocol, but it's blind to anything inside the request. L7 load balancing terminates the actual protocol (HTTP) and can route on path, headers, or cookies, at the cost of more CPU work per request. Choose L4 when you just need to spread raw connections across identical backends as fast as possible; choose L7 when the routing decision depends on request content, like sending `/api/*` and `/static/*` to different backend pools.

**Q2: How do Round Robin, Least Connections, and IP Hash differ, and when would you pick each?**
Round Robin cycles through backends in fixed order — simple and fair when backends and requests are roughly uniform, but blind to actual load. Least Connections routes to whichever backend has the fewest active connections, adapting well when request cost varies significantly. IP Hash deterministically maps a client to the same backend every time, which gives session affinity for free but can distribute unevenly if client IPs aren't well spread (e.g., many users behind one corporate NAT hashing to the same backend).

**Q3: Why is a load balancer a single point of failure, and how do you fix that?**
Adding one load balancer in front of a redundant backend fleet just moves the single point of failure up a layer — if that one load balancer dies, the entire (otherwise healthy) backend fleet becomes unreachable. The fix is making the load balancer tier itself highly available: active-passive (a standby takes over on failure) or active-active (multiple load balancers share traffic simultaneously), typically coordinated via a floating IP that can move to a healthy instance almost instantly.

**Q4: What are sticky sessions, and why are they considered a workaround rather than a best practice?**
Sticky sessions route every request from a given client to the same backend, usually via a cookie or IP Hash, so that server-side session state stored in that backend's memory remains reachable. They're a workaround because they reintroduce statefulness into what should be a stateless, horizontally scalable tier — they unbalance load, and they cause every pinned session to lose its state at once if that backend fails. The better long-term fix is externalizing session state (Redis, a database) so any backend can serve any request.

**Q5: What's the difference between active and passive health checks?**
Active health checks have the load balancer proactively ping each backend on a schedule (e.g., `GET /health`) independent of real traffic, catching dead backends even during quiet periods. Passive health checks infer backend health from real production traffic patterns (recent real requests erroring or timing out), with no extra synthetic load, catching failure modes that only appear under genuine request shapes. Production systems typically run both.

**Q6: What is connection draining, and why does it matter for deployments?**
Connection draining (AWS's deregistration delay) stops sending new requests to a backend being removed from rotation while letting its existing in-flight requests finish naturally, up to a timeout. It's the mechanism that makes zero-downtime rolling deployments possible — without it, taking a backend out of rotation for a deploy would abort every request currently in flight to it.

**Q7: What are the trade-offs of terminating SSL at the load balancer versus end-to-end encryption?**
Terminating SSL at the load balancer means backends skip the TLS handshake entirely, reducing their CPU cost and centralizing certificate management — but traffic between the load balancer and backends is plaintext by default. End-to-end encryption (TLS re-encryption / SSL bridging) keeps every hop encrypted by having the load balancer open a fresh TLS connection to the backend after terminating the client's, at the cost of performing the handshake twice and managing certificates in more places.

**Q8: How do a load balancer, a reverse proxy, and an API gateway differ?**
A load balancer distributes traffic across a pool of interchangeable backends — any of them can answer any request. A reverse proxy sits in front of one or more backends forwarding requests on their behalf, often adding caching or compression, with load balancing as a possible side effect. An API gateway is the single entry point for multiple distinct backend services that are *not* interchangeable, adding cross-cutting concerns like authentication, rate limiting, and routing by API version or path to entirely different services.

**Q9: What does a service mesh add that a centralized load balancer doesn't handle well?**
In a microservices architecture, service-to-service (east-west) calls happen far more often than client-to-backend (north-south) calls, and routing every one of them through a centralized load balancer would make it an enormous bottleneck and single point of failure for all internal traffic. A service mesh (Istio, Linkerd) gives every service instance a local sidecar proxy that handles client-side load balancing, retries, timeouts, and mutual TLS for that instance specifically — decentralizing the decision instead of centralizing it.

**Q10: What's the difference between GeoDNS and Anycast for global load balancing, and why does the difference matter operationally?**
GeoDNS returns a different IP address depending on the geographic location of the DNS resolver, routing users to their nearest region — simple to operate with a standard DNS provider, but failover speed is bounded by however long DNS responses are cached (their TTL). Anycast announces the same IP from multiple physical locations via BGP, letting normal internet routing send each user to the nearest location, with near-instant failover — but it requires control over network-layer routing, which is a much heavier operational lift typically only justified at CDN or large cloud-provider scale.
