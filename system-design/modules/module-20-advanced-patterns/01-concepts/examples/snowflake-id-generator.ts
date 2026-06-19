/**
 * Snowflake-Style Distributed ID Generator
 * Module: 20 — Advanced Patterns & Putting It All Together
 * Concept: A single auto-increment column doesn't work once you have more
 *   than one writer (multiple app servers, multiple regions). Twitter's
 *   Snowflake scheme solves this by packing a millisecond timestamp, a
 *   machine ID, and a per-millisecond sequence counter into a single 64-bit
 *   integer — so every machine can generate globally unique, time-sortable
 *   IDs completely independently, with zero network calls and zero shared
 *   coordinator. This file implements that bit-packing scheme and proves,
 *   with multiple simulated machines generating IDs concurrently, that the
 *   result is both monotonic (per machine) and collision-free (across
 *   machines) — the two properties the whole scheme exists to guarantee.
 * Run: npx ts-node snowflake-id-generator.ts
 * Dependencies: none (Node.js built-in BigInt only)
 */

// === BIT LAYOUT (64 bits total, fits in a native bigint) ===
//   1 bit   unused sign bit (kept 0, so the value is always a positive bigint)
//  41 bits  timestamp: milliseconds since a custom epoch (good for ~69 years)
//  10 bits  machine/worker ID (supports up to 1024 distinct machines)
//  12 bits  per-millisecond sequence (supports up to 4096 IDs per machine per ms)
const TIMESTAMP_BITS = 41n;
const MACHINE_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;

const MAX_MACHINE_ID = (1n << MACHINE_ID_BITS) - 1n; // 1023
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n; // 4095

const MACHINE_ID_SHIFT = SEQUENCE_BITS; // 12
const TIMESTAMP_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS; // 22

// Custom epoch: 2024-01-01T00:00:00.000Z. Using a recent custom epoch (instead
// of the Unix epoch) leaves more of the 41 timestamp bits usable for years
// going forward, exactly like Twitter's real Snowflake epoch choice.
const CUSTOM_EPOCH_MS = 1704067200000n;

/** Thrown if a generator is constructed with a machine ID outside the valid range. */
class InvalidMachineIdError extends Error {
  constructor(machineId: number) {
    super(`machineId must be between 0 and ${MAX_MACHINE_ID}, got ${machineId}`);
    this.name = "InvalidMachineIdError";
  }
}

/**
 * One instance per physical machine/process. Each instance only needs to know
 * its own pre-assigned machineId — no network call, no shared coordinator,
 * no lock — to generate an ID guaranteed not to collide with any other
 * machine's IDs, as long as machine IDs themselves are assigned uniquely
 * (typically via deploy-time config or a lightweight coordination service).
 */
class SnowflakeIdGenerator {
  private readonly machineId: bigint;
  private lastTimestampMs = -1n;
  private sequence = 0n;

  constructor(machineId: number) {
    if (machineId < 0 || BigInt(machineId) > MAX_MACHINE_ID) {
      throw new InvalidMachineIdError(machineId);
    }
    this.machineId = BigInt(machineId);
  }

