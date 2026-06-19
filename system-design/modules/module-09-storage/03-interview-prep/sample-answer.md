# Sample Answer: "Design the Storage Backend for a Photo-Sharing App"

> A fully worked deep-dive answer for a prompt structurally identical to [Design Challenge 01](../04-exercises/design-challenges/challenge-01.md), applying the framework from this section's [README](./README.md).

---

## Characterize the Data

- **Volume**: hundreds of millions of photos, each roughly 2-5MB for the original upload, growing daily and essentially never shrinking.
- **Mutability**: write-once — once a photo is uploaded, its bytes never change. (A user "editing" a photo, in practice, uploads a new version; the old one is typically either kept or deleted, never modified in place.)
- **Read/write ratio**: extremely read-heavy — a single popular photo can be viewed millions of times after being uploaded once.
- **Access pattern**: whole-object reads (you don't seek into the middle of a JPEG and read a byte range in normal use, aside from progressive-loading thumbnails), almost always by a known key (photo ID), never by ad-hoc query against the bytes themselves.

This shape — write-once, read-many, whole-object access, no need for in-place mutation — is exactly the shape object storage is built for, which is the first concrete decision this characterization buys us.

## Storage Category Decision

**Object storage (S3 or equivalent) for the photo bytes themselves.** Block storage is the wrong fit (no need for low-latency random byte-level writes; we're not running a database directly against the photo bytes). File storage (EFS/NFS) is also the wrong fit — we don't need POSIX semantics or multiple servers mutating the same file; we need massive, horizontally-scalable, durable storage for immutable blobs, which is precisely object storage's design target.

## Metadata vs. Blob Separation

The photo's bytes live in object storage, keyed by a generated photo ID (e.g., `photos/{photoId}/original.jpg`). Everything else — who uploaded it, when, captions, tags, like counts, which album it belongs to, visibility/privacy settings — lives in a separate database (a relational or document store, per [Module 04](../../module-04-databases/)) keyed by the same photo ID. This separation matters because the access patterns are completely different: metadata is small, queried constantly with filters and joins (show me my friend's recent photos), and benefits from a real database's indexing; the blob is large, opaque, and only ever fetched whole by exact key.

## Upload Flow

1. Client requests an upload slot from the application server, which generates a photo ID and a **presigned URL** scoped to that exact object key, with a short expiration.
2. Client uploads the photo bytes **directly to object storage** using the presigned URL — not proxied through the application server. This avoids burning application server bandwidth and compute on what's purely a data-transfer operation.
3. Once the upload completes, the client (or an event triggered by the storage system itself, e.g., S3 event notifications) notifies the application server, which writes the metadata row and kicks off asynchronous post-processing.
4. **Asynchronous post-processing** (via a message queue, see [Module 08](../../module-08-message-queues/)) generates multiple resized variants (thumbnail, feed-size, full-size) and stores each as its own object — pre-generating these avoids resizing on every read.

> 📊 **Diagram:** `s3-upload-flow.drawio` — Shows the client requesting a presigned URL from the application server, uploading photo bytes directly to object storage, an event notification firing back to the application server, and an asynchronous worker fanning out to generate resized variants.

> 🎯 **Interview Tip:** Mentioning presigned URLs for direct-to-storage upload is a strong signal — it shows you know application servers shouldn't be a bandwidth-bound proxy for large binary transfers when the storage system can accept the upload directly and securely.

## Read / Serving Path and CDN Integration

Reads never go through the application server for the actual image bytes. A CDN sits in front of the object store as the origin: the first request for a given photo variant is a cache miss that pulls from the object store and caches it at the edge; every subsequent request, from any user, anywhere near that edge location, is served from the CDN without touching the origin at all. Given the read-heavy, write-once nature of this data, cache invalidation is nearly a non-issue — since photo objects are immutable, a long (even nearly infinite) CDN TTL is safe, keyed by an immutable object key. A "new version" of a photo gets a **new key**, not an overwrite of the old one, sidestepping cache invalidation entirely by relying on key immutability instead. (Full CDN mechanics are in [Module 10](../../module-10-cdn/).)

## Durability and Tiering

- **Durability**: rely on the object store's built-in multi-facility replication (the "11 nines" durability model covered in the [deep dive](../02-deep-dive/README.md)) rather than building custom replication — this is exactly the problem object storage is designed to solve.
- **Tiering**: recently uploaded, actively-viewed photos stay in the hot tier; the storage system's lifecycle rules can automatically move originals (not the CDN-served resized variants, which stay hot as long as they're requested) to a cheaper infrequent-access tier after a period of low view activity, since most photos receive the overwhelming majority of their views shortly after upload.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Blob storage | Object storage (S3), not block/file | Massive scale and durability for immutable blobs; gives up in-place mutation and POSIX semantics we don't need anyway |
| Upload path | Direct-to-storage via presigned URL | Saves application server bandwidth/compute; slightly more complex client logic and URL-expiration handling |
| Resized variants | Pre-generated asynchronously at upload time | Fast, consistent reads later; extra storage cost and upload-time processing latency |
| Cache invalidation | New key per version instead of overwrite-in-place | Trivially safe long CDN TTLs; requires the metadata layer to track "current" version per logical photo slot |
