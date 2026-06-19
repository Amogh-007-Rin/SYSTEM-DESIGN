# Design Challenge 01 — Solution: Consistency Model for a Distributed Shopping Cart

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — summarized here for the exercise format.

## The Core Move: Split the Decision by Field, Not by System

A shopping cart is not one consistency decision — it's at least three, each with a different cost of being wrong:

| Component | Model | Why |
|---|---|---|
| Cart line items | AP + CRDT (OR-Set of items) | Losing a user's add silently is worse than a brief cross-device inconsistency; OR-Set merge has no conflict to lose |
| Displayed inventory count ("X left") | AP, eventually consistent | A few-seconds-stale display number causes minor surprise, not real harm |
| Inventory decrement at purchase time | CP | Overselling strictly limited stock is a real trust/business cost; minority side should reject/retry rather than guess |
| Checkout / payment capture | CP, linearizable | Double-charging or losing payment state is categorically worse than a delayed or retried checkout |

## Failure Scenario 1: Concurrent Cart Edits Across a Partition

A user's phone and laptop both have the same cart open; a partition separates their sessions. The phone adds "USB-C Cable," the laptop adds "Laptop Stand," concurrently — neither write sees the other. With the cart modeled as an OR-Set CRDT, both adds succeed immediately and locally (AP), and when the partition heals, set union merges them with **both items preserved** — no error, no lost write, no manual conflict resolution. (Contrast this against a naive LWW field-overwrite approach, which would have kept only the higher-timestamp write and silently dropped the other — see [`02-deep-dive/examples/lww-vs-crdt-merge.ts`](../../02-deep-dive/examples/lww-vs-crdt-merge.ts) for the running code that demonstrates exactly this difference.)

## Failure Scenario 2: Two Concurrent Purchases of the Last Unit

Two customers in different regions both attempt to buy the last unit of a strictly limited item during a network partition between regions. Because the inventory *decrement* path is CP, the decrement is routed through a single source of truth (or a quorum write). The customer on the partition's majority side gets a confirmed purchase; the customer on the minority side is told to retry rather than receiving a confirmed order that would later need to be cancelled. This trades a worse failure mode (cancelling an already-"successful" purchase) for a better one (an honest, immediate "please try again").

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Cart line items as an OR-Set CRDT | AP, zero-coordination merge | Gains availability and guaranteed convergence with no lost writes; costs some complexity in modeling "the cart" as a set of tagged items rather than a single overwritable object |
| Inventory decrement routed through a CP path | Consistency over availability for this one operation | Prevents overselling; costs availability for purchase attempts specifically during a partition (an acceptable, scoped cost, not a system-wide one) |

See the full discussion (including why the *displayed* inventory count and the *actual* decrement are different consistency problems entirely) in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
