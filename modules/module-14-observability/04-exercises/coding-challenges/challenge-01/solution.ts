// SOLUTION FILE — try starter.ts first!
/**
 * Prometheus Metrics for an Express App
 * Module: 14 — Observability
 * Concept: Instrument an Express app with a request Counter and a latency
 *   Histogram using prom-client, recorded transparently via middleware,
 *   then expose them on /metrics in Prometheus text exposition format —
 *   the exact mechanism a real Prometheus server scrapes on an interval.
 * Run: npx ts-node solution.ts
 * Dependencies: express, prom-client (already in this repo's package.json)
 */

import * as http from "http";
import express, { Request, Response, NextFunction } from "express";
import client from "prom-client";

function buildApp(): { app: express.Express; registry: client.Registry } {
  const app = express();

  // A dedicated Registry (rather than the global default) keeps this app's
  // metrics isolated — useful in tests/examples where you don't want state
  // leaking between runs, and good practice in any app with sub-modules
  // that might also register metrics.
  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry }); // process CPU, memory, event loop lag, etc.

  const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests served, labeled by method, route, and status code",
    labelNames: ["method", "route", "status_code"],
    registers: [registry],
  });

  const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds, labeled by method and route",
    labelNames: ["method", "route"],
    // Buckets tuned for a typical web service: sub-10ms up through a 5s
    // worst case. Real bucket boundaries should be chosen from observed
    // latency distribution, not guessed once and left forever.
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [registry],
  });

  // Middleware recording rate + latency for every request, regardless of
  // which route handler runs — this is what lets instrumentation live in
  // one place instead of being duplicated into every handler.
  function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint();

    res.on("finish", () => {
      const elapsedNs = process.hrtime.bigint() - startTime;
      const elapsedSeconds = Number(elapsedNs) / 1e9;

      // Use the matched route *pattern* (e.g. "/orders/:id"), not the literal
      // path with a real ID substituted in — labeling by raw path would create
      // one time series per distinct order ID ever requested, an unbounded
      // cardinality blowup that can overwhelm a real Prometheus server.
      const routeLabel = req.route?.path ?? req.path;

      httpRequestsTotal.inc({
        method: req.method,
        route: routeLabel,
        status_code: String(res.statusCode),
      });
      httpRequestDurationSeconds.observe({ method: req.method, route: routeLabel }, elapsedSeconds);
    });

    next();
  }
  app.use(metricsMiddleware);

  // --- Demo routes ---------------------------------------------------------

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/orders/:id", (req: Request, res: Response) => {
    const delayMs = Math.random() * 100;
    setTimeout(() => {
      res.status(200).json({ orderId: req.params.id, status: "shipped" });
    }, delayMs);
  });

  app.get("/checkout", (_req: Request, res: Response) => {
    // Sometimes errors — this is what makes the status_code label, and the
    // RED method's "Errors" signal, actually vary in this demo.
    const shouldFail = Math.random() < 0.3;
    const delayMs = Math.random() * 150;
    setTimeout(() => {
      if (shouldFail) {
        res.status(500).json({ error: "payment processor timeout" });
      } else {
        res.status(200).json({ status: "order placed" });
      }
    }, delayMs);
  });

  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  });

  return { app, registry };
}

// --- Minimal HTTP client helper using Node's built-in `http` module --------
function requestPath(port: number, path: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(`http://localhost:${port}${path}`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode ?? 0, body }));
      })
      .on("error", reject);
  });
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 4014;
  const { app } = buildApp();

  const server = await new Promise<http.Server>((resolve) => {
    const s = app.listen(PORT, () => resolve(s));
  });
  console.log(`Server listening on port ${PORT}\n`);

  console.log("Firing demo requests...");
  const requestPlan = [
    "/health",
    "/orders/123",
    "/orders/456",
    "/checkout",
    "/checkout",
    "/checkout",
    "/checkout",
    "/checkout",
    "/checkout",
  ];

  for (const path of requestPlan) {
    const { statusCode } = await requestPath(PORT, path);
    console.log(`  GET ${path} -> ${statusCode}`);
  }

  console.log("\nScraping /metrics...\n");
  const { statusCode: metricsStatus, body: metricsBody } = await requestPath(PORT, "/metrics");
  console.log(`/metrics returned HTTP ${metricsStatus}\n`);

  // Print just the lines relevant to the metrics we defined, skipping the
  // (verbose) default Node.js process metrics for readability.
  const relevantLines = metricsBody
    .split("\n")
    .filter((line) => line.startsWith("http_requests_total") || line.startsWith("http_request_duration_seconds"));
  console.log(relevantLines.join("\n"));

  server.close();
  console.log("\nServer closed.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
