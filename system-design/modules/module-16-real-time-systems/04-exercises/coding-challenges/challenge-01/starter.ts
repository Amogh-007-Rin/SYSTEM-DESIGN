/**
 * Real-Time Chat Server with Rooms
 * Module: 16 — Real-Time Systems
 * Concept: WebSockets maintain persistent bidirectional connections.
 *   This server supports multiple named rooms with join/leave/message events.
 * Run: npx ts-node starter.ts
 *   Connect: ws://localhost:8080?room=general&user=alice
 * Dependencies: npm install ws @types/ws
 */

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

/**
 * TODO: Implement ChatServer.
 *
 * handleConnection(ws, userId, room): void
 *   1. Add to clients map and rooms map
 *   2. Broadcast "join" to everyone else in the room
 *   3. Send "user_list" to the new client
 *   4. Attach ws.on("message") → handleMessage
 *   5. Attach ws.on("close") → handleDisconnect
 *
 * handleMessage(ws, rawData): void
 *   Parse JSON, validate, broadcast to room (include sender).
 *
 * handleDisconnect(ws): void
 *   Remove from clients + rooms, broadcast "leave" to room.
 *
 * broadcast(room, message, exclude?): void
 *   Send to all OPEN connections in room, skip `exclude` if provided.
 *
 * getRoomUsers(room): string[]
 *   Return userIds of all clients in the room.
 */
class ChatServer {
  private clients: Map<WebSocket, Client> = new Map();
  private rooms: Map<string, Set<WebSocket>> = new Map();

  handleConnection(ws: WebSocket, userId: string, room: string): void {
    // TODO: implement
  }

  private handleMessage(ws: WebSocket, rawData: string): void {
    // TODO: implement
  }

  private handleDisconnect(ws: WebSocket): void {
    // TODO: implement
  }

  private broadcast(room: string, message: ChatMessage, exclude?: WebSocket): void {
    // TODO: implement
  }

  private getRoomUsers(room: string): string[] {
    // TODO: implement
    return [];
  }
}

// === SERVER SETUP ===
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const chatServer = new ChatServer();

wss.on("connection", (ws, req) => {
  const parsed = url.parse(req.url ?? "", true);
  const userId = (parsed.query.user as string) || `user-${Date.now()}`;
  const room = (parsed.query.room as string) || "general";
  console.log(`[CONNECT] ${userId} → room: ${room}`);
  chatServer.handleConnection(ws, userId, room);
});

server.listen(8080, () => {
  console.log("Chat server: ws://localhost:8080?room=general&user=alice");
});
