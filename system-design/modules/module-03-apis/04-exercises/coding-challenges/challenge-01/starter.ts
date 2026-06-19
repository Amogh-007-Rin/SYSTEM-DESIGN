/**
 * REST Blog API
 * Module: 03 — API Design
 * Concept: A fully RESTful resource model (posts + nested comments) with
 *   cursor-based pagination and correct status codes throughout.
 * Run: npx ts-node starter.ts
 * Dependencies: express, @types/express
 */

import express, { Request, Response } from "express";

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: number;
}

interface Comment {
  id: string;
  postId: string;
  text: string;
  createdAt: number;
}

const posts = new Map<string, Post>();
const comments = new Map<string, Comment>(); // all comments, filter by postId when listing
let nextId = 1;
function generateId(): string {
  return String(nextId++);
}

/**
 * TODO: Implement cursor-based pagination over an array already sorted by id.
 * - `cursor` is the last-seen numeric id (as a string), or undefined for the first page.
 * - Return up to `limit` items with numeric id > cursor, plus a `nextCursor`
 *   (the last returned item's id, or null if this was the last page).
 */
function paginate<T extends { id: string }>(
  items: T[],
  cursor: string | undefined,
  limit: number
): { items: T[]; nextCursor: string | null } {
  // TODO: implement
  throw new Error("Not implemented");
}

function createApp() {
  const app = express();
  app.use(express.json());

  // TODO: POST /posts -> 201 + Location header, body { title, body }, 400 if missing fields
  app.post("/posts", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  // TODO: GET /posts?after=&limit= -> 200 { items, nextCursor }
  app.get("/posts", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  // TODO: GET /posts/:id -> 200 or 404
  app.get("/posts/:id", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  // TODO: PATCH /posts/:id -> 200 or 404
  app.patch("/posts/:id", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  // TODO: DELETE /posts/:id -> 204 or 404; also delete this post's comments
  app.delete("/posts/:id", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  // TODO: POST /posts/:postId/comments -> 201 or 404 if post missing
  app.post("/posts/:postId/comments", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  // TODO: GET /posts/:postId/comments?after=&limit= -> 200 { items, nextCursor } or 404
  app.get("/posts/:postId/comments", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  return app;
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 4001;
  const server = createApp().listen(PORT);
  const base = `http://localhost:${PORT}`;

  const create = await fetch(`${base}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Hello", body: "World" }),
  });
  const post = (await create.json()) as Post;
  console.log(`POST /posts -> ${create.status}`, post);

  const comment = await fetch(`${base}/posts/${post.id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Nice post!" }),
  });
  console.log(`POST /posts/${post.id}/comments -> ${comment.status}`, await comment.json());

  const list = await fetch(`${base}/posts?limit=10`);
  console.log(`GET /posts -> ${list.status}`, await list.json());

  const del = await fetch(`${base}/posts/${post.id}`, { method: "DELETE" });
  console.log(`DELETE /posts/${post.id} -> ${del.status}`);

  const missing = await fetch(`${base}/posts/${post.id}`);
  console.log(`GET /posts/${post.id} (after delete) -> ${missing.status}`);

  server.close();
}

main();
