# Module 06 — Concepts: Scalability

## Why This Matters

Every system that succeeds eventually meets the same problem: the thing that worked perfectly for 100 users falls over at 100,000. A single Postgres instance happily serving your beta users will not survive a launch on the front page of a major site. Scalability is the discipline of designing systems so that growth in load is met with growth in capacity, predictably and (ideally) without rewriting the architecture from scratch every time traffic doubles. It is not a single technique — it's a way of thinking about where a system's limits are *before* you hit them, and what lever you pull next when you do.

---

## Vertical Scaling (Scale Up)

Vertical scaling means making a single machine more powerful: more CPU cores, more RAM, faster disks (NVMe over spinning disks), a beefier network interface. It is the simplest possible scaling move — no architectural change, no new failure modes, often just a few clicks in a cloud console or a reboot onto a bigger instance type.

**When it makes sense:** early-stage systems, workloads that are genuinely hard to distribute (a single large in-memory computation, a legacy monolith that assumes a single process), or as a stopgap while a horizontal redesign is in progress.

**Limits:**
- **Hard ceiling** — there is a biggest machine you can buy; eventually you cannot scale up further, only out.
- **Non-linear cost** — the largest cloud instances cost disproportionately more per unit of CPU/RAM than mid-tier ones.
- **Single point of failure** — one machine means one machine that can die; vertical scaling does nothing for availability.
- **Downtime to resize** — many vertical scaling operations require a restart, which horizontal scaling avoids entirely.

> 💡 **Note:** Vertical scaling isn't a beginner mistake to be avoided at all costs — it's frequently the *correct* first move, because it's free of the complexity horizontal scaling introduces. The mistake is treating it as a strategy rather than a stage.

---

## Horizontal Scaling (Scale Out)

Horizontal scaling means adding more machines and spreading load across them, rather than making any single machine bigger. This is how systems scale past the ceiling vertical scaling eventually hits, and it's the foundation of nearly every large-scale architecture in this repository.

The catch: horizontal scaling only works cleanly if the machines can share load **without depending on each other's local state** — this is the shared-nothing architecture, where each node is independently capable of handling any request, and nodes don't quietly rely on something only one of them holds in memory.

### Stateless vs. Stateful Services

A **stateless** service keeps no client-specific data in its own memory between requests — every request carries (or can fetch from a shared store) everything needed to handle it. A **stateful** service remembers something locally — a session, an in-memory cache, a WebSocket connection — that only it knows about.

Statelessness is what makes horizontal scaling trivial: if any server can handle any request, a load balancer can route traffic to whichever instance is least busy, instances can be added or removed without coordinating who "owns" what, and a crashed instance loses nothing another instance can't immediately serve instead. The moment a service is stateful, you need session affinity (sticky sessions), a shared session store (Redis), or some other workaround — complexity pure statelessness avoids entirely.

> 🎯 **Interview Tip:** When asked to design something at scale, say out loud that you're choosing to keep the application tier stateless and explain *where* the state actually lives instead (a database, a distributed cache, a token). Interviewers are listening for whether you understand statelessness is a deliberate design choice, not a default.

> ⚠️ **Warning:** "Stateless" doesn't mean "no state anywhere in the system" — it means the *application server* holds no state a client depends on surviving a restart or a different instance handling the next request. The state still exists; it just lives in shared infrastructure (database, cache, object storage) instead of a server's local memory.

---

## The Scaling Journey

Real systems tend to evolve through a predictable sequence of stages, each one solving the bottleneck the previous stage exposed:

1. **Single server** — app and database on one machine. Simple, cheap, and fine until either CPU/memory or disk I/O becomes the limit.
2. **Separate the database** — move the database to its own machine. The app server and database no longer compete for the same CPU/RAM, and each can now be scaled independently.
3. **Add caching** — put a cache (in-process or Redis) in front of the database to absorb repeated reads, covered in depth in [Module 05](../../module-05-caching/01-concepts/README.md). This buys significant headroom before you need more app servers or database capacity.
4. **Multiple app servers behind a load balancer** — once a single app server's CPU is the bottleneck, add more app servers (this is where statelessness pays off) and a load balancer to distribute requests across them ([Module 07](../../module-07-load-balancing/) covers this in depth).
5. **Database replication** — read replicas absorb read traffic so the primary database isn't doing all the work alone; this only helps once reads (not writes) are the bottleneck.
6. **Sharding** — once a single database's *write* capacity or total dataset size is the limit, split the data across multiple database instances (shards), each owning a subset of the data.

