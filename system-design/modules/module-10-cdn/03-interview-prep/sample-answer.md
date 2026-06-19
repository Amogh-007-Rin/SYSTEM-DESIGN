# Sample Answer: "Design Global Content Delivery for a Video Streaming Platform"

> A fully worked deep-dive answer for a YouTube/Netflix-scale prompt, drawing on this module's concepts (CDN routing, caching, invalidation) and deep dive (adaptive bitrate streaming, security, multi-CDN, edge compute).

---

## Clarify Scope

I'd confirm the scope before diving in: are we designing the upload/encoding pipeline too, or just the delivery path from "video is encoded and stored" to "video plays smoothly on a user's device, anywhere in the world"? For this answer I'll focus on delivery, since that's where CDN-specific decisions live, and briefly note where it connects to storage and encoding.

## Identify the Core Requirement

The defining constraint of video delivery at this scale is that **read traffic vastly outnumbers write traffic** (millions of viewers per upload), **the same bytes are requested repeatedly by different users**, and **users have wildly different, changing network conditions**. That combination of "highly cacheable" plus "bandwidth-variable" is exactly what CDN delivery plus adaptive bitrate streaming is built for.

## Encoding and Storage (Briefly)

Uploaded video is transcoded into a rendition ladder (e.g., 240p/400kbps up to 1080p or 4K/15+ Mbps) and packaged for HLS or DASH: each rendition sliced into short segments, with a manifest listing every available rendition. The master copies live in object storage (the origin, building on [Module 09](../../module-09-storage/01-concepts/README.md)) — durable, but not what users hit directly at scale.

## CDN Architecture

**Routing:** Anycast-based routing gets each user's request to their nearest Point of Presence with no client-side logic required, the same mechanism covered in [01-concepts](../01-concepts/README.md#how-cdn-routing-works) and originally introduced for general networking in [Module 02](../../module-02-networking/02-deep-dive/README.md#anycast-routing).

**Caching model:** Pull CDN as the default — edge nodes fetch each segment from the origin on first request, then serve it from cache for every subsequent viewer of that same segment/rendition. I'd consider push (pre-warming the CDN) specifically for a high-profile scheduled premiere, where we know in advance exactly which content will get a traffic spike at a precise moment and want zero "first viewer pays origin latency" risk.

**Cache headers:** Segments are immutable once encoded (a given segment's bytes never change), so I'd set a long `max-age` with `immutable`, similar to how versioned static assets are cached — there's no invalidation problem for segments at all, since a re-encode simply produces a new URL rather than overwriting the old one.

**Manifest caching:** Manifests change less often than people assume (only on a re-encode or new rendition added) but I'd still give them a short TTL rather than treating them as fully immutable, since a manifest pointing at stale segment URLs is a worse failure than a manifest being a few seconds out of date.

> 📊 **Diagram:** `cdn-request-flow.drawio` — Shows a viewer's player requesting the manifest, then requesting successive segments from the nearest edge node, with a cache hit on every segment after the first viewer in that PoP's region has already requested it.

## Adaptive Bitrate Streaming

The player (not the server) drives quality selection: it measures its own throughput and buffer health and picks which rendition to request for the *next* segment, stepping down under network pressure and back up once bandwidth recovers — covered hands-on in [`02-deep-dive/examples/abr-selector.ts`](../02-deep-dive/examples/abr-selector.ts). This is what lets the same video play smoothly on a fast home connection and a spotty mobile connection without any server-side awareness of which is which.

## Security

- **DDoS resilience** comes largely for free from the Anycast architecture already in place for routing — attack traffic spreads across every PoP rather than concentrating on one origin.
- **TLS termination at the edge** means the handshake cost happens close to the viewer, and the origin doesn't need to manage public-facing certificates for traffic it never directly receives.
- A lightweight **WAF rule set** at the edge can catch obviously malicious patterns (e.g., scraping every video ID sequentially) before they reach the origin or trigger unnecessary transcoding/storage load.

## Multi-CDN (If Asked to Go Further)

At true YouTube/Netflix scale, I'd raise multi-CDN as a deliberate next step rather than a default: route across two or more providers via DNS-level steering that accounts for real-time per-region performance, accepting the added complexity of keeping cache rules and purge behavior consistent across providers in exchange for resilience against any single provider's regional outage.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| CDN model | Pull by default, push for scheduled premieres | Push avoids any first-viewer latency for known high-traffic moments, at the cost of needing to predict and pre-warm content in advance |
| Segment caching | Long `max-age, immutable` per segment | No invalidation problem at all for segments; relies on re-encodes always producing new URLs rather than overwriting old ones |
| Manifest caching | Short TTL, not fully immutable | A few seconds of potential staleness, in exchange for never risking a manifest permanently pointing at outdated segment references |
| CDN provider count | Single CDN unless given evidence of a specific gap | Simpler operations by default; multi-CDN only once scale or a real outage justifies the added complexity |