  /**
   * Generates the next ID. If called more than 4096 times within the same
   * millisecond by this machine, it busy-waits for the next millisecond
   * rather than overflowing the sequence counter — this is what guarantees
   * monotonicity per machine even under extreme call rates.
   */
  nextId(): bigint {
    let nowMs = BigInt(Date.now());

    if (nowMs < this.lastTimestampMs) {
      // Clock moved backwards (e.g., NTP correction). Refusing to generate an
      // ID here is the safe choice — generating one would risk a duplicate or
      // a non-monotonic ID. Production systems typically alert on this.
      throw new Error("Clock moved backwards — refusing to generate a non-monotonic ID");
    }

    if (nowMs === this.lastTimestampMs) {
      this.sequence = (this.sequence + 1n) & MAX_SEQUENCE;
      if (this.sequence === 0n) {
        // Sequence exhausted for this millisecond — spin until the clock ticks.
        while (nowMs <= this.lastTimestampMs) {
          nowMs = BigInt(Date.now());
        }
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestampMs = nowMs;

    const timestampPart = (nowMs - CUSTOM_EPOCH_MS) << TIMESTAMP_SHIFT;
    const machinePart = this.machineId << MACHINE_ID_SHIFT;
    return timestampPart | machinePart | this.sequence;
  }

  /** Decodes an ID back into its components — useful for debugging and for proving correctness below. */
  static decode(id: bigint): { timestampMs: bigint; machineId: bigint; sequence: bigint } {
    const sequence = id & MAX_SEQUENCE;
    const machineId = (id >> MACHINE_ID_SHIFT) & MAX_MACHINE_ID;
    const timestampMs = (id >> TIMESTAMP_SHIFT) + CUSTOM_EPOCH_MS;
    return { timestampMs, machineId, sequence };
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  console.log("=== Snowflake ID bit layout ===");
  console.log(
    `${TIMESTAMP_BITS} bits timestamp | ${MACHINE_ID_BITS} bits machine ID | ${SEQUENCE_BITS} bits sequence = 63 bits (+1 unused sign bit) = 64 bits total\n`
  );

  // --- Demonstration 1: monotonicity on a single machine ---
  console.log("=== Single machine: 10,000 rapid-fire IDs must be strictly increasing ===");
  const machine0 = new SnowflakeIdGenerator(0);
  const idsFromMachine0: bigint[] = [];
  for (let i = 0; i < 10_000; i++) {
    idsFromMachine0.push(machine0.nextId());
  }
  let monotonic = true;
  for (let i = 1; i < idsFromMachine0.length; i++) {
    if (idsFromMachine0[i] <= idsFromMachine0[i - 1]) {
      monotonic = false;
      break;
    }
  }
  console.log(`Generated: ${idsFromMachine0.length} IDs`);
  console.log(`Strictly increasing (monotonic): ${monotonic}`);
  console.log(`First ID:  ${idsFromMachine0[0]}`);
  console.log(`Last ID:   ${idsFromMachine0[idsFromMachine0.length - 1]}\n`);

  // --- Demonstration 2: collision-free across many machines, same millisecond ---
  console.log("=== 8 machines generating IDs concurrently: no collisions across machines ===");
  const machineCount = 8;
  const idsPerMachine = 2_000;
  const machines = Array.from({ length: machineCount }, (_, i) => new SnowflakeIdGenerator(i));

  const allIds = new Set<string>();
  let duplicateCount = 0;
  let totalGenerated = 0;

  // Interleave calls across machines (round-robin) to maximize the chance
  // multiple machines generate an ID within the very same millisecond —
  // exactly the scenario a single auto-increment column cannot handle safely.
  for (let round = 0; round < idsPerMachine; round++) {
    for (const machine of machines) {
      const id = machine.nextId();
      totalGenerated++;
      const key = id.toString();
      if (allIds.has(key)) {
        duplicateCount++;
      } else {
        allIds.add(key);
      }
    }
  }

  console.log(`Machines: ${machineCount}, IDs per machine: ${idsPerMachine}`);
  console.log(`Total IDs generated: ${totalGenerated}`);
  console.log(`Unique IDs: ${allIds.size}`);
  console.log(`Collisions detected: ${duplicateCount}`);

  // --- Demonstration 3: decode an ID back to its components ---
  console.log("\n=== Decoding a sample ID ===");
  const sampleId = machines[3].nextId();
  const decoded = SnowflakeIdGenerator.decode(sampleId);
  console.log(`Sample ID:        ${sampleId}`);
  console.log(`Decoded machine:  ${decoded.machineId} (expected 3)`);
  console.log(`Decoded sequence: ${decoded.sequence}`);
  console.log(`Decoded time:     ${new Date(Number(decoded.timestampMs)).toISOString()}`);

  // --- Demonstration 4: invalid machine ID is rejected ---
  console.log("\n=== Validation: machine ID out of range is rejected ===");
  try {
    new SnowflakeIdGenerator(2000); // max is 1023
    console.log("BUG: should have thrown");
  } catch (err) {
    console.log(`Correctly rejected: ${(err as Error).message}`);
  }

  const allChecksPassed = monotonic && duplicateCount === 0 && decoded.machineId === 3n;
  console.log(`\nAll correctness checks passed: ${allChecksPassed}`);
}

main();
