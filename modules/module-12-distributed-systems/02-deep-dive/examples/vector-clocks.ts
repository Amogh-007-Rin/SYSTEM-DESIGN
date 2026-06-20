/**
 * Vector Clocks
 * Module: 12 — Distributed Systems Fundamentals
 * Concept: Vector clocks track one counter per node, so unlike a Lamport
 *   timestamp (a single number), comparing two vector clocks tells you the
 *   actual causal relationship between the events they label: one
 *   happened-before the other, or they're concurrent (neither caused the
 *   other) — which is exactly the information a leaderless replicated store
 *   needs to detect a genuine write conflict instead of silently picking a
 *   "last writer wins" answer that might be wrong.
 * Run: npx ts-node vector-clocks.ts
 * Dependencies: none
 */

type VectorClock = Record<string, number>;

type Comparison = "before" | "after" | "equal" | "concurrent";

/** Returns a copy of a vector clock with every known node defaulted to 0. */
function cloneClock(clock: VectorClock): VectorClock {
  return { ...clock };
}

/** Element-wise max of two vector clocks across the union of their keys. */
function mergeClocks(a: VectorClock, b: VectorClock): VectorClock {
  const merged: VectorClock = {};
  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const node of allNodes) {
    merged[node] = Math.max(a[node] ?? 0, b[node] ?? 0);
  }
  return merged;
}

/**
 * Compares two vector clocks to determine their causal relationship:
 * - "before": every entry in A is <= the corresponding entry in B, and at
 *   least one is strictly less -> A happened-before B.
 * - "after": the mirror image of "before".
 * - "equal": every entry matches exactly -> same event/state.
 * - "concurrent": neither dominates the other -> truly independent writes,
 *   a genuine conflict that needs application-level resolution.
 */
function compareClocks(a: VectorClock, b: VectorClock): Comparison {
  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)]);
  let aLessOrEqual = true;
  let bLessOrEqual = true;

  for (const node of allNodes) {
    const av = a[node] ?? 0;
    const bv = b[node] ?? 0;
    if (av > bv) bLessOrEqual = false;
    if (bv > av) aLessOrEqual = false;
  }

  if (aLessOrEqual && bLessOrEqual) return "equal";
  if (aLessOrEqual) return "before"; // a happened-before b
  if (bLessOrEqual) return "after"; // a happened-after b
  return "concurrent";
}

function formatClock(clock: VectorClock, nodeOrder: string[]): string {
  return `[${nodeOrder.map((n) => `${n}:${clock[n] ?? 0}`).join(", ")}]`;
}

/** A single versioned write to a key, tagged with the vector clock at write time. */
interface VersionedValue {
  value: string;
  clock: VectorClock;
  writtenBy: string;
}

/**
 * Simulates one replica in a leaderless, Dynamo-style store. Each replica
 * keeps its own vector clock slot and a local copy of each key's value(s) —
 * a key can briefly hold MULTIPLE concurrent versions if a conflict is
 * detected, exactly like Riak's "siblings" until the application resolves them.
 */
class Replica {
  public clock: VectorClock = {};
  private store: Map<string, VersionedValue[]> = new Map();

  constructor(public readonly id: string, allNodeIds: string[]) {
    for (const id of allNodeIds) this.clock[id] = 0;
  }

  /** A local write: bump this replica's own slot, then store the new version. */
  write(key: string, value: string): VersionedValue {
    this.clock[this.id]++;
    const versioned: VersionedValue = { value, clock: cloneClock(this.clock), writtenBy: this.id };
    // A fresh local write supersedes anything this replica already knows about
    // for this key (it had full knowledge of prior versions before writing).
    this.store.set(key, [versioned]);
    console.log(`  [${this.id}] WRITE ${key}="${value}" @ ${formatClock(this.clock, Object.keys(this.clock).sort())}`);
    return versioned;
  }

