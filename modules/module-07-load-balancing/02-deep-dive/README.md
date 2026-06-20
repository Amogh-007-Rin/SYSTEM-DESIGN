# Module 07 — Deep Dive: Draining, SSL Termination, and the LB/Proxy/Gateway/Mesh Spectrum

## Why This Matters

Knowing the algorithms a load balancer can use to pick a backend is only half the job. The other half is everything that happens *around* a request: how a deploy avoids dropping in-flight requests on the floor, who pays the cost of encrypting traffic, and — increasingly, in a microservices world — what even counts as "the load balancer" anymore once every service talks to every other service through its own local proxy. This deep dive covers the operational nuance that separates a load balancer that works in a demo from one that survives a real deploy at 3am.

---

## Connection Draining (Deregistration Delay)

When a backend is about to be removed from rotation — because it's unhealthy, or because a deploy is replacing it — simply yanking it out immediately would abort every request currently in flight to it. **Connection draining** (AWS calls this the **deregistration delay**) instead stops sending *new* requests to that backend immediately, while letting its existing in-flight requests finish naturally, up to a configured timeout (AWS's ALB default is 300 seconds).

This is the mechanism that makes **zero-downtime deployments** possible in a rolling-deploy strategy: take one backend out of rotation, drain it, deploy the new version, health-check it back in, then move to the next backend — at no point does a client get connection-refused or a half-finished response.

> ⚠️ **Warning:** A deregistration delay that's too short relative to your slowest endpoint's typical latency will forcibly cut off legitimately slow-but-healthy requests during every deploy — effectively turning your rollout process into an intermittent outage for your slowest users. Set it comfortably above your p99 latency for the slowest endpoint the load balancer serves, not just the median.

The [`examples/`](./examples/) directory in this section simulates a rolling deploy with connection draining, tracking in-flight requests per node before it's removed from rotation.

---

## SSL/TLS Termination at the Load Balancer

Encrypting traffic costs CPU. **SSL termination at the load balancer** means the load balancer decrypts incoming HTTPS traffic and forwards plain HTTP to backends internally, instead of every backend doing its own TLS handshake.

| | SSL Termination at LB | End-to-End Encryption (Re-encryption) |
|---|---|---|
| Backend CPU cost | Lower — backends skip TLS entirely | Higher — every backend handles TLS too |
| Certificate management | Centralized at the LB only | Certificates needed at the LB *and* every backend |
| Internal traffic | Plaintext between LB and backends | Encrypted all the way to the backend |
| Compliance fit | Fine for most workloads if the internal network is trusted | Required when regulations demand encryption at every hop (PCI-DSS, HIPAA in some configurations) |

The compromise — **TLS re-encryption** (sometimes called "SSL bridging") — has the load balancer terminate the client's TLS connection, then open a *new*, separate TLS connection to the backend. This keeps every hop encrypted while still letting the load balancer inspect and route on the decrypted L7 content (path, headers) in between, at the cost of doing the TLS handshake twice.

> 💡 **Note:** "The internal network is trusted so plaintext internally is fine" was the default assumption for years — it's the assumption a zero-trust/service-mesh architecture (see below) explicitly rejects, since it assumes any internal hop could be compromised too.

---

## Load Balancer vs. Reverse Proxy vs. API Gateway

These three terms get used almost interchangeably in casual conversation, but each emphasizes a different primary job — and in a real architecture, the same physical software (commonly Nginx or Envoy) is often configured to do more than one of these jobs at once.

| Term | Primary Job | Typical Extra Capabilities |
|---|---|---|
| **Load Balancer** | Distribute traffic across a pool of identical/equivalent backends | Health checks, SSL termination |
| **Reverse Proxy** | Sit in front of one or more backends, forwarding client requests on their behalf | Caching, compression, load balancing as a side effect |
| **API Gateway** | Be the single entry point for many distinct backend *services* (not just replicas of one service) | Authentication, rate limiting, request transformation, routing by API version/path to entirely different services, analytics |

The clearest way to tell them apart: a load balancer's backends are interchangeable (any of them can answer any request); an API gateway's backends are *not* interchangeable (the orders service and the inventory service do different things, and the gateway routes between them on purpose, not just for load distribution).

> 🎯 **Interview Tip:** If a system has multiple distinct microservices behind one public entry point, say "API gateway," not "load balancer" — even though the gateway likely load-balances *within* each service's pool too. Using the more precise term signals you understand the difference between balancing replicas and routing between services.

---

## Service Mesh: Load Balancing Inside Microservices

In a microservices architecture, load balancing isn't only a north-south concern (client → backend) — it's also an east-west concern (service A calling service B, dozens or hundreds of times across a request's lifecycle). Routing every one of those internal calls through a centralized load balancer would make that LB an enormous bottleneck and a single point of failure for all internal traffic.

A **service mesh** (Istio, Linkerd) solves this by giving every service instance its own lightweight **sidecar proxy** (Envoy, in Istio's case) that handles outgoing and incoming traffic for that instance specifically — including client-side load balancing across the destination service's available instances, retries, timeouts, circuit breaking, and mutual TLS between services, all without the application code being aware any of it is happening.

> 💡 **Note:** The HA pattern from [01-concepts](../01-concepts/README.md#the-load-balancer-as-a-single-point-of-failure) (`load-balancer-ha.drawio`) doesn't apply here in the same form — a service mesh distributes the load-balancing decision itself out to every sidecar instead of centralizing it the way a north-south load balancer does, so there's no single shared "mesh load balancer" to make highly available; the responsibility is fully decentralized per-instance.

| | Centralized LB (north-south) | Service Mesh (east-west) |
|---|---|---|
| Where the decision is made | One (or a small HA set of) shared load balancer(s) | Locally, in a sidecar next to each calling service instance |
| Failure blast radius if it breaks | All traffic through that LB | Only that one instance's outgoing calls |
| Added latency | One extra network hop through the LB | Local hop to the sidecar (same host/pod), much smaller |
| Operational complexity | Lower — one thing to run and monitor | Higher — a sidecar per instance, plus a control plane |

> ⚠️ **Warning:** A service mesh is a significant operational investment (a control plane, a sidecar in every pod, new failure modes of its own) — it earns its complexity at real microservices scale (dozens of services, east-west traffic dominating), but adopting one for two or three services is usually over-engineering. Start with simple client-side or library-based retries/timeouts, and reach for a mesh once that approach stops scaling operationally.

---

## Key Takeaways

- Connection draining lets in-flight requests finish before a backend leaves rotation, which is the mechanism that makes zero-downtime rolling deploys possible.
- SSL termination at the load balancer saves backend CPU but means internal traffic is plaintext by default; TLS re-encryption keeps every hop encrypted at the cost of a second handshake.
- Load balancer, reverse proxy, and API gateway describe overlapping but distinct primary jobs — the clearest test is whether the backends behind it are interchangeable (LB) or distinct services (API gateway).
- A service mesh decentralizes load balancing to a per-instance sidecar for east-west (service-to-service) traffic, avoiding the bottleneck a single centralized LB would become at microservices scale.
- Every choice here is a trade-off between operational simplicity and a specific guarantee (encryption everywhere, zero downtime, decentralized resilience) — none of these techniques are free.
