# Design Challenge 01: A Simple Note-Taking App

**Difficulty:** Easy | **No distributed-systems scale required for this version**

## Prompt

Design a note-taking app for a single user managing their own personal notes (think a simplified version of Apple Notes or Google Keep). This is intentionally a small-scale system — the goal is to practice the full design flow (clarify → requirements → architecture → trade-offs), not to practice sharding or replication.

## What to Produce

1. A short list of clarifying questions you'd ask before designing
2. Functional requirements (what can a user do?)
3. Non-functional requirements (what does "good" look like — latency, availability, durability?)
4. A high-level architecture diagram (boxes + arrows; description is fine if you can't draw)
5. A list of the 3–5 most important components and what each does
6. At least 2 explicit trade-offs you made

## Constraints

- Assume roughly 1 million users, each with a few hundred small notes — small enough that this is not a "design Twitter" problem.
- Decide for yourself whether offline support is in scope, and justify the decision.

A full worked solution is available at [`challenge-01-solution.md`](./challenge-01-solution.md) — and an even more detailed walkthrough of this exact prompt is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md). Try your own answer before reading either.
