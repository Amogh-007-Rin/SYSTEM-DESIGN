/**
 * HTTP Long Polling
 * Module: 02 — Networking Fundamentals
 * Concept: Long polling holds a request open until there's new data (or a
 *   timeout), trading one held-open connection per waiting client for much
 *   lower latency than fixed-interval short polling.
 * Run: npx ts-node starter.ts
 * Dependencies: none (Node.js built-in `http` module)
 */

import * as http from "http";

interface PendingRequest {
  res: http.ServerResponse;
  timer: NodeJS.Timeout;
}

/**
 * TODO: Implement createLongPollingServer.
 *
 * - Keep an array of PendingRequest for currently-waiting clients.
 * - On GET /poll: push { res, timer } onto the array, where `timer` is a
 *   setTimeout(timeoutMs) that, if it fires, removes this entry and responds
 *   with JSON { data: null }.
 * - Return { server, publish } where publish(data) immediately responds to
 *   EVERY currently-waiting request with JSON { data }, clears their timers,
 *   and empties the pending array.
 */
function createLongPollingServer(
  port: number,
  timeoutMs: number
): { server: http.Server; publish: (data: string) => void } {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO: Implement pollOnce — makes a single GET /poll request, measuring
 * elapsed time, and returns the parsed { data: string | null } response.
 */
function pollOnce(port: number): Promise<{ data: string | null; elapsedMs: number }> {
  // TODO: implement
  throw new Error("Not implemented");
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 9091;
  const TIMEOUT_MS = 1000;
  const { server, publish } = createLongPollingServer(PORT, TIMEOUT_MS);

  // Simulate "new data" arriving 2.5 seconds in — roughly mid-way through the
  // 3rd poll cycle, so we should see one poll resolve almost instantly.
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
