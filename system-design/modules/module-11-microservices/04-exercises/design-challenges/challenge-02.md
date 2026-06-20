# Design Challenge 02: Design the Saga for an E-Commerce Order

**Difficulty:** Medium

## Prompt

Building on the service decomposition from [Design Challenge 01](./challenge-01.md): a customer places an order. The Order service creates the order, the Inventory service successfully reserves the requested stock, and **then the Payment service fails to charge the customer's card** (card declined, or the payment provider times out). At this point, stock has already been deducted from availability for an order that will never be paid for.

## What to Produce

1. Choose **choreography or orchestration** for this saga, and justify the choice against the trade-offs in [02-deep-dive](../../02-deep-dive/README.md#choreography-vs-orchestration) (number of steps, need for centralized visibility, coupling).
2. Lay out the full happy-path sequence of steps, service by service.
3. Lay out the **exact failure and compensation sequence** for the scenario described above (payment fails after inventory is reserved) — which service detects the failure, what gets compensated, in what order, and what each compensating transaction actually does.
4. Address the case where **the compensation itself fails** (e.g., the call to release inventory times out) — what do you do, and why is this fundamentally different from the original failure?
5. State what consistency model the customer-facing order status reflects throughout this sequence (i.e., what does the customer see at each step, and is there a window where the displayed state could be misleading?).
6. At least 1 trade-off you accepted in your saga design.

A full worked solution, including a runnable TypeScript implementation, is in [`challenge-02-solution.md`](./challenge-02-solution.md) and [`../../02-deep-dive/examples/saga-pattern.ts`](../../02-deep-dive/examples/saga-pattern.ts).

![Saga orchestration diagram](../../01-concepts/diagrams/exports/saga-orchestration.png)
*A central Saga Orchestrator calling Order, Inventory, and Payment in sequence, with the compensating calls fired in reverse order once Payment fails.*
