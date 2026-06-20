// SOLUTION FILE — try starter.ts first!
/**
 * HTTP Long Polling
 * Module: 02 — Networking Fundamentals
 * Concept: Long polling holds a request open until there's new data (or a
 *   timeout), trading one held-open connection per waiting client for much
 *   lower latency than fixed-interval short polling.
 * Run: npx ts-node solution.ts
 * Dependencies: none (Node.js built-in `http` module)
 */

import * as http from "http";

interface PendingRequest {
  res: http.ServerResponse;
  timer: NodeJS.Timeout;
}

function createLongPollingServer(
  port: number,
  timeoutMs: number
): { server: http.Server; publish: (data: string) => void } {
  let pending: PendingRequest[] = [];

  const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/poll") {
      // The timer is what makes this "long polling" rather than a request that
      // hangs forever — a well-behaved long-poll endpoint always bounds how
      // long a connection stays open, even with no new data.
      const timer = setTimeout(() => {
        pending = pending.filter((p) => p.res !== res);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ data: null }));
      }, timeoutMs);

      pending.push({ res, timer });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  // Resolves every currently-waiting client immediately — this is the entire
  // latency advantage over short polling: clients don't wait for their next
  // scheduled tick, they wait for the data itself.
  function publish(data: string): void {
    const toNotify = pending;
    pending = [];
    toNotify.forEach(({ res, timer }) => {
      clearTimeout(timer);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data }));
    });
  }

  server.listen(port);
  return { server, publish };
}

function pollOnce(port: number): Promise<{ data: string | null; elapsedMs: number }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    http
      .get(`http://localhost:${port}/poll`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const elapsedMs = Date.now() - startedAt;
          resolve({ data: JSON.parse(body).data, elapsedMs });
        });
      })
      .on("error", reject);
  });
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 9091;
  const TIMEOUT_MS = 1000;
  const { server, publish } = createLongPollingServer(PORT, TIMEOUT_MS);

  setTimeout(() => publish("new comment posted!"), 2500);

  for (let i = 0; i < 4; i++) {
    const result = await pollOnce(PORT);
    console.log(
      `Poll ${i + 1}: data=${JSON.stringify(result.data)} (took ${result.elapsedMs}ms)`
    );
  }

  server.close();
}

main();
