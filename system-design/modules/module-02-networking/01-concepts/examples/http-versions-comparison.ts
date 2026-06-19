/**
 * HTTP Versions Comparison
 * Module: 02 — Networking Fundamentals
 * Concept: HTTP/1.1 needs multiple connections (or serialized requests) to fetch
 *   many resources, while HTTP/2 multiplexes them over one connection. This file
 *   simulates the request "waterfall" for both to make the difference concrete.
 * Run: npx ts-node http-versions-comparison.ts
 * Dependencies: none
 */

interface SimulatedRequest {
  name: string;
  durationMs: number;
}

const CONNECTION_SETUP_MS = 50; // TCP + TLS handshake cost, paid per new connection
const MAX_PARALLEL_CONNECTIONS_HTTP1 = 6; // a common browser-enforced limit per origin

// HTTP/1.1: each connection handles one request at a time (no real pipelining in
// practice). With N parallel connections, requests are distributed round-robin
// across them, and each new connection pays its own setup cost.
function simulateHttp1(requests: SimulatedRequest[]): number {
  const connectionFinishTimes = new Array(MAX_PARALLEL_CONNECTIONS_HTTP1).fill(0);

  requests.forEach((req, i) => {
    const connectionIndex = i % MAX_PARALLEL_CONNECTIONS_HTTP1;
    const isNewConnection = i < MAX_PARALLEL_CONNECTIONS_HTTP1;
    const setupCost = isNewConnection ? CONNECTION_SETUP_MS : 0;
    connectionFinishTimes[connectionIndex] += setupCost + req.durationMs;
  });

  return Math.max(...connectionFinishTimes);
}

// HTTP/2: a single connection (one setup cost, paid once) multiplexes all
// requests concurrently. Total time is dominated by the single slowest request,
// not the sum of all of them.
function simulateHttp2(requests: SimulatedRequest[]): number {
  const slowestRequest = Math.max(...requests.map((r) => r.durationMs));
  return CONNECTION_SETUP_MS + slowestRequest;
}

// === USAGE EXAMPLE ===
// A realistic modern page: one HTML doc plus ~18 small assets (icons, fonts,
// chunked JS, tracking pixels). The count matters here — with more resources
// than the 6-connection limit, HTTP/1.1 connections must serve multiple
// requests sequentially, which is exactly the scenario HTTP/2 multiplexing fixes.
const pageResources: SimulatedRequest[] = [
  { name: "index.html", durationMs: 40 },
  { name: "app.css", durationMs: 30 },
  { name: "app.js", durationMs: 60 },
  { name: "logo.png", durationMs: 25 },
  { name: "hero.jpg", durationMs: 80 },
  { name: "font.woff2", durationMs: 35 },
  { name: "analytics.js", durationMs: 20 },
  { name: "icon-sprite.svg", durationMs: 15 },
  { name: "icon-1.svg", durationMs: 12 },
  { name: "icon-2.svg", durationMs: 12 },
  { name: "icon-3.svg", durationMs: 10 },
  { name: "chunk-vendor.js", durationMs: 45 },
  { name: "chunk-routes.js", durationMs: 30 },
  { name: "tracking-pixel-1.gif", durationMs: 8 },
  { name: "tracking-pixel-2.gif", durationMs: 8 },
  { name: "social-widget.js", durationMs: 22 },
  { name: "avatar-thumb.jpg", durationMs: 18 },
  { name: "banner.png", durationMs: 28 },
];

const http1Total = simulateHttp1(pageResources);
const http2Total = simulateHttp2(pageResources);

console.log(`Loading ${pageResources.length} resources:`);
console.log(`  HTTP/1.1 (max ${MAX_PARALLEL_CONNECTIONS_HTTP1} connections): ${http1Total}ms`);
console.log(`  HTTP/2 (1 multiplexed connection):       ${http2Total}ms`);
console.log(`  Improvement: ${(http1Total / http2Total).toFixed(2)}x faster with HTTP/2`);

console.log("\nNote: real-world gains vary with packet loss, server processing time,");
console.log("and number of resources — this models connection/multiplexing overhead only.");
