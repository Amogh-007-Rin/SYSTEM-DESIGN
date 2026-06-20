# Coding Challenge 02: Implement a Basic Inverted Index in TypeScript

## Problem Statement

Implement an inverted index over a small set of documents, supporting both AND and OR multi-term search — the core data structure behind every full-text search engine, covered conceptually in [01-concepts](../../../01-concepts/README.md#the-inverted-index).

## Requirements

1. `addDocument(id, text)` — tokenizes `text` (lowercase, split on non-alphanumeric characters) and indexes it: for every unique term in the document, add `id` to that term's postings set.
2. `search(query, mode)` — tokenizes `query` the same way, then:
   - `mode = "AND"` — returns document IDs containing **every** query term (intersection of postings lists)
   - `mode = "OR"` — returns document IDs containing **at least one** query term (union of postings lists)
3. A query term that doesn't exist in the index at all should contribute an empty postings list (so an AND query containing it returns no results, and an OR query containing it simply contributes nothing).
4. Results should be returned as a sorted array of document IDs (sorted for deterministic, testable output — a real engine would sort by relevance score instead, see [01-concepts](../../../01-concepts/README.md#tf-idf-scoring-term-importance)).

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

`starter.ts` type-checks cleanly but throws `"Not implemented"` — implement tokenization, indexing, and the AND/OR postings-list intersection/union before running it for real output. Once implemented, indexing a handful of short documents and querying a single term should return every document containing it; querying two terms with `"AND"` should return only documents containing both; the same two terms with `"OR"` should return the (larger or equal) set of documents containing either.
