/**
 * Minimal REST API Demo
 * Module: 03 — API Design
 * Concept: Demonstrates resource-based routing and correct status code usage:
 *   201 on create, 200 on read/update, 204 on delete, 404 when missing,
 *   409 on duplicate create. The demo then exercises every route with fetch
 *   so you can see the contract in action without a separate HTTP client.
 * Run: npx ts-node rest-api-demo.ts
 * Dependencies: express, @types/express (npm install already configured at repo root)
 */

import express, { Request, Response } from "express";

interface Post {
  id: string;
  title: string;
  body: string;
}

const posts = new Map<string, Post>();

function createApp() {
  const app = express();
  app.use(express.json());

  // POST /posts — create. 201 + Location header on success, 409 if the
  // caller-supplied id already exists (treating id as client-assignable here
  // for simplicity; see Module 03's cursor-pagination example for a
  // server-generated-id variant).
  app.post("/posts", (req: Request, res: Response) => {
    const { id, title, body } = req.body as Partial<Post>;
    if (!id || !title || !body) {
      return res.status(400).json({ error: "id, title, and body are required" });
    }
    if (posts.has(id)) {
      return res.status(409).json({ error: `post ${id} already exists` });
    }
    const post: Post = { id, title, body };
    posts.set(id, post);
    res.status(201).location(`/posts/${id}`).json(post);
  });

  // GET /posts/:id — read. 200 with body, or 404 if missing.
  app.get("/posts/:id", (req: Request, res: Response) => {
    const post = posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "not found" });
    res.status(200).json(post);
  });

  // GET /posts — list.
  app.get("/posts", (_req: Request, res: Response) => {
    res.status(200).json(Array.from(posts.values()));
  });

  // PATCH /posts/:id — partial update. 200 with the updated resource, 404 if missing.
  app.patch("/posts/:id", (req: Request, res: Response) => {
    const post = posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "not found" });
    const updated = { ...post, ...req.body, id: post.id };
    posts.set(post.id, updated);
    res.status(200).json(updated);
  });

  // DELETE /posts/:id — 204 (no body) on success, 404 if missing.
  app.delete("/posts/:id", (req: Request, res: Response) => {
    if (!posts.has(req.params.id)) return res.status(404).json({ error: "not found" });
    posts.delete(req.params.id);
    res.status(204).send();
  });

  return app;
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 4000;
  const server = createApp().listen(PORT);
  const base = `http://localhost:${PORT}`;

  const create = await fetch(`${base}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "p1", title: "Hello", body: "First post" }),
  });
  console.log(`POST /posts -> ${create.status}`, await create.json());

  const duplicate = await fetch(`${base}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "p1", title: "Hello again", body: "..." }),
  });
  console.log(`POST /posts (duplicate) -> ${duplicate.status}`, await duplicate.json());

  const read = await fetch(`${base}/posts/p1`);
  console.log(`GET /posts/p1 -> ${read.status}`, await read.json());

  const patch = await fetch(`${base}/posts/p1`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Updated title" }),
  });
  console.log(`PATCH /posts/p1 -> ${patch.status}`, await patch.json());

  const del = await fetch(`${base}/posts/p1`, { method: "DELETE" });
  console.log(`DELETE /posts/p1 -> ${del.status} (body is empty: ${(await del.text()) === ""})`);

  const missing = await fetch(`${base}/posts/p1`);
  console.log(`GET /posts/p1 (after delete) -> ${missing.status}`, await missing.json());

  server.close();
}

main();
