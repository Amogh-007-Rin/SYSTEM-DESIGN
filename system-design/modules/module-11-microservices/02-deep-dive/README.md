# Module 11 — Deep Dive: Distributed Transactions and Resilience Patterns

## Why This Matters

The moment "place an order" means coordinating writes across an Order service, a Payment service, and an Inventory service — each with its own database — you lose the one guarantee a single-database transaction gave you for free: atomicity. Either all three writes happen or none do, with nothing in between, used to be the database's problem. Now it's the system's problem, and getting it wrong means double-charged customers or oversold inventory. This deep dive covers how production systems actually solve that, plus the resilience patterns (circuit breakers, bulkheads, service mesh) that keep one failing service from taking down everything that calls it.

---

## Why Two-Phase Commit (2PC) Struggles at Scale

**Two-phase commit** is the classic distributed-transaction protocol: a coordinator asks every participant to *prepare* (lock resources, confirm it can commit) in phase one, then tells everyone to *commit* in phase two only if every participant said yes in phase one.

The problem is what it costs operationally:
- **Blocking locks** — every participant holds its lock from the moment it says "yes" in phase one until the coordinator's phase-two decision arrives. A slow or network-partitioned participant blocks every other participant's resources for the duration.
- **Coordinator is a single point of failure** — if the coordinator crashes after phase one but before sending the phase-two decision, every participant is stuck holding locks indefinitely, unable to safely commit or abort on its own.
- **It doesn't compose across organizational/service boundaries well** — 2PC assumes all participants are reachable, willing to hold locks for an unbounded duration, and part of the same trust/infrastructure domain. None of that holds when "participants" are independently-deployed microservices, each potentially owned by a different team with its own database technology.

This is why microservices architectures largely abandon 2PC in favor of patterns that accept **eventual consistency** instead of strict atomicity.

---

## The Saga Pattern

A **saga** breaks one logical transaction into a sequence of local transactions, one per service, each committing immediately and independently. If a later step fails, the saga runs **compensating transactions** that semantically undo the effects of the steps that already succeeded — there's no lock held across the whole sequence, and no global commit/abort decision.

### Choreography

Each service publishes events after completing its local transaction; other services subscribe to the events relevant to them and react — there's no central coordinator.

- Order service creates an order (status `PENDING`) and publishes `OrderCreated`.
- Inventory service consumes `OrderCreated`, reserves stock, publishes `InventoryReserved` (or `InventoryReservationFailed`).
- Payment service consumes `InventoryReserved`, charges the customer, publishes `PaymentCompleted` (or `PaymentFailed`).
- On `PaymentFailed`, Inventory consumes that event and runs its own compensating transaction (`ReleaseInventory`); Order consumes it too and marks the order `CANCELLED`.

> 📊 **Diagram:** `saga-choreography.drawio` — Shows Order, Inventory, and Payment services connected only through a message broker, each publishing and subscribing to events with no central coordinator, including the compensating `ReleaseInventory` path triggered by `PaymentFailed`.

### Orchestration

A central **saga orchestrator** explicitly tells each service what to do next and reacts to each result — the coordination logic lives in one place instead of being implicitly distributed across every service's event subscriptions.

- Orchestrator calls Order service: create order.
- Orchestrator calls Inventory service: reserve stock.
- Orchestrator calls Payment service: charge customer. On failure, orchestrator explicitly calls Inventory: release reservation, then Order: cancel order.

> 📊 **Diagram:** `saga-orchestration.drawio` — Shows a central Saga Orchestrator making sequential calls to Order, Inventory, and Payment services and explicitly invoking compensating calls in reverse order when the Payment step fails.

### Choreography vs. Orchestration

| | Choreography | Orchestration |
|---|---|---|
| Coordination logic | Implicit, spread across every service's event handlers | Explicit, centralized in one orchestrator |
| Coupling | Services only know about events, not each other | Services are coupled to the orchestrator's calls (but not to each other) |
| Adding a new step | Just subscribe to the relevant event — no existing service changes | Must update the orchestrator's logic |
| Visibility into saga state | Hard — must reconstruct it from events across services | Easy — the orchestrator holds the whole state machine |
| Best fit | Few steps, simple reactions | Complex, multi-step sagas where visibility and explicit control matter |

> ⚠️ **Warning:** Choreography's biggest hidden cost is debuggability. With logic spread across N services' event handlers, answering "why didn't this order ship?" means reconstructing a timeline from logs across every service involved — this is precisely why most non-trivial sagas in production use orchestration once there are more than a couple of steps.

A complete worked example with a simulated payment failure and compensation is in [`examples/saga-pattern.ts`](./examples/saga-pattern.ts).

---

## Circuit Breaker Pattern

Borrowed from electrical circuit breakers: when a downstream service is failing, stop calling it for a while instead of letting every caller wait out a timeout against a service that's already known to be unhealthy. Popularized by Netflix's Hystrix and continued by Resilience4j.

Three states:
- **Closed** — normal operation; calls pass through. The breaker counts failures.
- **Open** — once failures exceed a threshold, the breaker "trips": calls fail immediately (fast-fail) without even attempting the downstream call, for a configured `resetTimeoutMs`.
- **Half-Open** — after the timeout, the breaker allows exactly one (or a small number of) trial call through. Success closes the breaker again; failure re-opens it.

