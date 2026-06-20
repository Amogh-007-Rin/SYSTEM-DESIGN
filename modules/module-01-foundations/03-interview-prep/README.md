# Module 01 — Interview Prep: The Foundation Framework

## Why This Matters

Every system design interview — whether the prompt is "design a parking lot" or "design Google Maps" — is judged against the same invisible rubric: did the candidate clarify scope, reason about scale, design something coherent, go deep where it mattered, and communicate clearly throughout? This page introduces the 5-step framework you'll use in every interview from here forward. The full version, with timing for a 45-minute interview, lives in [`interview-prep/how-to-approach-system-design-interview.md`](../../../interview-prep/how-to-approach-system-design-interview.md) — read this page first for the high-level shape.

---

## The 4-Step Framework (Compressed)

1. **Clarify** — turn the vague prompt into explicit functional and non-functional requirements. Ask about scale, latency targets, and what's in/out of scope.
2. **Estimate** — convert requirements into numbers: QPS, storage, bandwidth. This sets the stakes for every design decision that follows.
3. **Design** — draw the high-level architecture: client → load balancer → services → data layer. Narrate one concrete request flowing through it.
4. **Deep Dive** — pick 2–3 components and go deep: schema, caching strategy, a tricky failure mode. This is where senior signal is judged most heavily.

> 🎯 **Interview Tip:** Most candidates under-invest in step 1 and over-invest in step 3. A crisp two-minute clarification phase that surfaces the real constraints is worth more than five extra minutes of box-drawing.

---

## Talking Through Trade-offs Out Loud

Interviewers cannot see your reasoning — only what you say. The habit to build, starting now: every time you make a design decision, follow it immediately with "...because X, at the cost of Y." Silence after a decision reads as either not having considered alternatives, or not being able to articulate why you didn't choose them. Both read poorly, even if your internal reasoning was sound.

---

## Whiteboarding Tips

- Start with the simplest possible architecture that satisfies the functional requirements, then add complexity (caching, queues, replicas) only when you can name the specific problem it solves.
- Label every arrow. An unlabeled line between two boxes forces the interviewer to ask what it represents — make them never have to ask.
- Keep your diagram visually consistent: same shape for the same component type throughout (see the [color convention](../../../CONTRIBUTING.md#color-convention) used in this repository's own diagrams).

---

## Common Questions at This Level

- **"Design a URL shortener"** — A canonical easy question that exercises capacity estimation, basic API design, and a simple data model, without distributed systems complexity. See the full worked version in [`interview-prep/question-bank/easy/url-shortener.md`](../../../interview-prep/question-bank/easy/url-shortener.md).
- **"Design a parking lot"** — A classic object-oriented design question often used to test whether a candidate can model real-world constraints (capacity, pricing tiers, multiple entry points) as clean abstractions, independent of any distributed systems concerns. See [`interview-prep/question-bank/easy/parking-lot.md`](../../../interview-prep/question-bank/easy/parking-lot.md).

Continue to [`common-questions.md`](./common-questions.md) for a broader Q&A on foundational concepts, and [`sample-answer.md`](./sample-answer.md) for a fully worked example interview answer.
