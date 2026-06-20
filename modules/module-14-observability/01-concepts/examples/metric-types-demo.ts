/**
 * Prometheus Metric Types — Minimal In-Memory Implementation
 * Module: 14 — Observability
 * Concept: Prometheus's data model is built on a small number of metric
 *   types, each shaped for a different kind of measurement:
 *     - Counter:   monotonically increasing (e.g. total requests served)
 *     - Gauge:     goes up and down (e.g. current active connections)
 *     - Histogram: bucketed observations you can derive percentiles from,
 *                  and — critically — can be combined across instances
 *                  because the buckets simply add together.
 *   This file implements tiny versions of all three from scratch (no
 *   prom-client) to make the underlying data structures concrete, then
 *   prints a Prometheus-text-format-style summary, the same shape of
 *   output a real `/metrics` endpoint would return for a scrape.
 * Run: npx ts-node metric-types-demo.ts
 * Dependencies: none (Node.js built-ins only)
 */

// --- Counter -----------------------------------------------------------
// Only moves in one direction. Real dashboards never read the raw value;
// they apply rate() over a time window to get a per-second rate. We expose
// the raw cumulative value here, matching what a real /metrics scrape sees.
class Counter {
  private value = 0;

  constructor(private readonly name: string, private readonly help: string) {}

  inc(amount = 1): void {
    if (amount < 0) {
      throw new Error("Counter can only increase — use a Gauge for values that can decrease");
    }
    this.value += amount;
  }

  toPromText(): string {
    return [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} counter`, `${this.name} ${this.value}`].join(
      "\n"
    );
  }
}

// --- Gauge ---------------------------------------------------------------
// A point-in-time value — no aggregation trick needed, just read it.
class Gauge {
  private value = 0;

  constructor(private readonly name: string, private readonly help: string) {}

  set(value: number): void {
    this.value = value;
  }

  inc(amount = 1): void {
    this.value += amount;
  }

  dec(amount = 1): void {
    this.value -= amount;
  }

  toPromText(): string {
    return [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} gauge`, `${this.name} ${this.value}`].join("\n");
  }
}

// --- Histogram -------------------------------------------------------------
// Observations are sorted into cumulative buckets ("le" = less-than-or-equal
// to the bucket boundary), plus a running count and sum. This is what lets
// Prometheus approximate percentiles (via histogram_quantile()) AFTER the
// fact, and — unlike a Summary's pre-computed quantiles — combine buckets
// across many service instances into one fleet-wide percentile, because
// adding two histograms' buckets together is just integer addition.
class Histogram {
  private readonly bucketBounds: number[];
  private readonly bucketCounts: Map<number, number> = new Map();
  private count = 0;
  private sum = 0;

  constructor(private readonly name: string, private readonly help: string, bucketBoundsMs: number[]) {
    // Buckets must be ascending and cumulative; +Infinity always included so
    // every observation lands in at least one bucket.
    this.bucketBounds = [...bucketBoundsMs, Infinity];
    for (const bound of this.bucketBounds) {
      this.bucketCounts.set(bound, 0);
    }
  }

  observe(value: number): void {
    this.count += 1;
    this.sum += value;
    // Cumulative buckets: an observation of 120ms increments the 200ms
    // bucket AND the 500ms bucket AND the +Inf bucket — every bound >= value.
    for (const bound of this.bucketBounds) {
      if (value <= bound) {
        this.bucketCounts.set(bound, (this.bucketCounts.get(bound) ?? 0) + 1);
      }
    }
  }

  /** Approximate the given percentile (0-1) via linear interpolation within the bucket it falls in. */
  approxPercentile(p: number): number {
    const target = p * this.count;
    let prevBound = 0;
    let prevCount = 0;
    for (const bound of this.bucketBounds) {
      const cumulativeCount = this.bucketCounts.get(bound) ?? 0;
      if (cumulativeCount >= target) {
        if (cumulativeCount === prevCount || bound === Infinity) return prevBound;
        const fraction = (target - prevCount) / (cumulativeCount - prevCount);
        return prevBound + fraction * (bound - prevBound);
      }
      prevBound = bound;
      prevCount = cumulativeCount;
    }
    return prevBound;
  }

  toPromText(): string {
    const lines = [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} histogram`];
    for (const bound of this.bucketBounds) {
      const label = bound === Infinity ? "+Inf" : bound;
      lines.push(`${this.name}_bucket{le="${label}"} ${this.bucketCounts.get(bound)}`);
    }
    lines.push(`${this.name}_sum ${this.sum}`);
    lines.push(`${this.name}_count ${this.count}`);
    return lines.join("\n");
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const requestsTotal = new Counter("http_requests_total", "Total number of HTTP requests served");
  const activeConnections = new Gauge("active_connections", "Current number of open connections");
  const requestDuration = new Histogram(
    "http_request_duration_ms",
    "HTTP request latency in milliseconds",
    [50, 100, 200, 500, 1000]
  );

  // Simulate a small burst of traffic: 10 requests with varying latency,
  // a couple of which fail. The Counter only ever goes up; the Gauge moves
  // with connection churn; the Histogram buckets every latency observed.
  const simulatedLatenciesMs = [42, 88, 95, 120, 150, 210, 340, 480, 610, 900];

  console.log("Simulating 10 requests...\n");
  for (const latencyMs of simulatedLatenciesMs) {
    activeConnections.inc();
    requestsTotal.inc();
    requestDuration.observe(latencyMs);
    activeConnections.dec(); // request completes, connection closes
  }

  // One connection stays open at the end (e.g. a slow client still connected).
  activeConnections.inc();

  console.log("=== Prometheus-text-format-style /metrics output ===\n");
  console.log(requestsTotal.toPromText());
  console.log();
  console.log(activeConnections.toPromText());
  console.log();
  console.log(requestDuration.toPromText());

  console.log("\n=== Derived percentiles (computed from histogram buckets) ===");
  console.log(`p50: ${requestDuration.approxPercentile(0.5).toFixed(1)}ms`);
  console.log(`p95: ${requestDuration.approxPercentile(0.95).toFixed(1)}ms`);
  console.log(`p99: ${requestDuration.approxPercentile(0.99).toFixed(1)}ms`);

  console.log(
    "\nNote: these percentiles are *approximations* derived from bucket boundaries, exactly like real " +
      "Prometheus histogram_quantile() — the trade-off for being combinable across many service instances."
  );
}

main();
