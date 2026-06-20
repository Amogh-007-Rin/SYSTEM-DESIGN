# Design Challenge 02: Design a Google-Like Type-Ahead with Top-K Results

**Difficulty:** Hard

## Prompt

Design the autocomplete system behind a search box like Google's: as a user types, the system returns the top-K most likely completions within tens of milliseconds, at a scale of billions of unique historical queries and extremely high request volume (every keystroke from every user, globally).

## What to Produce

1. The core data structure for matching a prefix to candidate completions, and why it needs to differ from a naive Trie at this scale (consider: memory footprint of billions of queries, multiple languages, typos).
2. How completions are ranked — what determines that "weather" outranks "weathervane" for the prefix "weath," and how that ranking signal is computed and kept up to date as query trends shift (e.g., breaking news suddenly spiking a previously-rare query).
3. The latency budget: where does time go for a single keystroke, end-to-end, and what has to happen well before the request even arrives (offline/precomputation) versus at request time?
4. How the system scales horizontally — sharding strategy for the prefix structure, and how a request for one prefix gets routed to the right shard(s).
5. How you'd handle the long tail: rare, novel, or never-before-seen prefixes that don't have rich historical data.
6. At least 2 trade-offs you made and why.

A full worked solution is in [`challenge-02-solution.md`](./challenge-02-solution.md).
