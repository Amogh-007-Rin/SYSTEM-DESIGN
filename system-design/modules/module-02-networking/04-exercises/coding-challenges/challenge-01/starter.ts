/**
 * TCP Server & Client
 * Module: 02 — Networking Fundamentals
 * Concept: TCP requires a connection handshake before any data flows, and every
 *   message is a separate round trip unless pipelined. This exercise makes both
 *   costs visible in logs using Node's built-in `net` module.
 * Run: npx ts-node starter.ts
 * Dependencies: none (Node.js built-in `net` module)
 */

import * as net from "net";

function log(label: string, startedAt: number): void {
  console.log(`[+${(Date.now() - startedAt).toString().padStart(4)}ms] ${label}`);
}

/**
 * TODO: Implement createEchoServer.
 * - Create a net.Server with net.createServer.
 * - On "connection", log it, then on "data" from that socket, write back
 *   `echo: <data>` and log it.
 * - On socket "close", log it.
 * - listen(port), and resolve the returned promise once listening.
 */
function createEchoServer(port: number, startedAt: number): Promise<net.Server> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO: Implement connectClient.
 * - net.connect({ port }), log on "connect".
 * - Send messages[0]. On each "data" event (the echo reply), log it, then send
 *   the next message, until all messages are sent.
 * - After the last echo is received, call socket.end().
 * - Resolve the returned promise once the socket emits "close".
 */
function connectClient(port: number, messages: string[], startedAt: number): Promise<void> {
  // TODO: implement
  throw new Error("Not implemented");
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 9090;
  const startedAt = Date.now();

  const server = await createEchoServer(PORT, startedAt);
  await connectClient(PORT, ["hello", "system design", "goodbye"], startedAt);

  server.close(() => log("Server closed — exiting", startedAt));
}

main();
