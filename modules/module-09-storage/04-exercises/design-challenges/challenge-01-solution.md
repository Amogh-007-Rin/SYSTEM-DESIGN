# Design Challenge 01 — Solution: Photo Storage System (Instagram-style)

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — summarized here for the exercise format.

## Data Characterization and Storage Category

Photos are write-once (uploaded, then never byte-level modified), read extremely often relative to writes, and always accessed whole-object by a known key — never via ad-hoc query against the bytes. That shape points directly to **object storage** (S3 or equivalent): block storage's low-latency random-write strength is wasted here, and file storage's POSIX/shared-mutation semantics aren't needed either.

## Upload Flow

1. Application server generates a photo ID and a **presigned URL** scoped to that exact object key.
2. Client uploads directly to object storage using the presigned URL — not proxied through the application server, which avoids burning app-server bandwidth on large binary transfers.
3. On upload completion, the application server writes a metadata row and enqueues asynchronous **resize/variant generation** (thumbnail, feed-size, full-size) via a message queue.

## Metadata vs. Blob Separation

| | Lives In | Why |
|---|---|---|
| Photo bytes | Object storage, keyed by photo ID | Large, opaque, write-once, whole-object access |
| Metadata (owner, caption, timestamp, privacy, album) | Relational/document database, keyed by photo ID | Small records, queried constantly with filters/joins — a normal database problem |

## Read Path and CDN

A CDN sits in front of the object store as origin. Because photos are immutable once uploaded, **a "new version" gets a new object key rather than overwriting the old one** — this makes cache invalidation almost a non-problem, since a long (even near-infinite) CDN TTL is safe for a key that, by construction, never changes contents. The metadata layer tracks which key is "current" for a given logical photo slot.

## Durability and Tiering

- Durability: rely on the object store's built-in multi-facility replication rather than building custom replication.
- Tiering: lifecycle rules move rarely-viewed originals to a cheaper infrequent-access/cold tier after view activity drops, since most views happen shortly after upload.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Blob storage | Object storage | Massive scale/durability; no in-place mutation (not needed here anyway) |
| Upload path | Direct-to-storage via presigned URL | Saves app-server resources; adds client-side URL-expiration handling complexity |
| Versioning | New key per version, not overwrite | Trivially safe long CDN TTLs; metadata layer must track "current" pointer |

See the full discussion (including why pre-generating resized variants at upload time beats resizing on every read) in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
