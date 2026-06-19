# Coding Challenge 02: HTTP Long Polling

## Problem Statement

Implement a long-polling HTTP endpoint using Node's built-in `http` module: a client requests `/poll`, and the server holds the connection open without responding until either (a) new data becomes available, or (b) a timeout elapses — at which point it responds (possibly with "no new data") and the client immediately re-polls.

## Requirements

1. `createLongPollingServer(port, timeoutMs)` — starts an HTTP server. `GET /poll` should hang until `publish(data)` is called (responds immediately with that data) or `timeoutMs` elapses (responds with `{ data: null }`).
2. `publish(data)` — a function the "rest of the app" would call when new data exists; it should resolve any currently-waiting `/poll` requests immediately.
3. A client function that polls in a loop, logging each response and how long the request took (to show the difference between an instant response when data was published vs. a full-timeout response when it wasn't).

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expected output: a sequence of poll log lines — most taking close to the timeout (no new data), and exactly one returning almost instantly (right after the example calls `publish(...)`), demonstrating why long polling has lower latency than fixed-interval short polling without the constant request overhead of an open WebSocket.
