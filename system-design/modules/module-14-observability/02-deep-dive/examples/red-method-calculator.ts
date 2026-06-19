/**
 * RED Method Calculator — Rate, Errors, Duration
 * Module: 14 — Observability
 * Concept: The RED method reduces "how healthy is this service" to three
 *   numbers: Rate (throughput), Errors (failure rate), Duration (latency
 *   distribution). This file takes a batch of raw request log entries
 *   (the kind a real service might emit per-request) and computes all
 *   three from scratch — including p50/p95/p99 latency percentiles —
 *   the same shape of computation a metrics backend performs continuously
 *   over a sliding time window.
 * Run: npx ts-node red-method-calculator.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface RequestLogEntry {
  timestampMs: number;
  route: string;
  statusCode: number;
  latencyMs: number;
}

interface REDSummary {
  windowSeconds: number;
  rate: { totalRequests: number; requestsPerSecond: number };
  errors: { errorCount: number; errorRatePercent: number };
  duration: { p50: number; p95: number; p99: number; avg: number };
}

/** Linear-interpolation percentile over a sorted numeric array — exact, not bucket-approximated,
 *  since here we have the raw values (unlike a real Prometheus histogram scrape). */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const rank = p * (sortedValues.length - 1);
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  if (lowerIndex === upperIndex) return sortedValues[lowerIndex];
  const fraction = rank - lowerIndex;
  return sortedValues[lowerIndex] + fraction * (sortedValues[upperIndex] - sortedValues[lowerIndex]);
}

/** A request counts as an "error" by the RED method's convention: any 5xx (server fault)
 *  or 429 (rate-limited) — i.e., failures attributable to the service, not the caller's 4xx mistakes. */
function isError(statusCode: number): boolean {
  return statusCode >= 500 || statusCode === 429;
}

function computeREDSummary(logs: RequestLogEntry[]): REDSummary {
  if (logs.length === 0) {
    throw new Error("Cannot compute RED summary over an empty log window");
  }

  const timestamps = logs.map((l) => l.timestampMs);
  const windowMs = Math.max(...timestamps) - Math.min(...timestamps);
  const windowSeconds = Math.max(windowMs / 1000, 1); // avoid divide-by-zero on a near-instant burst

  const totalRequests = logs.length;
  const requestsPerSecond = totalRequests / windowSeconds;

  const errorCount = logs.filter((l) => isError(l.statusCode)).length;
  const errorRatePercent = (errorCount / totalRequests) * 100;

  const latencies = logs.map((l) => l.latencyMs).sort((a, b) => a - b);
  const avg = latencies.reduce((sum, v) => sum + v, 0) / latencies.length;

  return {
    windowSeconds,
    rate: { totalRequests, requestsPerSecond },
    errors: { errorCount, errorRatePercent },
    duration: {
      p50: percentile(latencies, 0.5),
      p95: percentile(latencies, 0.95),
      p99: percentile(latencies, 0.99),
      avg,
    },
  };
}

/** Breaks down RED per-route — real dashboards almost always slice by route/endpoint,
 *  since a fleet-wide average can hide one slow or failing endpoint entirely. */
function computeREDByRoute(logs: RequestLogEntry[]): Map<string, REDSummary> {
  const byRoute = new Map<string, RequestLogEntry[]>();
  for (const entry of logs) {
    const existing = byRoute.get(entry.route) ?? [];
    existing.push(entry);
    byRoute.set(entry.route, existing);
  }

  const result = new Map<string, REDSummary>();
  for (const [route, entries] of byRoute) {
    result.set(route, computeREDSummary(entries));
  }
  return result;
}

function formatSummary(label: string, summary: REDSummary): string {
  return [
    `${label}`,
    `  Rate:     ${summary.rate.totalRequests} requests over ${summary.windowSeconds.toFixed(1)}s ` +
      `(${summary.rate.requestsPerSecond.toFixed(2)} req/s)`,
    `  Errors:   ${summary.errors.errorCount} errors (${summary.errors.errorRatePercent.toFixed(2)}%)`,
    `  Duration: avg=${summary.duration.avg.toFixed(1)}ms  p50=${summary.duration.p50.toFixed(1)}ms  ` +
      `p95=${summary.duration.p95.toFixed(1)}ms  p99=${summary.duration.p99.toFixed(1)}ms`,
  ].join("\n");
}

/** Generates a synthetic but realistic batch of request logs across a few routes,
 *  with one route deliberately having an elevated error rate and latency tail —
 *  the exact kind of skew a per-route breakdown is meant to surface. */
function generateSyntheticLogs(): RequestLogEntry[] {
  const logs: RequestLogEntry[] = [];
  const startMs = Date.now();
  const routes = ["/checkout", "/search", "/profile"];
  const perRouteSeq: Record<string, number> = { "/checkout": 0, "/search": 0, "/profile": 0 };

  for (let i = 0; i < 300; i++) {
    const route = routes[i % routes.length];
    const timestampMs = startMs + i * 33; // ~30 requests/sec spread over the window
    perRouteSeq[route]++;
    const seq = perRouteSeq[route]; // per-route counter, so each route's error cadence is independent

    if (route === "/checkout") {
      // /checkout is the deliberately unhealthy route: heavier tail latency, occasional 5xx.
      const latencyMs = 80 + Math.random() * 400 + (seq % 20 === 0 ? 1500 : 0);
      const statusCode = seq % 15 === 0 ? 503 : 200;
      logs.push({ timestampMs, route, statusCode, latencyMs });
    } else if (route === "/search") {
      const latencyMs = 20 + Math.random() * 60;
      const statusCode = seq % 50 === 0 ? 500 : 200;
      logs.push({ timestampMs, route, statusCode, latencyMs });
    } else {
      const latencyMs = 10 + Math.random() * 25;
      const statusCode = 200;
      logs.push({ timestampMs, route, statusCode, latencyMs });
    }
  }
  return logs;
}

// === USAGE EXAMPLE ===
function main(): void {
  const logs = generateSyntheticLogs();

  console.log(`Analyzing ${logs.length} synthetic request log entries across ${new Set(logs.map((l) => l.route)).size} routes...\n`);

  console.log("=== Fleet-wide RED summary ===");
  console.log(formatSummary("all routes", computeREDSummary(logs)));

  console.log("\n=== Per-route RED breakdown ===");
  const byRoute = computeREDByRoute(logs);
  for (const [route, summary] of byRoute) {
    console.log();
    console.log(formatSummary(route, summary));
  }

  console.log(
    "\nNote: /checkout's per-route breakdown reveals an elevated error rate and a heavy p99 tail that the " +
      "fleet-wide average mostly hides — exactly why RED dashboards are sliced per route/service, not just aggregated."
  );
}

main();
