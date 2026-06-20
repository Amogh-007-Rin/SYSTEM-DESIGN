/**
 * Bloom Filter
 * Module: 05 — Caching
 * Concept: A space-efficient probabilistic structure that answers "definitely
 *   not present" or "maybe present" — never a false negative, occasionally a
 *   false positive. Used to prevent cache penetration: check the filter
 *   before hitting the database for a key that might not exist at all.
 * Run: npx ts-node bloom-filter.ts
 * Dependencies: none (uses Node.js built-in crypto)
 */

import * as crypto from "crypto";

class BloomFilter {
  private bits: Uint8Array;
  private readonly sizeInBits: number;
  private readonly hashCount: number;

  constructor(sizeInBits: number, hashCount: number) {
    this.sizeInBits = sizeInBits;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(Math.ceil(sizeInBits / 8));
  }

  // Derives `hashCount` independent-enough positions from two real hash
  // functions (double hashing) instead of computing N separate hashes —
  // a standard, cheap way to simulate multiple hash functions.
  private getPositions(value: string): number[] {
    const h1 = this.hashToInt(value, "md5");
    const h2 = this.hashToInt(value, "sha1");
    const positions: number[] = [];
    for (let i = 0; i < this.hashCount; i++) {
      const combined = (h1 + i * h2) % this.sizeInBits;
      positions.push(Math.abs(combined));
    }
    return positions;
  }

  private hashToInt(value: string, algorithm: string): number {
    const hex = crypto.createHash(algorithm).update(value).digest("hex");
    return parseInt(hex.substring(0, 8), 16);
  }

  private setBit(position: number): void {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    this.bits[byteIndex] |= 1 << bitIndex;
  }

  private getBit(position: number): boolean {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    return (this.bits[byteIndex] & (1 << bitIndex)) !== 0;
  }

  add(value: string): void {
    this.getPositions(value).forEach((pos) => this.setBit(pos));
  }

  // False positives are possible (says "maybe present" for something never
  // added, if all its bits happen to be set by other entries). False
  // negatives are NOT possible — if this returns false, the value is
  // guaranteed to have never been added. That asymmetry is the whole point.
  mightContain(value: string): boolean {
    return this.getPositions(value).every((pos) => this.getBit(pos));
  }
}

// Simulates the cache-penetration-prevention use case: check the filter
// before ever touching the (simulated, slow) database.
class ProtectedLookupService {
  private filter: BloomFilter;
  private dbCallCount = 0;

  constructor(existingIds: string[], filterSizeBits: number, hashCount: number) {
    this.filter = new BloomFilter(filterSizeBits, hashCount);
    existingIds.forEach((id) => this.filter.add(id));
  }

  lookup(id: string): { found: boolean; hitDatabase: boolean } {
    if (!this.filter.mightContain(id)) {
      // Definitely not present — skip the database entirely.
      return { found: false, hitDatabase: false };
    }
    this.dbCallCount++;
    return { found: true, hitDatabase: true }; // assume the real DB confirms it
  }

  getDbCallCount(): number {
    return this.dbCallCount;
  }
}

// === USAGE EXAMPLE ===
const existingUserIds = Array.from({ length: 1000 }, (_, i) => `user-${i}`);
const service = new ProtectedLookupService(existingUserIds, 10_000, 4);

console.log("=== Looking up 5 real IDs (should hit the database) ===");
["user-1", "user-500", "user-999"].forEach((id) => {
  console.log(`lookup(${id}):`, service.lookup(id));
});

console.log("\n=== Looking up 1000 IDs that were NEVER added (penetration attempt) ===");
let dbHitsForFakeIds = 0;
for (let i = 0; i < 1000; i++) {
  const fakeId = `nonexistent-${i}`;
  const result = service.lookup(fakeId);
  if (result.hitDatabase) dbHitsForFakeIds++;
}
console.log(`Of 1000 nonexistent IDs, ${dbHitsForFakeIds} incorrectly reached the database`);
console.log("(this is the Bloom filter's false-positive rate — tunable via size/hash count)");

console.log(`\nTotal database calls so far: ${service.getDbCallCount()}`);
console.log("Without the filter, all 1003 lookups above would have hit the database.");
