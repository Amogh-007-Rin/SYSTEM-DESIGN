/**
 * Last-Write-Wins vs. CRDT Merge: The Same Concurrent Write, Two Outcomes
 * Module: 13 — Consistency, Consensus & CAP Theorem
 * Concept: Two replicas of a shopping cart go offline from each other (a
 *   partition), and each accepts a concurrent, independent write. LWW
 *   conflict resolution (timestamp-based) keeps only one write and silently
 *   discards the other. A CRDT-style merge (an OR-Set of cart line items)
 *   instead preserves both contributions, because its merge operation
 *   (set union) is commutative, associative, and idempotent by construction
 *   — there is no "winner" to pick, so there is nothing to lose.
 * Run: npx ts-node lww-vs-crdt-merge.ts
 * Dependencies: none
 */

// === Shared scenario setup ===
// Two replicas of the same shopping cart (e.g., synced across a phone and a
// laptop) go offline from each other. While disconnected:
//   - Replica 1 (phone):  the user adds "USB-C Cable"
//   - Replica 2 (laptop): the user (same logical cart) adds "Laptop Stand"
// Both writes are concurrent — neither replica saw the other's write before
// making its own. When the replicas reconnect, they must merge.

interface TimestampedValue {
  value: string;
  timestampMs: number;
  replicaId: string;
}

// === Approach 1: Last-Write-Wins ===
// LWW models the cart as a single field holding "the current cart contents,"
// resolved on conflict by keeping whichever write has the higher timestamp.
// This is exactly how a naive "last write wins" key-value replication would
// treat two concurrent updates to the same key.
class LWWCart {
  private current: TimestampedValue;

  constructor(initial: TimestampedValue) {
    this.current = initial;
  }

  /** Merge with a concurrent write: keep whichever has the higher timestamp. */
  merge(incoming: TimestampedValue): void {
    if (incoming.timestampMs > this.current.timestampMs) {
      this.current = incoming;
    }
    // If incoming.timestampMs <= current.timestampMs, incoming is silently
    // discarded — no error, no log, no trace that a write ever happened.
  }

  read(): string {
    return this.current.value;
  }
}

// === Approach 2: CRDT (OR-Set-style merge) ===
// Instead of treating "the cart" as one overwritable field, model it as a
// grow-only set of line items per replica, where merge is simply set union.
// Set union is commutative (order doesn't matter), associative (grouping
// doesn't matter), and idempotent (merging the same item twice changes
// nothing) — the three properties that make a CRDT's convergence guarantee
// hold regardless of merge order or duplication.
class CRDTCart {
  private items: Set<string> = new Set();

  add(item: string): void {
    this.items.add(item);
  }

  /** Merge with another replica's set: union. Nothing is ever discarded. */
  merge(other: CRDTCart): void {
    for (const item of other.items) {
      this.items.add(item);
    }
  }

  read(): string[] {
    return Array.from(this.items).sort();
  }
}

function section(title: string): void {
  console.log(`\n=== ${title} ===`);
}

// === USAGE EXAMPLE ===
function main(): void {
  section("Scenario: two replicas of one cart go offline, each accepts a concurrent write");
  console.log("Replica 1 (phone):   adds 'USB-C Cable' at t=1000");
  console.log("Replica 2 (laptop):  adds 'Laptop Stand' at t=1001 (1ms later, but concurrent —");
  console.log("                     neither replica had seen the other's write yet)");

  section("Approach 1: Last-Write-Wins");
  // Each replica starts from the same prior agreed state, then diverges.
  const lwwReplica1 = new LWWCart({ value: "USB-C Cable", timestampMs: 1000, replicaId: "phone" });
  const lwwReplica2 = new LWWCart({ value: "Laptop Stand", timestampMs: 1001, replicaId: "laptop" });

  // Reconnect: exchange writes and merge both directions.
  const phoneWrite: TimestampedValue = { value: "USB-C Cable", timestampMs: 1000, replicaId: "phone" };
  const laptopWrite: TimestampedValue = { value: "Laptop Stand", timestampMs: 1001, replicaId: "laptop" };
  lwwReplica1.merge(laptopWrite);
  lwwReplica2.merge(phoneWrite);

  console.log(`  Replica 1 cart after merge: "${lwwReplica1.read()}"`);
  console.log(`  Replica 2 cart after merge: "${lwwReplica2.read()}"`);
  console.log(
    "  Result: both replicas converge to 'Laptop Stand' (higher timestamp) — the user's\n" +
      "  'USB-C Cable' add is GONE. No error was raised anywhere; the cable simply never\n" +
      "  appears in the merged cart."
  );

  section("Approach 2: CRDT merge (OR-Set union)");
  const crdtReplica1 = new CRDTCart();
  crdtReplica1.add("USB-C Cable");

  const crdtReplica2 = new CRDTCart();
  crdtReplica2.add("Laptop Stand");

  // Reconnect: merge both directions, in arbitrary order.
  crdtReplica1.merge(crdtReplica2);
  crdtReplica2.merge(crdtReplica1);

  console.log(`  Replica 1 cart after merge: [${crdtReplica1.read().join(", ")}]`);
  console.log(`  Replica 2 cart after merge: [${crdtReplica2.read().join(", ")}]`);
  console.log(
    "  Result: both replicas converge to BOTH items. Neither concurrent contribution was lost."
  );

  section("Idempotency check (merging twice changes nothing, as a CRDT requires)");
  crdtReplica1.merge(crdtReplica2);
  crdtReplica1.merge(crdtReplica2);
  console.log(`  Replica 1 cart after re-merging twice more: [${crdtReplica1.read().join(", ")}]`);
  console.log("  (unchanged — merge is idempotent, exactly as the CRDT guarantee requires)");

  section("Takeaway");
  console.log(
    "LWW and the CRDT merge started from the EXACT same concurrent-write scenario. LWW\n" +
      "collapsed two writes into one and discarded the loser with no trace. The CRDT's union-\n" +
      "based merge preserved both, because set union has no 'loser' to pick — it is commutative,\n" +
      "associative, and idempotent by construction. This is precisely why real shopping carts\n" +
      "are modeled as OR-Sets of line items rather than as a single LWW-resolved blob: losing a\n" +
      "user's cart addition silently is a worse failure mode than briefly seeing a duplicate or\n" +
      "a slightly stale item count."
  );
}

main();
