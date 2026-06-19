// SOLUTION FILE — try starter.ts first!
/**
 * Bloom Filter
 * Module: 05 — Caching
 * Concept: A space-efficient probabilistic set membership structure — no
 *   false negatives, a tunable rate of false positives. Used to avoid cache
 *   penetration by cheaply ruling out keys that definitely don't exist.
 * Run: npx ts-node solution.ts
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

  private hashToInt(value: string, algorithm: string): number {
    const hex = crypto.createHash(algorithm).update(value).digest("hex");
    return parseInt(hex.substring(0, 8), 16);
  }

  private getPositions(value: string): number[] {
    const h1 = this.hashToInt(value, "md5");
    const h2 = this.hashToInt(value, "sha1");
    const positions: number[] = [];
    for (let i = 0; i < this.hashCount; i++) {
      positions.push(Math.abs((h1 + i * h2) % this.sizeInBits));
    }
    return positions;
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

  mightContain(value: string): boolean {
    return this.getPositions(value).every((pos) => this.getBit(pos));
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
