/**
 * Latency Reference & RTT Estimator
 * Module: 02 — Networking Fundamentals
 * Concept: Prints the canonical latency numbers every engineer should know,
 *   and estimates total round-trip time for a chain of dependent network hops —
 *   the kind of math you do when asked "what's the latency budget here?"
 * Run: npx ts-node latency-reference.ts
 * Dependencies: none
 */

interface LatencyFigure {
  operation: string;
  nanoseconds: number;
}

// Stored in nanoseconds so we can sort and compare on one consistent unit,
// then format to whatever unit reads best for a human (ns/us/ms).
const latencyTable: LatencyFigure[] = [
  { operation: "L1 cache reference", nanoseconds: 1 },
  { operation: "L2 cache reference", nanoseconds: 4 },
  { operation: "Main memory (RAM) reference", nanoseconds: 100 },
  { operation: "SSD random read (NVMe)", nanoseconds: 16_000 },
  { operation: "Round trip within same datacenter", nanoseconds: 500_000 },
  { operation: "HDD seek", nanoseconds: 4_000_000 },
  { operation: "Cross-region round trip (e.g. US -> Europe)", nanoseconds: 100_000_000 },
];

function formatNanoseconds(ns: number): string {
  if (ns < 1_000) return `${ns} ns`;
  if (ns < 1_000_000) return `${(ns / 1_000).toFixed(1)} μs`;
  return `${(ns / 1_000_000).toFixed(1)} ms`;
}

function printLatencyTable(): void {
  console.log("=== Latency Numbers Every Engineer Should Know ===");
  latencyTable.forEach((entry) => {
    console.log(`${entry.operation.padEnd(45)} ${formatNanoseconds(entry.nanoseconds)}`);
  });
}

interface NetworkHop {
  name: string;
  oneWayLatencyMs: number;
}

// A simple model for "if a request has to make these hops sequentially, what's
// the minimum possible round-trip budget?" — useful for sanity-checking whether
// a design's latency target is even physically achievable.
function estimateSequentialRTT(hops: NetworkHop[]): number {
  // Each hop is a round trip (request + response), so we double the one-way figure.
  return hops.reduce((total, hop) => total + hop.oneWayLatencyMs * 2, 0);
}

// === USAGE EXAMPLE ===
printLatencyTable();

console.log("\n=== Sequential Hop Budget: client -> app server -> auth service -> database ===");
const requestChain: NetworkHop[] = [
  { name: "Client -> App Server (same region)", oneWayLatencyMs: 20 },
  { name: "App Server -> Auth Service (same DC)", oneWayLatencyMs: 0.5 },
  { name: "App Server -> Database (same DC)", oneWayLatencyMs: 0.5 },
];

requestChain.forEach((hop) => {
  console.log(`  ${hop.name}: ${(hop.oneWayLatencyMs * 2).toFixed(1)}ms round trip`);
});

const totalRTT = estimateSequentialRTT(requestChain);
console.log(`Total minimum sequential RTT: ${totalRTT.toFixed(1)}ms`);
console.log("(This ignores processing time — it's the network floor, not the real total.)");
