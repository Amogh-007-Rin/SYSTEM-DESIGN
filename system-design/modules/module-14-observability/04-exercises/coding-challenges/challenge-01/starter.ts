/**
 * Prometheus Metrics for an Express App — STARTER
 * Module: 14 — Observability
 * Concept: Instrument an Express app with a request-rate Counter and a
 *   latency Histogram using prom-client, recorded via middleware so no
 *   individual route handler needs to know metrics exist, then expose
 *   them on /metrics for Prometheus to scrape.
 * Run: npx ts-node starter.ts
 * Dependencies: express, prom-client (already in this repo's package.json)
 */

import express, { Request, Response, NextFunction } from "express";
import client from "prom-client";

const app = express();

// TODO: Create a Registry (or use client.register, the default global registry)
// and register default Node.js process metrics via client.collectDefaultMetrics().

// TODO: Create a Counter named "http_requests_total", labeled by
// ["method", "route", "status_code"], help text describing total HTTP
// requests served.

// TODO: Create a Histogram named "http_request_duration_seconds", labeled
// by ["method", "route"], help text describing request duration in seconds.
// Pick reasonable bucket boundaries for a typical web service (e.g.
// [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]).

// TODO: Add middleware (app.use) that:
//   1. Records the start time on request entry.
//   2. On response finish (res.on("finish", ...)), computes the elapsed
//      duration in seconds, then increments the Counter and observes the
//      Histogram, both labeled with method, route, and (for the counter)
//      status code.
//   Use req.route?.path ?? req.path as the route label so it reflects the
//   route *pattern* (e.g. "/orders/:id") rather than one literal path per ID.
function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  next(); // TODO: replace with real instrumentation
}
app.use(metricsMiddleware);

// --- Demo routes ---------------------------------------------------------

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/orders/:id", (req: Request, res: Response) => {
  // Simulate variable latency.
  const delayMs = Math.random() * 100;
  setTimeout(() => {
    res.status(200).json({ orderId: req.params.id, status: "shipped" });
  }, delayMs);
});

app.get("/checkout", (req: Request, res: Response) => {
  // Simulate an endpoint that sometimes fails.
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

// TODO: Add a GET /metrics endpoint that sets Content-Type to
// client.register.contentType and sends client.register.metrics()
// (an async call — await it before sending).
app.get("/metrics", async (_req: Request, res: Response) => {
  res.status(501).send("Not implemented");
});

// === USAGE EXAMPLE ===
// See solution.ts for a complete main() that starts this server, fires
// requests at it, prints the resulting /metrics scrape, and shuts down
// cleanly. This starter file intentionally does not start a server on its
// own so that type-checking it doesn't leave a process hanging.

export { app };
