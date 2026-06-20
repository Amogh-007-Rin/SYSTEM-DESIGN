# Module 15 — Exercises

> 💡 **Note:** Unlike most other modules in this repository, Module 15 has **no coding-challenges directory**. Per the module specification, this module's exercises are design challenges only — security is being assessed here at the architecture/reasoning level (auth system design, vulnerability identification), not via a from-scratch data-structure implementation like Module 05's LRU cache or Module 09's consistent hashing ring. The working code in this module lives in `01-concepts/examples/` and `02-deep-dive/examples/` as illustrative, runnable examples rather than as graded exercises.

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Auth System for a Multi-Tenant SaaS App](./design-challenges/challenge-01.md) | Design a complete authentication system: SSO, RBAC, audit logging, tenant isolation |
| [02 — Find the 5 Vulnerabilities](./design-challenges/challenge-02.md) | Given a concrete (deliberately flawed) system design, identify 5 real security vulnerabilities and propose fixes |

Challenge 01 mirrors the exact prompt worked through in [`03-interview-prep/sample-answer.md`](../03-interview-prep/sample-answer.md) — attempt the challenge yourself before reading that answer. Challenge 02 is the better exercise for sharpening the "spot the bug" instinct system design interviews specifically probe for; work through the flawed design line by line before checking the solution.
