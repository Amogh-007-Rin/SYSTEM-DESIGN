# Design Challenge 01: Content Delivery Architecture for a Video Streaming Platform

**Difficulty:** Medium

## Prompt

Design the content delivery architecture for a video streaming platform at YouTube/Netflix scale: hundreds of millions of viewers worldwide, video lengths from a few minutes to several hours, and viewers on everything from fiber connections to spotty mobile networks.

## What to Produce

1. **Routing** — how does a viewer's request reach a nearby edge node? Name the specific mechanism(s), not just "the CDN handles it."
2. **Push vs. pull** — state which model you'd use for video segments, and whether there's any content you'd handle differently (e.g., a scheduled high-profile release).
3. **Caching strategy** — specify `Cache-Control`/TTL behavior for: video segments, manifests, and thumbnail images. Justify why each is treated differently.
4. **Invalidation** — what's your strategy for a video that gets taken down (e.g., a copyright claim) versus a video that gets re-encoded into a new rendition ladder?
5. **Adaptive streaming** — explain how the player adapts quality to network conditions, and what the CDN's role is versus the player's role.
6. **Security** — name at least two CDN-level security mechanisms relevant to this platform.
7. **At least 2 trade-offs**, stated explicitly (not just listed as bullet points with no justification).

A full worked solution is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md), which answers this exact prompt in depth.
