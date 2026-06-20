# Module 09 — Interview Prep: Designing a Storage Backend

## Why This Matters

"Design Instagram" or "design Dropbox" or "design a file storage service" all reduce, at some point, to the same question: what's actually holding the bytes, and why? Interviewers use storage-heavy prompts specifically to see whether a candidate reaches for object storage out of genuine reasoning about access patterns (write-once, read-many, massive scale) or just because "S3" is the trendy answer. This section gives you a repeatable framework for that reasoning, plus a fully worked example.

---

## A Framework for "How Would You Design This Storage Backend?"

1. **Characterize the data**: size per item, total volume, read/write ratio, mutability (write-once vs. frequently-updated), and access pattern (random point lookups vs. large sequential scans).
2. **Pick the storage category** — block, file, or object — and justify it from the characterization in step 1, not from familiarity.
3. **Decide what's metadata vs. what's the blob itself**: metadata (owner, size, content-type, permissions, location pointer) almost always belongs in a fast database/index, separate from the actual bytes, which belong in bulk storage optimized for size and durability rather than query flexibility.
4. **Design the upload/write path**: direct-to-storage (e.g., presigned URLs straight to S3) vs. proxied through your application servers, and why.
5. **Design the read/serving path**: where does a CDN fit, what's cached, what's the cache invalidation/versioning story for content that can change (e.g., a new avatar uploaded under the same logical "current profile photo" slot).
6. **Address durability and tiering**: replication factor, and whether some data should age into cheaper, colder storage.

> 🎯 **Interview Tip:** Always say the word "metadata" out loud and explain where it lives separately from the blob. Candidates who treat "store the photo" as a single undifferentiated operation usually miss that the metadata layer (who owns this, what are its permissions, where exactly is it stored) is a normal database problem wearing a storage costume — and it's usually the harder half of the design.

---

## What Interviewers Are Listening For

- Did you separate **metadata** (small, frequently queried, needs a real database/index) from the **blob** (large, opaque, belongs in bulk storage)?
- Did you justify object storage (or block/file storage) from the **access pattern**, not from brand recognition?
- Did you mention a **CDN** for anything user-facing and frequently re-read, and explain what it caches and for how long?
- Did you address what happens when storage **scales past one machine/region** — sharding the metadata layer, replicating the blob layer?
- Did you name a **durability** strategy (replication factor, checksums) and a **cost** strategy (tiering) rather than assuming infinite cheap storage?

> ⚠️ **Warning:** A common interview mistake is spending the entire answer on the blob storage choice ("we'll use S3") and never designing the metadata layer at all. The metadata layer is where the real distributed-systems complexity lives — it needs its own database, its own indexing strategy, and often its own sharding plan, especially at the scale these prompts are usually asked at.

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design the storage backend for a photo-sharing app").
