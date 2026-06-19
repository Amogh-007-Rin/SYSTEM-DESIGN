# Coding Challenge 01: TCP Server & Client

## Problem Statement

Using Node's built-in `net` module, implement a TCP echo server and a client that connects to it, sends a few messages, and logs every connection lifecycle event (`connect`, `data`, `close`) with a timestamp and elapsed time since the previous event. The goal is to *see* the cost of connection setup and message round trips that [the deep dive](../../../02-deep-dive/README.md) describes in prose.

## Requirements

1. `createEchoServer(port)` — starts a TCP server that writes back whatever it receives, prefixed with `echo: `.
2. `connectClient(port, messages)` — connects to the server, sends each message in `messages` sequentially (waiting for the echoed reply before sending the next), logging timestamps at each step, then closes the connection.
3. Log the time elapsed between "client initiates connection" and "server receives connection" to make handshake cost visible.
4. The process must exit cleanly after the exchange completes (close the server once the client disconnects).

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expected output: a log line per lifecycle event, ending with the server and client both reporting a clean close, and the process exiting on its own (no hang).
