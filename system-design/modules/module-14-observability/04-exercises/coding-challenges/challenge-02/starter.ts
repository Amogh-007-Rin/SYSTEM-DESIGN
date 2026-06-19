/**
 * Structured Logging with Correlation IDs — STARTER
 * Module: 14 — Observability
 * Concept: Assign every request a correlation ID (propagated from the
 *   caller via header, or generated fresh if absent), attach it to every
 *   structured log line for that request, and echo it back in the
 *   response — the mechanism that makes "find every log line for this
 *   one request" possible across a multi-service system.
 * Run: npx ts-node starter.ts
 * Dependencies: express (already in this repo's package.json)
 */

import * as crypto from "crypto";
import express, { Request, Response, NextFunction } from "express";

const CORRELATION_ID_HEADER = "x-correlation-id";

// Augment Express's Request type so handlers can read req.correlationId
// with full type safety instead of an `any` cast at every call site.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

// TODO: Implement a structured logger function `log(level, message, fields)`
// that prints exactly one JSON object per call (via console.log(JSON.stringify(...))),
// including at minimum: timestamp (ISO string), level, message, and
// whatever extra fields are passed in (expected to include correlationId).
function log(level: LogLevel, message: string, fields: LogFields = {}): void {
  // TODO: implement structured JSON logging
}

// TODO: Implement middleware that:
//   1. Reads the `x-correlation-id` request header.
//   2. If absent, generates a new ID (crypto.randomUUID()).
//   3. Attaches it to req.correlationId.
//   4. Sets it on the response header so callers can see/propagate it too.
function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  next(); // TODO: replace with real correlation ID assignment + propagation
}

const app = express();
app.use(correlationIdMiddleware);

// --- Demo routes ---------------------------------------------------------

app.get("/orders/:id", (req: Request, res: Response) => {
  // TODO: log an "info" line here including req.correlationId, e.g.
  // "fetching order", with fields like { orderId: req.params.id }.
  res.status(200).json({ orderId: req.params.id, status: "shipped" });
});

app.get("/checkout", (req: Request, res: Response) => {
  // TODO: log an "info" line here including req.correlationId before
  // responding, e.g. "checkout completed".
  res.status(200).json({ status: "order placed" });
});

// === USAGE EXAMPLE ===
// See solution.ts for a complete main() that starts this server, fires one
// request with no correlation ID (server generates one) and one request
// with a pre-set x-correlation-id header (server propagates it unchanged),
// and prints the resulting structured log lines for both. This starter file
// intentionally does not start a server on its own so that type-checking it
// doesn't leave a process hanging.

export { app, log, CORRELATION_ID_HEADER };
