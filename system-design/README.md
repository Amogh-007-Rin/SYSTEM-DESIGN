# 🏗️ System Design Mastery

> The most comprehensive open-source resource to learn system design — from absolute beginner to professional engineer.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Modules](https://img.shields.io/badge/modules-20-orange.svg)
![Exercises](https://img.shields.io/badge/exercises-60%2B-purple.svg)

---

## Why This Repository?

There is no shortage of system design content on the internet — but most of it is either a wall of buzzwords with no working code, or a single "design Twitter" blog post with no path to get there. This repository is built to be different.

| Feature | This Repo | Other Resources |
|---|---|---|
| Linear learning path (beginner → pro) | ✅ 20 modules, each building on the last | ❌ Usually a random grab-bag of topics |
| Real TypeScript code examples | ✅ Every concept has runnable code | ⚠️ Mostly pseudocode or none at all |
| Coding + design exercises every module | ✅ 60+ exercises across the repo | ❌ Rarely more than a few examples |
| Interview prep built into every topic | ✅ Dedicated section in every module | ⚠️ Usually a separate, disconnected resource |
| Real-world company architectures | ✅ Case study template + index | ❌ Scattered across blog posts |
| Free and open source | ✅ MIT licensed, forever | ⚠️ Often paywalled past the basics |

---

## What You'll Learn

This repository takes you from "what is a server?" to designing systems that handle billions of requests a day. You'll learn the vocabulary, the mental models, the trade-offs, and the hands-on skills (in TypeScript) used by engineers who build and operate large-scale systems — and you'll learn how to communicate all of it clearly in an interview.

### Learning Path

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

Each arrow is a prerequisite relationship — modules are designed to be taken roughly in order, though experienced engineers can jump straight to what they need.

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

## How to Use This Repository

### 🟢 Beginner Track
Start at [Module 01](./modules/module-01-foundations/) and work straight through in order. Don't skip the exercises — system design is a practiced skill, not a memorized one. Budget 3–4 months at a relaxed pace.

### 🟡 Intermediate Track
Skim the `SUMMARY.md` of Modules 01–05 to confirm you already know the fundamentals, then start reading in depth from [Module 06](./modules/module-06-scalability/) onward.

### 🔴 Senior / Staff Interview Track
Go straight to [`interview-prep/`](./interview-prep/) and read the [interview framework](./interview-prep/how-to-approach-system-design-interview.md) first. Then work through the [question bank](./interview-prep/question-bank/) (medium → hard), using module deep-dives as reference when you hit a gap.

### 📖 Look-Something-Up Track
Jump straight to [`cheatsheets/`](./cheatsheets/) — the [vocabulary glossary](./cheatsheets/system-design-vocabulary.md), [database comparison](./cheatsheets/database-comparison.md), and [numbers every engineer should know](./cheatsheets/numbers-every-engineer-should-know.md) are designed for quick reference, not sequential reading.

---

## Real-World Architectures

The [`company-architectures/`](./company-architectures/) section contains case studies of how real companies solve the problems taught in this repository at scale. See the [template](./company-architectures/_template/README.md) if you'd like to contribute one.

---

## Repository Structure

```
system-design-mastery/
├── modules/              ← 20 sequential learning modules
├── interview-prep/       ← Interview framework, question bank, mock interviews
├── cheatsheets/          ← Quick-reference sheets
├── company-architectures/← Real-world case studies
├── exercises/            ← Cross-module exercise index
└── assets/               ← Shared diagrams and images
```

---

## Contributing

Contributions of all sizes are welcome — typo fixes, new exercises, diagram improvements, and entirely new content. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a PR; it covers content standards, the module structure template, and the diagram color convention.

---

## Community

- **GitHub Discussions** — ask questions, propose new modules, share your own designs.
- **Issues** — use the templates in [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/) to report bugs, request topics, or suggest content improvements.

---

## License

This project is licensed under the [MIT License](./LICENSE) — use it, fork it, teach with it, build on it.

---

## Acknowledgements

This repository synthesizes ideas from decades of public engineering writing: company engineering blogs, conference talks, academic papers (Lamport, Brewer, DeCandia et al.), and the collective experience of engineers who have shared their war stories publicly. Every module's [Further Reading](./modules/module-01-foundations/05-further-reading/README.md) section credits the primary sources it draws from.
