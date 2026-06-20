# Sample Answer: "Decompose This Monolith E-Commerce App into Microservices"

> A fully worked deep-dive answer. This is the same prompt as [Design Challenge 01](../04-exercises/design-challenges/challenge-01.md) — read this after attempting it yourself.

---

## Restate the Starting Point

The monolith is a single deployable Rails/Django/Spring-style app: one codebase, one database, handling product catalog browsing, cart, checkout, payment, inventory, order history, and shipping notifications. Symptoms that justify decomposing it (I'd say this out loud first, not just jump to drawing boxes): deploys have gotten slow and risky because every team's change ships together; the catalog/search code and the checkout code have very different scaling profiles (read-heavy browsing vs. write-heavy, consistency-sensitive checkout) but share one database that can't be scaled independently for either; and three separate teams now work in this one codebase and constantly block each other's releases.

## Decomposition Method

I'll use **business capability** as the primary lens, cross-checked against **DDD bounded contexts** for any service where the same noun ("Product") means different things to different parts of the system, and sanity-check the result against **Conway's Law** — am I creating boundaries three teams can actually own independently?

## Proposed Services

| Service | Business Capability | Owns Its Own Data |
|---|---|---|
| **Catalog** | Product listings, descriptions, images, search/browse | Product metadata (title, description, images, category) |
| **Inventory** | Stock levels, reservations | SKU stock counts, reservation records |
| **Cart** | Session-scoped shopping cart contents before checkout | Cart items per user/session (often a fast key-value store, not a relational DB) |
| **Order** | Order lifecycle: created, paid, shipped, delivered, cancelled | Orders and their line items, order status |
| **Payment** | Charging, refunds, payment method storage | Payment transactions, tokenized payment methods (PCI scope isolated here) |
| **Shipping/Notification** | Shipment tracking, order status emails/push | Shipment records; doesn't own customer data, just references order IDs |

> 💡 **Note:** "Product" is a DDD bounded-context example here in miniature — Catalog's notion of Product (description, images, marketing copy) and Inventory's notion of the same SKU (stock count, warehouse location) are different models serving different purposes. Keeping them as separate services, each with its own "Product"-shaped data, is correct; merging them into one shared Product entity is exactly the kind of accidental coupling DDD bounded contexts are meant to prevent.

![Monolith vs. microservices diagram](../01-concepts/diagrams/exports/monolith-vs-microservices.png)
*The single monolithic deployable on the left, and the same capabilities as independently deployable services, each with its own database, on the right.*

## APIs Between Services

- **Catalog ↔ Cart**: Cart calls Catalog (sync, REST/gRPC) to validate a SKU exists and fetch display data when an item is added — Cart never needs Catalog's full write API, just a read lookup.
- **Cart → Order**: at checkout, Cart's contents are read once by Order to create the order; after that Order owns the data and Cart's copy is irrelevant (cart is cleared).
- **Order → Inventory**: synchronous call to reserve stock as part of the checkout saga (see Design Challenge 02) — checkout cannot proceed without knowing reservation succeeded, so this has to be synchronous, not fire-and-forget.
- **Order → Payment**: synchronous call to charge the customer — same reasoning, the order flow needs the result before deciding the order's final status.
- **Order → Shipping/Notification**: asynchronous, event-driven (`OrderShipped` event) — the checkout flow doesn't need to wait for a confirmation email to be sent to consider checkout complete.

> 🎯 **Interview Tip:** Notice the pattern in which calls are sync vs. async — every synchronous call here is one the caller needs an answer to *before it can proceed* (can't confirm checkout without knowing inventory was reserved and payment succeeded); every async one is a side effect the caller doesn't need to block on. State this rule explicitly rather than picking sync/async per service arbitrarily.

## Data Ownership Rules

Each service owns its table(s) exclusively — no other service is allowed to read or write Order's database directly, even for "just a quick read." Any data another service needs from Order must come through Order's API or through events Order publishes. This is the part of the decomposition most candidates skip, and it's the part that actually matters: without this rule enforced, "microservices" silently becomes the old SOA mistake of services sharing a database, which re-couples everything the network boundary was supposed to decouple.

## What Stays Synchronous-Critical-Path vs. What Doesn't

The checkout flow (Cart → Order → Inventory → Payment) is the one place where multiple services must agree before the user gets a definitive answer ("your order is confirmed" or "payment failed"). Everything downstream of a confirmed order (shipping label generation, notification emails, analytics events) is async and off the critical path — the user doesn't wait on any of it.

## Trade-offs Accepted

| Decision | Choice | Trade-off |
|---|---|---|
| Number of services | 6, one per business capability | More deployable units to operate (CI/CD, monitoring, service discovery per service) in exchange for each team owning a clean, independently releasable boundary |
| Checkout consistency | Saga with compensations instead of a single DB transaction | Gives up atomicity for availability/scalability — needs explicit compensation logic (see Design Challenge 02) instead of a free database rollback |
| Cart service | Eventually-consistent, fast key-value store rather than the same relational store as Order | Cart data loss/staleness is low-stakes (a cart can be rebuilt from scratch); accepting weaker guarantees here in exchange for low-latency add-to-cart is the right trade |
| Catalog/Inventory split | Two separate "Product"-shaped models instead of one shared entity | More services to keep in sync conceptually, but avoids the bounded-context bloat of a single Product entity trying to serve marketing and warehouse-management needs simultaneously |

## What I'd Flag As Open Questions to the Interviewer

- Expected order volume and whether checkout latency budget allows a few sequential synchronous service calls, or whether parts of that chain need to be parallelized/restructured.
- Whether this is a greenfield decomposition or a live migration — if live, I'd reach for the [strangler fig pattern](../02-deep-dive/README.md#strangler-fig-pattern) and migrate one capability at a time rather than a big-bang cutover.
