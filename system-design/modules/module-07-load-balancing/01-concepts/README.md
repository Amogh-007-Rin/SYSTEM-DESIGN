# Module 07 — Concepts: Load Balancing

## Why This Matters

[Module 06](../../module-06-scalability/) established that the fix for "one server can't handle the load" is "run more servers." But the moment there's more than one server, a new question appears: **which server handles this particular request?** A client can't be expected to know that `app-server-7` just crashed, or that `app-server-3` is drowning in connections while `app-server-4` sits idle. A load balancer answers that question on every request, transparently, so the rest of the system can keep treating "the backend" as one reliable thing instead of a fleet of individually fragile machines. Get this component wrong and you don't just lose performance — you can route traffic into a dead server, or turn the load balancer itself into the one box that takes the whole system down.

---

## What Is a Load Balancer?

A load balancer sits between clients and a pool of backend servers, distributing requests across that pool according to an algorithm, while continuously checking which backends are actually healthy enough to receive traffic. Think of it like the host at a busy restaurant: customers don't pick their own table — the host sees the whole floor and seats each new party wherever they'll be served fastest, while quietly not seating anyone at a table that's on fire.

**Hardware** load balancers (F5 BIG-IP, Citrix ADC) are dedicated appliances with very high, purpose-built throughput but high upfront cost and slower config changes. **Software** load balancers (HAProxy, Nginx, Envoy) run as a process on commodity hardware, are configuration-as-code friendly, and dominate new system designs. Most teams today don't touch either directly — they use a managed cloud load balancer like **AWS ALB/NLB** or Google Cloud Load Balancing.

> 💡 **Note:** AWS's two load balancer products map directly onto the L4/L7 split below: **NLB** (Network Load Balancer) operates at L4, **ALB** (Application Load Balancer) at L7. Naming them correctly signals you understand *why* two products exist instead of one.

---

## L4 vs. L7 Load Balancing

| | L4 (Transport Layer) | L7 (Application Layer) |
|---|---|---|
| Decision basis | IP address + TCP/UDP port only | Full HTTP request — path, headers, cookies, body |
| Performance | Faster — no content parsing | Slower — must terminate and read the protocol |
| Capabilities | Simple forwarding | Content-based routing, rewriting, SSL termination |
| Use case | Raw TCP/UDP, extreme throughput | HTTP/HTTPS where routing logic matters |

An L4 load balancer is a fast packet-forwarding switch — it never looks past the IP/TCP header, so it has no idea whether a request is for `/login` or `/checkout`. An L7 load balancer terminates the HTTP connection and can route on the path, a header, or a cookie, at the cost of more CPU work per request.

> 🎯 **Interview Tip:** If asked "L4 or L7 here?", ask what the routing decision actually depends on. "Spread connections evenly across identical backends" is an L4 job. "Send `/video/*` to one service and `/api/*` to another" is inherently L7 — L4 physically cannot see the path.

> 📊 **Diagram:** `l4-vs-l7-load-balancing.drawio` — Shows the same client request flowing through an L4 load balancer (forwarding on IP/port only, blind to HTTP content) beside an L7 load balancer (terminating HTTP, reading the path/header, and routing to different backend pools accordingly).

---

## Load Balancing Algorithms

- **Round Robin** — requests rotate through backends in fixed order (1, 2, 3, 1, 2, ...). Simple and fair when backends are equal capacity and requests cost about the same.
- **Weighted Round Robin** — like Round Robin, but each backend gets a weight, so a more powerful (or newly warmed-up) server gets proportionally more requests.
- **Least Connections** — routes to whichever backend currently has the fewest active connections. Adapts to backends slowed by a long-running request or a GC pause, unlike Round Robin.
- **IP Hash** — hashes the client IP to deterministically pick the same backend every time for that client — a cheap way to get session affinity without the load balancer tracking session state itself.
- **Least Response Time** — combines active connection count with recent latency, routing around backends that are slow even with few connections.
- **Random** — picks a backend uniformly at random. Surprisingly competitive at scale ("power of two random choices" performs nearly as well as full Least Connections with far less bookkeeping) and trivial to implement.

| Algorithm | Best When | Weakness |
|---|---|---|
| Round Robin | Uniform backends, uniform request cost | Ignores real-time backend load |
| Weighted Round Robin | Heterogeneous backend capacity | Weights are static, don't adapt |
| Least Connections | Request cost varies significantly | Needs live per-backend connection tracking |
| IP Hash | Need affinity without server-side session storage | Uneven if client IPs aren't well distributed |
| Random | Large pools, want simplicity | Slightly less even than Least Connections |

The [`examples/`](./examples/) directory implements Round Robin, Weighted Round Robin, and IP Hash so you can see the actual selection sequence each produces.

