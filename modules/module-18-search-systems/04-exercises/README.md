# Module 18 — Exercises

## Coding Challenges

| Challenge | Description |
|---|---|
| [01 — Trie-Based Autocomplete](./coding-challenges/challenge-01/) | Implement a weighted Trie that returns the top-K highest-weighted completions for a prefix — the matching + ranking split discussed in 01-concepts |
| [02 — Basic Inverted Index](./coding-challenges/challenge-02/) | Implement an inverted index from a set of documents, supporting AND/OR multi-term queries via postings-list intersection/union |

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Search System for Airbnb](./design-challenges/challenge-01.md) | Design location search, filters, and ranking for a marketplace where geography and structured filters matter as much as text |
| [02 — Google-Like Type-Ahead with Top-K Results](./design-challenges/challenge-02.md) | Design autocomplete at internet scale: matching, ranking, freshness, and latency budgets |

Challenge 01 (Trie autocomplete) and Challenge 02 (inverted index) are the two data structures underpinning almost every search feature in this module — build both from scratch before relying on a library or search engine to do it for you. The design challenges then apply those structures (plus the geo/faceted/sync concepts from [02-deep-dive](../02-deep-dive/README.md)) to two of the most commonly asked search system design prompts.
