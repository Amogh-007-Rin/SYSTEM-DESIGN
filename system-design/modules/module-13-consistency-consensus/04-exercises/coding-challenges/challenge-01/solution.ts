// SOLUTION FILE — try starter.ts first!

/**
 * G-Counter CRDT (Grow-Only Counter)
 * Module: 13 — Consistency, Consensus & CAP Theorem
 * Concept: CRDTs can be replicated and merged without coordination.
 *   A G-Counter stores per-node counts; merge takes per-node max.
 *   The total value is the sum of all per-node counts.
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

/**
 * GCounter: a grow-only counter CRDT.
 *
 * Each replica only ever increments its OWN entry in the map — it never
 * writes another node's entry directly. That's what makes increments
 * coordination-free: two replicas can both increment concurrently with no
 * risk of clobbering each other, because they're writing to disjoint keys.
 *
 * Merging takes the per-node MAX (not sum) of each replica's counters. Max
 * is the right operation here because each node's own counter only ever
 * grows monotonically — so the higher value for a given node is always the
 * more "caught up" one, regardless of which replica is doing the merging or
 * how many times the merge happens. That's exactly why this merge function
 * is commutative, associative, and idempotent:
 *   - Commutative: max(a, b) == max(b, a) — merge order doesn't matter.
 *   - Associative: max(max(a, b), c) == max(a, max(b, c)) — grouping doesn't matter.
 *   - Idempotent: max(a, a) == a — merging the same state twice is a no-op.
 */
class GCounter {
  private readonly nodeId: string;
  private counters: Map<string, number> = new Map();

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.counters.set(nodeId, 0);
  }

  /** Increment this node's own counter by 1. Never touches other nodes' entries. */
  increment(): void {
    const current = this.counters.get(this.nodeId) ?? 0;
    this.counters.set(this.nodeId, current + 1);
  }

  /** Total value: sum of every node's counter. */
  value(): number {
    let total = 0;
    for (const count of this.counters.values()) {
      total += count;
    }
    return total;
  }

  /**
   * Merge with another replica's state: for every nodeId the other replica
   * knows about, keep the max of "what I have" and "what they have." This
   * never loses information — a node's counter can only go up, in either
   * replica's view, so the larger value is always the more up-to-date one.
   */
  merge(other: GCounter): void {
    for (const [nodeId, otherCount] of other.getCounters()) {
      const myCount = this.counters.get(nodeId) ?? 0;
      this.counters.set(nodeId, Math.max(myCount, otherCount));
    }
  }

  // Helper: expose counters for merging
  getCounters(): Map<string, number> {
    return new Map(this.counters);
  }

  state(): Record<string, number> {
    const obj: Record<string, number> = {};
    this.counters.forEach((v, k) => { obj[k] = v; });
    return obj;
  }
}

// === USAGE EXAMPLE ===
const counterA = new GCounter("node-A");
const counterB = new GCounter("node-B");
const counterC = new GCounter("node-C");

counterA.increment(); counterA.increment(); counterA.increment(); // A: 3
counterB.increment(); counterB.increment();                        // B: 2
counterC.increment();                                              // C: 1

console.log("Before merge:");
console.log("  A value:", counterA.value(), "state:", counterA.state());
console.log("  B value:", counterB.value(), "state:", counterB.state());

counterA.merge(counterB);
counterA.merge(counterC);
counterB.merge(counterA);

console.log("\nAfter merge:");
console.log("  A value:", counterA.value(), "(expected: 6)");
console.log("  B value:", counterB.value(), "(expected: 6)");

// Idempotency check
counterA.merge(counterB);
console.log("  A after re-merge:", counterA.value(), "(should still be 6)");