> 📊 **Diagram:** `scaling-journey.drawio` — Shows the six-stage evolution from a single server running app+DB together, through separated DB, caching, multiple app servers behind a load balancer, read replicas, and finally sharded databases, with the bottleneck that triggers each transition labeled on the arrow between stages.

> 📊 **Diagram:** `vertical-vs-horizontal-scaling.drawio` — Side-by-side comparison: vertical scaling shown as one box growing larger over time with a visible ceiling; horizontal scaling shown as identical boxes being added side by side behind a load balancer, with no ceiling drawn.

> 📊 **Diagram:** `stateless-scaling.drawio` — A load balancer routing requests to N identical stateless app server instances, each reading/writing shared state to a common database and cache layer rather than holding any of it locally, illustrating why any instance can serve any request.

Each stage is a real trade-off, not a strict improvement — caching adds invalidation complexity; replicas add replication lag; sharding makes cross-shard queries hard. Skipping straight to sharding for a system with 200 users is over-engineering; staying single-server past the point your database is visibly the bottleneck is under-engineering. The skill is recognizing *which* stage you're actually in.

---

## Amdahl's Law

Amdahl's Law answers a deceptively important question: if you throw more processors (or more servers) at a problem, how much faster does it actually get? The answer depends on how much of the work can be parallelized at all.

```
Speedup(N) = 1 / ((1 - P) + P/N)
```

Where `P` is the proportion of the work that can be parallelized, and `N` is the number of processors/workers. The term `(1 - P)` — the *serial* portion — is the part that no amount of parallelism can speed up, because it has to happen anyway, in order, no matter how many workers you have.

The implication that matters for system design: if 90% of a workload is parallelizable (`P = 0.9`), the maximum possible speedup as `N → ∞` is **10x** — not unlimited. The serial 10% becomes a hard ceiling on total speedup, no matter how many machines you add. This is why "just add more servers" doesn't help every problem — if your bottleneck is a serial step (a single coordinating write, a global lock, a sequential migration step), more horizontal capacity elsewhere won't touch it. Shrinking the serial portion of a workload is often more valuable than adding raw parallel capacity.

---

## Little's Law

Little's Law is a simple, exact relationship between three properties of any queueing system (a web server's request queue, a database's connection pool, a checkout line):

```
L = λ × W
```

- **L** — average number of items in the system (e.g., concurrent in-flight requests)
- **λ** (lambda) — average arrival rate (e.g., requests per second)
- **W** — average time an item spends in the system (e.g., average request latency)

This lets you reason about capacity without guessing. If your service receives 1,000 requests/second (`λ = 1000`) and each request takes an average of 200ms to process (`W = 0.2s`), Little's Law says you need to hold `L = 1000 × 0.2 = 200` requests in flight concurrently — that's your real concurrency requirement, and it tells you directly how many worker threads or connection pool slots to provision. If latency `W` creeps up under load while `λ` stays fixed, `L` necessarily grows too — exactly the death spiral behind cascading overload: slower responses mean more requests queued up, which often makes responses slower still.

---

## Key Takeaways

- Vertical scaling (bigger machine) is simple and often the right first move, but has a hard ceiling and does nothing for availability; horizontal scaling (more machines) has no inherent ceiling but requires statelessness to work cleanly.
- Statelessness — no client-specific data held in an app server's local memory — is the precondition that makes horizontal scaling trivial; state instead lives in shared infrastructure like a database or cache.
- Real systems evolve through a predictable journey: single server → separate DB → caching → multiple app servers → read replicas → sharding, each stage solving the bottleneck the last stage exposed.
- Amdahl's Law caps the maximum possible speedup from parallelization at `1/(1-P)` — the serial portion of a workload is a hard ceiling no amount of added capacity can remove.
- Little's Law (`L = λW`) lets you compute required concurrency directly from arrival rate and latency, and explains why rising latency under fixed load causes an ever-growing backlog.
