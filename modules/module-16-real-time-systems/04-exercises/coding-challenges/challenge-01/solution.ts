// SOLUTION FILE — try starter.ts first!
/**
 * Real-Time Chat Server with Rooms
 * Module: 16 — Real-Time Systems
 * Concept: WebSockets maintain persistent bidirectional connections.
 *   This server supports multiple named rooms with join/leave/message events.
 *   The `clients` map and `rooms` map are exactly the in-memory state a real
 *   WebSocket server instance holds locally — the state a pub/sub backbone
 *   (see Module 16's deep dive) exists to bridge across multiple server
 *   instances once a single process is no longer enough.
 * Run: npx ts-node solution.ts
 *   Connect manually: ws://localhost:8080?room=general&user=alice
 * Dependencies: ws, @types/ws (already in this repo's package.json)
 */

// A default import (rather than the starter's `import * as WebSocket`) is
// used here because this file, unlike the starter, also needs to construct
// client-side WebSocket connections (`new WebSocket(url)`) for the demo —
// `ws`'s CommonJS `export =` shape needs the default-import form for ts-node
// to type-check the constructor call cleanly.
import WebSocket from "ws";
import * as http from "http";
import * as url from "url";

interface Client {
  ws: WebSocket;
  userId: string;
  room: string;
  connectedAt: number;
}

interface ChatMessage {
  type: "message" | "join" | "leave" | "error" | "user_list";
  room: string;
  userId?: string;
  content?: string;
  users?: string[];
  timestamp: number;
}

class ChatServer {
  private clients: Map<WebSocket, Client> = new Map();
  private rooms: Map<string, Set<WebSocket>> = new Map();

  handleConnection(ws: WebSocket, userId: string, room: string): void {
    // 1. Add to clients map and rooms map.
    const client: Client = { ws, userId, room, connectedAt: Date.now() };
    this.clients.set(ws, client);
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(ws);

    // 2. Broadcast "join" to everyone else in the room (exclude the new client —
    //    it doesn't need to be told about its own join).
    this.broadcast(
      room,
      { type: "join", room, userId, timestamp: Date.now() },
      ws
    );

    // 3. Send "user_list" to the new client so its UI can render who's already here.
    ws.send(
      JSON.stringify({
        type: "user_list",
        room,
        users: this.getRoomUsers(room),
        timestamp: Date.now(),
      } satisfies ChatMessage)
    );

    // 4. Attach message handler.
    ws.on("message", (rawData: WebSocket.RawData) => {
      this.handleMessage(ws, rawData.toString());
    });

    // 5. Attach disconnect handler.
    ws.on("close", () => {
      this.handleDisconnect(ws);
    });
  }

  private handleMessage(ws: WebSocket, rawData: string): void {
    const client = this.clients.get(ws);
    if (!client) return; // message from an unregistered/already-closed socket

    let parsed: { content?: unknown };
    try {
      parsed = JSON.parse(rawData);
    } catch {
      ws.send(
        JSON.stringify({
          type: "error",
          room: client.room,
          content: "Invalid JSON",
          timestamp: Date.now(),
        } satisfies ChatMessage)
      );
      return;
    }

    if (typeof parsed.content !== "string" || parsed.content.length === 0) {
      ws.send(
        JSON.stringify({
          type: "error",
          room: client.room,
          content: "Message must include non-empty string `content`",
          timestamp: Date.now(),
        } satisfies ChatMessage)
      );
      return;
    }

    // Broadcast to the whole room, including the sender (no `exclude`) — the
    // sender's own UI renders the confirmed message the same way everyone
    // else's does, rather than optimistically rendering a local-only copy.
    this.broadcast(client.room, {
      type: "message",
      room: client.room,
      userId: client.userId,
      content: parsed.content,
      timestamp: Date.now(),
    });
  }

  private handleDisconnect(ws: WebSocket): void {
    const client = this.clients.get(ws);
    if (!client) return;

    this.clients.delete(ws);
    this.rooms.get(client.room)?.delete(ws);
    if (this.rooms.get(client.room)?.size === 0) {
      this.rooms.delete(client.room);
    }

    this.broadcast(client.room, {
      type: "leave",
      room: client.room,
      userId: client.userId,
      timestamp: Date.now(),
    });
  }

