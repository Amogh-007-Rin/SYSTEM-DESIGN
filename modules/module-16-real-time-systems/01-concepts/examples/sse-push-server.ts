/**
 * Server-Sent Events (SSE): One-Directional Server Push
 * Module: 16 — Real-Time Systems
 * Concept: SSE rides on a plain HTTP response that the server simply never
 *   ends — it keeps writing `data: ...\n\n` chunks over time, and the client
 *   reads them as they arrive instead of polling. This demonstrates the
 *   full lifecycle: a client connects, receives several pushed events as
 *   they're produced (not buffered into one response), then the server
 *   ends the stream and both sides shut down cleanly.
 * Run: npx ts-node sse-push-server.ts
 * Dependencies: none (Node.js built-in `http` module)
 */

import * as http from "http";

interface PriceTick {
  symbol: string;
  price: number;
  sequence: number;
}

/**
 * Writes one SSE-framed message to the response stream. The wire format is
 * intentionally simple text: each event is a `data:` line followed by a
 * blank line. Real SSE also supports `event:` (custom event names) and
 * `id:` (for resuming after a dropped connection), omitted here for clarity.
 */
function sendEvent(res: http.ServerResponse, data: unknown): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function startSseServer(port: number, ticksToSend: number, intervalMs: number): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url !== "/ticker") {
        res.writeHead(404).end();
        return;
      }

      // These three headers are what make this an SSE stream rather than a
      // normal buffered response: no caching, connection stays open, and the
      // browser's EventSource API specifically requires this content type.
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      console.log("[SERVER] client connected to /ticker");

      let sequence = 0;
      const symbol = "ACME";
      let price = 100;

      const timer = setInterval(() => {
        sequence++;
        // Simulate a live stock price random-walking, the canonical SSE use case.
        price = Math.round((price + (Math.random() - 0.5) * 4) * 100) / 100;
        const tick: PriceTick = { symbol, price, sequence };
        sendEvent(res, tick);
        console.log(`[SERVER] pushed tick #${sequence}: ${symbol} @ $${price}`);

        if (sequence >= ticksToSend) {
          clearInterval(timer);
          res.end();
          console.log("[SERVER] stream ended (sent all ticks)");
        }
      }, intervalMs);

      req.on("close", () => clearInterval(timer));
    });

    server.listen(port, () => resolve(server));
  });
}

/**
 * A minimal SSE client built on Node's `http` module. The browser's
 * `EventSource` does this same parsing (split on blank lines, strip the
 * `data: ` prefix) plus automatic reconnection — reproduced manually here
 * since `EventSource` isn't a Node built-in.
 */
function connectSseClient(port: number, path: string): Promise<PriceTick[]> {
  return new Promise((resolve, reject) => {
    const received: PriceTick[] = [];
    let buffer = "";

    const req = http.get({ host: "localhost", port, path }, (res) => {
      res.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        const events = buffer.split("\n\n");
        // The last split segment may be an incomplete event still streaming in.
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          const line = rawEvent.trim();
          if (!line.startsWith("data: ")) continue;
          const tick = JSON.parse(line.slice("data: ".length)) as PriceTick;
          received.push(tick);
          console.log(`[CLIENT] received tick #${tick.sequence}: ${tick.symbol} @ $${tick.price}`);
        }
      });

      res.on("end", () => {
        console.log("[CLIENT] stream closed by server");
        resolve(received);
      });
    });

    req.on("error", reject);
  });
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 4516;
  const TICKS_TO_SEND = 5;
  const INTERVAL_MS = 100;

  console.log("=== Server-Sent Events: live price ticker ===\n");

  const server = await startSseServer(PORT, TICKS_TO_SEND, INTERVAL_MS);
  console.log(`SSE server listening on port ${PORT}\n`);

  const ticks = await connectSseClient(PORT, "/ticker");

  console.log(`\nClient received ${ticks.length} pushed events without ever polling.`);
  console.log("Sequence numbers received in order:", ticks.map((t) => t.sequence));

  server.close(() => console.log("\nServer closed — exiting."));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
