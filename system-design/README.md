# 🏗️ System Design Mastery

> The most comprehensive open-source resource to learn system design — from "what is a server?" to designing systems that serve billions of requests a day.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Modules](https://img.shields.io/badge/modules-20-orange.svg)
![Exercises](https://img.shields.io/badge/exercises-57-purple.svg)
![Diagrams](https://img.shields.io/badge/diagrams-104-blueviolet.svg)
![Question Bank](https://img.shields.io/badge/interview%20questions-22-red.svg)
![TypeScript](https://img.shields.io/badge/code-TypeScript-3178c6.svg)

---

## Table of Contents

- [Why This Repository?](#why-this-repository)
- [What's Inside](#whats-inside)
- [The Learning Path](#the-learning-path)
- [Module Index](#module-index)
- [Anatomy of a Module](#anatomy-of-a-module)
- [How to Use This Repository](#how-to-use-this-repository)
- [Interview Prep](#interview-prep)
- [Diagrams](#diagrams)
- [Code Examples](#code-examples)
- [Cheatsheets](#cheatsheets)
- [Real-World Architectures](#real-world-architectures)
- [Repository Structure](#repository-structure)
- [Contributing](#contributing)
- [Community](#community)
- [FAQ](#faq)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Why This Repository?

There is no shortage of system design content on the internet — but most of it is either a wall of buzzwords with no working code, or a single "design Twitter" blog post with no path to get there. This repository is built to be different: a complete, linear curriculum where every concept is explained from first principles, illustrated with a real diagram, backed by runnable TypeScript, and connected directly to how it's actually asked about in interviews.

| Feature | This Repo | Other Resources |
|---|---|---|
| Linear learning path (beginner → pro) | ✅ 20 modules, each building on the last, with an explicit prerequisite graph | ❌ Usually a random grab-bag of topics in no particular order |
| Real, runnable code | ✅ 95 TypeScript files — every pattern is something you can `npx ts-node` and watch run | ⚠️ Mostly pseudocode, slides, or no code at all |
| Original diagrams for every concept | ✅ 104 hand-drawn-style Excalidraw diagrams, source files included | ❌ Stock images, ASCII art, or no diagrams |
| Hands-on exercises every module | ✅ 57 exercises (26 coding challenges + 31 design challenges), each with a worked solution | ❌ Rarely more than a couple of examples |
| Interview prep woven throughout | ✅ A dedicated framework, 22 fully-worked question-bank answers, and an "Interview Tip" in nearly every concept section | ⚠️ Usually a separate, disconnected resource |
| Real-world company architectures | ✅ Case-study template + index for contributed write-ups | ❌ Scattered across dozens of individual blog posts |
| Free and open source | ✅ MIT licensed, forever | ⚠️ Often paywalled past the basics |

---

## What's Inside

A precise inventory of what you actually get, end to end:

| Category | Count | Where |
|---|---|---|
| Modules | 20 | [`modules/`](./modules/) |
| Total module content | ~66,500 words across concept + deep-dive pages | every module's `01-concepts/` and `02-deep-dive/` |
| Diagrams (Excalidraw, source + PNG) | 104 | `*/diagrams/` throughout, plus [`assets/diagrams/`](./assets/diagrams/) |
| TypeScript files | 95 (43 concept/deep-dive examples + 52 exercise files) | `*/examples/`, `*/coding-challenges/` |
| Coding challenges | 26 (each with `starter.ts` + `solution.ts`) | `*/04-exercises/coding-challenges/` |
| Design challenges | 31 (each with a prompt + worked solution) | `*/04-exercises/design-challenges/` |
| Interview question-bank entries | 22 (5 easy, 9 medium, 8 hard) | [`interview-prep/question-bank/`](./interview-prep/question-bank/) |
| Mock interview resources | A blank scorecard + a full annotated transcript | [`interview-prep/mock-interviews/`](./interview-prep/mock-interviews/) |
| Cheatsheets | 5 | [`cheatsheets/`](./cheatsheets/) |
| Estimated time to complete everything | ~90–115 hours | sum of each module's estimated time |
| Total markdown files | 312 | everywhere |

---

## The Learning Path

```
[01 Foundations] → [02 Networking] → [03 APIs] → [04 Databases] → [05 Caching]
       ↓
[06 Scalability] → [07 Load Balancing] → [08 Message Queues] → [09 Storage] → [10 CDN]
       ↓
[11 Microservices] → [12 Distributed Systems] → [13 Consistency & Consensus]
       ↓
[14 Observability] → [15 Security] → [16 Real-Time Systems]
       ↓
[17 Data Pipelines] → [18 Search Systems] → [19 ML Systems] → [20 Advanced Patterns]
```

Each arrow is a genuine prerequisite relationship, not a suggestion — Module 13 (Consensus) assumes you already have Module 12's vocabulary for clocks and replication; Module 19 (ML Systems) assumes Module 17's stream-processing concepts. Experienced engineers can and should jump straight to whatever module addresses their current gap; beginners should follow the arrows in order.

---

## Module Index

| # | Module | Difficulty | Est. Time | Prerequisites |
|---|---|---|---|---|
| 01 | [Foundations of System Design](./modules/module-01-foundations/) | 🟢 Beginner | 3–4h | None |
| 02 | [Networking Fundamentals](./modules/module-02-networking/) | 🟢 Beginner–Intermediate | 4–5h | Module 01 |
| 03 | [API Design](./modules/module-03-apis/) | 🟢 Beginner–Intermediate | 4–5h | Modules 01, 02 |
| 04 | [Databases](./modules/module-04-databases/) | 🟡 Intermediate | 6–8h | Module 01 |
| 05 | [Caching](./modules/module-05-caching/) | 🟡 Intermediate | 4–5h | Module 04 |
| 06 | [Scalability](./modules/module-06-scalability/) | 🟡 Intermediate | 5–6h | Modules 04, 05 |
| 07 | [Load Balancing](./modules/module-07-load-balancing/) | 🟡 Intermediate | 3–4h | Module 06 |
| 08 | [Message Queues & Event-Driven Architecture](./modules/module-08-message-queues/) | 🟡 Intermediate | 5–6h | Module 06 |
| 09 | [Storage Systems](./modules/module-09-storage/) | 🟡 Intermediate | 4–5h | Module 04 |
| 10 | [Content Delivery Networks](./modules/module-10-cdn/) | 🟡 Intermediate | 3–4h | Modules 02, 09 |
| 11 | [Microservices Architecture](./modules/module-11-microservices/) | 🟠 Intermediate–Advanced | 6–7h | Modules 03, 07, 08 |
| 12 | [Distributed Systems Fundamentals](./modules/module-12-distributed-systems/) | 🔴 Advanced | 6–8h | Modules 06, 08, 11 |
| 13 | [Consistency, Consensus & CAP Theorem](./modules/module-13-consistency-consensus/) | 🔴 Advanced | 6–8h | Module 12 |
| 14 | [Observability](./modules/module-14-observability/) | 🟡 Intermediate | 4–5h | Module 11 |
| 15 | [Security in System Design](./modules/module-15-security/) | 🟡 Intermediate | 4–5h | Modules 03, 11 |
| 16 | [Real-Time Systems](./modules/module-16-real-time-systems/) | 🟠 Intermediate–Advanced | 5–6h | Modules 02, 08 |
| 17 | [Data Pipelines & Stream Processing](./modules/module-17-data-pipelines/) | 🔴 Advanced | 5–6h | Modules 08, 09 |
| 18 | [Search Systems](./modules/module-18-search-systems/) | 🟠 Intermediate–Advanced | 4–5h | Modules 04, 09 |
| 19 | [ML Systems & AI Infrastructure](./modules/module-19-ml-systems/) | 🔴 Advanced | 5–6h | Module 17 |
| 20 | [Advanced Patterns & Putting It All Together](./modules/module-20-advanced-patterns/) | 🔴 Advanced | 6–8h | All previous modules |

---

## Anatomy of a Module

Every module — without exception — follows the exact same five-part structure, so once you've worked through one, you know exactly how to navigate all twenty:

```
module-XX-topic-name/
├── README.md              ← Overview, prerequisites table, learning objectives
├── 01-concepts/            ← Core theory, explained from "why does this matter"
│   ├── README.md           first, with diagrams and a Key Takeaways summary
│   ├── diagrams/           ← Excalidraw source + exported PNGs
│   └── examples/           ← Runnable TypeScript illustrating the concept
├── 02-deep-dive/           ← Advanced nuances, internals, production trade-offs
│   ├── README.md
│   └── examples/
├── 03-interview-prep/      ← How this topic shows up in interviews
│   ├── README.md
│   ├── common-questions.md ← Curated Q&A
│   └── sample-answer.md    ← One fully worked example answer
├── 04-exercises/           ← Practice, with reference solutions
│   ├── coding-challenges/   ← starter.ts + solution.ts per challenge
│   └── design-challenges/   ← Open-ended prompt + worked solution
├── 05-further-reading/     ← Curated external sources (papers, eng blogs, talks)
└── SUMMARY.md              ← One-page cheat sheet: key concepts, trade-offs, patterns
```

Every `01-concepts/README.md` opens with real-world motivation before any theory, states every trade-off explicitly (nothing in system design is purely good or purely bad), and closes with a 5-bullet Key Takeaways list. Look for these consistent callouts throughout:

> 💡 **Note:** supplementary information worth knowing
> ⚠️ **Warning:** common mistakes and gotchas
> 🎯 **Interview Tip:** interview-specific advice
> 📊 a diagram, embedded directly with a caption

---

## How to Use This Repository

### 🟢 Beginner Track
Start at [Module 01](./modules/module-01-foundations/) and work straight through in order. Don't skip the exercises — system design is a practiced skill, not a memorized one. Budget 3–4 months at a relaxed pace, or push through faster if you can dedicate full days.

### 🟡 Intermediate Track
Skim each module's `SUMMARY.md` for Modules 01–05 to confirm you already know the fundamentals, then start reading in depth from [Module 06](./modules/module-06-scalability/) onward.

### 🔴 Senior / Staff Interview Track
Go straight to [`interview-prep/`](./interview-prep/) and read the [interview framework](./interview-prep/how-to-approach-system-design-interview.md) first, then skim [`common-mistakes.md`](./interview-prep/common-mistakes.md). Work through the [question bank](./interview-prep/question-bank/) (medium → hard), using module deep-dives as reference whenever you hit a concept gap. Run at least one timed mock interview using the [scorecard template](./interview-prep/mock-interviews/template.md) before the real thing.

### 📖 Look-Something-Up Track
Jump straight to [`cheatsheets/`](./cheatsheets/) — the [vocabulary glossary](./cheatsheets/system-design-vocabulary.md), [database comparison](./cheatsheets/database-comparison.md), and [numbers every engineer should know](./cheatsheets/numbers-every-engineer-should-know.md) are designed for quick reference, not sequential reading.

---

## Interview Prep

The [`interview-prep/`](./interview-prep/) section is a complete, self-contained interview preparation track:

- **[The 5-step framework](./interview-prep/how-to-approach-system-design-interview.md)** — clarify, estimate, design, deep dive, wrap up, with time budgets for a 45-minute interview slot.
- **[Estimation cheatsheet](./interview-prep/estimation-cheatsheet.md)** — every number you need to do back-of-envelope math fluently, plus a worked storage calculation.
- **[Common mistakes](./interview-prep/common-mistakes.md)** — the 10 most frequent ways candidates lose points, with the fix for each.
- **[Mock interviews](./interview-prep/mock-interviews/)** — a blank 45-minute scorecard, plus a fully annotated transcript showing what a strong answer actually sounds like, moment by moment.
- **[Question bank](./interview-prep/question-bank/)** — 22 questions, each answered in full using the same template: problem statement, clarifying questions, requirements, capacity estimation, architecture (with a diagram), API design, a deep dive on the hardest component, caching strategy, scaling, trade-offs, and follow-up questions.

| Tier | Count | Examples |
|---|---|---|
| 🟢 Easy | 5 | URL Shortener, Pastebin, Rate Limiter, Key-Value Store, Parking Lot |
| 🟡 Medium | 9 | Twitter, Instagram, WhatsApp, Uber, YouTube, News Feed |
| 🔴 Hard | 8 | Google Docs, Distributed Cache, Stock Trading System, Netflix, Payment System |

---

## Diagrams

Every diagram in this repository — all 104 of them — is an original [Excalidraw](https://excalidraw.com) drawing, not a stock image or screenshot. Each one ships as both:

- A `.excalidraw` **source file**, open it at [excalidraw.com](https://excalidraw.com) (or the VS Code extension) to view, edit, or remix it
- An exported **PNG** (1440px+ wide) embedded directly in the relevant page with a caption underneath

Diagrams follow a consistent color convention so component *type* is recognizable at a glance across every module:

| Element | Color |
|---|---|
| Client / User | 🔵 Blue |
| Server / Service | 🟢 Green |
| Database | 🟠 Orange |
| Cache | 🟣 Purple |
| Message Queue | 🟡 Yellow |
| External Service | ⚪ Grey |
| Load Balancer | 🟦 Teal |
| CDN / Edge | 🩷 Pink |

See the full convention and diagram contribution standards in [`CONTRIBUTING.md`](./CONTRIBUTING.md#diagram-standards).

---

## Code Examples

All 95 TypeScript files in this repository follow the same rules, enforced in [`CONTRIBUTING.md`](./CONTRIBUTING.md#code-standards):

- **Strict mode** — every file type-checks under `"strict": true`
- **Zero build step** — every file runs standalone with `npx ts-node <file>.ts`
- **No `any`** — precise types or generics throughout
- **Self-documenting structure** — a header comment (title, module, concept, run command), inline comments that explain *why* not *what*, and a `// === USAGE EXAMPLE ===` block at the bottom showing real output
- **`solution.ts` files** are clearly marked (`// SOLUTION FILE — try starter.ts first!`) and live alongside, not hidden behind, the problem

To run any example yourself:

```bash
git clone https://github.com/<your-fork>/system-design-mastery.git
cd system-design-mastery
npm install
npx ts-node modules/module-05-caching/04-exercises/coding-challenges/challenge-01/starter.ts
```

---

## Cheatsheets

Quick-reference material designed to be looked up, not read start to finish:

| Cheatsheet | What's In It |
|---|---|
| [`numbers-every-engineer-should-know.md`](./cheatsheets/numbers-every-engineer-should-know.md) | Latency and throughput numbers, powers of two, common object sizes |
| [`cap-theorem-quick-reference.md`](./cheatsheets/cap-theorem-quick-reference.md) | The CAP triangle, CP/AP examples, PACELC, and when to choose which |
| [`database-comparison.md`](./cheatsheets/database-comparison.md) | A full comparison table across 10 databases plus a SQL-vs-NoSQL decision flowchart |
| [`scaling-patterns.md`](./cheatsheets/scaling-patterns.md) | Every scaling pattern in the repo, grouped by layer, with a one-line description and module link |
| [`system-design-vocabulary.md`](./cheatsheets/system-design-vocabulary.md) | A 60-term alphabetical glossary, each entry linked to the module that covers it in depth |

---

## Real-World Architectures

The [`company-architectures/`](./company-architectures/) section is where real engineering write-ups live — how an actual company solved the problems taught in this repository, at real scale. It ships with a [template](./company-architectures/_template/README.md) (an 8-section structure: overview, scale, architecture diagram, key components, key decisions, evolution over time, lessons learned, references) and a blank starter diagram, ready for the first contributed case study.

---

## Repository Structure

```
system-design-mastery/
├── README.md                  ← you are here
├── LICENSE                     MIT
├── CONTRIBUTING.md             How to contribute well
├── SUMMARY.md                  Flat table of contents of every doc/code file
│
├── modules/                   ← 20 sequential learning modules (see Anatomy above)
├── interview-prep/            ← Framework, 22-question bank, mock interviews
├── cheatsheets/                5 quick-reference sheets
├── company-architectures/     ← Real-world case studies + contribution template
├── exercises/                 ← Cross-module exercise index and how-to-use guide
├── assets/
│   ├── diagrams/                Cross-cutting diagrams (e.g. question-bank architectures)
│   └── images/
│
├── .github/
│   ├── ISSUE_TEMPLATE/          Bug report, content improvement, new topic request
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/validate-links.yml
│
└── scripts/
    ├── validate-links.sh        Checks every markdown link resolves
    └── check-structure.sh       Validates every module has the required files
```

---

## Contributing

Contributions of all sizes are welcome — typo fixes, new exercises, diagram improvements, new question-bank entries, and entirely new modules. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a PR; it covers content standards, the exact module structure template, TypeScript code standards, and the diagram color convention.

Before submitting, run the local validation scripts:

```bash
bash scripts/check-structure.sh   # confirms every module has its required files
bash scripts/validate-links.sh    # confirms every markdown link resolves
```

Look for issues labeled `good first issue`, `typo fix`, `link fix`, or `exercise needed` if you're not sure where to start.

---

## Community

- **GitHub Discussions** — ask questions, propose new modules, share your own designs.
- **Issues** — use the templates in [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/) to report bugs, request topics, or suggest content improvements.

---

## FAQ

**Do I need to know TypeScript to use this repository?**
No. The concepts and diagrams stand on their own. TypeScript is the implementation language for the hands-on exercises, chosen for being readable to engineers coming from almost any other language — if you can read JavaScript, Java, or Python, you can read the code here.

**Can I use this to prepare for interviews on a tight timeline?**
Yes — see the [🔴 Senior / Staff Interview Track](#how-to-use-this-repository) above. Reading the framework, working the question bank medium-to-hard, and running one timed mock interview is a focused, multi-day plan, not a multi-month one.

**Are the diagrams editable?**
Yes. Every diagram has its `.excalidraw` source file alongside the exported PNG — open it at [excalidraw.com](https://excalidraw.com), tweak it, and export your own version.

**Is this content accurate / reviewed?**
Every module links to primary sources in its `05-further-reading/` section (official docs, original papers, engineering blog posts). If you spot an inaccuracy, please open an issue using the [bug report template](./.github/ISSUE_TEMPLATE/bug_report.md) — content correctness is taken seriously.

---

## License

This project is licensed under the [MIT License](./LICENSE) — use it, fork it, teach with it, build on it.

---

## Acknowledgements

This repository synthesizes ideas from decades of public engineering writing: company engineering blogs, conference talks, academic papers (Lamport, Brewer, DeCandia et al.), and the collective experience of engineers who have shared their war stories publicly. Every module's [Further Reading](./modules/module-01-foundations/05-further-reading/README.md) section credits the primary sources it draws from.
