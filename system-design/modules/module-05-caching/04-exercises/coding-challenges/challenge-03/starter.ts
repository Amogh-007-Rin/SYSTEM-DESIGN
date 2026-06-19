/**
 * Bloom Filter
 * Module: 05 — Caching
 * Concept: A space-efficient probabilistic set membership structure — no
 *   false negatives, a tunable rate of false positives. Used to avoid cache
 *   penetration by cheaply ruling out keys that definitely don't exist.
 * Run: npx ts-node starter.ts
 * Dependencies: none (uses Node.js built-in crypto)
 */

import * as crypto from "crypto";

/**
 * TODO: Implement BloomFilter.
 *
 * Constructor(sizeInBits, hashCount): allocate a Uint8Array of
 *   Math.ceil(sizeInBits / 8) bytes.
 *
 * private getPositions(value): number[]
 *   - h1 = parseInt(md5(value).slice(0,8), 16)
 *   - h2 = parseInt(sha1(value).slice(0,8), 16)
 *   - for i in [0, hashCount): position = (h1 + i*h2) % sizeInBits
 *
 * private setBit(position) / getBit(position): standard bit-twiddling on the byte array.
 *
 * add(value): set all of value's positions.
 * mightContain(value): true only if ALL of value's positions are set.
 */
class BloomFilter {
  private bits: Uint8Array;
  private readonly sizeInBits: number;
  private readonly hashCount: number;

  constructor(sizeInBits: number, hashCount: number) {
    this.sizeInBits = sizeInBits;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(Math.ceil(sizeInBits / 8));
  }

  private getPositions(value: string): number[] {
    // TODO: implement
    throw new Error("Not implemented");
  }

  private setBit(position: number): void {
    // TODO: implement
  }

  private getBit(position: number): boolean {
    // TODO: implement
    throw new Error("Not implemented");
  }

  add(value: string): void {
    // TODO: implement
  }

  mightContain(value: string): boolean {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// === USAGE EXAMPLE ===
const filter = new BloomFilter(10_000, 4);
const addedValues = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
addedValues.forEach((v) => filter.add(v));

console.log("=== Checking added values (must ALL be true) ===");
const allFound = addedValues.every((v) => filter.mightContain(v));
console.log(`All 1000 added values report present: ${allFound}`);

console.log("\n=== Checking 1000 never-added values (false-positive rate) ===");
let falsePositives = 0;
for (let i = 0; i < 1000; i++) {
  if (filter.mightContain(`never-added-${i}`)) falsePositives++;
}
console.log(`False positives: ${falsePositives} / 1000`);
