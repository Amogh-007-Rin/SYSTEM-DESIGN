# Exercises

Every module in this repository ends with a `04-exercises/` folder containing **coding challenges** (TypeScript implementations of core algorithms and patterns) and **design challenges** (open-ended system design prompts). This page is a cross-module index and a guide to how to use them — the exercises themselves live inside each module, not here.

---

## How Exercises Work

### Coding Challenges

Each coding challenge lives at `modules/module-XX-topic/04-exercises/coding-challenges/challenge-NN/` and contains:

- `README.md` — the problem statement, constraints, and expected behavior
- `starter.ts` — skeleton code with `// TODO:` markers and a working `// === USAGE EXAMPLE ===` block at the bottom so you can run it immediately and see what "done" looks like
- `solution.ts` — a complete reference implementation (see [`solutions/README.md`](./solutions/README.md) before peeking)

Run any starter or solution file directly:

```bash
npx ts-node starter.ts
```

### Design Challenges

Each design challenge is a single Markdown prompt (`challenge-NN.md`) describing a system to design, with a companion `challenge-NN-solution.md` containing a full worked solution (requirements, estimation, architecture, trade-offs). Design challenges have no single correct answer — the solution file shows *one* reasonable approach, not *the* approach.

---

## Difficulty Guide

| Module Range | Suggested Difficulty |
|---|---|
| Modules 01–05 | Foundational — data structures and basic patterns (LRU cache, rate limiter, consistent hashing) |
| Modules 06–13 | Intermediate–Advanced — distributed systems primitives (circuit breaker, gossip protocol, Lamport timestamps, CRDTs) |
| Modules 14–20 | Advanced — full system design challenges and production-shaped problems |

---

## Recommended Approach

1. Read the relevant module's `01-concepts/` and `02-deep-dive/` first — exercises assume you've read the theory.
2. Attempt the challenge yourself before opening the solution. The TODO markers in `starter.ts` are scoped to be solvable in 20–45 minutes each.
3. For design challenges, write your own answer to the prompt before reading the solution file — compare your trade-offs, not just your final architecture.
4. Use the [question bank](../interview-prep/question-bank/) for additional timed, interview-style practice once you've worked through a module's own exercises.

See [`solutions/README.md`](./solutions/README.md) for guidance on using solutions responsibly.
