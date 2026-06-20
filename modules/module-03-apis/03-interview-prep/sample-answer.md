# Sample Answer: "Design the API for Twitter"

> A fully worked example focused specifically on API surface design — not the full Twitter system (that capstone lives in [Module 20](../../module-20-advanced-patterns/04-exercises/design-challenges/challenge-02.md)).

---

## Core Actions (Plain English First)

- Post a tweet
- Follow / unfollow a user
- View a user's timeline (their own tweets)
- View the home timeline (tweets from people you follow)
- Like a tweet

## Endpoint Design

| Action | Method & Path | Notes |
|---|---|---|
| Post a tweet | `POST /tweets` | Body: `{ text: string }`. Returns `201` + the created tweet, including server-assigned `id` and `created_at`. |
| Get a tweet | `GET /tweets/:id` | `404` if not found or deleted. |
| Delete a tweet | `DELETE /tweets/:id` | `204` on success; only the author may delete (`403` otherwise). |
| Follow a user | `POST /users/:id/follow` | Idempotent in effect (following twice changes nothing) but not a `PUT`, since there's no resource body being replaced — modeled as an action endpoint. |
| Unfollow | `DELETE /users/:id/follow` | `204` on success. |
| User's tweets | `GET /users/:id/tweets?after=<cursor>&limit=20` | Cursor pagination — see [Module 03 deep dive](../02-deep-dive/README.md). |
| Home timeline | `GET /timelines/home?after=<cursor>&limit=20` | Same pagination convention, applied consistently. |
| Like a tweet | `POST /tweets/:id/likes` | `201` on first like, `409` (or idempotent `200`, a defensible alternative) if already liked. |

## Request/Response Example

```http
POST /tweets
Content-Type: application/json
Authorization: Bearer <token>

{ "text": "Shipping the new system design repo today!" }
```

```json
HTTP/1.1 201 Created
Location: /tweets/9001

{
  "id": "9001",
  "text": "Shipping the new system design repo today!",
  "author_id": "42",
  "created_at": "2026-01-15T18:30:00Z",
  "like_count": 0
}
```

## Versioning Strategy

URL versioning (`/v1/tweets`), N-1 version support for 12 months after a new major version ships — explicit and easy for the large, uncoordinated set of third-party clients a platform like Twitter has to track.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Pagination | Cursor-based everywhere | Slightly less intuitive than `?page=2` for API consumers, but stable and fast at any depth |
| Follow/unfollow modeling | Action-style endpoints (`POST .../follow`) instead of a `PUT` on a "follow resource" | Reads more naturally for a unary relationship; less "purely RESTful" by some interpretations |
| Like semantics | `409` on duplicate like | Forces clients to handle the conflict explicitly rather than silently no-op-ing; alternative is defensible |

## Follow-Up Questions an Interviewer Might Ask

- How would you design the API to support tweet threads (replies)?
- How would rate limiting differ for posting tweets vs. reading timelines?
- How would you version a breaking change to the tweet response shape without breaking existing mobile clients?
