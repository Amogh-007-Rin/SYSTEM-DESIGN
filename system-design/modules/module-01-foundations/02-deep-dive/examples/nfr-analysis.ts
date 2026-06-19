/**
 * NFR Analysis
 * Module: 01 — Foundations of System Design
 * Concept: Different system types imply wildly different non-functional
 *   requirements. This file models a few archetypal systems as data and
 *   prints a comparison, to make the "NFRs drive architecture" idea concrete.
 * Run: npx ts-node nfr-analysis.ts
 * Dependencies: none
 */

interface NonFunctionalRequirements {
  systemType: string;
  availabilityTarget: string;
  latencyP99Ms: number;
  consistencyModel: "strong" | "eventual";
  durabilityCritical: boolean;
  readWriteRatio: string;
  notes: string;
}

// Each row represents a believable NFR profile for a well-known category of system.
// The point isn't that these numbers are universally "correct" — it's that they
// differ enough from each other to force different architecture decisions.
const systemProfiles: NonFunctionalRequirements[] = [
  {
    systemType: "Social media feed (read-heavy)",
    availabilityTarget: "99.9%",
    latencyP99Ms: 200,
    consistencyModel: "eventual",
    durabilityCritical: false,
    readWriteRatio: "100:1",
    notes: "Staleness of a few seconds on a feed is invisible to users; optimize for read latency and availability over strict consistency.",
  },
  {
    systemType: "Banking ledger (write-critical)",
    availabilityTarget: "99.99%",
    latencyP99Ms: 500,
    consistencyModel: "strong",
    durabilityCritical: true,
    readWriteRatio: "5:1",
    notes: "A lost or double-applied write is a regulatory incident, not a bug ticket. Strong consistency and durability dominate latency.",
  },
  {
    systemType: "Real-time multiplayer game state",
    availabilityTarget: "99.9%",
    latencyP99Ms: 50,
    consistencyModel: "eventual",
    durabilityCritical: false,
    readWriteRatio: "1:1",
    notes: "Latency budget is the tightest of any profile here — a 200ms p99 would be unplayable. Durability of any single state update barely matters.",
  },
  {
    systemType: "E-commerce inventory count",
    availabilityTarget: "99.95%",
    latencyP99Ms: 300,
    consistencyModel: "strong",
    durabilityCritical: true,
    readWriteRatio: "20:1",
    notes: "Overselling inventory is a customer-facing failure; this needs strong consistency on the decrement path even though reads can be cached.",
  },
];

function printComparison(profiles: NonFunctionalRequirements[]): void {
  console.log("System Type".padEnd(35), "Avail".padEnd(8), "p99(ms)".padEnd(9), "Consistency".padEnd(12), "Durable?".padEnd(9), "R:W");
  console.log("-".repeat(95));
  profiles.forEach((p) => {
    console.log(
      p.systemType.padEnd(35),
      p.availabilityTarget.padEnd(8),
      String(p.latencyP99Ms).padEnd(9),
      p.consistencyModel.padEnd(12),
      (p.durabilityCritical ? "yes" : "no").padEnd(9),
      p.readWriteRatio
    );
  });
}

// Given a partial set of constraints, suggest which NFR should dominate the design.
// This mirrors the judgment call an architect makes when constraints conflict —
// you can't maximize every property, so something has to be named "primary."
function dominantConcern(profile: NonFunctionalRequirements): string {
  if (profile.durabilityCritical && profile.consistencyModel === "strong") {
    return "Correctness (durability + consistency) over raw latency";
  }
  if (profile.latencyP99Ms <= 100) {
    return "Latency above all else — even at some consistency cost";
  }
  if (profile.readWriteRatio.startsWith("100") || profile.readWriteRatio.startsWith("20")) {
    return "Read scalability — heavy caching, eventual consistency acceptable on reads";
  }
  return "Balanced — no single property dominates strongly";
}

// === USAGE EXAMPLE ===
printComparison(systemProfiles);

console.log("\n=== Dominant Concern Per System ===");
systemProfiles.forEach((p) => {
  console.log(`- ${p.systemType}: ${dominantConcern(p)}`);
  console.log(`  Why: ${p.notes}`);
});
