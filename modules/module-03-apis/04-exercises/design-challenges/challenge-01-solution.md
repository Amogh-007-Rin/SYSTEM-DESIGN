# Design Challenge 01 — Solution: API Surface for a Ride-Sharing App

## Core Actions

- Rider requests a ride
- System matches a driver
- Driver accepts/declines
- Both parties track the ride in progress
- Ride completes, payment processes
- Rider rates the driver (and vice versa)

## Endpoint Design

| Action | Method & Path | Notes |
|---|---|---|
| Request a ride | `POST /rides` | Body: `{ pickup: {lat, lng}, dropoff: {lat, lng} }`. Returns `202 Accepted` + ride `id` with `status: "requested"` — accepted, not yet matched, since matching is asynchronous. |
| Get ride status | `GET /rides/:id` | Returns current `status` and, once matched, driver info and live location reference. |
| Driver accepts | `POST /rides/:id/accept` | Driver-side action; `409` if already accepted by someone else or canceled. |
| Cancel a ride | `POST /rides/:id/cancel` | Valid from rider or driver depending on current status; business rules (cancellation fee) live in the service layer, not the API shape. |
| Complete a ride | `POST /rides/:id/complete` | Driver-triggered; transitions to `completed`, triggers payment processing. |
| Rate a ride | `POST /rides/:id/rating` | Body: `{ stars: number, comment?: string }`. Either party may call it once; `409` on a second attempt. |
| Ride history | `GET /users/:id/rides?after=<cursor>&limit=20` | Cursor pagination, consistent with [Module 03's convention](../../../02-deep-dive/README.md). |

## Modeling Ride Status

Status is a single field with an explicit, enumerated set of valid transitions, enforced server-side (not client-trusted): `requested → matched → in_progress → completed`, with `canceled` reachable from any pre-`completed` state. The API never lets a client set `status` directly — every transition happens through a specific action endpoint (`/accept`, `/cancel`, `/complete`) that encodes the business rule for that transition.

> ⚠️ **Warning:** A common mistake is exposing `PATCH /rides/:id { status: "completed" }` — that puts the business logic for valid transitions on the client, and invites bugs (or abuse) where a status is set without the side effects (payment, notifications) that should accompany it actually happening.

## Real-Time Location Updates

WebSockets, not polling — both the rider and driver apps need frequent, low-latency, bidirectional updates (driver pushes location, rider app receives it; ride status changes need to reach both sides instantly). This is exactly the use case [Module 02](../../../module-02-networking/01-concepts/README.md) and [Module 16](../../../module-16-real-time-systems/) identify WebSockets as suited for — high frequency, low latency, naturally bidirectional. SSE would work for the rider's one-directional "watch driver location" view alone, but WebSockets avoid needing two different real-time mechanisms for the two roles.

## Versioning

URL versioning (`/v1/rides`), since this API has two very different first-party client types (rider app, driver app) that release on separate App Store/Play Store cycles — explicit versioning makes it safe to evolve the API for one client type without forcing a synchronized release of the other.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Ride request response | `202 Accepted`, not `201 Created` | Correctly signals "we've accepted the request, matching happens async" rather than implying the ride object itself is fully formed/usable yet |
| Status transitions | Action endpoints, not direct field updates | More endpoints to design, but the business rules live in one place instead of being re-validated by every client |
| Real-time updates | WebSockets for both roles | One real-time mechanism to operate instead of two, at the cost of needing connection-scaling infrastructure even for the simpler one-directional rider view |