  private broadcast(room: string, message: ChatMessage, exclude?: WebSocket): void {
    const connections = this.rooms.get(room);
    if (!connections) return;

    const serialized = JSON.stringify(message);
    for (const conn of connections) {
      if (conn === exclude) continue;
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(serialized);
      }
    }
  }

  private getRoomUsers(room: string): string[] {
    const connections = this.rooms.get(room);
    if (!connections) return [];
    const users: string[] = [];
    for (const conn of connections) {
      const client = this.clients.get(conn);
      if (client) users.push(client.userId);
    }
    return users;
  }
}

// === SERVER SETUP ===
function buildServer(port: number): Promise<{ server: http.Server; wss: WebSocket.Server }> {
  return new Promise((resolve) => {
    const server = http.createServer();
    const wss = new WebSocket.Server({ server });
    const chatServer = new ChatServer();

    wss.on("connection", (ws, req) => {
      const parsed = url.parse(req.url ?? "", true);
      const userId = (parsed.query.user as string) || `user-${Date.now()}`;
      const room = (parsed.query.room as string) || "general";
      console.log(`[CONNECT] ${userId} -> room: ${room}`);
      chatServer.handleConnection(ws, userId, room);
    });

    server.listen(port, () => resolve({ server, wss }));
  });
}

// --- Minimal demo client helper -------------------------------------------
// Wraps a `ws` client connection so the usage example can wait for specific
// events deterministically instead of racing against asynchronous delivery.
class DemoClient {
  public received: ChatMessage[] = [];
  private socket: WebSocket;

  constructor(port: number, userId: string, room: string) {
    this.socket = new WebSocket(`ws://localhost:${port}?room=${room}&user=${userId}`);
    this.socket.on("message", (raw: WebSocket.RawData) => {
      this.received.push(JSON.parse(raw.toString()));
    });
  }

  waitForOpen(): Promise<void> {
    return new Promise((resolve) => this.socket.on("open", () => resolve()));
  }

  send(content: string): void {
    this.socket.send(JSON.stringify({ content }));
  }

  /** Polls `received` until `predicate` matches or `timeoutMs` elapses. */
  async waitForMessage(predicate: (m: ChatMessage) => boolean, timeoutMs = 2000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.received.some(predicate)) return;
      await new Promise((r) => setTimeout(r, 10));
    }
    throw new Error(`Timed out waiting for expected message (got: ${JSON.stringify(this.received)})`);
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.on("close", () => resolve());
      this.socket.close();
    });
  }
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 8080;
  console.log("=== Real-Time Chat Server with Rooms ===\n");

  const { server, wss } = await buildServer(PORT);
  console.log(`Chat server listening on ws://localhost:${PORT}\n`);

  // Alice and Bob join "general"; Carol joins a separate room "random" and
  // should never see anything from "general".
  const alice = new DemoClient(PORT, "alice", "general");
  await alice.waitForOpen();
  console.log("[DEMO] alice connected to room: general");

  const bob = new DemoClient(PORT, "bob", "general");
  await bob.waitForOpen();
  console.log("[DEMO] bob connected to room: general");

  const carol = new DemoClient(PORT, "carol", "random");
  await carol.waitForOpen();
  console.log("[DEMO] carol connected to room: random");

  // Alice should observe Bob's "join" event (she was already in the room).
  await alice.waitForMessage((m) => m.type === "join" && m.userId === "bob");
  console.log("[DEMO] alice observed bob's join event ✔");

  // Bob sends a message; both alice and bob (sender included) should receive it.
  bob.send("hey alice, this is bob");
  await alice.waitForMessage((m) => m.type === "message" && m.userId === "bob");
  await bob.waitForMessage((m) => m.type === "message" && m.userId === "bob");
  console.log("[DEMO] bob's message broadcast to alice and echoed back to bob ✔");

  // Carol, in a different room, must NOT receive anything from "general".
  const carolSawGeneralTraffic = carol.received.some((m) => m.room === "general");
  console.log(`[DEMO] carol (room: random) received any "general" traffic: ${carolSawGeneralTraffic} (expected: false)`);

  // Bob disconnects; alice should observe his "leave" event.
  await bob.close();
  console.log("[DEMO] bob disconnected");
  await alice.waitForMessage((m) => m.type === "leave" && m.userId === "bob");
  console.log("[DEMO] alice observed bob's leave event ✔");

  // Clean up remaining clients and the server so the process exits on its own.
  await alice.close();
  await carol.close();
  await new Promise<void>((resolve) => wss.close(() => resolve()));
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log("\nAll demo clients disconnected and server closed — exiting.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