> 📊 **Diagram:** `circuit-breaker-states.drawio` — Shows the three-state cycle: Closed transitions to Open after the failure threshold is crossed, Open transitions to Half-Open after the reset timeout elapses, and Half-Open transitions back to Closed on a successful probe or back to Open on a failed one.

This prevents **cascading failure**: without a breaker, every caller of a struggling service keeps sending requests, each one consuming a thread/connection while it waits to time out, until the *caller* also runs out of resources and becomes unhealthy too — the failure spreads upstream. Fast-failing while open means callers fail fast and stay healthy themselves, and stop adding load to a service that's already struggling to recover.

The full state machine (closed → open → half-open → closed) is implemented hands-on in this module's coding challenge: [`04-exercises/coding-challenges/challenge-01/`](../04-exercises/coding-challenges/challenge-01/).

---

## Bulkhead Pattern

Named for a ship's bulkheads — partitions that keep one flooded compartment from sinking the whole ship. Applied to services: partition resources (thread pools, connection pools) **per downstream dependency**, so that if calls to one slow/failing dependency exhaust their allotted pool, calls to every *other* dependency still have their own separate pool and keep working. Without bulkheads, a single thread pool shared across all outbound calls means one slow dependency can consume every available thread, starving calls to completely unrelated, healthy services.

> 💡 **Note:** Circuit breakers and bulkheads solve adjacent but different problems and are normally used together: a bulkhead limits the *blast radius* of a slow dependency (it can't consume more than its allotted resources); a circuit breaker stops *sending traffic* to a dependency once it's known to be failing. One limits damage while calls are still being attempted; the other stops the attempts.

---

## Strangler Fig Pattern

Named after the strangler fig vine, which grows around a host tree and gradually replaces it. Applied to migration: instead of a risky big-bang rewrite, route an increasing slice of traffic for a given capability away from the monolith and to a new microservice (often via a routing layer/proxy in front of both), one capability at a time, until the monolith has nothing left to do and can be decommissioned. This keeps the system shippable and rollback-able throughout a migration that might take months or years, rather than betting everything on one cutover.

---

## Backends for Frontends (BFF)

Different client types (web, iOS, Android, third-party partner API) often need different shapes of the same underlying data — a mobile app wants a lean payload; a web dashboard wants a richly nested one. A **BFF** is a thin backend service built *per client type*, that calls the underlying microservices and assembles/shapes the response specifically for that client, instead of forcing one generic API to serve everyone (and either over-fetching for mobile or under-fetching for web). The trade-off is more services to maintain — one BFF per client type — in exchange for each client getting an API shaped exactly for it.

---

## Service Mesh

A **service mesh** (Istio, Linkerd) moves cross-cutting networking concerns out of application code and into a per-instance **sidecar proxy** that intercepts all inbound/outbound traffic for its service:

- **mTLS (mutual TLS)** — the mesh automatically encrypts and authenticates service-to-service traffic, so every call is verified on both ends without any application code managing certificates.
- **Observability** — the mesh sees every request between every pair of services, so it can produce uniform latency, error-rate, and traffic metrics and distributed traces without each service instrumenting itself individually.
- **Traffic management** — canary releases (route 5% of traffic to a new version), retries, timeouts, and circuit breaking can be configured declaratively at the mesh level instead of being re-implemented in every service's code.

> 🎯 **Interview Tip:** The reason a service mesh exists at all is that "retry, encrypt, time out, trace" used to mean every team re-implemented the same logic in their own service. The mesh deduplicates that into infrastructure, at the cost of an extra sidecar proxy hop per call and real operational complexity to run the mesh control plane itself.

---

## Docker and Kubernetes — Enough for System Design

- **Container (Docker)** — packages a service with its exact dependencies into one portable image, so "works on my machine" becomes "works identically everywhere this image runs." This is what makes deploying dozens of independently-versioned microservices tractable.
- **Pod** — Kubernetes's smallest deployable unit; one or more tightly-coupled containers (e.g., a service + a logging sidecar) that always get scheduled together on the same node and share a network namespace.
- **Deployment** — declares the desired state for a set of identical pods (which image, how many replicas) and handles rolling updates — replacing old pods with new ones gradually, the same zero-downtime mechanism covered for load balancers in [Module 07](../../module-07-load-balancing/02-deep-dive/README.md).
- **Service** — a stable virtual IP/DNS name in front of a *set* of pods (which come and go as they scale or restart); this is Kubernetes's built-in answer to the service discovery problem covered in [01-concepts](../01-concepts/README.md#service-discovery).
- **Ingress** — manages external HTTP(S) access into the cluster, routing by hostname/path to the correct internal Service, conceptually similar to the API gateway role covered in 01-concepts but specifically for entry into the cluster.

---

## Key Takeaways

- 2PC's blocking locks and single-coordinator failure mode make it impractical across independently-deployed services; sagas trade strict atomicity for eventual consistency via compensating transactions.
- Choreography has no central coordinator (services react to events) and scales simply for a few steps; orchestration centralizes the logic and wins on visibility and control as a saga grows more complex.
- A circuit breaker's closed → open → half-open cycle stops cascading failure by fast-failing instead of letting every caller queue up against an already-unhealthy dependency.
- Bulkheads limit blast radius per dependency; circuit breakers stop traffic to a known-bad dependency — they're complementary, not redundant.
- Kubernetes pods/deployments/services/ingress map directly onto microservices concerns: packaging, rolling deployment, service discovery, and external entry, respectively.
