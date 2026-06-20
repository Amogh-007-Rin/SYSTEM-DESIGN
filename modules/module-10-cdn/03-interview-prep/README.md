# Module 10 — Interview Prep: Designing with a CDN

## Why This Matters

"How would you make this fast for users worldwide?" and "design YouTube/Netflix" both eventually require a candidate to reason about CDN placement, caching strategy, and (for video) adaptive streaming — not just say "use a CDN" and move on. Interviewers use CDN questions to check whether you understand *why* edge delivery works (Anycast, caching theory, segment-based streaming) or whether you're naming a product without understanding the mechanism underneath it.

---

## A Framework for "Where Does a CDN Fit in This Design?"

1. **Identify what's cacheable** — static assets and images are nearly always cacheable; video is cacheable per-segment once encoded; some API responses are cacheable for short TTLs; truly personalized or write-heavy data is not.
2. **State the routing mechanism** — name Anycast/GeoDNS explicitly rather than waving at "the CDN routes you to the nearest server" as an unexplained black box.
3. **Pick push vs. pull** — pull by default; push only when you can name a specific reason (a scheduled high-profile release, guaranteed zero first-request latency).
4. **State your caching headers and TTLs** — `Cache-Control`, `Vary`, and whether `stale-while-revalidate` is worth the staleness trade-off for this specific data.
5. **State your invalidation strategy explicitly** — versioned URLs for static assets, surrogate keys/purging for dynamic content tied to a changing entity.
6. **For video**, mention adaptive bitrate streaming (HLS/DASH) by name and explain the segment + rendition-ladder mechanism, not just "stream the video through the CDN."
7. **Name a trade-off** — multi-CDN complexity vs. resilience, edge compute's statelessness constraints, or purge propagation delay are all strong, specific things to raise unprompted.

> 🎯 **Interview Tip:** A candidate who says "we'd put a CDN in front of the images" gets partial credit. A candidate who says "we'd cache images at the edge with a long `max-age` and a versioned URL per upload, so invalidation is never actually needed" gets full credit — the second answer proves you understand *why* the pattern works, not just that it exists.

---

## When a CDN Is NOT the Right Answer

- Truly per-user, always-must-be-current data (a live auction's current bid, an account balance) — caching this at a shared edge node risks serving one user another user's stale state, or at minimum adds an invalidation problem with no real upside.
- Extremely low-traffic, latency-insensitive internal tools — the operational cost of CDN configuration isn't justified if nobody is far from the origin and traffic is minimal.
- Write-heavy paths — a CDN accelerates reads; it does nothing for the write path, which still has to reach the origin (and ultimately the database) directly.

See [`common-questions.md`](./common-questions.md) and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design global content delivery for a video streaming platform").