  /**
   * Replicates an incoming version from another replica. Compares the
   * incoming version against every version already stored locally for this
   * key:
   * - if the incoming version happened-after everything stored, it replaces them.
   * - if it happened-before something already stored, it's discarded (stale).
   * - if it's concurrent with something stored, BOTH are kept as siblings —
   *   this is the conflict case that needs resolving.
   * Either way, this replica's clock catches up via element-wise max + its
   * own increment, exactly like the Lamport receive rule but per-element.
   */
  receive(key: string, incoming: VersionedValue): void {
    this.clock = mergeClocks(this.clock, incoming.clock);
    this.clock[this.id]++;

    const existing = this.store.get(key) ?? [];
    const surviving: VersionedValue[] = [];
    let incomingIsStale = false;

    for (const stored of existing) {
      const result = compareClocks(incoming.clock, stored.clock);
      if (result === "before") {
        // incoming is older than something we already have — drop incoming, keep stored.
        surviving.push(stored);
        incomingIsStale = true;
      } else if (result === "after" || result === "equal") {
        // incoming supersedes (or matches) this stored version — drop stored.
        continue;
      } else {
        // concurrent — genuine conflict, keep both.
        surviving.push(stored);
      }
    }

    if (!incomingIsStale) surviving.push(incoming);
    this.store.set(key, surviving);
  }

  getVersions(key: string): VersionedValue[] {
    return this.store.get(key) ?? [];
  }

  printKey(key: string, nodeOrder: string[]): void {
    const versions = this.getVersions(key);
    if (versions.length === 0) {
      console.log(`  [${this.id}] ${key}: <no value>`);
      return;
    }
    if (versions.length === 1) {
      const v = versions[0];
      console.log(`  [${this.id}] ${key} = "${v.value}" (by ${v.writtenBy}) @ ${formatClock(v.clock, nodeOrder)}`);
    } else {
      console.log(`  [${this.id}] ${key} has ${versions.length} CONFLICTING versions (siblings):`);
      for (const v of versions) {
        console.log(`      - "${v.value}" (by ${v.writtenBy}) @ ${formatClock(v.clock, nodeOrder)}`);
      }
    }
  }
}

// === USAGE EXAMPLE ===
const NODE_IDS = ["A", "B", "C"];
const replicaA = new Replica("A", NODE_IDS);
const replicaB = new Replica("B", NODE_IDS);
const replicaC = new Replica("C", NODE_IDS);
const replicas = { A: replicaA, B: replicaB, C: replicaC };

function replicate(from: Replica, to: Replica[], key: string, version: VersionedValue): void {
  for (const target of to) target.receive(key, version);
}

console.log("=== Scenario 1: a clean causal chain (no conflict) ===");
console.log("A writes shoppingCart, replicates to B and C before either writes anything else.");
const v1 = replicaA.write("cart:42", "[apples]");
replicate(replicaA, [replicaB, replicaC], "cart:42", v1);

console.log("\nB now writes on top of what it just received from A (causally dependent on v1):");
// B's clock already merged in A's vector during receive(), so this write
// happens-after v1 by construction — there's no ambiguity to resolve.
const v2 = replicaB.write("cart:42", "[apples, bread]");
replicate(replicaB, [replicaA, replicaC], "cart:42", v2);

console.log("\nFinal state for cart:42 across all replicas (should all agree, no conflict):");
replicaA.printKey("cart:42", NODE_IDS);
replicaB.printKey("cart:42", NODE_IDS);
replicaC.printKey("cart:42", NODE_IDS);

console.log("\n=== Scenario 2: two concurrent, conflicting writes ===");
console.log("A and B both write cart:99 independently, WITHOUT having seen each other's write first.");
const vA = replicaA.write("cart:99", "[milk]"); // A's local write
const vB = replicaB.write("cart:99", "[eggs]"); // B's local write, concurrent with A's

console.log("\nNow A and B exchange their versions with each other and with C:");
replicate(replicaA, [replicaB, replicaC], "cart:99", vA);
replicate(replicaB, [replicaA, replicaC], "cart:99", vB);

console.log("\nDirect comparison of the two vector clocks:");
console.log(`  compareClocks(vA, vB) = "${compareClocks(vA.clock, vB.clock)}" (neither dominates -> genuine conflict)`);

console.log("\nFinal state for cart:99 — every replica should report the SAME conflict (both siblings kept):");
replicaA.printKey("cart:99", NODE_IDS);
replicaB.printKey("cart:99", NODE_IDS);
replicaC.printKey("cart:99", NODE_IDS);

console.log("\n=== Why this matters ===");
console.log("A naive 'last write wins by wall-clock timestamp' system would have silently");
console.log("discarded either the milk or the eggs. Vector clocks instead let the system");
console.log("DETECT the conflict explicitly and hand it to the application to merge —");
console.log("e.g., union the two carts into [milk, eggs] — instead of silently losing data.");
