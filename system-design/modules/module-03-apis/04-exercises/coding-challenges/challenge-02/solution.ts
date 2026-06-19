// SOLUTION FILE — try starter.ts first!
/**
 * JWT Auth Middleware
 * Module: 03 — API Design
 * Concept: JWTs let a server verify a caller's identity from a signature
 *   alone, without a database lookup per request — at the cost of being hard
 *   to revoke before their natural expiry.
 * Run: npx ts-node solution.ts
 * Dependencies: express, jsonwebtoken, @types/express, @types/jsonwebtoken
 */

import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "dev-secret-do-not-use-in-production";

interface AuthedRequest extends Request {
  user?: { username: string };
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing token" });
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    // jwt.verify both checks the signature (was this issued by us, unmodified?)
    // and the expiry — either failure throws, which is why this is wrapped.
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.user = { username: decoded.username };
    next();
  } catch {
    res.status(401).json({ error: "invalid or expired token" });
  }
}

function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/login", (req: Request, res: Response) => {
    const { username } = req.body ?? {};
    if (!username) return res.status(400).json({ error: "username is required" });
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
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
