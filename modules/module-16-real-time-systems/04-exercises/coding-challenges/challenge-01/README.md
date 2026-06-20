# Coding Challenge 01: Real-Time Chat Server with Rooms

## Problem Statement

WebSockets maintain persistent bidirectional connections. Implement `ChatServer`, a server that supports multiple named chat rooms with join/leave/message events, using Node's `ws` library.

**Connect:** `ws://localhost:8080?room=general&user=alice`

## Requirements

Implement `ChatServer`:

- **`handleConnection(ws, userId, room)`**:
  1. Add the client to the `clients` map and the `rooms` map.
  2. Broadcast a `"join"` event to everyone else already in the room.
  3. Send a `"user_list"` event to the newly connected client.
  4. Attach `ws.on("message")` → `handleMessage`.
  5. Attach `ws.on("close")` → `handleDisconnect`.

- **`handleMessage(ws, rawData)`**: Parse the incoming JSON, validate it, and broadcast a `"message"` event to everyone in the room — including the sender (so the sender's own UI can confirm the message was received and rendered the same way for everyone).

- **`handleDisconnect(ws)`**: Remove the client from both the `clients` map and its room's connection set, then broadcast a `"leave"` event to the rest of the room.

- **`broadcast(room, message, exclude?)`**: Send `message` to every connection in `room` whose `readyState` is `OPEN`, skipping the `exclude` connection if one is provided (used so a `"join"` broadcast, for example, doesn't get echoed back to the client that just joined before it's received its own `"user_list"`).

- **`getRoomUsers(room)`**: Return the `userId` of every client currently in `room`.

## Why This Matters

This is a hands-on version of everything in [`01-concepts/README.md`](../../../01-concepts/README.md)'s WebSocket section and [`02-deep-dive/README.md`](../../../02-deep-dive/README.md)'s chat system section, condensed to a single process: the `clients` map and `rooms` map here are exactly the in-memory state a real WebSocket server instance holds locally (the state that a pub/sub backbone exists to bridge *across* server instances at scale — this exercise builds the single-instance version that pattern sits on top of).

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node solution.ts
```

The solution file runs an in-process demo: it starts the chat server, connects three simulated `ws` clients (two join `general`, one joins a separate `random` room), sends messages, observes the join/leave/broadcast events each client receives, then disconnects every client and closes the server so the process exits on its own.

> 💡 **Note:** If you want to connect manually instead of via the demo, run `solution.ts` and use any WebSocket client (e.g., browser dev tools console: `new WebSocket("ws://localhost:8080?room=general&user=alice")`) — but note the solution's own `main()` already calls `server.close()` after its demo finishes, so for manual testing you'd remove or comment out that shutdown call first.
