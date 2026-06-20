/**
 * JWT Auth Middleware
 * Module: 03 — API Design
 * Concept: JWTs let a server verify a caller's identity from a signature
 *   alone, without a database lookup per request — at the cost of being hard
 *   to revoke before their natural expiry.
 * Run: npx ts-node starter.ts
 * Dependencies: express, jsonwebtoken, @types/express, @types/jsonwebtoken
 */

import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "dev-secret-do-not-use-in-production";

interface AuthedRequest extends Request {
  user?: { username: string };
}

/**
 * TODO: Implement requireAuth middleware.
 * - Read `Authorization` header, expect format "Bearer <token>".
 * - If missing or malformed: res.status(401).json({ error: "missing token" }); return.
 * - jwt.verify(token, JWT_SECRET) — on failure (throws), respond 401 invalid/expired.
 * - On success, attach the decoded payload to req.user and call next().
 */
function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  // TODO: implement
  throw new Error("Not implemented");
}

function createApp() {
  const app = express();
  app.use(express.json());

  // TODO: POST /login -> { username } in body, sign a JWT with { username },
  // expiresIn "1h", return { token }. 400 if username missing.
  app.post("/login", (req: Request, res: Response) => {
    throw new Error("Not implemented");
  });

  app.get("/me", requireAuth, (req: AuthedRequest, res: Response) => {
    res.status(200).json({ user: req.user });
  });

  return app;
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const PORT = 4002;
  const server = createApp().listen(PORT);
  const base = `http://localhost:${PORT}`;

  const login = await fetch(`${base}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alice" }),
  });
  const { token } = (await login.json()) as { token: string };
  console.log(`POST /login -> ${login.status}, token issued: ${typeof token === "string"}`);

  const authed = await fetch(`${base}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`GET /me (valid token) -> ${authed.status}`, await authed.json());

  const noToken = await fetch(`${base}/me`);
  console.log(`GET /me (no token) -> ${noToken.status}`);

  const tampered = await fetch(`${base}/me`, {
    headers: { Authorization: `Bearer ${token}tampered` },
  });
  console.log(`GET /me (tampered token) -> ${tampered.status}`);

  server.close();
}

main();
