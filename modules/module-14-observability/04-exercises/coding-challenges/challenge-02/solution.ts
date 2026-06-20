// SOLUTION FILE — try starter.ts first!
/**
 * Structured Logging with Correlation IDs
 * Module: 14 — Observability
 * Concept: Assign every request a correlation ID (propagated from the
 *   caller via header, or generated fresh if absent), attach it to every
 *   structured log line for that request, and echo it back in the
 *   response — the mechanism that makes "find every log line for this
 *   one request" possible across a multi-service system, instead of
 *   manually cross-referencing timestamps across independent log streams.
 * Run: npx ts-node solution.ts
 * Dependencies: express (already in this repo's package.json)
 */

import * as crypto from "crypto";
import * as http from "http";
import express, { Request, Response, NextFunction } from "express";

const CORRELATION_ID_HEADER = "x-correlation-id";

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

// Captured log lines, so the usage example below can print exactly what was
// logged per request without scraping stdout. In a real service this
// `sink` would instead be "write to stdout, which a log shipper forwards to
// centralized storage" — capturing here is purely for the demo's clarity.
const capturedLogLines: string[] = [];

/** Emits exactly one JSON object per call — never a free-text sentence — so
 *  log lines are queryable data instead of something you can only grep. */
function log(level: LogLevel, message: string, fields: LogFields = {}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  const line = JSON.stringify(entry);
  capturedLogLines.push(line);
  console.log(line);
}

/** Reads the correlation ID from the incoming request, generating one if the
 *  caller didn't supply it, then echoes it back on the response so a caller
 *  (or the next service in a chain) can keep propagating the same ID. */
function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header(CORRELATION_ID_HEADER);
  req.correlationId = incomingId ?? crypto.randomUUID();
  res.setHeader(CORRELATION_ID_HEADER, req.correlationId);
  next();
}

function buildApp(): express.Express {
  const app = express();
  app.use(correlationIdMiddleware);

  // --- Demo routes ---------------------------------------------------------

  app.get("/orders/:id", (req: Request, res: Response) => {
    log("info", "fetching order", { correlationId: req.correlationId, orderId: req.params.id });
    res.status(200).json({ orderId: req.params.id, status: "shipped" });
  });

  app.get("/checkout", (req: Request, res: Response) => {
    log("info", "checkout started", { correlationId: req.correlationId });
    // Simulate a downstream call that would, in a real multi-service system,
    // forward the same correlation ID via this exact header to the next hop.
    log("info", "checkout completed", { correlationId: req.correlationId, status: "order placed" });
    res.status(200).json({ status: "order placed" });
  });

  return app;
}

// --- Minimal HTTP client helper using Node's built-in `http` module --------
function requestPath(
  port: number,
  path: string,
  headers: Record<string, string> = {}
): Promise<{ statusCode: number; body: string; correlationId: string | undefined }> {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "localhost", port, path, headers }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({
            statusCode: res.statusCode ?? 0,
            body,
            correlationId: res.headers[CORRELATION_ID_HEADER] as string | undefined,
          })
        );
      })
      .on("error", reject);
  });
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 4015;
  const app = buildApp();

  const server = await new Promise<http.Server>((resolve) => {
    const s = app.listen(PORT, () => resolve(s));
  });
  console.log(`Server listening on port ${PORT}\n`);

  // --- Request 1: no correlation ID supplied — server must generate one ---
  console.log("=== Request 1: GET /orders/789 (no x-correlation-id header) ===");
  capturedLogLines.length = 0;
  const result1 = await requestPath(PORT, "/orders/789");
  console.log(`Response status: ${result1.statusCode}`);
  console.log(`Response x-correlation-id header: ${result1.correlationId}`);
  console.log("Log lines captured for this request:");
  capturedLogLines.forEach((line) => console.log(`  ${line}`));
  const generatedIdAppearsInLogs = capturedLogLines.every((line) => line.includes(result1.correlationId ?? "__missing__"));
  console.log(`All log lines carry the generated correlation ID: ${generatedIdAppearsInLogs}`);

  // --- Request 2: caller supplies its own correlation ID — must be echoed unchanged ---
  const callerSuppliedId = "caller-supplied-id-abc123";
  console.log(`\n=== Request 2: GET /checkout (x-correlation-id: ${callerSuppliedId}) ===`);
  capturedLogLines.length = 0;
  const result2 = await requestPath(PORT, "/checkout", { [CORRELATION_ID_HEADER]: callerSuppliedId });
  console.log(`Response status: ${result2.statusCode}`);
  console.log(`Response x-correlation-id header: ${result2.correlationId}`);
  console.log("Log lines captured for this request:");
  capturedLogLines.forEach((line) => console.log(`  ${line}`));
  const propagatedCorrectly = result2.correlationId === callerSuppliedId;
  console.log(`Correlation ID propagated unchanged from caller: ${propagatedCorrectly}`);

  const distinctIds = result1.correlationId !== result2.correlationId;
  console.log(`\nThe two requests received distinct correlation IDs: ${distinctIds}`);

  server.close();
  console.log("Server closed.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
