# Coding Challenge 01: Implement a Trie-Based Autocomplete System in TypeScript

## Problem Statement

Implement a Trie (prefix tree) that supports inserting weighted words and retrieving the top-K highest-weighted completions for a given prefix — the same matching + ranking split discussed in [01-concepts](../../../01-concepts/README.md#autocomplete--type-ahead): a Trie alone tells you *which* completions exist for a prefix, but a real autocomplete system needs to rank those completions by some weight (historical search frequency, popularity) and return only the best few.

## Requirements

1. `insert(word, weight)` — adds a word to the Trie with an associated weight (e.g., historical query frequency). Inserting the same word again should update its weight, not duplicate it.
2. `getSuggestions(prefix, topK)` — returns the top-K words that start with `prefix`, ordered by weight descending (ties broken however you like, but be consistent). Returns an empty array if no words match the prefix.
3. Both operations should avoid full-tree scans where possible — walking to the prefix's node should be the only "search" step; finding the top-K from there should not require re-scanning words that don't share the prefix.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

`starter.ts` type-checks cleanly but its methods throw `"Not implemented"` — implement `insert` and `getSuggestions` (and any helper traversal you need) before running it for real output. Once implemented, inserting a small dictionary of weighted words (e.g., `"react"` weight 50, `"redux"` weight 30, `"redis"` weight 80, `"red"` weight 10) and querying `getSuggestions("re", 3)` should return `["redis", "react", "redux"]` — ranked by weight, not insertion order or alphabetically.
