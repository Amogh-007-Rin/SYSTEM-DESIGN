// SOLUTION FILE — try starter.ts first!
/**
 * TCP Server & Client
 * Module: 02 — Networking Fundamentals
 * Concept: TCP requires a connection handshake before any data flows, and every
 *   message is a separate round trip unless pipelined. This exercise makes both
 *   costs visible in logs using Node's built-in `net` module.
 * Run: npx ts-node solution.ts
 * Dependencies: none (Node.js built-in `net` module)
 */

import * as net from "net";

function log(label: string, startedAt: number): void {
  console.log(`[+${(Date.now() - startedAt).toString().padStart(4)}ms] ${label}`);
}

function createEchoServer(port: number, startedAt: number): Promise<net.Server> {
  return new Promise((resolve) => {
    const server = net.createServer((socket) => {
      log(`Server: connection received from ${socket.remoteAddress}:${socket.remotePort}`, startedAt);

      socket.on("data", (data) => {
        const message = data.toString();
        log(`Server: received "${message}"`, startedAt);
        socket.write(`echo: ${message}`);
      });

      socket.on("close", () => {
        log("Server: client socket closed", startedAt);
      });
    });

    server.listen(port, () => {
      log(`Server: listening on port ${port}`, startedAt);
      resolve(server);
    });
  });
}

function connectClient(port: number, messages: string[], startedAt: number): Promise<void> {
  return new Promise((resolve) => {
    const socket = net.connect({ port }, () => {
      // This fires only after the full TCP 3-way handshake completes —
      // everything before this log line was handshake cost.
      log("Client: connected (handshake complete)", startedAt);
      socket.write(messages[0]);
    });

    let messageIndex = 0;

    socket.on("data", (data) => {
      log(`Client: received "${data.toString()}"`, startedAt);
      messageIndex++;
      if (messageIndex < messages.length) {
        socket.write(messages[messageIndex]);
      } else {
        socket.end();
      }
    });

    socket.on("close", () => {
      log("Client: connection closed", startedAt);
      resolve();
    });
  });
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
