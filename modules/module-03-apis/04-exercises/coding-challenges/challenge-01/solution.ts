// SOLUTION FILE — try starter.ts first!
/**
 * REST Blog API
 * Module: 03 — API Design
 * Concept: A fully RESTful resource model (posts + nested comments) with
 *   cursor-based pagination and correct status codes throughout.
 * Run: npx ts-node solution.ts
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
const comments = new Map<string, Comment>();
let nextId = 1;
function generateId(): string {
  return String(nextId++);
}

function paginate<T extends { id: string }>(
  items: T[],
  cursor: string | undefined,
  limit: number
): { items: T[]; nextCursor: string | null } {
  const sorted = [...items].sort((a, b) => Number(a.id) - Number(b.id));
  const startIndex = cursor
    ? sorted.findIndex((item) => Number(item.id) > Number(cursor))
    : 0;
  if (startIndex === -1) return { items: [], nextCursor: null };

  const page = sorted.slice(startIndex, startIndex + limit);
  const nextCursor =
    startIndex + limit < sorted.length ? page[page.length - 1]?.id ?? null : null;

  return { items: page, nextCursor };
}

function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/posts", (req: Request, res: Response) => {
    const { title, body } = req.body ?? {};
    if (!title || !body) {
      return res.status(400).json({ error: "title and body are required" });
    }
    const post: Post = { id: generateId(), title, body, createdAt: Date.now() };
    posts.set(post.id, post);
    res.status(201).location(`/posts/${post.id}`).json(post);
  });

  app.get("/posts", (req: Request, res: Response) => {
    const cursor = req.query.after as string | undefined;
    const limit = Number(req.query.limit) || 20;
    const result = paginate(Array.from(posts.values()), cursor, limit);
    res.status(200).json(result);
  });

  app.get("/posts/:id", (req: Request, res: Response) => {
    const post = posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "not found" });
    res.status(200).json(post);
  });

  app.patch("/posts/:id", (req: Request, res: Response) => {
    const post = posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "not found" });
    const updated = { ...post, ...req.body, id: post.id };
    posts.set(post.id, updated);
    res.status(200).json(updated);
  });

  app.delete("/posts/:id", (req: Request, res: Response) => {
    if (!posts.has(req.params.id)) return res.status(404).json({ error: "not found" });
    posts.delete(req.params.id);
    // Cascade delete: a post's comments have no meaning without their parent.
    for (const [commentId, comment] of comments) {
      if (comment.postId === req.params.id) comments.delete(commentId);
    }
    res.status(204).send();
  });

  app.post("/posts/:postId/comments", (req: Request, res: Response) => {
    if (!posts.has(req.params.postId)) {
      return res.status(404).json({ error: "post not found" });
    }
    const { text } = req.body ?? {};
    if (!text) return res.status(400).json({ error: "text is required" });
    const comment: Comment = {
      id: generateId(),
      postId: req.params.postId,
      text,
      createdAt: Date.now(),
    };
    comments.set(comment.id, comment);
    res.status(201).location(`/posts/${req.params.postId}/comments/${comment.id}`).json(comment);
  });

  app.get("/posts/:postId/comments", (req: Request, res: Response) => {
    if (!posts.has(req.params.postId)) {
      return res.status(404).json({ error: "post not found" });
    }
    const postComments = Array.from(comments.values()).filter(
      (c) => c.postId === req.params.postId
    );
    const cursor = req.query.after as string | undefined;
    const limit = Number(req.query.limit) || 20;
    res.status(200).json(paginate(postComments, cursor, limit));
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
