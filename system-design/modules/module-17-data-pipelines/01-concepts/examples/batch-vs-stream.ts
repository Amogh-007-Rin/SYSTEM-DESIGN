/**
 * Batch vs. Stream Processing
 * Module: 17 — Data Pipelines & Stream Processing
 * Concept: The exact same dataset (ride events for a ride-sharing app)
 *   processed two ways:
 *     1. BATCH — the complete, bounded array already sits in memory; we run
 *        one pass over all of it and emit a single final aggregate result,
 *        mirroring a nightly Spark job reading a full day's data.
 *     2. STREAM — the identical records "arrive" one at a time over simulated
 *        time delays (setTimeout), and we maintain a running aggregate that
 *        is printed incrementally after every event, mirroring a Kafka
 *        Streams / Flink job that never sees the "whole" dataset at once and
 *        must produce a usable answer at every point in time.
 *   The point: batch optimizes for one accurate answer over a complete
 *   dataset; stream optimizes for an always-up-to-date approximate answer
 *   that is available far sooner, at the cost of having to revise it as
 *   more events arrive.
 * Run: npx ts-node batch-vs-stream.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface RideEvent {
  rideId: string;
  city: string;
  fareCents: number;
  // Simulated arrival delay in ms, used only by the streaming run to spread
  // "real-time" events out over time instead of all arriving instantly.
  arrivesAfterMs: number;
}

// A fixed, bounded dataset — exactly what a batch job would read from
// storage (a Parquet file, a day's worth of database rows) in one go.
const RIDE_EVENTS: RideEvent[] = [
  { rideId: "r1", city: "Austin", fareCents: 1450, arrivesAfterMs: 100 },
  { rideId: "r2", city: "Austin", fareCents: 2200, arrivesAfterMs: 250 },
  { rideId: "r3", city: "Denver", fareCents: 980, arrivesAfterMs: 400 },
  { rideId: "r4", city: "Austin", fareCents: 1775, arrivesAfterMs: 520 },
  { rideId: "r5", city: "Denver", fareCents: 3100, arrivesAfterMs: 680 },
  { rideId: "r6", city: "Denver", fareCents: 1225, arrivesAfterMs: 800 },
  { rideId: "r7", city: "Austin", fareCents: 990, arrivesAfterMs: 950 },
];

interface CityAggregate {
  rideCount: number;
  totalFareCents: number;
}

function formatAggregates(aggregates: Map<string, CityAggregate>): string {
  return [...aggregates.entries()]
    .map(([city, agg]) => `${city}: ${agg.rideCount} rides, $${(agg.totalFareCents / 100).toFixed(2)} total`)
    .join(" | ");
}

// === BATCH PROCESSING ===
// Mirrors a MapReduce-style job: "map" each event to its city, "reduce" by
// summing fares and counting rides per city. The entire dataset is already
// available, so this runs once, synchronously, and produces ONE final result.
function runBatchJob(events: RideEvent[]): Map<string, CityAggregate> {
  const aggregates = new Map<string, CityAggregate>();

  for (const event of events) {
    const existing = aggregates.get(event.city) ?? { rideCount: 0, totalFareCents: 0 };
    existing.rideCount += 1;
    existing.totalFareCents += event.fareCents;
    aggregates.set(event.city, existing);
  }

  return aggregates;
}

// === STREAM PROCESSING ===
// Mirrors a Kafka Streams / Flink job: events arrive one at a time, spread
// out over real time, and the aggregate is updated AND emitted after every
// single event — there is no "wait for everything" step, because in a true
// stream there is no final event to wait for.
function runStreamJob(events: RideEvent[]): Promise<Map<string, CityAggregate>> {
  return new Promise((resolve) => {
    const aggregates = new Map<string, CityAggregate>();
    let processed = 0;

    for (const event of events) {
      setTimeout(() => {
        const existing = aggregates.get(event.city) ?? { rideCount: 0, totalFareCents: 0 };
        existing.rideCount += 1;
        existing.totalFareCents += event.fareCents;
        aggregates.set(event.city, existing);
        processed += 1;

        console.log(
          `  [t+${event.arrivesAfterMs}ms] event arrived (ride ${event.rideId}, ${event.city}) -> ` +
            `running totals: ${formatAggregates(aggregates)}`
        );

        if (processed === events.length) resolve(aggregates);
      }, event.arrivesAfterMs);
    }
  });
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  console.log("=== BATCH JOB: processing the complete dataset in one pass ===");
  const batchStart = Date.now();
  const batchResult = runBatchJob(RIDE_EVENTS);
  const batchDurationMs = Date.now() - batchStart;
  console.log(`Batch result (computed in ${batchDurationMs}ms, after reading all ${RIDE_EVENTS.length} events at once):`);
  console.log(`  ${formatAggregates(batchResult)}`);
  console.log("  Notice: ONE result, available only once every record had already arrived.\n");

  console.log("=== STREAM JOB: processing the same events as they arrive over time ===");
  const streamStart = Date.now();
  const streamResult = await runStreamJob(RIDE_EVENTS);
  const streamDurationMs = Date.now() - streamStart;
  console.log(`\nStream finished after ${streamDurationMs}ms (bounded by the last event's arrival delay).`);
  console.log(`Final stream result: ${formatAggregates(streamResult)}`);

  console.log("\n=== Lesson ===");
  console.log("Both jobs converge on the SAME final numbers -- but the batch job only ever");
  console.log("printed one answer, at the very end, while the stream job printed an updated,");
  console.log("immediately-usable answer after every single event. A real-time 'trips per");
  console.log("minute' dashboard needs the stream shape; a monthly revenue report is fine");
  console.log("with the batch shape -- the data is the same, the latency requirement decides.");
}

main();
