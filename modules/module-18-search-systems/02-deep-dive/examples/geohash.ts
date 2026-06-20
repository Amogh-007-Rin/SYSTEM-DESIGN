/**
 * Geohash Encoder/Decoder
 * Module: 18 — Search Systems
 * Concept: A simplified implementation of geohashing — encoding a
 *   (latitude, longitude) pair into a base32 string by recursively
 *   subdividing the world into a grid, alternating between longitude and
 *   latitude bisection. Demonstrates the key property that makes geohashing
 *   useful for search: nearby coordinates usually share a long common
 *   prefix, turning "find things near this point" into a prefix lookup
 *   against a normal inverted index instead of a per-row distance scan.
 * Run: npx ts-node geohash.ts
 * Dependencies: none
 */

// Standard geohash base32 alphabet (note: omits "a", "i", "l", "o" to avoid
// visual ambiguity with "0", "1" — this is the real geohash alphabet).
const BASE32_ALPHABET = "0123456789bcdefghjkmnpqrstuvwxyz";

interface LatLonRange {
  min: number;
  max: number;
}

// Encodes a (lat, lon) pair into a geohash string of the given precision
// (number of base32 characters). Each iteration bisects either the longitude
// or latitude range (alternating), appending a bit indicating which half the
// true coordinate falls in. Every 5 bits collected forms one base32 character.
function encodeGeohash(latitude: number, longitude: number, precision: number): string {
  let latRange: LatLonRange = { min: -90, max: 90 };
  let lonRange: LatLonRange = { min: -180, max: 180 };

  let isEvenBit = true; // alternates starting with longitude
  let bitIndex = 0;
  let charIndex = 0;
  let geohash = "";

  while (geohash.length < precision) {
    if (isEvenBit) {
      const mid = (lonRange.min + lonRange.max) / 2;
      if (longitude >= mid) {
        charIndex = (charIndex << 1) | 1;
        lonRange.min = mid;
      } else {
        charIndex = charIndex << 1;
        lonRange.max = mid;
      }
    } else {
      const mid = (latRange.min + latRange.max) / 2;
      if (latitude >= mid) {
        charIndex = (charIndex << 1) | 1;
        latRange.min = mid;
      } else {
        charIndex = charIndex << 1;
        latRange.max = mid;
      }
    }

    isEvenBit = !isEvenBit;
    bitIndex++;

    // Every 5 bits maps to one base32 character.
    if (bitIndex === 5) {
      geohash += BASE32_ALPHABET[charIndex];
      bitIndex = 0;
      charIndex = 0;
    }
  }

  return geohash;
}

// Decodes a geohash string back into an approximate (lat, lon) center point
// plus the bounding box of precision it represents — the inverse of the
// recursive bisection performed during encoding.
function decodeGeohash(geohash: string): {
  latitude: number;
  longitude: number;
  latRange: LatLonRange;
  lonRange: LatLonRange;
} {
  let latRange: LatLonRange = { min: -90, max: 90 };
  let lonRange: LatLonRange = { min: -180, max: 180 };
  let isEvenBit = true;

  for (const char of geohash) {
    const charIndex = BASE32_ALPHABET.indexOf(char);
    if (charIndex === -1) {
      throw new Error(`Invalid geohash character: "${char}"`);
    }

    for (let bit = 4; bit >= 0; bit--) {
      const bitValue = (charIndex >> bit) & 1;
      if (isEvenBit) {
        const mid = (lonRange.min + lonRange.max) / 2;
        if (bitValue === 1) lonRange.min = mid;
        else lonRange.max = mid;
      } else {
        const mid = (latRange.min + latRange.max) / 2;
        if (bitValue === 1) latRange.min = mid;
        else latRange.max = mid;
      }
      isEvenBit = !isEvenBit;
    }
  }

  return {
    latitude: (latRange.min + latRange.max) / 2,
    longitude: (lonRange.min + lonRange.max) / 2,
    latRange,
    lonRange,
  };
}

// Counts how many leading characters two geohashes share — a cheap proxy for
// "how geographically close are these two points," used below to demonstrate
// the prefix-locality property.
function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

// === USAGE EXAMPLE ===
const PRECISION = 9; // ~9 characters ≈ sub-meter precision in real geohashing

interface NamedPoint {
  name: string;
  lat: number;
  lon: number;
}

const points: NamedPoint[] = [
  { name: "Eiffel Tower, Paris", lat: 48.8584, lon: 2.2945 },
  { name: "Louvre Museum, Paris (~2.5km away)", lat: 48.8606, lon: 2.3376 },
  { name: "Notre-Dame, Paris (~2km away)", lat: 48.853, lon: 2.3499 },
  { name: "Statue of Liberty, NYC (~5,800km away)", lat: 40.6892, lon: -74.0445 },
];

console.log("=== Encoding coordinates to geohashes ===");
const encoded = points.map((p) => ({
  ...p,
  geohash: encodeGeohash(p.lat, p.lon, PRECISION),
}));

for (const p of encoded) {
  console.log(`${p.name.padEnd(42)} -> ${p.geohash}`);
}

console.log("\n=== Decoding a geohash back to coordinates ===");
const decoded = decodeGeohash(encoded[0].geohash);
console.log(`geohash "${encoded[0].geohash}" decodes to:`);
console.log(`  lat=${decoded.latitude.toFixed(5)}, lon=${decoded.longitude.toFixed(5)}`);
console.log(`  (original was lat=${points[0].lat}, lon=${points[0].lon})`);

console.log("\n=== Demonstrating prefix locality ===");
const paris1 = encoded[0]; // Eiffel Tower
for (const other of encoded.slice(1)) {
  const sharedLength = commonPrefixLength(paris1.geohash, other.geohash);
  console.log(
    `${paris1.name} vs. ${other.name}: shares ${sharedLength}/${PRECISION} prefix characters ` +
      `("${paris1.geohash.substring(0, sharedLength)}")`
  );
}

console.log(
  "\nNotice: the two nearby Paris landmarks share many more prefix characters " +
    "with the Eiffel Tower than the Statue of Liberty does — this is exactly " +
    "why a search engine can index geohashes as ordinary strings and use a " +
    "prefix query to find 'things near this point,' without any custom " +
    "spatial data structure."
);
