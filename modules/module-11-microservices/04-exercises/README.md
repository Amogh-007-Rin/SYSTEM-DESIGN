# Module 11 — Exercises

## Coding Challenges

| Challenge | Description |
|---|---|
| [01 — Implement a Circuit Breaker](./coding-challenges/challenge-01/) | Implement the closed/open/half-open state machine in TypeScript and drive a flaky function through enough failures to trip it, observe the fast-fail behavior, then watch a successful half-open probe close it again |

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Decompose a Monolithic E-Commerce App](./design-challenges/challenge-01.md) | Take a monolithic e-commerce app and design its microservices decomposition — service boundaries, APIs between them, data ownership |
| [02 — Design the Order Saga](./design-challenges/challenge-02.md) | Design the saga for an e-commerce order where payment fails after inventory is already reserved — how do you compensate? |

Challenge 01 (circuit breaker) is one of the most commonly asked microservices-adjacent coding questions in interviews — practice explaining *why* half-open allows only one trial call, not just implementing the three states. The two design challenges are deliberately sequential: Design Challenge 01 produces the service boundaries that Design Challenge 02's saga then has to coordinate across, so attempt them in order.
