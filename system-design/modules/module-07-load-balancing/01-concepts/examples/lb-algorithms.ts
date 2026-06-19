/**
 * Load Balancing Algorithms: Round Robin, Weighted Round Robin, IP Hash
 * Module: 07 — Load Balancing
 * Concept: Each algorithm produces a different backend-selection *sequence*
 *   for the exact same incoming traffic. Seeing the sequences side-by-side
 *   makes the trade-offs (fairness vs. capacity-awareness vs. affinity)
 *   concrete instead of abstract.
 * Run: npx ts-node lb-algorithms.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface Backend {
  id: string;
  weight: number; // relative capacity; used only by Weighted Round Robin
}

// ROUND ROBIN: cycles through backends in fixed order, ignoring capacity or
// load entirely. Fair only when every backend and every request is roughly
// equal — which is why it's the simplest default, not the most adaptive one.
class RoundRobinBalancer {
  private nextIndex = 0;
  constructor(private backends: Backend[]) {}

  pick(): Backend {
    const backend = this.backends[this.nextIndex];
    this.nextIndex = (this.nextIndex + 1) % this.backends.length;
    return backend;
  }
}

// WEIGHTED ROUND ROBIN: a backend with weight 3 receives 3 requests for
// every 1 a weight-1 backend receives. Implemented here with the classic
// "expand into a weighted sequence, then round-robin over it" approach —
// simple to reason about, though production implementations (e.g. HAProxy's
// smooth weighted round robin) interleave weights more evenly over time.
class WeightedRoundRobinBalancer {
  private sequence: Backend[] = [];
  private nextIndex = 0;

  constructor(backends: Backend[]) {
    for (const backend of backends) {
      for (let i = 0; i < backend.weight; i++) {
        this.sequence.push(backend);
      }
    }
  }

  pick(): Backend {
    const backend = this.sequence[this.nextIndex];
    this.nextIndex = (this.nextIndex + 1) % this.sequence.length;
    return backend;
  }
}

// IP HASH: deterministically maps a client IP to the same backend every
// time, giving "free" session affinity with zero server-side session
// state. The trade-off is visible below: distribution quality now depends
// entirely on how well-spread the *input* IPs happen to be, not on the
// algorithm itself.
class IpHashBalancer {
  constructor(private backends: Backend[]) {}

  private hash(ip: string): number {
    // A small, fast string hash (variant of djb2) — good enough to
    // demonstrate deterministic bucketing; not cryptographic.
    let hash = 5381;
    for (let i = 0; i < ip.length; i++) {
      hash = (hash * 33) ^ ip.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  pick(clientIp: string): Backend {
    const index = this.hash(clientIp) % this.backends.length;
    return this.backends[index];
  }
}

function countSelections(selections: Backend[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const backend of selections) {
    counts[backend.id] = (counts[backend.id] ?? 0) + 1;
  }
  return counts;
}

// === USAGE EXAMPLE ===
const backends: Backend[] = [
  { id: "server-A", weight: 2 },
  { id: "server-B", weight: 1 },
  { id: "server-C", weight: 1 },
];

console.log("=== Round Robin (8 requests) ===");
const roundRobin = new RoundRobinBalancer(backends);
const rrSequence = Array.from({ length: 8 }, () => roundRobin.pick().id);
console.log("Sequence:", rrSequence.join(", "));
console.log("Counts:  ", countSelections(rrSequence.map((id) => ({ id, weight: 0 }))));

console.log("\n=== Weighted Round Robin (weights A:2, B:1, C:1 — 8 requests) ===");
const weighted = new WeightedRoundRobinBalancer(backends);
const wrrSequence = Array.from({ length: 8 }, () => weighted.pick().id);
console.log("Sequence:", wrrSequence.join(", "));
console.log("Counts:  ", countSelections(wrrSequence.map((id) => ({ id, weight: 0 }))));
console.log("Note: server-A (weight 2) receives roughly double the requests of B or C.");

console.log("\n=== IP Hash (same client IP always lands on the same backend) ===");
const ipHash = new IpHashBalancer(backends);
const clientIps = ["203.0.113.5", "198.51.100.23", "203.0.113.5", "192.0.2.77", "198.51.100.23"];
for (const ip of clientIps) {
  console.log(`  client ${ip.padEnd(15)} -> ${ipHash.pick(ip).id}`);
}
console.log(
  "Note: repeated IPs (203.0.113.5, 198.51.100.23) always map to the same backend " +
    "— that's session affinity, achieved with zero stored session state."
);
