/**
 * G-Counter CRDT (Grow-Only Counter)
 * Module: 13 — Consistency, Consensus & CAP Theorem
 * Concept: CRDTs can be replicated and merged without coordination.
 *   A G-Counter stores per-node counts; merge takes per-node max.
 *   The total value is the sum of all per-node counts.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

/**
 * TODO: Implement GCounter.
 *
 * increment(): void
 *   Increment this node's counter by 1.
 *
 * value(): number
 *   Sum of all per-node counters.
 *
 * merge(other: GCounter): void
 *   For each nodeId in other: this[nodeId] = max(this[nodeId] ?? 0, other[nodeId])
 *   This operation is commutative, associative, and idempotent.
 *
 * state(): Record<string, number>
 *   Plain object snapshot for serialisation.
 */
class GCounter {
  private readonly nodeId: string;
  private counters: Map<string, number> = new Map();

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.counters.set(nodeId, 0);
  }

  increment(): void {
    // TODO: implement
  }

  value(): number {
    // TODO: implement
    throw new Error("Not implemented");
  }

  merge(other: GCounter): void {
    // TODO: expose internal counters via a getter, then merge
    throw new Error("Not implemented");
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