> 📊 **Diagram:** `load-balancer-algorithms.drawio` — Shows one load balancer and four backend servers, with side-by-side request-sequence traces of how Round Robin, Weighted Round Robin (2:1:1:1), and Least Connections each assign the same 8 incoming requests differently.

---

## Sticky Sessions (Session Affinity)

Some apps keep session state (a cart, a login session) in the memory of the server that first handled that user — if a later request lands on a *different* backend, that state appears to vanish. **Sticky sessions** fix this by routing every request from a client to the same backend for the session's lifetime, typically via a cookie the load balancer sets, or via IP Hash.

> ⚠️ **Warning:** Sticky sessions are a workaround, not a best practice. They reintroduce the statefulness [Module 06](../../module-06-scalability/01-concepts/README.md) identifies as the enemy of clean horizontal scaling, they unbalance load (one backend can end up "owning" a disproportionate share of active sessions), and they fail badly when that backend dies — every pinned session loses its state at once. The better fix is to **externalize session state** (Redis, a database) so any backend can serve any request, making stickiness unnecessary.

---

## Health Checks

- **Active health checks** — the load balancer periodically pings each backend (`GET /health`) on a schedule, independent of real traffic, removing any backend that fails to respond correctly.
- **Passive health checks** — the load balancer infers health from real production traffic (the last several real requests to this backend errored or timed out), with no extra synthetic load.

Both matter: active checks catch a dead backend during a quiet period with no real traffic; passive checks catch failures that only show up under real request patterns. **Graceful degradation** — a backend shedding low-priority work or serving a simplified response under stress instead of timing out completely — buys recovery time without a full removal from rotation.

> 💡 **Note:** A health check should verify things that predict actual capability — database connectivity, downstream reachability — not just "is the process alive." A backend with an exhausted DB connection pool isn't healthy just because `/health` still returns 200.

---

## The Load Balancer as a Single Point of Failure

This is load balancing's central irony: you add a load balancer to remove any single backend as a point of failure, but with only *one* load balancer you've just moved the single point of failure up a layer — the whole backend fleet can be fine while the LB itself dying takes everyone offline.

- **Active-passive** — one load balancer serves all traffic; a standby monitors it and takes over (via a floating IP) on failure. Simple, but the standby's capacity sits idle.
- **Active-active** — multiple load balancers serve traffic simultaneously (split via DNS, a floating IP, or Anycast). No idle capacity, and one LB failing only reduces capacity instead of causing an outage.
- **Floating IP** — a virtual IP reassigned at the network level from a failed load balancer to a healthy standby almost instantly, so clients keep using the same IP through a failover with no DNS propagation delay.

> 📊 **Diagram:** `load-balancer-ha.drawio` — Shows an active-active load balancer HA setup: two LB instances both receiving traffic via a floating IP, each independently health-checking and forwarding to the same shared backend pool, so either LB failing only reduces capacity rather than causing an outage.

> 🎯 **Interview Tip:** If you propose "add a load balancer," immediately add "...running at least two, active-active, behind a floating IP, so the LB itself isn't a new single point of failure." That one sentence signals you're reasoning about the whole system's failure modes, not just the happy path.

---

## Global Load Balancing

Everything above balances load *within* one data center. Global load balancing routes a user to the best **region** before any single region is even involved.

- **GeoDNS** — DNS returns a different IP based on the resolver's geographic location (Tokyo users get a Tokyo IP). Simple and widely supported, but failover is bounded by however long DNS responses are cached (their TTL).
- **Anycast** — the same IP is announced from multiple physical locations via BGP, and normal internet routing sends each user to the "closest" announcing location. Failover is near-instant, but requires BGP-level control — a heavier lift typically only seen at CDN and cloud-provider scale.

> 💡 **Note:** Choose GeoDNS when you want simple, standard-DNS-provider multi-region routing; reach for Anycast only when you also control network-layer routing, since it trades operational simplicity for near-instant failover.

---

## Key Takeaways

- A load balancer distributes requests across a backend pool while continuously tracking which backends are healthy — it's what lets a fleet of fragile servers behave like one reliable system.
- L4 is fast but blind to request content; L7 is slower but can route on path, headers, or cookies — choose based on whether the routing decision needs to see inside the request.
- No algorithm is universally correct: Round Robin assumes uniform cost, Least Connections adapts to uneven cost, IP Hash trades even distribution for free session affinity.
- The load balancer itself is a single point of failure unless the LB tier is deliberately made highly available (active-active or active-passive, behind a floating IP).
- Global load balancing (GeoDNS, Anycast) solves a different problem than in-region balancing: picking the best region at all, before any regional LB is reached.
