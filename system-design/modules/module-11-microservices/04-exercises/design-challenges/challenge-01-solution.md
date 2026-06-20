# Design Challenge 01 — Solution: Decompose a Monolithic E-Commerce App into Microservices

## Forcing Functions

Two distinct, independently sufficient justifications exist here, and a strong answer names both: **(1) team coordination** — three teams sharing one deployable means any one team's risky change can block or break every other team's release, and **(2) divergent scaling/consistency needs** — catalog browsing is read-heavy and bursty (flash sales, marketing pushes) while checkout is write-heavy and correctness-sensitive (you cannot tolerate losing an order write), and both are currently stuck sharing the same database's capacity with no way to scale one without paying for the other.

> ⚠️ **Warning:** If neither forcing function were present — say, a 4-person team and no scaling pain — the right answer would be "don't decompose yet, fix internal module boundaries inside the monolith first." Always state the forcing function; it's the difference between an engineering decision and cargo-culting.

## Proposed Services and Decomposition Method

| Service | Decomposition Method | Rationale |
|---|---|---|
| **Catalog** | Business capability | Product browsing/search is a complete, externally-meaningful capability on its own |
| **Inventory** | DDD bounded context (split from Catalog's "Product") | "Product" means stock count + warehouse location here, a different model than Catalog's marketing-facing description/images — see the Note in the [sample answer](../../03-interview-prep/sample-answer.md) |
| **Cart** | Business capability | Session-scoped pre-checkout state, naturally its own lifecycle (created, abandoned, converted) distinct from a placed order |
| **Order** | Business capability | Order lifecycle (created → paid → shipped → delivered/cancelled) is a capability with its own state machine, owned by its own team |
| **Payment** | Business capability + compliance boundary | Charging and payment-method storage is naturally isolated; also the cleanest place to scope PCI compliance to one service instead of the whole system |
| **Shipping/Notification** | Business capability | Tracking and customer notifications are a distinct downstream capability that doesn't need to block checkout |

Conway's Law cross-check: this maps cleanly onto "Browse/Search team" (Catalog), "Checkout team" (Cart, Order, Payment), and "Fulfillment team" (Inventory, Shipping) — three teams, three coherent groups of services, no team needs to touch another's service to ship most of their own roadmap.

![Monolith vs. microservices diagram](../../01-concepts/diagrams/exports/monolith-vs-microservices.png)
*The single monolithic deployable next to the same capabilities as independently deployable services, each owning its own database.*

## Data Ownership

| Service | Owns Exclusively | Access Rule for Others |
|---|---|---|
| Catalog | Product descriptions, images, categories | Read via Catalog's API only; never queried directly by another service's code |
| Inventory | SKU stock counts, reservation records | Read/write only via Inventory's reserve/release API |
| Cart | Per-user/session cart line items | Read/write only via Cart's API; cleared after checkout, never referenced afterward |
| Order | Orders, line items, order status | Read via Order's API; other services learn about order events via published events, never by querying Order's table |
| Payment | Payment transactions, tokenized payment methods | Charge/refund only via Payment's API — deliberately the narrowest, most locked-down API of all six, given PCI scope |
| Shipping/Notification | Shipment records | Subscribes to Order's events; never reads Order's database directly |

> 🎯 **Interview Tip:** The "never queried directly" rule is the part of this exercise interviewers most often probe. If you allow even one service to read another's table directly "just for convenience," you've recreated the SOA shared-database mistake microservices are supposed to avoid — say this rule out loud unprompted.

## APIs Between Services (4+ pairs)

| Pair | Direction | Sync or Async | Justification |
|---|---|---|---|
| Cart → Catalog | Cart calls Catalog | Synchronous (REST) | Adding an item to cart needs to validate the SKU exists and fetch display data right now — the cart UI can't render without it |
| Order → Inventory | Order calls Inventory | Synchronous (REST/gRPC) | Checkout cannot proceed without knowing whether stock was actually reserved — this is a hard blocking dependency, part of the saga in [Design Challenge 02](./challenge-02.md) |
| Order → Payment | Order calls Payment | Synchronous (REST/gRPC) | Checkout's final status depends directly on whether the charge succeeded; the user is waiting on this answer |
| Order → Shipping/Notification | Order publishes `OrderShipped` / `OrderConfirmed` events | Asynchronous (event-driven via message queue) | The checkout flow doesn't need to wait for a confirmation email or shipping label to be generated — these are side effects, not part of the answer the user is blocked on |

## Critical Path vs. Async

**Critical path (user is blocked waiting):** Cart → Catalog validation, and the full checkout chain Order → Inventory → Payment. Every one of these is something the user needs an answer to before "order confirmed" can be shown.

**Safely async:** anything after order confirmation — shipping label generation, tracking updates, confirmation/status emails, analytics/reporting events. None of these change whether the order itself succeeded, so none of them belong on the synchronous path.

## Trade-offs Accepted

| Decision | Choice | Trade-off |
|---|---|---|
| Splitting Catalog and Inventory | Two separate "Product"-shaped services instead of one | More services and APIs to keep conceptually aligned, but avoids one bloated Product entity trying to serve both marketing and warehouse-management needs — see DDD bounded context discussion in [01-concepts](../../01-concepts/README.md#service-decomposition-strategies) |
| Checkout consistency model | Saga with compensations across Order/Inventory/Payment instead of one DB transaction | Gives up atomicity (a brief window where inventory is reserved but payment hasn't resolved) for the ability to scale and deploy these three services independently — the saga and its compensations are designed in [Design Challenge 02](./challenge-02.md) |
| Cart service data store | Fast key-value store, eventually consistent, separate from Order's strongly-consistent store | Accepting that a cart could theoretically be lost on a rare failure is fine — a cart is trivially rebuildable — in exchange for low add-to-cart latency at high read/write volume |
