# Coding Challenge 01: REST Blog API

## Problem Statement

Build a REST-compliant Express API for a simple blog: CRUD for posts, and nested CRUD for comments on a post. Use cursor-based pagination for list endpoints and correct HTTP status codes throughout, per [Module 03's concepts](../../../01-concepts/README.md).

## Requirements

1. `POST /posts` — create a post. `201` + `Location` header.
2. `GET /posts?after=<cursor>&limit=<n>` — cursor-paginated list, returning `{ items, nextCursor }`.
3. `GET /posts/:id` — `200` or `404`.
4. `PATCH /posts/:id` — partial update, `200` or `404`.
5. `DELETE /posts/:id` — `204` or `404`. Deleting a post also deletes its comments.
6. `POST /posts/:postId/comments` — create a comment on a post. `404` if the post doesn't exist, otherwise `201`.
7. `GET /posts/:postId/comments?after=<cursor>&limit=<n>` — cursor-paginated list of comments.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

The bottom of the file exercises every route via `fetch` against the locally running server and prints each response's status code and body, then shuts the server down.
