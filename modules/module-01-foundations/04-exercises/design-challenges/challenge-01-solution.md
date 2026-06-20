# Design Challenge 01 — Solution: A Simple Note-Taking App

This solution intentionally mirrors the fully worked example in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md), which you should treat as the canonical answer to this prompt — this file restates it briefly in the design-challenge format for quick reference.

## Clarifying Questions

1. Single-user notes, or shared/collaborative notes? (Assume single-user.)
2. Rich content (images, checklists) or plain text + basic formatting? (Assume plain text + tags for this version.)
3. Does it need offline support? (Assume yes — this is the one interesting design decision in an otherwise simple system.)
4. Expected scale? (Assume 1M users, ~200 notes each, ~2KB/note.)

## Functional Requirements

- Create, read, update, delete a note
- List notes sorted by last-modified
- Tag and filter notes
- Edit offline; sync automatically on reconnect

## Non-Functional Requirements

- Availability: 99.9% (non-critical personal productivity tool)
- Perceived latency: <100ms for local read/write (served from the local cache before any network round-trip)
- Durability: a synced note must never be lost
- Scale: ~400GB total data (1M users × 200 notes × 2KB) — fits a single relational database comfortably

## Architecture

![Note-taking app architecture diagram](../../01-concepts/diagrams/exports/note-app-architecture.png)
*Client with local embedded store ↔ HTTPS ↔ stateless application server ↔ single primary PostgreSQL database with backups.*

**Components:**
- **Client** — local embedded database (SQLite/IndexedDB) for instant offline reads/writes
- **Application server** — stateless REST API for CRUD + sync endpoint
- **Database** — single PostgreSQL instance; `last_modified` timestamp per note drives sync conflict resolution

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Conflict resolution | Last-write-wins by timestamp | Simple to implement; can silently drop a rare concurrent edit from two offline devices |
| Storage | Single relational instance | No operational complexity of sharding; a future ceiling if user count grows 100x |
| Scope | No collaboration features | Lets the whole sync model stay simple — collaborative editing needs CRDTs/OT (see Module 20) |

See the [sample-answer.md](../../03-interview-prep/sample-answer.md) for the full discussion of why last-write-wins is an acceptable trade-off here but would not be for a collaborative document.
