# Design Challenge 02 — Solution: Scalable Image Upload and Processing Pipeline

## Upload Path: Direct-to-Storage, Not Through the App Servers

At 10,000 uploads/minute × 5MB average, that's roughly 50GB/minute of raw upload traffic. Routing all of that *through* the application servers (receiving the full file, then writing it to storage) would make the app tier's bottleneck about raw bandwidth and memory buffering, not request logic — exactly the kind of work that shouldn't compete with normal API traffic for the same compute.

**Design:** the app server issues a **pre-signed upload URL** (a short-lived, scoped credential for a specific object storage location — S3, GCS, etc.) in response to a lightweight "I want to upload an image" API call. The client then uploads the actual file bytes **directly to object storage**, bypassing the application tier entirely for the expensive part (the bytes). This keeps the app server's job cheap and constant-cost regardless of file size — it only ever handles a small JSON request/response, never the image itself.

## Where Processing Happens: Offloaded, Asynchronous

Resizing an image into multiple sizes is **CPU-bound** work (per the distinction in [02-deep-dive](../../02-deep-dive/README.md)) — it's not waiting on anything, it's actively computing. Doing this synchronously inside the upload request would tie up request-handling capacity for CPU work unrelated to handling more requests, and would make upload latency directly proportional to image processing time, which users would feel directly.

**Design:** object storage emits an event on object creation (most object storage services support this natively) that publishes a message onto a queue ([Module 08](../../../module-08-message-queues/)). A separately-scaled fleet of **worker processes** consumes that queue, downloads the original, generates the thumbnail/medium/full variants, and writes them back to object storage. The upload request itself returns success the moment the raw file lands in storage — processing happens after, off the critical path.

## Scaling Processing Independently

Because workers consume from a queue rather than being tied 1:1 to upload requests, the worker fleet can be scaled (manually or via auto-scaling keyed on **queue depth**, not CPU — queue depth is a more direct signal of processing backlog than worker CPU alone) independently of the upload-handling app tier. If processing falls behind during a spike, the queue simply grows — uploads keep succeeding (the user sees "upload complete"), but the *processed* variants (thumbnail, etc.) become available with a delay. The product experience should be designed around this explicitly: show the original/full image immediately if needed sooner, and let the optimized thumbnail "pop in" once ready, rather than blocking the user on processing completion.

> ⚠️ **Warning:** This only works if the product UX tolerates eventual availability of processed variants. If the product genuinely requires the thumbnail to exist before the upload is considered "done" (rare, but possible), this design needs a different trade-off — e.g., a tighter SLA-backed processing tier, accepting higher cost for lower processing latency guarantees.

## Storage and Serving

Processed variants are written back to the same object storage, organized by a predictable key scheme (e.g., `images/{id}/thumbnail.jpg`, `images/{id}/full.jpg`), and served to end users through a **CDN** ([Module 10](../../../module-10-cdn/)) in front of that storage rather than directly from storage or, worse, through the application servers. Serving images through the app tier would reintroduce exactly the bandwidth bottleneck the direct-upload design avoided — except now on the read path instead of the write path. A CDN caches the (now-immutable, since processed variants don't change once generated) images at edge locations close to users, so most reads never reach origin storage at all.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Upload path | Direct-to-storage via pre-signed URLs | App tier stays cheap and bandwidth-independent; clients need pre-signed-URL support, and the app server no longer directly observes/validates upload content in real time |
| Processing | Async via queue + independently-scaled workers | Processing scales on its own terms and a backlog doesn't block uploads; processed variants are eventually, not immediately, available |
| Auto-scaling signal for workers | Queue depth, not CPU | More directly reflects backlog than CPU alone; requires the queue system to expose that metric to the autoscaler |
| Serving | CDN in front of object storage | Removes app servers and even origin storage from most read traffic; adds CDN invalidation/cache-key complexity if an image is ever replaced at the same key |
