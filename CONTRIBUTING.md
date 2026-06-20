# Contributing to System Design Mastery

Thank you for considering a contribution. This repository is only as good as the community that maintains it. This document explains how to contribute well.

---

## Types of Contributions

We welcome:

- **Content improvements** — clarifying confusing explanations, fixing technical inaccuracies, improving examples
- **New exercises** — coding challenges or design challenges for any module
- **Diagram fixes or additions** — both source files and exports
- **Typo / grammar fixes** — small but appreciated
- **Further reading additions** — high-quality external links (official docs, papers, engineering blogs)
- **Question bank entries** — new interview questions following the template
- **Company architecture case studies** — using the template in `company-architectures/_template/`

---

## Content Standards

All written content in this repository must follow these standards:

1. **Tone**: Clear and direct. No fluff, no padding, no marketing language. Assume an intelligent reader who wants to learn quickly.
2. **Always start with "why this matters"**: Every concept section opens with a real-world motivation before diving into theory or definitions.
3. **Always state trade-offs**: Nothing in system design is purely good or purely bad. If you present a solution, present what it costs.
4. **Use concrete analogies**: Abstract definitions should be paired with a relatable comparison.
5. **End with Key Takeaways**: Concept sections end with a bulleted list of at most 5 takeaways.
6. **Use callout blockquotes consistently**:
   - `> 💡 **Note:**` — supplementary information worth knowing
   - `> ⚠️ **Warning:**` — common mistakes and gotchas
   - `> 🎯 **Interview Tip:**` — interview-specific advice
   - `> 📊 **Diagram:**` — diagram placeholder (see Diagram Standards below)
7. **Link backwards and forwards**: Reference the prerequisite modules/concepts a topic depends on, and what it unlocks.

---

## Module Structure Requirements

Every module **must** follow this exact structure. Do not deviate from it — consistency is what makes the repository navigable.

```
module-XX-topic-name/
├── README.md
├── SUMMARY.md
├── 01-concepts/
│   ├── README.md
│   ├── diagrams/{source,exports}/
│   └── examples/*.ts
├── 02-deep-dive/
│   ├── README.md
│   └── examples/*.ts
├── 03-interview-prep/
│   ├── README.md
│   ├── common-questions.md
│   └── sample-answer.md
├── 04-exercises/
│   ├── README.md
│   ├── coding-challenges/challenge-NN/{README.md,starter.ts,solution.ts}
│   └── design-challenges/{challenge-NN.md,challenge-NN-solution.md}
└── 05-further-reading/
    └── README.md
```

If you are adding a new module, copy this structure exactly and fill in every file — no empty placeholders.

---

## Code Standards

All code examples in this repository are **TypeScript**, with the following rules:

1. **Strict mode** — all code must type-check under `"strict": true`.
2. **Runnable with `npx ts-node`** — no build step required for a single example file.
3. **File header comment** — every file starts with a block comment in this format:
   ```typescript
   /**
    * <Title>
    * Module: <NN — Module Name>
    * Concept: <one or two sentences on the system design concept being illustrated>
    * Run: npx ts-node <filename>.ts
    * Dependencies: <none, or npm packages required>
    */
   ```
4. **Inline comments explain *why*, not *what*** — don't narrate the code; explain the system design reasoning behind a line.
5. **`// === USAGE EXAMPLE ===`** section at the bottom of every file showing how to run/use the code, with realistic sample output where helpful.
6. **No `any`** — use precise types or generics.
7. **Prefer Node.js built-ins** — only add an external dependency when it's essential to the concept (e.g., `ioredis` for a Redis example).
8. **Descriptive file names** — `lru-cache.ts`, not `example1.ts`.
9. **`solution.ts` files** must begin with `// SOLUTION FILE — try starter.ts first!` and contain a complete, correct implementation that produces the output shown in the corresponding `starter.ts` usage example.

---

## Diagram Standards

Diagrams are authored in **Draw.io** (`.drawio`) or **Excalidraw** (`.excalidraw`).

1. Source file lives in `module-XX-topic/01-concepts/diagrams/source/`
2. Exported PNG lives in `module-XX-topic/01-concepts/diagrams/exports/`
3. The PNG must share the source file's name (just swap the extension)
4. Export PNGs at a minimum of **1440px** wide
5. Reference diagrams in markdown with a relative path and a caption directly beneath:
   ```markdown
   ![Consistent hash ring with 3 nodes](./diagrams/exports/consistent-hashing-ring.png)
   *The hash ring assigns each of the 3 physical nodes 150 virtual nodes; keys map clockwise to the nearest virtual node.*
   ```
6. Until a diagram is drawn, use the placeholder format so contributors know what's missing:
   ```markdown
   > 📊 **Diagram:** `consistent-hashing-ring.drawio` — Shows a hash ring with 3 physical nodes and 150 virtual nodes each, illustrating how keys map clockwise to the nearest node.
   ```

### Color Convention

| Element | Color | Hex |
|---|---|---|
| Client / User | Blue | `#4A90D9` |
| Server / Service | Green | `#27AE60` |
| Database | Orange | `#E67E22` |
| Cache | Purple | `#8E44AD` |
| Message Queue | Yellow | `#F39C12` |
| External Service | Grey | `#95A5A6` |
| Load Balancer | Teal | `#16A085` |
| CDN / Edge | Pink | `#E91E8C` |

---

## PR Process

1. **Fork** the repository and create a branch named after the content area, e.g. `content/module-04-add-sharding-exercise`.
2. Make your change, following the standards above.
3. Run the local validation scripts before opening a PR:
   ```bash
   bash scripts/validate-links.sh
   bash scripts/check-structure.sh
   ```
4. Open a PR with a descriptive title: `[Module 04] Add sharding strategy exercise`.
5. Fill out the PR template completely — incomplete checklists will be asked to be completed before review.
6. A maintainer will review for technical accuracy, tone, and structural consistency.

---

## Good First Issues

New to the repo? Look for issues labeled:

- `good first issue` — small, well-scoped, beginner-friendly
- `typo fix` — text corrections, no technical review needed
- `link fix` — broken or outdated links
- `exercise needed` — a module is missing a coding or design challenge

---

Thank you for helping make this the best free system design resource on the internet.
