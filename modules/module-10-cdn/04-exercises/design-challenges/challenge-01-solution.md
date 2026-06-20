# Design Challenge 01 — Solution: Content Delivery Architecture for a Video Streaming Platform

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — summarized here for the exercise format.

## Routing

Anycast-based routing (the same mechanism covered in [01-concepts](../../01-concepts/README.md#how-cdn-routing-works) and originally in [Module 02](../../../module-02-networking/02-deep-dive/README.md#anycast-routing)) delivers each viewer's request to their nearest Point of Presence automatically, with no client-side logic required.

## Push vs. Pull

Pull CDN by default: edge nodes fetch each segment from the origin on first request, then serve every subsequent viewer of that segment from cache. Push is reserved for content where the traffic spike timing is known in advance (a scheduled premiere) and zero first-viewer latency is worth the upload effort.

## Caching Strategy

| Content | Cache-Control | Why |
|---|---|---|
| Video segments | Long `max-age`, `immutable` | Segments never change once encoded — a re-encode produces a new URL rather than overwriting the old one, so there's no staleness risk to guard against |
| Manifests | Short TTL (seconds, not hours) | Changes more rarely than segments but a stale manifest pointing at outdated segment references is a worse failure mode than being briefly out of date |
| Thumbnails | Long `max-age` + versioned URL per thumbnail generation | Same reasoning as static assets — versioning sidesteps invalidation entirely |

## Invalidation

| Event | Strategy |
|---|---|
| Video taken down (e.g., copyright claim) | Explicit purge of the manifest URL (stops new playback starts) combined with an application-level "this video is unavailable" check, rather than relying on purge propagation alone to stop every in-flight viewer instantly |
| Video re-encoded into a new rendition ladder | No invalidation needed — new segments get new URLs; the manifest is updated to reference them, and old segment URLs simply age out of cache naturally |

## Adaptive Streaming

The player measures its own throughput and buffer health and independently selects which rendition to request for each upcoming segment (implemented in [`02-deep-dive/examples/abr-selector.ts`](../../02-deep-dive/examples/abr-selector.ts)). The CDN's role is purely to serve whichever segment/rendition combination the player asks for, from cache, as fast as possible — all adaptive intelligence lives client-side, not in the CDN.

## Security

- **DDoS resilience** via the same Anycast architecture used for routing, which naturally spreads attack traffic across every PoP instead of concentrating it on one origin.
- **TLS termination at the edge**, keeping the expensive handshake close to the viewer and removing the need for the origin to manage public-facing certificates.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Segment caching | Long `max-age, immutable` | Eliminates invalidation complexity entirely, at the cost of requiring strict discipline that segment URLs are never reused for different content |
| Takedown handling | Purge + application-level unavailability check, not purge alone | More implementation work than "just purge," but doesn't rely on global purge propagation speed to stop playback for already-in-flight viewers |

See the full discussion (including manifest TTL reasoning and multi-CDN considerations) in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
