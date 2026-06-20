# Sample Answer: "Would You Choose a CP or AP Database for This System, and Why?"

> A fully worked deep-dive answer for a distributed shopping cart, the same system used in [Design Challenge 01](../04-exercises/design-challenges/challenge-01.md).

---

## Clarify the Question First

"This system" isn't one decision — it's several, because a shopping cart has fields with very different stakes. Before picking CP or AP, I'd separate the cart into the pieces that actually need different guarantees:

1. **Cart line items** (what's in the cart, added from possibly multiple devices/sessions)
2. **Inventory count** (how many units are left to sell)
3. **Final checkout total / payment capture** (the money-moving step)

I'd answer each separately rather than force one global answer onto all three, and say so explicitly — this is the single biggest signal an interviewer is listening for on this question.

## Cart Line Items: AP, with a CRDT Merge

**Choice: AP.** A shopping cart should never refuse to let a user add an item just because the network is having a bad moment. Modeling line items as an OR-Set (observed-remove set) CRDT means each device/session can add or remove items locally with zero coordination, and merges are guaranteed to converge correctly — commutative, associative, idempotent — with no conflict left over to resolve.

**Failure scenario:** A user has the cart open on their phone and laptop. A network partition separates the phone's session from the laptop's session (different regions, a flaky mobile connection, whatever the cause). While partitioned:
- Phone adds "USB-C Cable"
- Laptop adds "Laptop Stand"

Both writes are concurrent — neither device saw the other's write. With a CP design, one of these writes would have to be rejected or blocked until the partition heals (whichever device can't reach quorum) — that's a real, felt cost: the user just wanted to add an item and got an error or a spinner. With the AP/CRDT design, both adds succeed immediately and locally. When the partition heals and the two replicas merge (set union), the result is a cart with *both* items — no error, no data loss, no manual conflict resolution needed. This is worked through with actual running code in [`02-deep-dive/examples/lww-vs-crdt-merge.ts`](../02-deep-dive/examples/lww-vs-crdt-merge.ts), including the contrast against a naive LWW approach that would have silently dropped one of the two adds.

**What we accept:** brief inconsistency between devices is fine — seeing the cart "catch up" a second after reconnecting is an acceptable, common UX, the same one users already implicitly understand from apps like Google Docs or Notion.

## Inventory Count: It Depends on the Required Precision, Likely CP for the Final Decrement

**Choice: CP at the moment of decrementing stock for a sale; AP/eventually-consistent for the *displayed* "X left in stock" number shown while browsing.**

These are two different reads of "inventory," and conflating them is a common interview mistake. The number shown on a product page doesn't need to be linearizable — showing "3 left" when it's actually 2 a moment later causes minor user surprise, not a real problem, so that display value can be served from a replica that's slightly behind, favoring availability and low latency.

The *actual decrement* — "reserve one unit for this specific order" — is different: overselling a strictly limited item (a concert ticket, a single Beanie Baby drop) is a real business and customer-trust problem. That step benefits from a CP path: route the decrement through a single source of truth (or a quorum-based write) so two concurrent purchases of the last unit can't both succeed. **Failure scenario:** two customers in different regions both try to buy the last unit during a partition. A CP design routes the decrement through the partition's majority side; the minority side's purchase attempt is rejected/queued rather than risking a successful sale of stock that doesn't exist. The customer on the minority side sees "please try again" rather than a confirmed order that later has to be cancelled — a worse failure mode (canceling an already-confirmed purchase) traded for a better one (a clear, immediate retry prompt).

## Checkout Total / Payment Capture: CP, No Exceptions

**Choice: CP.** Charging a card is the one place in this system where "being wrong" (double-charging, charging the wrong total) is categorically worse than "being unavailable" (the checkout button spins for an extra second or shows "please retry"). This needs linearizable reads/writes on the order and payment state — a payment must be captured exactly once, and if the system can't currently confirm that, it should refuse to proceed rather than guess.

**Failure scenario:** a partition occurs mid-checkout, after the cart total was computed but before payment capture confirms. A CP design simply blocks/retries the capture step until it can confirm state with the source of truth, rather than allowing two isolated nodes to both believe they're the one capturing payment for this order. The cost is a possible brief delay or a "please try again" on checkout during a rare partition — an acceptable trade against the alternative of a duplicate charge.

## Summary Table

| Component | Choice | Why |
|---|---|---|
| Cart line items | AP + CRDT (OR-Set) | Losing a user's add is worse than briefly-inconsistent devices; merge has no conflict to lose by construction |
| Displayed inventory count | AP (eventually consistent) | A few-seconds-stale "X left" display causes minor surprise, not real harm |
| Inventory decrement (the actual sale) | CP | Overselling strictly limited stock is a real business/trust cost; minority side should reject/retry, not guess |
| Checkout / payment capture | CP | Double-charging or losing payment state is categorically worse than a delayed or retried checkout |

## Closing the Answer

I'd close by naming the general principle this illustrates: **consistency is a per-field decision, not a per-system one.** The same shopping cart legitimately runs AP CRDT logic for its line items and CP logic for its payment capture, in the same request flow, because the cost of being wrong is wildly different for each. An interviewer asking "CP or AP for this system" is often testing whether the candidate notices that the question, taken literally, has a wrong premise — and scoping the answer correctly is the strongest possible response.
