# Design Challenge 01 — Solution: Load Balancing Strategy for a Video Streaming Service

## Traffic Types and Why They Differ

| Traffic Type | Shape | Why It's Different |
|---|---|---|
| Catalog/search API | Short-lived, cheap, high volume | Classic stateless request/response — the easy case |
| Video segment streaming | Long-lived (minutes), high bandwidth, low CPU per connection | A connection that lasts 90 minutes is fundamentally different load than 1,000 one-second API calls |
| Upload/transcoding | Long-lived, very high CPU cost, low volume | Each request is expensive enough that "connection count" alone understates the real load |

Treating all three with one algorithm would be a mistake: a metric that's a good proxy for load on one traffic type (connection count, for streaming) is a poor proxy on another (transcoding, where CPU cost per request varies enormously and a few heavy jobs can dominate a backend that "only" has 2 connections).

## Per-Traffic-Type Strategy

### Catalog / Search API
- **Layer**: L7 — routing needs to distinguish `/search`, `/catalog`, `/recommendations` paths, and SSL termination needs to happen somewhere.
- **Algorithm**: Round Robin. Requests are short and roughly uniform cost; the simplicity is worth it, and Least Connections' extra bookkeeping buys little here since no single request lingers long enough to skew connection counts meaningfully.

### Video Segment Streaming
- **Layer**: L4 for the actual segment delivery (often via a CDN in front of origin servers — see [Module 10](../../../module-10-cdn/) — but the origin tier behind the CDN still needs its own load balancing). Raw throughput matters more than content-based routing once a stream has started.
- **Algorithm**: Least Connections. A streaming connection is held open for the duration of playback, so connection count is a direct, accurate proxy for how many concurrent streams a backend is serving — exactly the situation Least Connections is designed for, unlike Round Robin which would keep assigning new streams to an already-saturated backend on schedule.

### Upload / Transcoding
- **Layer**: L7, since the upload pipeline needs to read request metadata (file size, format) to make a sensible decision before committing a backend.
- **Algorithm**: Least Connections is a reasonable starting point but understates true load here, since transcode jobs vary wildly in CPU cost. A more accurate approach: route based on **reported worker queue depth** (each transcoding worker publishes its current queue length; the balancer picks the shortest queue) rather than raw connection count — effectively a custom "least load" variant, since plain connection count isn't a good proxy for CPU-bound work.

## Load Balancer Tier High Availability

**Active-active**, at least two load balancer instances per region behind a floating IP (or a managed multi-AZ load balancer service), for the same reason as any other system: one load balancer is a moved, not removed, single point of failure. Given video streaming's traffic volume, idle active-passive standby capacity would be wasteful — active-active uses all provisioned capacity while still surviving a single instance's failure.

## Global Load Balancing

**GeoDNS**, routing users to their nearest region's catalog/API and streaming origin tier. Anycast is not justified here unless this company is also operating its own CDN edge network at a scale comparable to a real CDN provider — for everything above the CDN layer (which is itself typically a third-party Anycast network already), GeoDNS at the origin-region level is the right amount of complexity.

> 💡 **Note:** In practice, the actual video bytes for a popular title are served from CDN edge caches (Anycast-routed by the CDN provider), and only cache misses reach the origin's own region-level GeoDNS-routed load balancer tier — the two techniques operate at different layers of the same system simultaneously.

## Connection Draining, Differentiated by Traffic Type

| Traffic Type | Deregistration Delay |
|---|---|
| Catalog/search API | Short (a few seconds) — requests are quick, so a short delay drains everything safely without slowing deploys down |
| Video streaming | Long (matches the longest reasonable session — e.g., several minutes), or better: don't forcibly drain at all — let in-progress streams finish naturally on the old backend version while new streams go to new-version backends, since cutting off a stream mid-playback is a much worse user experience than a single retried API call |
| Upload/transcoding | Long enough to cover the slowest realistic job, or: don't drain transcoding workers mid-job at all — have the deploy process wait for a worker's current job queue to empty before replacing it, since a forcibly killed transcode is wasted work, not just a retryable request |

## Trade-offs Accepted

| Decision | Choice | Trade-off |
|---|---|---|
| Algorithm per traffic type | Different algorithms (Round Robin / Least Connections / queue-depth-based) for different traffic types instead of one for everything | More operational complexity (multiple load balancing configurations to maintain) in exchange for each traffic type actually being routed well instead of "good enough" everywhere |
| Global routing | GeoDNS over Anycast at the origin level | Failover bounded by DNS TTL rather than instant, but far lower operational lift, acceptable since the CDN layer (already Anycast-routed by the provider) absorbs most user-facing traffic anyway |
| Streaming drain behavior | Let in-progress streams finish rather than forcibly draining on a fixed timeout | Deploys take longer to fully complete (waiting for the longest session to finish), in exchange for zero playback interruptions during a deploy |
