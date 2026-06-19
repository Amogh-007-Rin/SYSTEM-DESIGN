# Coding Challenge 02: JWT Auth Middleware

## Problem Statement

Add JWT-based authentication to an Express API: a `POST /login` endpoint that issues a signed token, and a reusable middleware that protects routes by verifying the token from the `Authorization: Bearer <token>` header.

## Requirements

1. `POST /login` — accepts `{ username }` (no real password check needed for this exercise), returns `{ token }` signed with a secret, expiring in 1 hour.
2. `requireAuth` middleware — reads the `Authorization` header, verifies the JWT, and attaches the decoded payload to `req.user`. Responds `401` if the header is missing or the token is invalid/expired.
3. A protected route `GET /me` that returns `req.user`, demonstrating the middleware in action.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

The usage example logs in, calls `/me` with the issued token (expect `200`), then calls `/me` with no token and with a tampered token (expect `401` both times).
